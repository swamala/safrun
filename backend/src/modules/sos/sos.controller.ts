import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SosService } from './sos.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
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
  SOSTimelineResponseDto,
} from './dto/sos.dto';
import { SosTimelineService } from './services/sos-timeline.service';

@ApiTags('sos')
@Controller('sos')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@ApiBearerAuth()
export class SosController {
  constructor(
    private readonly sosService: SosService,
    private readonly timelineService: SosTimelineService,
  ) {}

  @Post('pending')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start 5-second countdown SOS (pending state)' })
  @ApiResponse({ status: 201, type: SOSAlertResponseDto, description: 'SOS countdown started' })
  async initiatePendingSOS(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePendingSOSDto,
  ): Promise<SOSAlertResponseDto> {
    return this.sosService.initiatePendingSOS(userId, dto);
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate SOS after countdown (or manually)' })
  @ApiResponse({ status: 200, type: SOSAlertResponseDto, description: 'SOS activated' })
  async activateSOS(
    @CurrentUser('id') userId: string,
    @Body() dto: ActivateSOSDto,
  ): Promise<SOSAlertResponseDto> {
    return this.sosService.activateSOS(userId, dto);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pending or active SOS' })
  @ApiResponse({ status: 200, type: SOSAlertResponseDto, description: 'SOS cancelled' })
  async cancelSOS(
    @CurrentUser('id') userId: string,
    @Body() dto: CancelSOSDto,
  ): Promise<SOSAlertResponseDto> {
    return this.sosService.cancelSOS(userId, dto);
  }

  @Post('trigger')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger an SOS alert (legacy - immediate)' })
  @ApiResponse({ status: 201, type: SOSAlertResponseDto, description: 'SOS alert created' })
  async triggerSOS(
    @CurrentUser('id') userId: string,
    @Body() dto: TriggerSOSDto,
  ): Promise<SOSAlertResponseDto> {
    return this.sosService.triggerSOS(userId, dto);
  }

  @Post('respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Respond to an SOS as a nearby runner' })
  @ApiResponse({ status: 200, type: SOSAlertResponseDto })
  async respondToSOS(
    @CurrentUser('id') responderId: string,
    @Body() dto: RespondToSOSDto,
  ): Promise<SOSAlertResponseDto> {
    return this.sosService.respondToSOS(responderId, dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SOS alert (safe or not safe)' })
  @ApiResponse({ status: 200, type: SOSAlertResponseDto })
  async verifySOSResponse(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifySOSDto,
  ): Promise<SOSAlertResponseDto> {
    return this.sosService.verifySOSResponse(userId, dto);
  }

  @Post('acknowledge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Acknowledge SOS as a responder (legacy)' })
  @ApiResponse({ status: 200, type: SOSAlertResponseDto })
  async acknowledgeAsResponder(
    @CurrentUser('id') responderId: string,
    @Body() dto: AcknowledgeSOSDto,
  ): Promise<SOSAlertResponseDto> {
    return this.sosService.acknowledgeAsResponder(responderId, dto);
  }

  @Post('responder/location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update responder location for ETA calculation' })
  async updateResponderLocation(
    @CurrentUser('id') responderId: string,
    @Body() dto: UpdateResponderLocationDto,
  ): Promise<{ success: boolean; estimatedETA: number | null }> {
    const eta = await this.sosService.updateResponderLocation(responderId, dto);
    return { success: true, estimatedETA: eta };
  }

  @Post(':alertId/arrived')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark responder as arrived at scene' })
  async markResponderArrived(
    @CurrentUser('id') responderId: string,
    @Param('alertId') alertId: string,
  ): Promise<void> {
    await this.sosService.markResponderArrived(responderId, alertId);
  }

  @Post(':alertId/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve SOS alert' })
  @ApiResponse({ status: 200, type: SOSAlertResponseDto })
  async resolveAlert(
    @CurrentUser('id') userId: string,
    @Param('alertId') alertId: string,
  ): Promise<SOSAlertResponseDto> {
    return this.sosService.resolveAlert(userId, alertId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get current active SOS alert' })
  @ApiResponse({ status: 200, type: SOSAlertResponseDto })
  async getActiveAlert(
    @CurrentUser('id') userId: string,
  ): Promise<SOSAlertResponseDto | null> {
    return this.sosService.getActiveAlert(userId);
  }

  @Get('responders')
  @ApiOperation({ summary: 'Get responders for user\'s active SOS' })
  @ApiResponse({ status: 200, type: RespondersListDto })
  async getResponders(
    @CurrentUser('id') userId: string,
  ): Promise<RespondersListDto> {
    return this.sosService.getRespondersForUserSOS(userId);
  }

  @Get(':alertId/responders')
  @ApiOperation({ summary: 'Get responders for a specific SOS alert' })
  @ApiResponse({ status: 200, type: RespondersListDto })
  async getAlertResponders(
    @Param('alertId') alertId: string,
  ): Promise<RespondersListDto> {
    return this.sosService.getAlertResponders(alertId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get SOS alert history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, type: SOSListResponseDto })
  async getAlertHistory(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SOSListResponseDto> {
    return this.sosService.getAlertHistory(userId, limit, offset);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby SOS alerts (for responders)' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiResponse({ status: 200, type: [SOSAlertResponseDto] })
  async getNearbyAlerts(
    @CurrentUser('id') userId: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<SOSAlertResponseDto[]> {
    return this.sosService.getNearbyAlerts(userId, latitude, longitude);
  }

  @Get(':alertId/timeline')
  @ApiOperation({ summary: 'Get full timeline of an SOS alert' })
  @ApiResponse({ status: 200, type: SOSTimelineResponseDto })
  async getAlertTimeline(
    @Param('alertId') alertId: string,
  ): Promise<SOSTimelineResponseDto> {
    return this.timelineService.getTimeline(alertId);
  }
}
