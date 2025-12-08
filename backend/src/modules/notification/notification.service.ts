import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';
import { PrismaService } from '@/core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  userId: string;
}

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  categoryId?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly twilioAccountSid: string;
  private readonly twilioAuthToken: string;
  private readonly twilioPhoneNumber: string;
  private readonly expoApiUrl = 'https://exp.host/--/api/v2/push/send';

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.twilioAccountSid = this.configService.get('TWILIO_ACCOUNT_SID', '');
    this.twilioAuthToken = this.configService.get('TWILIO_AUTH_TOKEN', '');
    this.twilioPhoneNumber = this.configService.get('TWILIO_PHONE_NUMBER', '');
  }

  /**
   * Send push notification to a single user
   */
  async sendPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const devices = await this.prisma.device.findMany({
      where: {
        userId,
        isActive: true,
        pushToken: { not: null },
      },
      select: {
        id: true,
        pushToken: true,
        deviceType: true,
      },
    });

    const expoPushTokens = devices
      .filter((d) => d.pushToken && this.isExpoPushToken(d.pushToken))
      .map((d) => d.pushToken!);

    if (expoPushTokens.length > 0) {
      await this.sendExpoPush(expoPushTokens, title, body, data);
    }

    this.logger.log(`Push notification sent to user ${userId}`);
  }

  /**
   * Send push notification to multiple users
   */
  async sendBulkPush(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const devices = await this.prisma.device.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
        pushToken: { not: null },
      },
      select: {
        pushToken: true,
      },
    });

    const expoPushTokens = devices
      .filter((d) => d.pushToken && this.isExpoPushToken(d.pushToken))
      .map((d) => d.pushToken!);

    if (expoPushTokens.length > 0) {
      await this.sendExpoPush(expoPushTokens, title, body, data);
    }

    this.logger.log(`Bulk push notification sent to ${userIds.length} users`);
  }

  /**
   * Send SMS via Twilio
   */
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      this.logger.warn('Twilio not configured, skipping SMS');
      return false;
    }

    try {
      const twilio = await import('twilio');
      const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);

      await client.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: phoneNumber,
      });

      this.logger.log(`SMS sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Send push notification via Expo's push service
   */
  private async sendExpoPush(
    pushTokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
    }));

    // Chunk messages (Expo allows max 100 per request)
    const chunks = this.chunkArray(messages, 100);

    for (const chunk of chunks) {
      try {
        const response = await fetch(this.expoApiUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error(`Expo push error: ${errorText}`);
        } else {
          const result = await response.json();
          this.logger.debug(`Expo push result: ${JSON.stringify(result)}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send Expo push: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Queue push notification for delivery via Redis
   */
  async sendPushNotification(notification: PushNotification): Promise<void> {
    // Get user's active devices with push tokens
    const devices = await this.prisma.device.findMany({
      where: {
        userId: notification.userId,
        isActive: true,
        pushToken: { not: null },
      },
      select: {
        id: true,
        pushToken: true,
        deviceType: true,
      },
    });

    for (const device of devices) {
      if (!device.pushToken) continue;

      // Queue for delivery
      await this.redisService.publish(
        'notification:push',
        JSON.stringify({
          deviceId: device.id,
          pushToken: device.pushToken,
          deviceType: device.deviceType,
          notification: {
            title: notification.title,
            body: notification.body,
            data: notification.data,
          },
        }),
      );
    }

    this.logger.log(`Push notification queued for user ${notification.userId}`);
  }

  async sendToSession(
    sessionId: string,
    notification: Omit<PushNotification, 'userId'>,
    excludeUserId?: string,
  ): Promise<void> {
    const participants = await this.prisma.runParticipant.findMany({
      where: {
        sessionId,
        status: 'JOINED',
        userId: excludeUserId ? { not: excludeUserId } : undefined,
      },
      select: { userId: true },
    });

    for (const participant of participants) {
      await this.sendPushNotification({
        ...notification,
        userId: participant.userId,
      });
    }
  }

  async notifySessionStart(sessionId: string, sessionName: string): Promise<void> {
    await this.sendToSession(sessionId, {
      title: 'Session Started! 🏃',
      body: `${sessionName} has started. Join now!`,
      data: { type: 'SESSION_START', sessionId },
    });
  }

  async notifySessionEnd(sessionId: string, sessionName: string): Promise<void> {
    await this.sendToSession(sessionId, {
      title: 'Session Ended',
      body: `${sessionName} has ended. Check your stats!`,
      data: { type: 'SESSION_END', sessionId },
    });
  }

  async notifyNewParticipant(
    sessionId: string,
    newUserName: string,
    newUserId: string,
  ): Promise<void> {
    await this.sendToSession(
      sessionId,
      {
        title: 'New Runner!',
        body: `${newUserName} has joined the session`,
        data: { type: 'PARTICIPANT_JOINED', sessionId },
      },
      newUserId,
    );
  }

  async notifySOSTriggered(
    userId: string,
    alertId: string,
    userName: string,
    distance?: number,
  ): Promise<void> {
    await this.sendPush(
      userId,
      '🆘 SOS Alert Nearby!',
      `${userName} needs help${distance ? ` (${Math.round(distance)}m away)` : ''}`,
      { type: 'SOS_ALERT', alertId },
    );
  }

  async notifySOSResolved(userId: string, alertId: string): Promise<void> {
    await this.sendPush(
      userId,
      '✅ SOS Resolved',
      'The runner has marked themselves as safe',
      { type: 'SOS_RESOLVED', alertId },
    );
  }

  async notifyNewResponder(
    userId: string,
    alertId: string,
    responderName: string,
    distance?: number,
    eta?: number,
  ): Promise<void> {
    const etaText = eta ? ` (ETA: ${Math.round(eta / 60)} min)` : '';
    await this.sendPush(
      userId,
      '🏃 Help is on the way!',
      `${responderName} is coming to help${etaText}`,
      { type: 'RESPONDER_JOINED', alertId },
    );
  }

  async notifySOSEscalation(
    userId: string,
    alertId: string,
    level: number,
  ): Promise<void> {
    const messages = {
      2: 'Emergency contacts have been notified',
      3: 'Maximum alert level - location is being continuously tracked',
    };
    await this.sendPush(
      userId,
      '⚠️ SOS Escalated',
      messages[level as keyof typeof messages] || 'Your SOS has been escalated',
      { type: 'SOS_ESCALATION', alertId, level },
    );
  }

  async registerPushToken(
    userId: string,
    deviceId: string,
    pushToken: string,
    voipToken?: string,
  ): Promise<void> {
    const updateData: any = { pushToken };
    if (voipToken) {
      updateData.voipToken = voipToken;
    }

    await this.prisma.device.updateMany({
      where: { userId, deviceId },
      data: updateData,
    });

    this.logger.log(`Push token registered for device ${deviceId}`);
  }

  /**
   * Queue push notification via BullMQ
   */
  async queuePushNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    priority?: string,
  ): Promise<void> {
    await this.redisService.publish(
      'notification:queue',
      JSON.stringify({
        jobType: 'push',
        userId,
        type,
        title,
        body,
        data,
        priority,
      }),
    );
    this.logger.debug(`Push notification queued for user ${userId}: ${title}`);
  }

  /**
   * Queue bulk push notification
   */
  async queueBulkPushNotification(
    userIds: string[],
    type: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ success: number; failed: number }> {
    await this.redisService.publish(
      'notification:queue',
      JSON.stringify({
        jobType: 'bulk-push',
        userIds,
        type,
        title,
        body,
        data,
      }),
    );
    return { success: userIds.length, failed: 0 }; // Actual results come from processor
  }

  /**
   * Schedule session reminder notification
   */
  async scheduleSessionReminder(
    userId: string,
    sessionId: string,
    sessionName: string,
    minutesBefore: number,
  ): Promise<void> {
    // Get session scheduled start time
    const session = await this.prisma.runSession.findUnique({
      where: { id: sessionId },
      select: { scheduledStartAt: true },
    });

    if (!session?.scheduledStartAt) {
      this.logger.warn(`Session ${sessionId} has no scheduled start time`);
      return;
    }

    const notifyAt = new Date(session.scheduledStartAt.getTime() - minutesBefore * 60 * 1000);
    const delay = notifyAt.getTime() - Date.now();

    if (delay <= 0) {
      this.logger.warn(`Session ${sessionId} reminder time has already passed`);
      return;
    }

    await this.redisService.publish(
      'notification:queue',
      JSON.stringify({
        jobType: 'delayed',
        userId,
        type: 'SESSION_STARTING_SOON',
        title: '🏃 Session Starting Soon!',
        body: `${sessionName} starts in ${minutesBefore} minutes. Get ready!`,
        data: { sessionId, sessionName },
        scheduledFor: notifyAt.toISOString(),
        delay,
      }),
    );

    this.logger.log(`Session reminder scheduled for user ${userId} in ${minutesBefore} minutes`);
  }

  /**
   * Send test push notification
   */
  async sendTestNotification(userId: string): Promise<{ success: boolean; devices: number }> {
    const devices = await this.prisma.device.findMany({
      where: {
        userId,
        isActive: true,
        pushToken: { not: null },
      },
    });

    if (devices.length === 0) {
      return { success: false, devices: 0 };
    }

    await this.sendPush(
      userId,
      'SAFRUN Test Notification',
      'If you see this, push notifications are working! 🎉',
      { type: 'TEST', timestamp: Date.now() },
    );

    return { success: true, devices: devices.length };
  }

  private isExpoPushToken(token: string): boolean {
    return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
