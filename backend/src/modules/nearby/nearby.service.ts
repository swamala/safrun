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
        stats: {
          totalDistance: profile.totalDistance,
          totalRuns: profile.totalRuns,
          averagePace: profile.averagePace,
        },
      });
    }

    return runners.slice(0, 20);
  }
}

