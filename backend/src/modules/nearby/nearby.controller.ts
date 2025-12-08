import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NearbyService } from './nearby.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  NearbySearchDto,
  NearbySessionSearchDto,
  NearbyResponseDto,
  NearbySessionsResponseDto,
  VisibilityDto,
  NearbyClustersResponseDto,
} from './dto/nearby.dto';
import { ClusteringService } from './services/clustering.service';

@ApiTags('nearby')
@Controller('nearby')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NearbyController {
  constructor(
    private readonly nearbyService: NearbyService,
    private readonly clusteringService: ClusteringService,
  ) {}

  @Get('runners')
  @ApiOperation({ summary: 'Find nearby runners (GET)' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radiusMeters', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async findNearbyRunnersGet(
    @CurrentUser('id') userId: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusMeters') radiusMeters?: number,
    @Query('status') status?: string,
  ): Promise<NearbyResponseDto> {
    return this.nearbyService.findNearbyRunners(userId, {
      latitude,
      longitude,
      radiusMeters,
      status: status as any,
    });
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find nearby runners (POST)' })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async findNearbyRunners(
    @CurrentUser('id') userId: string,
    @Body() dto: NearbySearchDto,
  ): Promise<NearbyResponseDto> {
    return this.nearbyService.findNearbyRunners(userId, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Find nearby running sessions' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radiusMeters', required: false, type: Number })
  @ApiResponse({ status: 200, type: NearbySessionsResponseDto })
  async findNearbySessions(
    @CurrentUser('id') userId: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusMeters') radiusMeters?: number,
  ): Promise<NearbySessionsResponseDto> {
    return this.nearbyService.findNearbySessions(userId, {
      latitude,
      longitude,
      radiusMeters,
    });
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Find runners in a specific session' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  async findRunnersInSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    return this.nearbyService.findRunnersInSession(
      userId,
      sessionId,
      latitude,
      longitude,
    );
  }

  @Post('visibility')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update nearby radar visibility' })
  async updateVisibility(
    @CurrentUser('id') userId: string,
    @Body() dto: VisibilityDto,
  ): Promise<void> {
    await this.nearbyService.updateRunnerVisibility(userId, dto.isVisible);
  }

  @Get('distance/:targetUserId')
  @ApiOperation({ summary: 'Get distance to another runner' })
  async getDistanceToRunner(
    @CurrentUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ): Promise<{ distance: number | null }> {
    const distance = await this.nearbyService.getDistanceToRunner(userId, targetUserId);
    return { distance };
  }

  @Get('clusters')
  @ApiOperation({ summary: 'Get clustered nearby runners' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radiusMeters', required: false, type: Number })
  @ApiResponse({ status: 200, type: NearbyClustersResponseDto })
  async getNearbyClusters(
    @CurrentUser('id') userId: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusMeters') radiusMeters?: number,
  ): Promise<NearbyClustersResponseDto> {
    const startTime = Date.now();

    // First get nearby runners
    const nearbyResult = await this.nearbyService.findNearbyRunners(userId, {
      latitude,
      longitude,
      radiusMeters: radiusMeters || 1000,
      limit: 100,
    });

    // Convert to runner locations for clustering
    const runnerLocations = nearbyResult.runners
      .filter((r) => r.location)
      .map((r) => ({
        userId: r.userId,
        latitude: r.location!.latitude,
        longitude: r.location!.longitude,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl,
      }));

    // Cluster the runners
    let clusters = this.clusteringService.clusterRunners(runnerLocations);

    // Merge overlapping clusters
    clusters = this.clusteringService.mergeClusters(clusters);

    const responseTimeMs = Date.now() - startTime;

    return {
      clusters: clusters.map((c) => ({
        id: c.id,
        centerLatitude: c.centerLatitude,
        centerLongitude: c.centerLongitude,
        size: c.size,
        radiusMeters: c.radiusMeters,
        runners: c.runners.map((r) => ({
          userId: r.userId,
          displayName: r.displayName || 'Unknown',
          avatarUrl: r.avatarUrl,
          latitude: r.latitude,
          longitude: r.longitude,
        })),
      })),
      searchLocation: {
        latitude,
        longitude,
      },
      radiusMeters: radiusMeters || 1000,
      totalRunners: runnerLocations.length,
      clusterCount: clusters.length,
      responseTimeMs,
    };
  }
}
