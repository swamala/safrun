import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';
import { PrismaService } from '@/core/prisma/prisma.service';

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  userId: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

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
    await this.sendPushNotification({
      userId,
      title: '🆘 SOS Alert Nearby!',
      body: `${userName} needs help${distance ? ` (${Math.round(distance)}m away)` : ''}`,
      data: { type: 'SOS_ALERT', alertId },
    });
  }

  async notifySOSResolved(userId: string, alertId: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      title: '✅ SOS Resolved',
      body: 'The runner has marked themselves as safe',
      data: { type: 'SOS_RESOLVED', alertId },
    });
  }

  async registerPushToken(
    userId: string,
    deviceId: string,
    pushToken: string,
  ): Promise<void> {
    await this.prisma.device.updateMany({
      where: { userId, deviceId },
      data: { pushToken },
    });

    this.logger.log(`Push token registered for device ${deviceId}`);
  }
}

