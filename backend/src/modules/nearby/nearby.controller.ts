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
import { NearbySearchDto, NearbyResponseDto, VisibilityDto } from './dto/nearby.dto';

@ApiTags('nearby')
@Controller('nearby')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NearbyController {
  constructor(private readonly nearbyService: NearbyService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find nearby runners' })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async findNearbyRunners(
    @CurrentUser('id') userId: string,
    @Body() dto: NearbySearchDto,
  ): Promise<NearbyResponseDto> {
    return this.nearbyService.findNearbyRunners(userId, dto);
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
}

