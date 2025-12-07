import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { RedisService } from '@/core/redis/redis.service';
import { ResponderStatus } from '@prisma/client';

@Injectable()
export class SosResponderService {
  private readonly logger = new Logger(SosResponderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async notifyResponder(
    responderId: string,
    alertId: string,
    approxLatitude: number,
    approxLongitude: number,
    distance: number,
  ): Promise<void> {
    // Create responder record
    await this.prisma.sOSResponder.upsert({
      where: {
        sosAlertId_responderId: {
          sosAlertId: alertId,
          responderId,
        },
      },
      create: {
        sosAlertId: alertId,
        responderId,
        status: ResponderStatus.NOTIFIED,
        distanceMeters: distance,
      },
      update: {
        status: ResponderStatus.NOTIFIED,
        notifiedAt: new Date(),
        distanceMeters: distance,
      },
    });

    // Store notification in Redis for quick access
    await this.redisService.hset(
      `sos:${alertId}:responders`,
      responderId,
      JSON.stringify({
        status: 'NOTIFIED',
        notifiedAt: Date.now(),
        distance,
        location: { latitude: approxLatitude, longitude: approxLongitude },
      }),
    );

    // The actual push notification would be sent via WebSocket gateway
    await this.redisService.publish(
      'sos:notification',
      JSON.stringify({
        type: 'SOS_ALERT',
        alertId,
        responderId,
        location: { latitude: approxLatitude, longitude: approxLongitude },
        distance,
      }),
    );

    this.logger.log(`Responder ${responderId} notified of SOS ${alertId}`);
  }

  async sendPreciseLocation(
    responderId: string,
    alertId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    // Update responder with precise location access
    await this.redisService.hset(
      `sos:${alertId}:responders`,
      responderId,
      JSON.stringify({
        status: 'ACCEPTED',
        hasPreciseLocation: true,
        preciseLocation: { latitude, longitude },
      }),
    );

    // Notify responder of precise location via WebSocket
    await this.redisService.publish(
      'sos:precise-location',
      JSON.stringify({
        type: 'SOS_PRECISE_LOCATION',
        alertId,
        responderId,
        location: { latitude, longitude },
      }),
    );

    this.logger.log(`Sent precise location to responder ${responderId} for SOS ${alertId}`);
  }

  async getResponderStats(alertId: string): Promise<{
    notified: number;
    accepted: number;
    enRoute: number;
    arrived: number;
    declined: number;
  }> {
    const responders = await this.prisma.sOSResponder.groupBy({
      by: ['status'],
      where: { sosAlertId: alertId },
      _count: true,
    });

    const stats = {
      notified: 0,
      accepted: 0,
      enRoute: 0,
      arrived: 0,
      declined: 0,
    };

    for (const r of responders) {
      switch (r.status) {
        case ResponderStatus.NOTIFIED:
          stats.notified = r._count;
          break;
        case ResponderStatus.ACCEPTED:
          stats.accepted = r._count;
          break;
        case ResponderStatus.EN_ROUTE:
          stats.enRoute = r._count;
          break;
        case ResponderStatus.ARRIVED:
          stats.arrived = r._count;
          break;
        case ResponderStatus.DECLINED:
          stats.declined = r._count;
          break;
      }
    }

    return stats;
  }

  async getRespondersForAlert(alertId: string) {
    return this.prisma.sOSResponder.findMany({
      where: { sosAlertId: alertId },
      include: {
        responder: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { distanceMeters: 'asc' },
    });
  }
}

