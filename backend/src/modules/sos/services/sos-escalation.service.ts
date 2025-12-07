import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SOSStatus, SOSEscalationLevel } from '@prisma/client';

@Injectable()
export class SosEscalationService {
  private readonly logger = new Logger(SosEscalationService.name);
  private readonly verificationTimeout: number;
  private readonly level1Timeout: number;
  private readonly level2Timeout: number;

  constructor(
    @InjectQueue('sos-escalation') private readonly escalationQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.verificationTimeout = this.configService.get('SOS_VERIFICATION_TIMEOUT_SECONDS', 10) * 1000;
    this.level1Timeout = this.configService.get('SOS_ESCALATION_LEVEL1_SECONDS', 30) * 1000;
    this.level2Timeout = this.configService.get('SOS_ESCALATION_LEVEL2_SECONDS', 60) * 1000;
  }

  async scheduleVerificationCheck(alertId: string): Promise<void> {
    await this.escalationQueue.add(
      'verification-timeout',
      { alertId },
      {
        delay: this.verificationTimeout,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Scheduled verification check for SOS ${alertId}`);
  }

  async scheduleEscalation(alertId: string): Promise<void> {
    // Schedule Level 2 escalation
    await this.escalationQueue.add(
      'escalate-level2',
      { alertId },
      {
        delay: this.level1Timeout,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // Schedule Level 3 escalation
    await this.escalationQueue.add(
      'escalate-level3',
      { alertId },
      {
        delay: this.level1Timeout + this.level2Timeout,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Scheduled escalation for SOS ${alertId}`);
  }

  async cancelEscalation(alertId: string): Promise<void> {
    // Remove all pending escalation jobs for this alert
    const jobs = await this.escalationQueue.getJobs(['delayed', 'waiting']);
    for (const job of jobs) {
      if (job.data.alertId === alertId) {
        await job.remove();
      }
    }

    this.logger.log(`Cancelled escalation for SOS ${alertId}`);
  }

  async processVerificationTimeout(alertId: string): Promise<void> {
    const alert = await this.prisma.sOSAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.status !== SOSStatus.PENDING_VERIFICATION) {
      return; // Already processed
    }

    // No response from user - assume emergency is real
    await this.prisma.sOSAlert.update({
      where: { id: alertId },
      data: {
        status: SOSStatus.ACTIVE,
        verificationSentAt: new Date(),
      },
    });

    this.logger.warn(`SOS ${alertId} auto-activated due to verification timeout`);

    // Trigger full broadcast
    // This would be done via event emitter or direct service call
  }

  async processLevel2Escalation(alertId: string): Promise<void> {
    const alert = await this.prisma.sOSAlert.findUnique({
      where: { id: alertId },
      include: {
        responders: true,
      },
    });

    if (!alert || alert.status !== SOSStatus.ACTIVE) {
      return;
    }

    // Check if any responders have accepted
    const acceptedResponders = alert.responders.filter((r) => r.status === 'ACCEPTED');
    if (acceptedResponders.length > 0) {
      // Help is on the way, update level but don't escalate further
      await this.prisma.sOSAlert.update({
        where: { id: alertId },
        data: { escalationLevel: SOSEscalationLevel.LEVEL_2 },
      });
      return;
    }

    // No responders - escalate to emergency contacts via call
    await this.prisma.sOSAlert.update({
      where: { id: alertId },
      data: {
        escalationLevel: SOSEscalationLevel.LEVEL_2,
        status: SOSStatus.ESCALATED,
      },
    });

    this.logger.warn(`SOS ${alertId} escalated to Level 2 - calling emergency contacts`);

    // Trigger emergency contact calls (would be handled by notification service)
  }

  async processLevel3Escalation(alertId: string): Promise<void> {
    const alert = await this.prisma.sOSAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.status !== SOSStatus.ESCALATED) {
      return;
    }

    // Maximum escalation - start audio recording and location logging
    await this.prisma.sOSAlert.update({
      where: { id: alertId },
      data: { escalationLevel: SOSEscalationLevel.LEVEL_3 },
    });

    this.logger.warn(`SOS ${alertId} escalated to Level 3 - starting audio recording`);

    // Trigger audio recording and intensive location tracking
  }
}

