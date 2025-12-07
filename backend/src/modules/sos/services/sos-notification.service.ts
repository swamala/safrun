import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { RedisService } from '@/core/redis/redis.service';
import { EmergencyContactService } from '@/modules/profile/services/emergency-contact.service';
import { ConfigService } from '@nestjs/config';
import { ParticipantStatus, RunSessionStatus } from '@prisma/client';

@Injectable()
export class SosNotificationService {
  private readonly logger = new Logger(SosNotificationService.name);
  private readonly twilioAccountSid: string;
  private readonly twilioAuthToken: string;
  private readonly twilioPhoneNumber: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly emergencyContactService: EmergencyContactService,
    private readonly configService: ConfigService,
  ) {
    this.twilioAccountSid = this.configService.get('TWILIO_ACCOUNT_SID', '');
    this.twilioAuthToken = this.configService.get('TWILIO_AUTH_TOKEN', '');
    this.twilioPhoneNumber = this.configService.get('TWILIO_PHONE_NUMBER', '');
  }

  async sendVerificationRequest(userId: string, alertId: string): Promise<void> {
    // Send via WebSocket
    await this.redisService.publish(
      'sos:verification',
      JSON.stringify({
        type: 'SOS_VERIFICATION',
        userId,
        alertId,
        message: 'Are you safe?',
      }),
    );

    this.logger.log(`Verification request sent to user ${userId}`);
  }

  async notifyEmergencyContacts(userId: string, alertId: string): Promise<void> {
    const contacts = await this.emergencyContactService.getSOSContacts(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const alert = await this.prisma.sOSAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || !user) return;

    const userName = user.profile?.displayName || 'Your contact';

    for (const contact of contacts) {
      // Send SMS
      await this.sendSMS(
        contact.phone,
        `SAFRUN EMERGENCY ALERT: ${userName} has triggered an SOS. ` +
        `Location: https://maps.google.com/?q=${alert.approxLatitude},${alert.approxLongitude} ` +
        `Please check on them immediately.`,
      );

      // If guardian is also a user, send push notification
      if (contact.isVerified) {
        const guardian = await this.prisma.emergencyContact.findUnique({
          where: { id: contact.id },
          select: { guardianId: true },
        });

        if (guardian?.guardianId) {
          await this.redisService.publish(
            'sos:guardian',
            JSON.stringify({
              type: 'SOS_GUARDIAN_ALERT',
              guardianId: guardian.guardianId,
              alertId,
              userId,
              userName,
            }),
          );
        }
      }
    }

    this.logger.log(`Emergency contacts notified for SOS ${alertId}`);
  }

  async notifyGroupMembers(userId: string, alertId: string): Promise<void> {
    // Find active session
    const participant = await this.prisma.runParticipant.findFirst({
      where: {
        userId,
        status: ParticipantStatus.JOINED,
        session: { status: RunSessionStatus.ACTIVE },
      },
      include: {
        session: {
          include: {
            participants: {
              where: { userId: { not: userId }, status: ParticipantStatus.JOINED },
            },
          },
        },
      },
    });

    if (!participant) return;

    const alert = await this.prisma.sOSAlert.findUnique({
      where: { id: alertId },
      include: {
        user: {
          select: { profile: { select: { displayName: true } } },
        },
      },
    });

    if (!alert) return;

    const userName = alert.user.profile?.displayName || 'A runner';

    // Notify all session participants
    for (const p of participant.session.participants) {
      await this.redisService.publish(
        'sos:group',
        JSON.stringify({
          type: 'SOS_GROUP_ALERT',
          userId: p.userId,
          alertId,
          sessionId: participant.session.id,
          triggeredBy: userId,
          userName,
          location: {
            latitude: alert.approxLatitude || alert.latitude,
            longitude: alert.approxLongitude || alert.longitude,
          },
        }),
      );
    }

    this.logger.log(`Group members notified for SOS ${alertId}`);
  }

  async notifyUserResponderAccepted(
    userId: string,
    alertId: string,
    responderId: string,
  ): Promise<void> {
    const responder = await this.prisma.user.findUnique({
      where: { id: responderId },
      select: { profile: { select: { displayName: true } } },
    });

    await this.redisService.publish(
      'sos:update',
      JSON.stringify({
        type: 'SOS_RESPONDER_ACCEPTED',
        userId,
        alertId,
        responderId,
        responderName: responder?.profile?.displayName || 'A nearby runner',
      }),
    );
  }

  async notifyUserResponderArrived(
    userId: string,
    alertId: string,
    responderId: string,
  ): Promise<void> {
    const responder = await this.prisma.user.findUnique({
      where: { id: responderId },
      select: { profile: { select: { displayName: true } } },
    });

    await this.redisService.publish(
      'sos:update',
      JSON.stringify({
        type: 'SOS_RESPONDER_ARRIVED',
        userId,
        alertId,
        responderId,
        responderName: responder?.profile?.displayName || 'A nearby runner',
      }),
    );
  }

  async notifySOSResolved(alertId: string): Promise<void> {
    const alert = await this.prisma.sOSAlert.findUnique({
      where: { id: alertId },
      include: {
        user: { select: { profile: { select: { displayName: true } } } },
        responders: true,
      },
    });

    if (!alert) return;

    // Notify all responders
    for (const responder of alert.responders) {
      await this.redisService.publish(
        'sos:update',
        JSON.stringify({
          type: 'SOS_RESOLVED',
          userId: responder.responderId,
          alertId,
          userName: alert.user.profile?.displayName || 'The runner',
        }),
      );
    }

    this.logger.log(`SOS resolved notification sent for ${alertId}`);
  }

  private async sendSMS(to: string, message: string): Promise<void> {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      this.logger.warn('Twilio not configured, skipping SMS');
      return;
    }

    try {
      const twilio = await import('twilio');
      const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);

      await client.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to,
      });

      this.logger.log(`SMS sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${(error as Error).message}`);
    }
  }
}

