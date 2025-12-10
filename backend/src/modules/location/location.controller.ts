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
import { LocationService } from './location.service';
import { RouteReconstructionService } from './services/route-reconstruction.service';
import { PaceCalculationService } from './services/pace-calculation.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  LocationUpdateDto,
  LocationResponseDto,
  BulkLocationUpdateDto,
  LocationStreamDto,
  StopLocationDto,
  SessionRouteResponseDto,
  PaceStatsDto,
  HeartbeatDto,
  HeartbeatResponseDto,
  RunnerStatusDto,
} from './dto/location.dto';
import { StatusDetectionService } from './services/status-detection.service';

@ApiTags('location')
@Controller('location')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly routeService: RouteReconstructionService,
    private readonly paceService: PaceCalculationService,
    private readonly statusService: StatusDetectionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Update current location' })
  @ApiResponse({ status: 201, type: LocationResponseDto })
  async updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: LocationUpdateDto,
    @Query('sessionId') sessionId?: string,
    @Query('soloRunId') soloRunId?: string,
  ): Promise<LocationResponseDto> {
    return this.locationService.updateLocation(userId, dto, sessionId, soloRunId);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update multiple locations (for offline sync)' })
  async updateLocationsBulk(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkLocationUpdateDto,
    @Query('sessionId') sessionId?: string,
    @Query('soloRunId') soloRunId?: string,
  ): Promise<{ processed: number; errors: number }> {
    return this.locationService.updateLocationsBulk(userId, dto, sessionId);
  }

  @Post('stream')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stream batch of locations (continuous tracking)' })
  async streamLocations(
    @CurrentUser('id') userId: string,
    @Body() dto: LocationStreamDto,
  ): Promise<{ processed: number; stats: PaceStatsDto | null }> {
    const result = await this.locationService.updateLocationsBulk(
      userId,
      { locations: dto.locations },
      dto.sessionId,
    );

    const stats = await this.paceService.getPaceStats(
      userId,
      dto.sessionId,
      dto.soloRunId,
    );

    return {
      processed: result.processed,
      stats,
    };
  }

  @Post('stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop location tracking' })
  async stopTracking(
    @CurrentUser('id') userId: string,
    @Body() dto: StopLocationDto,
  ): Promise<{ success: boolean }> {
    await this.locationService.stopTracking(userId, dto.sessionId, dto.soloRunId);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Get current location' })
  @ApiResponse({ status: 200, type: LocationResponseDto })
  async getLatestLocation(
    @CurrentUser('id') userId: string,
  ): Promise<LocationResponseDto | null> {
    return this.locationService.getLatestLocation(userId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get all participant locations in a session' })
  async getSessionLocations(@Param('sessionId') sessionId: string) {
    return this.locationService.getSessionLocations(sessionId);
  }

  @Get('session/:sessionId/route')
  @ApiOperation({ summary: 'Get reconstructed route for a session' })
  @ApiResponse({ status: 200, type: SessionRouteResponseDto })
  async getSessionRoute(
    @Param('sessionId') sessionId: string,
  ): Promise<SessionRouteResponseDto> {
    const route = await this.routeService.reconstructSessionRoute(sessionId);
    return {
      sessionId,
      points: route.points,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      averagePace: route.averagePace,
      polyline: route.polyline,
    };
  }

  @Get('session/:sessionId/route/user/:userId')
  @ApiOperation({ summary: 'Get reconstructed route for a specific user in a session' })
  @ApiResponse({ status: 200, type: SessionRouteResponseDto })
  async getUserSessionRoute(
    @Param('sessionId') sessionId: string,
    @Param('userId') userId: string,
  ): Promise<SessionRouteResponseDto> {
    const route = await this.routeService.reconstructUserSessionRoute(userId, sessionId);
    return {
      sessionId,
      points: route.points,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      averagePace: route.averagePace,
      polyline: route.polyline,
    };
  }

  @Get('solo/:soloRunId/route')
  @ApiOperation({ summary: 'Get reconstructed route for a solo run' })
  @ApiResponse({ status: 200, type: SessionRouteResponseDto })
  async getSoloRunRoute(
    @Param('soloRunId') soloRunId: string,
  ): Promise<SessionRouteResponseDto> {
    const route = await this.routeService.reconstructSoloRunRoute(soloRunId);
    return {
      sessionId: soloRunId,
      points: route.points,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      averagePace: route.averagePace,
      polyline: route.polyline,
    };
  }

  @Get('pace')
  @ApiOperation({ summary: 'Get current pace statistics' })
  @ApiQuery({ name: 'sessionId', required: false })
  @ApiQuery({ name: 'soloRunId', required: false })
  @ApiResponse({ status: 200, type: PaceStatsDto })
  async getPaceStats(
    @CurrentUser('id') userId: string,
    @Query('sessionId') sessionId?: string,
    @Query('soloRunId') soloRunId?: string,
  ): Promise<PaceStatsDto | null> {
    return this.paceService.getPaceStats(userId, sessionId, soloRunId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get location history' })
  @ApiQuery({ name: 'sessionId', required: false })
  @ApiQuery({ name: 'soloRunId', required: false })
  @ApiQuery({ name: 'startTime', required: false })
  @ApiQuery({ name: 'endTime', required: false })
  async getLocationHistory(
    @CurrentUser('id') userId: string,
    @Query('sessionId') sessionId?: string,
    @Query('soloRunId') soloRunId?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.locationService.getLocationHistory(
      userId,
      sessionId,
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined,
    );
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send heartbeat to keep runner alive and update battery' })
  @ApiResponse({ status: 200, type: HeartbeatResponseDto })
  async heartbeat(
    @CurrentUser('id') userId: string,
    @Body() dto: HeartbeatDto,
  ): Promise<HeartbeatResponseDto> {
    const status = await this.statusService.recordHeartbeat(
      userId,
      dto.batteryLevel,
      dto.isCharging,
      dto.sessionId,
      dto.soloRunId,
    );

    return {
      success: true,
      serverTime: Date.now(),
      status,
      syncRequired: false,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current runner status' })
  @ApiResponse({ status: 200, type: RunnerStatusDto })
  async getRunnerStatus(
    @CurrentUser('id') userId: string,
  ): Promise<RunnerStatusDto> {
    const state = await this.statusService.getRunnerState(userId);
    const status = await this.statusService.getRunnerStatus(userId);

    return {
      userId,
      status,
      batteryLevel: state?.batteryLevel ?? null,
      lastUpdate: state ? new Date(state.lastUpdate) : undefined,
      sessionId: state?.sessionId ?? null,
    };
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Get another runner\'s status (for nearby/SOS)' })
  @ApiResponse({ status: 200, type: RunnerStatusDto })
  async getOtherRunnerStatus(
    @Param('userId') targetUserId: string,
  ): Promise<RunnerStatusDto> {
    const state = await this.statusService.getRunnerState(targetUserId);
    const status = await this.statusService.getRunnerStatus(targetUserId);

    return {
      userId: targetUserId,
      status,
      batteryLevel: state?.batteryLevel ?? null,
      lastUpdate: state ? new Date(state.lastUpdate) : undefined,
      sessionId: state?.sessionId ?? null,
    };
  }
}
