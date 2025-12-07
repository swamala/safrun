import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { GeoService } from '@/core/redis/geo.service';
import { RedisService } from '@/core/redis/redis.service';
import { SosEscalationService } from './services/sos-escalation.service';
import { SosResponderService } from './services/sos-responder.service';
import { SosNotificationService } from './services/sos-notification.service';
import {
  TriggerSOSDto,
  VerifySOSDto,
  AcknowledgeSOSDto,
  SOSAlertResponseDto,
  SOSListResponseDto,
} from './dto/sos.dto';
import { SOSStatus, SOSTriggerType, SOSEscalationLevel, ResponderStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SosService {
  private readonly logger = new Logger(SosService.name);
  private readonly broadcastRadius: number;
  private readonly maxResponders: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
    private readonly redisService: RedisService,
    private readonly escalationService: SosEscalationService,
    private readonly responderService: SosResponderService,
    private readonly notificationService: SosNotificationService,
    private readonly configService: ConfigService,
  ) {
    this.broadcastRadius = this.configService.get('SOS_BROADCAST_RADIUS_METERS', 1000);
    this.maxResponders = this.configService.get('MAX_RESPONDERS_PER_SOS', 5);
  }

  async triggerSOS(userId: string, dto: TriggerSOSDto): Promise<SOSAlertResponseDto> {
    // Check for existing active SOS
    const existingActive = await this.prisma.sOSAlert.findFirst({
      where: {
        userId,
        status: { in: [SOSStatus.PENDING_VERIFICATION, SOSStatus.ACTIVE] },
      },
    });

    if (existingActive) {
      throw new BadRequestException('You already have an active SOS alert');
    }

    // Create fuzzy location for responders
    const { approxLat, approxLon } = this.fuzzLocation(dto.latitude, dto.longitude);

    // Create SOS alert
    const sosAlert = await this.prisma.sOSAlert.create({
      data: {
        userId,
        triggerType: dto.triggerType as SOSTriggerType,
        latitude: dto.latitude,
        longitude: dto.longitude,
        approxLatitude: approxLat,
        approxLongitude: approxLon,
        batteryLevel: dto.batteryLevel,
        status: SOSStatus.PENDING_VERIFICATION,
        escalationLevel: SOSEscalationLevel.LEVEL_1,
        notes: dto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    // Cache active SOS
    await this.redisService.set(
      `sos:active:${userId}`,
      JSON.stringify({ id: sosAlert.id, status: 'PENDING_VERIFICATION' }),
      3600,
    );

    // Schedule verification check
    await this.escalationService.scheduleVerificationCheck(sosAlert.id);

    // Send verification popup to user
    await this.notificationService.sendVerificationRequest(userId, sosAlert.id);

    this.logger.log(`SOS triggered by user ${userId}: ${sosAlert.id}`);

    return this.mapToResponse(sosAlert);
  }

  async verifySOSResponse(userId: string, dto: VerifySOSDto): Promise<SOSAlertResponseDto> {
    const sosAlert = await this.prisma.sOSAlert.findFirst({
      where: {
        id: dto.alertId,
        userId,
        status: SOSStatus.PENDING_VERIFICATION,
      },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!sosAlert) {
      throw new NotFoundException('SOS alert not found or already processed');
    }

    if (dto.isSafe) {
      // User is safe - mark as false alarm
      const updated = await this.prisma.sOSAlert.update({
        where: { id: sosAlert.id },
        data: {
          status: SOSStatus.FALSE_ALARM,
          resolvedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      });

      await this.redisService.del(`sos:active:${userId}`);
      await this.escalationService.cancelEscalation(sosAlert.id);

      this.logger.log(`SOS marked as false alarm: ${sosAlert.id}`);

      return this.mapToResponse(updated);
    } else {
      // User confirms emergency - activate full SOS
      const updated = await this.prisma.sOSAlert.update({
        where: { id: sosAlert.id },
        data: {
          status: SOSStatus.ACTIVE,
          verificationSentAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      });

      await this.redisService.set(
        `sos:active:${userId}`,
        JSON.stringify({ id: sosAlert.id, status: 'ACTIVE' }),
        3600,
      );

      // Broadcast to nearby runners and emergency contacts
      await this.broadcastSOS(sosAlert);

      // Schedule escalation
      await this.escalationService.scheduleEscalation(sosAlert.id);

      this.logger.log(`SOS activated: ${sosAlert.id}`);

      return this.mapToResponse(updated);
    }
  }

  async acknowledgeAsResponder(
    responderId: string,
    dto: AcknowledgeSOSDto,
  ): Promise<SOSAlertResponseDto> {
    const sosAlert = await this.prisma.sOSAlert.findUnique({
      where: { id: dto.alertId },
      include: {
        responders: true,
        user: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!sosAlert) {
      throw new NotFoundException('SOS alert not found');
    }

    if (sosAlert.status !== SOSStatus.ACTIVE) {
      throw new BadRequestException('SOS alert is not active');
    }

    const existingResponder = sosAlert.responders.find((r) => r.responderId === responderId);
    if (!existingResponder) {
      throw new ForbiddenException('You are not a notified responder for this SOS');
    }

    // Update responder status
    await this.prisma.sOSResponder.update({
      where: { id: existingResponder.id },
      data: {
        status: dto.accepted ? ResponderStatus.ACCEPTED : ResponderStatus.DECLINED,
        acceptedAt: dto.accepted ? new Date() : null,
        declinedAt: dto.accepted ? null : new Date(),
      },
    });

    if (dto.accepted) {
      // Notify the user that help is on the way
      await this.notificationService.notifyUserResponderAccepted(
        sosAlert.userId,
        sosAlert.id,
        responderId,
      );

      // Check if this is one of the first responders
      const acceptedCount = sosAlert.responders.filter(
        (r) => r.status === ResponderStatus.ACCEPTED || r.responderId === responderId,
      ).length;

      if (acceptedCount <= 3) {
        // Send precise location to first 3 responders
        await this.responderService.sendPreciseLocation(
          responderId,
          sosAlert.id,
          sosAlert.latitude,
          sosAlert.longitude,
        );
      }

      this.logger.log(`Responder ${responderId} accepted SOS ${sosAlert.id}`);
    }

    return this.mapToResponse(sosAlert);
  }

  async markResponderArrived(
    responderId: string,
    alertId: string,
  ): Promise<void> {
    await this.prisma.sOSResponder.updateMany({
      where: { sosAlertId: alertId, responderId },
      data: {
        status: ResponderStatus.ARRIVED,
        arrivedAt: new Date(),
      },
    });

    const sosAlert = await this.prisma.sOSAlert.findUnique({
      where: { id: alertId },
    });

    if (sosAlert) {
      await this.notificationService.notifyUserResponderArrived(
        sosAlert.userId,
        alertId,
        responderId,
      );
    }

    this.logger.log(`Responder ${responderId} arrived at SOS ${alertId}`);
  }

  async resolveAlert(userId: string, alertId: string): Promise<SOSAlertResponseDto> {
    const sosAlert = await this.prisma.sOSAlert.findFirst({
      where: {
        id: alertId,
        userId,
        status: { in: [SOSStatus.ACTIVE, SOSStatus.ACKNOWLEDGED] },
      },
    });

    if (!sosAlert) {
      throw new NotFoundException('Active SOS alert not found');
    }

    const updated = await this.prisma.sOSAlert.update({
      where: { id: alertId },
      data: {
        status: SOSStatus.RESOLVED,
        resolvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        responders: {
          include: {
            responder: {
              select: { id: true, profile: { select: { displayName: true } } },
            },
          },
        },
      },
    });

    await this.redisService.del(`sos:active:${userId}`);
    await this.escalationService.cancelEscalation(alertId);

    // Notify all responders and guardians
    await this.notificationService.notifySOSResolved(alertId);

    this.logger.log(`SOS resolved: ${alertId}`);

    return this.mapToResponse(updated);
  }

  async getActiveAlert(userId: string): Promise<SOSAlertResponseDto | null> {
    const sosAlert = await this.prisma.sOSAlert.findFirst({
      where: {
        userId,
        status: { in: [SOSStatus.PENDING_VERIFICATION, SOSStatus.ACTIVE] },
      },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        responders: {
          include: {
            responder: {
              select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
            },
          },
        },
      },
    });

    return sosAlert ? this.mapToResponse(sosAlert) : null;
  }

  async getAlertHistory(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<SOSListResponseDto> {
    const [alerts, total] = await Promise.all([
      this.prisma.sOSAlert.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { triggeredAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.sOSAlert.count({ where: { userId } }),
    ]);

    return {
      alerts: alerts.map(this.mapToResponse),
      total,
      offset,
      limit,
    };
  }

  async getNearbyAlerts(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<SOSAlertResponseDto[]> {
    // Find active SOS alerts within broadcast radius
    const activeAlerts = await this.prisma.sOSAlert.findMany({
      where: {
        status: SOSStatus.ACTIVE,
        userId: { not: userId },
      },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        responders: {
          where: { responderId: userId },
        },
      },
    });

    // Filter by distance
    const nearbyAlerts = activeAlerts.filter((alert) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        alert.approxLatitude || alert.latitude,
        alert.approxLongitude || alert.longitude,
      );
      return distance <= this.broadcastRadius;
    });

    return nearbyAlerts.map(this.mapToResponse);
  }

  private async broadcastSOS(sosAlert: {
    id: string;
    userId: string;
    latitude: number;
    longitude: number;
    approxLatitude: number | null;
    approxLongitude: number | null;
  }): Promise<void> {
    // Find nearby runners
    const nearbyRunners = await this.geoService.findNearbyRunners(
      sosAlert.longitude,
      sosAlert.latitude,
      this.broadcastRadius,
      this.maxResponders * 2,
      sosAlert.userId,
    );

    // Create responder records
    for (const runner of nearbyRunners.slice(0, this.maxResponders)) {
      await this.responderService.notifyResponder(
        runner.member,
        sosAlert.id,
        sosAlert.approxLatitude || sosAlert.latitude,
        sosAlert.approxLongitude || sosAlert.longitude,
        runner.distance,
      );
    }

    // Notify emergency contacts
    await this.notificationService.notifyEmergencyContacts(sosAlert.userId, sosAlert.id);

    // Notify group members if user is in an active session
    await this.notificationService.notifyGroupMembers(sosAlert.userId, sosAlert.id);

    this.logger.log(
      `SOS ${sosAlert.id} broadcast to ${nearbyRunners.length} nearby runners`,
    );
  }

  private fuzzLocation(lat: number, lon: number): { approxLat: number; approxLon: number } {
    // Add random offset of 100-300 meters
    const offsetMeters = 100 + Math.random() * 200;
    const angle = Math.random() * 2 * Math.PI;

    const offsetLat = (offsetMeters * Math.cos(angle)) / 111320;
    const offsetLon = (offsetMeters * Math.sin(angle)) / (111320 * Math.cos((lat * Math.PI) / 180));

    return {
      approxLat: lat + offsetLat,
      approxLon: lon + offsetLon,
    };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private mapToResponse(alert: {
    id: string;
    userId: string;
    triggerType: SOSTriggerType;
    status: SOSStatus;
    escalationLevel: SOSEscalationLevel;
    latitude: number;
    longitude: number;
    approxLatitude: number | null;
    approxLongitude: number | null;
    triggeredAt: Date;
    verificationSentAt: Date | null;
    acknowledgedAt: Date | null;
    resolvedAt: Date | null;
    notes: string | null;
    batteryLevel: number | null;
    user: {
      id: string;
      profile: { displayName: string; avatarUrl: string | null } | null;
    };
    responders?: Array<{
      id: string;
      responderId: string;
      status: ResponderStatus;
      distanceMeters: number | null;
      responder?: {
        id: string;
        profile: { displayName: string; avatarUrl?: string | null } | null;
      };
    }>;
  }): SOSAlertResponseDto {
    return {
      id: alert.id,
      userId: alert.userId,
      triggerType: alert.triggerType,
      status: alert.status,
      escalationLevel: alert.escalationLevel,
      location: {
        latitude: alert.approxLatitude || alert.latitude,
        longitude: alert.approxLongitude || alert.longitude,
        isApproximate: !!alert.approxLatitude,
      },
      triggeredAt: alert.triggeredAt,
      verificationSentAt: alert.verificationSentAt,
      acknowledgedAt: alert.acknowledgedAt,
      resolvedAt: alert.resolvedAt,
      notes: alert.notes,
      batteryLevel: alert.batteryLevel,
      user: {
        id: alert.user.id,
        displayName: alert.user.profile?.displayName || 'Unknown',
        avatarUrl: alert.user.profile?.avatarUrl,
      },
      responders: alert.responders?.map((r) => ({
        id: r.id,
        responderId: r.responderId,
        displayName: r.responder?.profile?.displayName || 'Unknown',
        avatarUrl: r.responder?.profile?.avatarUrl,
        status: r.status,
        distance: r.distanceMeters,
      })),
    };
  }
}

