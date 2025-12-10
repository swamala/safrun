import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { GeoService, NearbyResult } from '@/core/redis/geo.service';
import { ConfigService } from '@nestjs/config';
import { NearbyRunnerDto, NearbySearchDto, NearbyResponseDto } from './dto/nearby.dto';

@Injectable()
export class NearbyService {
  private readonly logger = new Logger(NearbyService.name);
  private readonly defaultRadius: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
    private readonly configService: ConfigService,
  ) {
    this.defaultRadius = this.configService.get('DEFAULT_NEARBY_RADIUS_METERS', 1000);
  }

  async findNearbyRunners(
    userId: string,
    dto: NearbySearchDto,
  ): Promise<NearbyResponseDto> {
    const startTime = Date.now();
    const radius = dto.radiusMeters || this.defaultRadius;
    const limit = dto.limit || 20;

    // Find nearby runners using Redis geo-indexing
    const nearbyResults = await this.geoService.findNearbyRunners(
      dto.longitude,
      dto.latitude,
      radius,
      limit + 1, // +1 to exclude self
      userId,
    );

    // Get user profiles for nearby runners
    const runners = await this.enrichWithProfiles(nearbyResults, userId);

    const responseTime = Date.now() - startTime;
    this.logger.debug(`Nearby search completed in ${responseTime}ms for user ${userId}`);

    return {
      runners,
      searchLocation: {
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      radiusMeters: radius,
      count: runners.length,
      responseTimeMs: responseTime,
    };
  }

  async findNearbySessions(
    userId: string,
    dto: { latitude: number; longitude: number; radiusMeters?: number },
  ): Promise<any> {
    const radius = dto.radiusMeters || 5000; // 5km default

    // Find sessions that are scheduled or active with a start location
    const sessions = await this.prisma.runSession.findMany({
      where: {
        status: { in: ['SCHEDULED', 'ACTIVE'] },
        startLatitude: { not: null },
        startLongitude: { not: null },
        privacy: 'PUBLIC',
      },
      include: {
        creator: {
          select: { profile: { select: { displayName: true } } },
        },
        _count: {
          select: { participants: { where: { status: 'JOINED' } } },
        },
      },
    });

    // Filter by distance
    const nearbySessions = sessions
      .map((session) => {
        const distance = this.calculateDistance(
          dto.latitude,
          dto.longitude,
          session.startLatitude!,
          session.startLongitude!,
        );
        return { session, distance };
      })
      .filter(({ distance }) => distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    return {
      sessions: nearbySessions.map(({ session, distance }) => ({
        sessionId: session.id,
        name: session.name,
        description: session.description,
        creatorName: session.creator.profile?.displayName || 'Unknown',
        participantCount: session._count.participants,
        maxParticipants: session.maxParticipants,
        distance,
        status: session.status,
        scheduledStartAt: session.scheduledStartAt,
        location: {
          latitude: session.startLatitude!,
          longitude: session.startLongitude!,
        },
      })),
      searchLocation: { latitude: dto.latitude, longitude: dto.longitude },
      radiusMeters: radius,
      count: nearbySessions.length,
    };
  }

  async findRunnersInSession(
    userId: string,
    sessionId: string,
    latitude: number,
    longitude: number,
  ): Promise<NearbyRunnerDto[]> {
    const results = await this.geoService.findSessionRunners(
      sessionId,
      longitude,
      latitude,
    );

    return this.enrichWithProfiles(results, userId);
  }

  async updateRunnerVisibility(
    userId: string,
    isVisible: boolean,
  ): Promise<void> {
    if (!isVisible) {
      // Remove from geo index
      await this.geoService.removeRunner(userId);
    }

    // Update profile setting
    await this.prisma.profile.update({
      where: { userId },
      data: { showOnNearbyRadar: isVisible },
    });

    this.logger.log(`User ${userId} visibility set to ${isVisible}`);
  }

  async getDistanceToRunner(
    userId: string,
    targetUserId: string,
  ): Promise<number | null> {
    return this.geoService.getDistanceBetweenRunners(userId, targetUserId);
  }

  private async enrichWithProfiles(
    nearbyResults: NearbyResult[],
    excludeUserId: string,
  ): Promise<NearbyRunnerDto[]> {
    if (nearbyResults.length === 0) return [];

    const userIds = nearbyResults
      .map((r) => r.member)
      .filter((id) => id !== excludeUserId);

    if (userIds.length === 0) return [];

    // Fetch profiles
    const profiles = await this.prisma.profile.findMany({
      where: {
        userId: { in: userIds },
        showOnNearbyRadar: true,
      },
      include: {
        user: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Create lookup map
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    // Build response
    const runners: NearbyRunnerDto[] = [];

    for (const result of nearbyResults) {
      if (result.member === excludeUserId) continue;

      const profile = profileMap.get(result.member);
      if (!profile || profile.user.status !== 'ACTIVE') continue;

      runners.push({
        userId: result.member,
        displayName: profile.anonymousModeEnabled
          ? 'Anonymous Runner'
          : profile.displayName,
        avatarUrl: profile.anonymousModeEnabled ? null : profile.avatarUrl,
        distance: result.distance,
        location: profile.anonymousModeEnabled
          ? null
          : result.coordinates
            ? {
                latitude: result.coordinates.latitude,
                longitude: result.coordinates.longitude,
              }
            : null,
        isAnonymous: profile.anonymousModeEnabled,
        status: 'idle' as const,
        stats: {
          totalDistance: profile.totalDistance,
          totalRuns: profile.totalRuns,
          averagePace: profile.averagePace,
        },
      });
    }

    return runners.slice(0, 20);
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

