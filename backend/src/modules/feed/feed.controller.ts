import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { MilestoneService } from './services/milestone.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  FeedQueryDto,
  FeedResponseDto,
  WeeklyStatsDto,
  MonthlyStatsDto,
  StatsOverviewDto,
  MilestonesResponseDto,
  TopStatsResponseDto,
} from './dto/feed.dto';
import { MILESTONE_CONFIG } from '@/shared/enums/milestone.enum';

@ApiTags('feed')
@Controller('feed')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly milestoneService: MilestoneService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get activity feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiResponse({ status: 200, type: FeedResponseDto })
  async getFeed(
    @CurrentUser('id') userId: string,
    @Query() query: FeedQueryDto,
  ): Promise<FeedResponseDto> {
    return this.feedService.getFeed(userId, query);
  }

  @Get('stats/weekly')
  @ApiOperation({ summary: 'Get weekly statistics' })
  @ApiResponse({ status: 200, type: WeeklyStatsDto })
  async getWeeklyStats(
    @CurrentUser('id') userId: string,
  ): Promise<WeeklyStatsDto> {
    return this.feedService.getWeeklyStats(userId);
  }

  @Get('stats/monthly')
  @ApiOperation({ summary: 'Get monthly statistics' })
  @ApiResponse({ status: 200, type: MonthlyStatsDto })
  async getMonthlyStats(
    @CurrentUser('id') userId: string,
  ): Promise<MonthlyStatsDto> {
    return this.feedService.getMonthlyStats(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get full statistics overview (weekly, monthly, all-time)' })
  @ApiResponse({ status: 200, type: StatsOverviewDto })
  async getStatsOverview(
    @CurrentUser('id') userId: string,
  ): Promise<StatsOverviewDto> {
    return this.feedService.getStatsOverview(userId);
  }

  @Get('milestones')
  @ApiOperation({ summary: 'Get user milestones (achieved and upcoming)' })
  @ApiResponse({ status: 200, type: MilestonesResponseDto })
  async getMilestones(
    @CurrentUser('id') userId: string,
  ): Promise<MilestonesResponseDto> {
    const { achieved, upcoming } = await this.milestoneService.getAllMilestones(userId);
    const nextMilestone = await this.milestoneService.getNextMilestone(userId);

    return {
      achieved: achieved.map((m) => ({
        type: m.type,
        title: MILESTONE_CONFIG[m.type].title,
        description: MILESTONE_CONFIG[m.type].description,
        achievedAt: new Date(), // Would need to track this
      })),
      upcoming: upcoming.slice(0, 5).map((m) => ({
        type: m.type,
        title: MILESTONE_CONFIG[m.type].title,
        description: MILESTONE_CONFIG[m.type].description,
        currentValue: m.currentValue,
        threshold: m.threshold,
        progress: Math.min(1, m.currentValue / m.threshold),
      })),
      nextMilestone: nextMilestone || null,
    };
  }
}

