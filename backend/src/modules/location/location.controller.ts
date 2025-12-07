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
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  LocationUpdateDto,
  LocationResponseDto,
  BulkLocationUpdateDto,
  LocationHistoryResponseDto,
} from './dto/location.dto';

@ApiTags('location')
@Controller('location')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Update current location' })
  @ApiResponse({ status: 201, type: LocationResponseDto })
  async updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: LocationUpdateDto,
    @Query('sessionId') sessionId?: string,
  ): Promise<LocationResponseDto> {
    return this.locationService.updateLocation(userId, dto, sessionId);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update multiple locations (for offline sync)' })
  async updateLocationsBulk(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkLocationUpdateDto,
    @Query('sessionId') sessionId?: string,
  ): Promise<{ processed: number; errors: number }> {
    return this.locationService.updateLocationsBulk(userId, dto, sessionId);
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

  @Get('history')
  @ApiOperation({ summary: 'Get location history' })
  @ApiQuery({ name: 'sessionId', required: false })
  @ApiQuery({ name: 'startTime', required: false })
  @ApiQuery({ name: 'endTime', required: false })
  @ApiResponse({ status: 200, type: LocationHistoryResponseDto })
  async getLocationHistory(
    @CurrentUser('id') userId: string,
    @Query('sessionId') sessionId?: string,
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
}

