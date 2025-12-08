import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@/core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotificationType, NotificationPriority } from '@/shared/enums/notification-type.enum';

interface PushNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
}

interface SMSNotificationPayload {
  to: string;
  message: string;
  userId?: string;
}

interface BulkPushPayload {
  userIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface DelayedNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledFor: Date;
}

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  private readonly twilioClient: any;
  private readonly twilioPhoneNumber: string;
  private readonly expoApiUrl = 'https://exp.host/--/api/v2/push/send';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();

    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    this.twilioPhoneNumber = this.configService.get('TWILIO_PHONE_NUMBER', '');

    if (accountSid && authToken) {
      try {
        const Twilio = require('twilio');
        this.twilioClient = new Twilio(accountSid, authToken);
      } catch (e) {
        this.logger.warn('Twilio SDK not available. SMS notifications disabled.');
      }
    }
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.debug(`Processing notification job: ${job.name} (${job.id})`);

    switch (job.name) {
      case 'push':
        return this.processPushNotification(job.data as PushNotificationPayload);
      case 'sms':
        return this.processSMSNotification(job.data as SMSNotificationPayload);
      case 'bulk-push':
        return this.processBulkPush(job.data as BulkPushPayload);
      case 'delayed':
        return this.processDelayedNotification(job.data as DelayedNotificationPayload);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        return null;
    }
  }

  /**
   * Process single push notification
   */
  private async processPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    const { userId, type, title, body, data } = payload;

    // Get user's push tokens
    const devices = await this.prisma.device.findMany({
      where: { userId, isActive: true, pushToken: { not: null } },
      select: { pushToken: true, deviceType: true },
    });

    if (devices.length === 0) {
      this.logger.warn(`No push tokens found for user ${userId}`);
      return false;
    }

    const messages = devices.map((device) => ({
      to: device.pushToken,
      title,
      body,
      data: { ...data, type },
      sound: 'default',
      priority: 'high',
    }));

    try {
      const response = await fetch(this.expoApiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();

      if (result.errors) {
        this.logger.error(`Expo push errors: ${JSON.stringify(result.errors)}`);
        return false;
      }

      this.logger.log(`Push notification sent to user ${userId}: ${title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Process SMS notification with fallback
   */
  private async processSMSNotification(payload: SMSNotificationPayload): Promise<boolean> {
    const { to, message, userId } = payload;

    if (!this.twilioClient || !this.twilioPhoneNumber) {
      this.logger.warn('Twilio not configured. SMS notification skipped.');
      return false;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to,
      });

      this.logger.log(`SMS sent to ${to}${userId ? ` for user ${userId}` : ''}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      return false;
    }
  }

  /**
   * Process bulk push notification
   */
  private async processBulkPush(payload: BulkPushPayload): Promise<{ success: number; failed: number }> {
    const { userIds, type, title, body, data } = payload;

    let success = 0;
    let failed = 0;

    // Get all push tokens for these users
    const devices = await this.prisma.device.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
        pushToken: { not: null },
      },
      select: { pushToken: true, userId: true },
    });

    if (devices.length === 0) {
      this.logger.warn(`No push tokens found for bulk notification`);
      return { success: 0, failed: userIds.length };
    }

    // Batch messages (Expo supports up to 100 per request)
    const BATCH_SIZE = 100;
    const messages = devices.map((device) => ({
      to: device.pushToken,
      title,
      body,
      data: { ...data, type },
      sound: 'default',
    }));

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);

      try {
        const response = await fetch(this.expoApiUrl, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });

        const result = await response.json();

        if (result.data) {
          success += result.data.filter((r: any) => r.status === 'ok').length;
          failed += result.data.filter((r: any) => r.status === 'error').length;
        }
      } catch (error) {
        this.logger.error(`Bulk push batch failed: ${error.message}`);
        failed += batch.length;
      }
    }

    this.logger.log(`Bulk push completed: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Process delayed notification
   */
  private async processDelayedNotification(payload: DelayedNotificationPayload): Promise<boolean> {
    const { userId, type, title, body, data, scheduledFor } = payload;

    // Check if still valid (user might have cancelled the session)
    const now = new Date();
    if (new Date(scheduledFor) < now) {
      this.logger.debug(`Delayed notification expired for user ${userId}`);
      return false;
    }

    return this.processPushNotification({
      userId,
      type,
      title,
      body,
      data,
    });
  }
}

