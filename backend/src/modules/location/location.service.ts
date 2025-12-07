import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { GeoService } from '@/core/redis/geo.service';
import { RedisService } from '@/core/redis/redis.service';
import { LocationValidationService } from './services/location-validation.service';
import { LocationHistoryService } from './services/location-history.service';
import {
  LocationUpdateDto,
  LocationResponseDto,
  BulkLocationUpdateDto,
} from './dto/location.dto';

export interface LocationBroadcast {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  timestamp: Date;
  distance?: number;
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
    private readonly redisService: RedisService,
    private readonly validationService: LocationValidationService,
    private readonly historyService: LocationHistoryService,
  ) {}

  async updateLocation(
    userId: string,
    dto: LocationUpdateDto,
    sessionId?: string,
  ): Promise<LocationResponseDto> {
    // Validate location data
    const validation = await this.validationService.validateLocation(userId, dto);
    if (!validation.isValid) {
      this.logger.warn(`Invalid location from user ${userId}: ${validation.reason}`);
      throw new BadRequestException(`Invalid location: ${validation.reason}`);
    }

    // Check for anomalies
    if (validation.isAnomalous) {
      this.logger.warn(`Anomalous location detected for user ${userId}: ${validation.reason}`);
      // Could trigger additional verification or alert
    }

    // Update geo index
    await this.geoService.updateRunnerLocation(userId, dto.longitude, dto.latitude, sessionId);

    // Store location in database
    const location = await this.prisma.liveLocation.create({
      data: {
        userId,
        sessionId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        altitude: dto.altitude,
        accuracy: dto.accuracy,
        speed: dto.speed,
        heading: dto.heading,
        batteryLevel: dto.batteryLevel,
        isCharging: dto.isCharging,
        networkType: dto.networkType,
        signatureHash: dto.signatureHash,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      },
    });

    // Cache latest location
    await this.cacheLatestLocation(userId, location);

    // Update session participant stats if in a session
    if (sessionId) {
      await this.updateSessionStats(userId, sessionId, dto);
    }

    return {
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude,
      speed: location.speed,
      heading: location.heading,
      timestamp: location.timestamp,
      sessionId: location.sessionId,
    };
  }

  async updateLocationsBulk(
    userId: string,
    dto: BulkLocationUpdateDto,
    sessionId?: string,
  ): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;

    for (const location of dto.locations) {
      try {
        await this.updateLocation(userId, location, sessionId);
        processed++;
      } catch (error) {
        this.logger.warn(`Failed to process location: ${(error as Error).message}`);
        errors++;
      }
    }

    return { processed, errors };
  }

  async getLatestLocation(userId: string): Promise<LocationResponseDto | null> {
    // Try cache first
    const cached = await this.redisService.get(`location:latest:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fall back to database
    const location = await this.prisma.liveLocation.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    if (!location) return null;

    const response: LocationResponseDto = {
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude,
      speed: location.speed,
      heading: location.heading,
      timestamp: location.timestamp,
      sessionId: location.sessionId,
    };

    // Cache for future requests
    await this.cacheLatestLocation(userId, location);

    return response;
  }

  async getSessionLocations(sessionId: string): Promise<LocationBroadcast[]> {
    const cacheKey = `session:${sessionId}:locations`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get all participants with their latest locations
    const participants = await this.prisma.runParticipant.findMany({
      where: { sessionId, status: 'JOINED' },
      include: {
        user: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    const locations: LocationBroadcast[] = [];

    for (const participant of participants) {
      const pos = await this.geoService.getRunnerPosition(participant.userId);
      if (pos) {
        const latestLoc = await this.getLatestLocation(participant.userId);
        locations.push({
          userId: participant.userId,
          displayName: participant.user.profile?.displayName || 'Unknown',
          avatarUrl: participant.user.profile?.avatarUrl,
          latitude: pos.latitude,
          longitude: pos.longitude,
          speed: latestLoc?.speed,
          heading: latestLoc?.heading,
          timestamp: latestLoc?.timestamp || new Date(),
          distance: participant.distance,
        });
      }
    }

    // Cache for 2 seconds
    await this.redisService.set(cacheKey, JSON.stringify(locations), 2);

    return locations;
  }

  async getLocationHistory(
    userId: string,
    sessionId?: string,
    startTime?: Date,
    endTime?: Date,
  ) {
    return this.historyService.getHistory(userId, sessionId, startTime, endTime);
  }

  async clearLocationHistory(userId: string, sessionId?: string): Promise<void> {
    await this.historyService.clearHistory(userId, sessionId);
  }

  private async cacheLatestLocation(
    userId: string,
    location: {
      id: string;
      latitude: number;
      longitude: number;
      altitude: number | null;
      speed: number | null;
      heading: number | null;
      timestamp: Date;
      sessionId: string | null;
    },
  ): Promise<void> {
    const data: LocationResponseDto = {
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude,
      speed: location.speed,
      heading: location.heading,
      timestamp: location.timestamp,
      sessionId: location.sessionId,
    };

    await this.redisService.set(`location:latest:${userId}`, JSON.stringify(data), 60);
  }

  private async updateSessionStats(
    userId: string,
    sessionId: string,
    dto: LocationUpdateDto,
  ): Promise<void> {
    // Get previous location
    const prevLocation = await this.historyService.getPreviousLocation(userId, sessionId);

    if (prevLocation) {
      // Calculate distance increment
      const distance = this.calculateDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        dto.latitude,
        dto.longitude,
      );

      // Calculate time increment
      const timeDiff = dto.timestamp
        ? (dto.timestamp - prevLocation.timestamp.getTime()) / 1000
        : 0;

      // Update participant stats
      await this.prisma.runParticipant.updateMany({
        where: { sessionId, userId },
        data: {
          distance: { increment: distance },
          duration: { increment: Math.max(0, Math.floor(timeDiff)) },
          maxSpeed: dto.speed
            ? { set: dto.speed }
            : undefined,
        },
      });
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

