import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LocationHistoryResponseDto, LocationPointDto } from '../dto/location.dto';

@Injectable()
export class LocationHistoryService {
  private readonly logger = new Logger(LocationHistoryService.name);
  private readonly retentionHours: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.retentionHours = this.configService.get('LOCATION_HISTORY_RETENTION_HOURS', 24);
  }

  async getHistory(
    userId: string,
    sessionId?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<LocationHistoryResponseDto> {
    const where: Record<string, unknown> = { userId };

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (startTime || endTime) {
      where.timestamp = {};
      if (startTime) (where.timestamp as Record<string, Date>).gte = startTime;
      if (endTime) (where.timestamp as Record<string, Date>).lte = endTime;
    }

    const locations = await this.prisma.liveLocation.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      select: {
        latitude: true,
        longitude: true,
        altitude: true,
        speed: true,
        heading: true,
        timestamp: true,
      },
    });

    if (locations.length === 0) {
      return {
        userId,
        sessionId,
        points: [],
        totalDistance: 0,
        duration: 0,
        averageSpeed: null,
        startTime: new Date(),
        endTime: new Date(),
      };
    }

    const points: LocationPointDto[] = locations.map((loc) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
      altitude: loc.altitude,
      speed: loc.speed,
      heading: loc.heading,
      timestamp: loc.timestamp,
    }));

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistance += this.calculateDistance(
        locations[i - 1].latitude,
        locations[i - 1].longitude,
        locations[i].latitude,
        locations[i].longitude,
      );
    }

    const startTimeResult = locations[0].timestamp;
    const endTimeResult = locations[locations.length - 1].timestamp;
    const duration = (endTimeResult.getTime() - startTimeResult.getTime()) / 1000;
    const averageSpeed = duration > 0 ? totalDistance / duration : null;

    return {
      userId,
      sessionId,
      points,
      totalDistance,
      duration,
      averageSpeed,
      startTime: startTimeResult,
      endTime: endTimeResult,
    };
  }

  async getPreviousLocation(
    userId: string,
    sessionId?: string,
  ): Promise<{ latitude: number; longitude: number; timestamp: Date } | null> {
    const location = await this.prisma.liveLocation.findFirst({
      where: { userId, sessionId },
      orderBy: { timestamp: 'desc' },
      select: { latitude: true, longitude: true, timestamp: true },
    });

    return location;
  }

  async clearHistory(userId: string, sessionId?: string): Promise<void> {
    const where: Record<string, unknown> = { userId };
    if (sessionId) {
      where.sessionId = sessionId;
    }

    await this.prisma.liveLocation.deleteMany({ where });
    this.logger.log(`Location history cleared for user ${userId}`);
  }

  async cleanupOldLocations(): Promise<number> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - this.retentionHours);

    const result = await this.prisma.liveLocation.deleteMany({
      where: {
        timestamp: { lt: cutoff },
        sessionId: null, // Only delete locations not tied to a session
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} old location records`);
    }

    return result.count;
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
}

