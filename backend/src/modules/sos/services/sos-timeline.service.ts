import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { SOSTimelineResponseDto, SOSTimelineEventDto } from '../dto/sos.dto';

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: Date;
  actorId?: string | null;
  actorName?: string | null;
  description: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class SosTimelineService {
  private readonly logger = new Logger(SosTimelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build complete timeline for an SOS alert
   */
  async getTimeline(alertId: string): Promise<SOSTimelineResponseDto> {
    const alert = await this.prisma.sOSAlert.findUnique({
      where: { id: alertId },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { displayName: true } },
          },
        },
        responders: {
          include: {
            responder: {
              select: {
                id: true,
                profile: { select: { displayName: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('SOS alert not found');
    }

    const events: TimelineEvent[] = [];
    const userName = alert.user.profile?.displayName || 'User';

    // Triggered event
    events.push({
      id: `${alertId}_triggered`,
      type: 'TRIGGERED',
      timestamp: alert.triggeredAt,
      actorId: alert.userId,
      actorName: userName,
      description: `SOS triggered by ${userName}`,
      metadata: {
        triggerType: alert.triggerType,
        latitude: alert.latitude,
        longitude: alert.longitude,
        batteryLevel: alert.batteryLevel,
      },
    });

    // Countdown started (for pending alerts)
    if (alert.countdownStartedAt) {
      events.push({
        id: `${alertId}_countdown`,
        type: 'COUNTDOWN_STARTED',
        timestamp: alert.countdownStartedAt,
        description: `${alert.countdownSeconds || 5} second countdown started`,
        metadata: { countdownSeconds: alert.countdownSeconds },
      });
    }

    // Verification sent
    if (alert.verificationSentAt) {
      events.push({
        id: `${alertId}_verification`,
        type: 'VERIFICATION_SENT',
        timestamp: alert.verificationSentAt,
        description: 'Verification request sent to user',
      });
    }

    // Activated
    if (alert.activatedAt) {
      events.push({
        id: `${alertId}_activated`,
        type: 'ACTIVATED',
        timestamp: alert.activatedAt,
        description: 'SOS alert activated and broadcast sent',
      });
    }

    // Escalation events
    if (alert.escalationLevel && alert.escalationLevel !== 'LEVEL_1') {
      events.push({
        id: `${alertId}_escalated`,
        type: 'ESCALATED',
        timestamp: alert.updatedAt,
        description: `Alert escalated to ${alert.escalationLevel}`,
        metadata: { escalationLevel: alert.escalationLevel },
      });
    }

    // Responder events
    for (const responder of alert.responders) {
      const responderName = responder.responder?.profile?.displayName || 'Responder';

      // Notified
      events.push({
        id: `${responder.id}_notified`,
        type: 'RESPONDER_NOTIFIED',
        timestamp: responder.createdAt,
        actorId: responder.responderId,
        actorName: responderName,
        description: `${responderName} was notified`,
        metadata: { distance: responder.distanceMeters },
      });

      // Accepted/Declined
      if (responder.status !== 'NOTIFIED') {
        events.push({
          id: `${responder.id}_responded`,
          type: responder.status === 'ACCEPTED' || responder.status === 'EN_ROUTE' || responder.status === 'ARRIVED'
            ? 'RESPONDER_ACCEPTED'
            : 'RESPONDER_DECLINED',
          timestamp: responder.updatedAt,
          actorId: responder.responderId,
          actorName: responderName,
          description: `${responderName} ${
            responder.status === 'ACCEPTED' || responder.status === 'EN_ROUTE' || responder.status === 'ARRIVED'
              ? 'accepted and is en route'
              : 'declined'
          }`,
          metadata: {
            status: responder.status,
            estimatedETA: responder.estimatedETA,
          },
        });
      }

      // Arrived
      if (responder.arrivedAt) {
        events.push({
          id: `${responder.id}_arrived`,
          type: 'RESPONDER_ARRIVED',
          timestamp: responder.arrivedAt,
          actorId: responder.responderId,
          actorName: responderName,
          description: `${responderName} arrived at location`,
        });
      }
    }

    // Acknowledged
    if (alert.acknowledgedAt) {
      events.push({
        id: `${alertId}_acknowledged`,
        type: 'ACKNOWLEDGED',
        timestamp: alert.acknowledgedAt,
        description: 'User acknowledged the alert',
      });
    }

    // Cancelled
    if (alert.cancelledAt) {
      events.push({
        id: `${alertId}_cancelled`,
        type: 'CANCELLED',
        timestamp: alert.cancelledAt,
        description: `SOS cancelled (${alert.status === 'FALSE_ALARM' ? 'false alarm' : 'user cancelled'})`,
        metadata: { status: alert.status },
      });
    }

    // Resolved
    if (alert.resolvedAt) {
      events.push({
        id: `${alertId}_resolved`,
        type: 'RESOLVED',
        timestamp: alert.resolvedAt,
        description: 'SOS alert resolved',
        metadata: {
          status: alert.status,
          resolutionNotes: alert.notes,
        },
      });
    }

    // Sort by timestamp
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate durations
    const totalDurationSeconds = Math.round(
      ((alert.resolvedAt || alert.cancelledAt || new Date()).getTime() - alert.triggeredAt.getTime()) / 1000,
    );

    // Time to first response
    const firstResponse = alert.responders.find(
      (r) => r.status === 'ACCEPTED' || r.status === 'EN_ROUTE' || r.status === 'ARRIVED',
    );
    const responseTimeSeconds = firstResponse?.updatedAt
      ? Math.round((firstResponse.updatedAt.getTime() - alert.triggeredAt.getTime()) / 1000)
      : null;

    // Time to resolution
    const resolutionTimeSeconds = alert.resolvedAt
      ? Math.round((alert.resolvedAt.getTime() - alert.triggeredAt.getTime()) / 1000)
      : null;

    return {
      alertId,
      events: events as SOSTimelineEventDto[],
      totalDurationSeconds,
      responseTimeSeconds,
      resolutionTimeSeconds,
    };
  }

  /**
   * Record a timeline event (for external logging)
   */
  async recordEvent(
    alertId: string,
    type: string,
    description: string,
    actorId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    // This could store to a dedicated timeline table if needed
    this.logger.log(`SOS Timeline [${alertId}]: ${type} - ${description}`);
  }
}

