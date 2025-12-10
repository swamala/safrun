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
  InitiatePendingSOSDto,
  ActivateSOSDto,
  CancelSOSDto,
  VerifySOSDto,
  AcknowledgeSOSDto,
  RespondToSOSDto,
  UpdateResponderLocationDto,
  SOSAlertResponseDto,
  SOSListResponseDto,
  RespondersListDto,
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

  async initiatePendingSOS(
    userId: string,
    dto: InitiatePendingSOSDto,
  ): Promise<SOSAlertResponseDto> {
    // Check for existing active/pending SOS
    const existingActive = await this.prisma.sOSAlert.findFirst({
      where: {
        userId,
        status: { in: [SOSStatus.PENDING, SOSStatus.PENDING_VERIFICATION, SOSStatus.ACTIVE] },
      },
    });

    if (existingActive) {
      throw new BadRequestException('You already have an active or pending SOS alert');
    }

    const countdownSeconds = dto.countdownSeconds || 5;

    // Create pending SOS alert
    const sosAlert = await this.prisma.sOSAlert.create({
      data: {
        userId,
        triggerType: SOSTriggerType.MANUAL,
        latitude: dto.latitude,
        longitude: dto.longitude,
        batteryLevel: dto.batteryLevel,
        status: SOSStatus.PENDING,
        countdownStartedAt: new Date(),
        countdownSeconds,
        escalationLevel: SOSEscalationLevel.LEVEL_1,
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

    // Cache pending SOS
    await this.redisService.set(
      `sos:pending:${userId}`,
      JSON.stringify({ id: sosAlert.id, countdownEnds: Date.now() + countdownSeconds * 1000 }),
      countdownSeconds + 30,
    );

    // Schedule auto-activation job
    await this.escalationService.scheduleAutoActivation(sosAlert.id, countdownSeconds);

    this.logger.log(`Pending SOS initiated by user ${userId}: ${sosAlert.id}`);

    return this.mapToResponse(sosAlert, countdownSeconds);
  }

  async activateSOS(userId: string, dto: ActivateSOSDto): Promise<SOSAlertResponseDto> {
    const sosAlert = await this.prisma.sOSAlert.findFirst({
      where: {
        id: dto.alertId,
        userId,
        status: SOSStatus.PENDING,
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
      throw new NotFoundException('Pending SOS alert not found');
    }

    // Create fuzzy location for responders
    const { approxLat, approxLon } = this.fuzzLocation(sosAlert.latitude, sosAlert.longitude);

    // Activate the SOS
    const updated = await this.prisma.sOSAlert.update({
      where: { id: sosAlert.id },
      data: {
        status: SOSStatus.ACTIVE,
        activatedAt: new Date(),
        approxLatitude: approxLat,
        approxLongitude: approxLon,
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
      JSON.stringify({ id: updated.id, status: 'ACTIVE' }),
      3600,
    );
    await this.redisService.del(`sos:pending:${userId}`);

    // Broadcast to nearby runners and emergency contacts
    await this.broadcastSOS(updated);

    // Schedule escalation
    await this.escalationService.scheduleEscalation(updated.id);

    this.logger.log(`SOS activated: ${updated.id}`);

    return this.mapToResponse(updated);
  }

  async cancelSOS(userId: string, dto: CancelSOSDto): Promise<SOSAlertResponseDto> {
    const sosAlert = await this.prisma.sOSAlert.findFirst({
      where: {
        id: dto.alertId,
        userId,
        status: { in: [SOSStatus.PENDING, SOSStatus.PENDING_VERIFICATION, SOSStatus.ACTIVE] },
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
      throw new NotFoundException('Active SOS alert not found');
    }

    const updated = await this.prisma.sOSAlert.update({
      where: { id: sosAlert.id },
      data: {
        status: SOSStatus.CANCELLED,
        cancelledAt: new Date(),
        notes: dto.reason ? `Cancelled: ${dto.reason}` : sosAlert.notes,
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

    // Clear caches
    await this.redisService.del(`sos:active:${userId}`);
    await this.redisService.del(`sos:pending:${userId}`);

    // Cancel any scheduled jobs
    await this.escalationService.cancelEscalation(sosAlert.id);

    // Notify responders if SOS was active
    if (sosAlert.status === SOSStatus.ACTIVE) {
      await this.notificationService.notifySOSCancelled(sosAlert.id);
    }

    this.logger.log(`SOS cancelled: ${sosAlert.id}`);

    return this.mapToResponse(updated);
  }

  async respondToSOS(
    responderId: string,
    dto: RespondToSOSDto,
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

    if (sosAlert.userId === responderId) {
      throw new BadRequestException('You cannot respond to your own SOS');
    }

    // Check if already a responder
    const existingResponder = sosAlert.responders.find((r) => r.responderId === responderId);

    if (existingResponder) {
      // Update existing responder status
      await this.prisma.sOSResponder.update({
        where: { id: existingResponder.id },
        data: {
          status: dto.accepted ? ResponderStatus.ACCEPTED : ResponderStatus.DECLINED,
          acceptedAt: dto.accepted ? new Date() : null,
          declinedAt: dto.accepted ? null : new Date(),
          lastLatitude: dto.latitude,
          lastLongitude: dto.longitude,
        },
      });
    } else {
      // Create new responder
      let distance: number | undefined;
      if (dto.latitude && dto.longitude) {
        distance = this.calculateDistance(
          dto.latitude,
          dto.longitude,
          sosAlert.approxLatitude || sosAlert.latitude,
          sosAlert.approxLongitude || sosAlert.longitude,
        );
      }

      await this.prisma.sOSResponder.create({
        data: {
          sosAlertId: sosAlert.id,
          responderId,
          status: dto.accepted ? ResponderStatus.ACCEPTED : ResponderStatus.DECLINED,
          acceptedAt: dto.accepted ? new Date() : null,
          declinedAt: dto.accepted ? null : new Date(),
          distanceMeters: distance,
          lastLatitude: dto.latitude,
          lastLongitude: dto.longitude,
        },
      });
    }

    if (dto.accepted) {
      // Notify the user that help is on the way
      await this.notificationService.notifyUserResponderAccepted(
        sosAlert.userId,
        sosAlert.id,
        responderId,
      );

      // Send precise location to accepted responders
      await this.responderService.sendPreciseLocation(
        responderId,
        sosAlert.id,
        sosAlert.latitude,
        sosAlert.longitude,
      );

      this.logger.log(`Responder ${responderId} accepted SOS ${sosAlert.id}`);
    }

    // Fetch updated alert
    const updatedAlert = await this.prisma.sOSAlert.findUnique({
      where: { id: dto.alertId },
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

    return this.mapToResponse(updatedAlert!);
  }

  async updateResponderLocation(
    responderId: string,
    dto: UpdateResponderLocationDto,
  ): Promise<number | null> {
    const responder = await this.prisma.sOSResponder.findFirst({
      where: {
        sosAlertId: dto.alertId,
        responderId,
        status: { in: [ResponderStatus.ACCEPTED, ResponderStatus.EN_ROUTE] },
      },
      include: {
        sosAlert: true,
      },
    });

    if (!responder) {
      throw new NotFoundException('Responder not found or not accepted');
    }

    // Calculate distance and ETA
    const distance = this.calculateDistance(
      dto.latitude,
      dto.longitude,
      responder.sosAlert.latitude,
      responder.sosAlert.longitude,
    );

    // Estimate ETA based on average running speed (3 m/s ~ 10.8 km/h)
    const averageSpeed = 3; // m/s
    const estimatedETA = Math.round(distance / averageSpeed);

    await this.prisma.sOSResponder.update({
      where: { id: responder.id },
      data: {
        lastLatitude: dto.latitude,
        lastLongitude: dto.longitude,
        distanceMeters: distance,
        estimatedETA,
        status: ResponderStatus.EN_ROUTE,
      },
    });

    // Notify SOS owner of updated ETA
    await this.notificationService.notifyUserResponderUpdate(
      responder.sosAlert.userId,
      responder.sosAlertId,
      responderId,
      distance,
      estimatedETA,
    );

    return estimatedETA;
  }

  async getRespondersForUserSOS(userId: string): Promise<RespondersListDto> {
    const sosAlert = await this.prisma.sOSAlert.findFirst({
      where: {
        userId,
        status: { in: [SOSStatus.ACTIVE, SOSStatus.ACKNOWLEDGED] },
      },
      include: {
        responders: {
          include: {
            responder: {
              select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
            },
          },
        },
      },
    });

    if (!sosAlert) {
      return { responders: [], totalAccepted: 0, totalNotified: 0, totalArrived: 0 };
    }

    return this.mapRespondersToDto(sosAlert.responders);
  }

  async getAlertResponders(alertId: string): Promise<RespondersListDto> {
    const responders = await this.prisma.sOSResponder.findMany({
      where: { sosAlertId: alertId },
      include: {
        responder: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
      },
    });

    return this.mapRespondersToDto(responders);
  }

  // Legacy methods (keeping for backwards compatibility)
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
          activatedAt: new Date(),
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
    return this.respondToSOS(responderId, {
      alertId: dto.alertId,
      accepted: dto.accepted,
    });
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
        status: { in: [SOSStatus.PENDING, SOSStatus.PENDING_VERIFICATION, SOSStatus.ACTIVE] },
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

    if (!sosAlert) return null;

    // Calculate countdown remaining for pending SOS
    let countdownRemaining: number | undefined;
    if (sosAlert.status === SOSStatus.PENDING && sosAlert.countdownStartedAt) {
      const elapsed = (Date.now() - sosAlert.countdownStartedAt.getTime()) / 1000;
      countdownRemaining = Math.max(0, sosAlert.countdownSeconds - Math.floor(elapsed));
    }

    return this.mapToResponse(sosAlert, countdownRemaining);
  }

  async getAlertHistory(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<SOSListResponseDto> {
    const take = limit ?? 10;
    const skip = offset ?? 0;
    
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
        skip,
        take,
      }),
      this.prisma.sOSAlert.count({ where: { userId } }),
    ]);

    return {
      alerts: alerts.map((a) => this.mapToResponse(a)),
      total,
      offset: skip,
      limit: take,
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

    return nearbyAlerts.map((a) => this.mapToResponse(a));
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

  private mapRespondersToDto(
    responders: Array<{
      id: string;
      responderId: string;
      status: ResponderStatus;
      distanceMeters: number | null;
      estimatedETA: number | null;
      lastLatitude: number | null;
      lastLongitude: number | null;
      responder: {
        id: string;
        profile: { displayName: string; avatarUrl: string | null } | null;
      };
    }>,
  ): RespondersListDto {
    const mapped = responders.map((r) => ({
      id: r.id,
      responderId: r.responderId,
      displayName: r.responder.profile?.displayName || 'Unknown',
      avatarUrl: r.responder.profile?.avatarUrl,
      status: r.status,
      distance: r.distanceMeters,
      estimatedETA: r.estimatedETA,
      lastLatitude: r.lastLatitude,
      lastLongitude: r.lastLongitude,
    }));

    return {
      responders: mapped,
      totalAccepted: responders.filter((r) => r.status === ResponderStatus.ACCEPTED || r.status === ResponderStatus.EN_ROUTE).length,
      totalNotified: responders.filter((r) => r.status === ResponderStatus.NOTIFIED).length,
      totalArrived: responders.filter((r) => r.status === ResponderStatus.ARRIVED).length,
    };
  }

  private mapToResponse(
    alert: {
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
      activatedAt?: Date | null;
      verificationSentAt: Date | null;
      acknowledgedAt: Date | null;
      resolvedAt: Date | null;
      cancelledAt?: Date | null;
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
        estimatedETA?: number | null;
        lastLatitude?: number | null;
        lastLongitude?: number | null;
        responder?: {
          id: string;
          profile: { displayName: string; avatarUrl?: string | null } | null;
        };
      }>;
    },
    countdownRemaining?: number,
  ): SOSAlertResponseDto {
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
      countdownRemaining,
      triggeredAt: alert.triggeredAt,
      activatedAt: alert.activatedAt || null,
      verificationSentAt: alert.verificationSentAt,
      acknowledgedAt: alert.acknowledgedAt,
      resolvedAt: alert.resolvedAt,
      cancelledAt: alert.cancelledAt || null,
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
        estimatedETA: r.estimatedETA,
        lastLatitude: r.lastLatitude,
        lastLongitude: r.lastLongitude,
      })),
    };
  }
}
