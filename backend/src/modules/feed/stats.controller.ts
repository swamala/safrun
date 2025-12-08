import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { MilestoneService } from './services/milestone.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { TopStatsResponseDto, MilestoneProgressDto } from './dto/feed.dto';
import { PrismaService } from '@/core/prisma/prisma.service';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(
    private readonly feedService: FeedService,
    private readonly milestoneService: MilestoneService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get top-level stats summary (all-time, week, month, next milestone)' })
  @ApiResponse({ status: 200, type: TopStatsResponseDto })
  async getTopStats(
    @CurrentUser('id') userId: string,
  ): Promise<TopStatsResponseDto> {
    // Get all stats in parallel
    const [statsOverview, nextMilestone, totalUsers, userRank] = await Promise.all([
      this.feedService.getStatsOverview(userId),
      this.milestoneService.getNextMilestone(userId),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.getUserRank(userId),
    ]);

    let nextMilestoneDto: MilestoneProgressDto | null = null;
    if (nextMilestone) {
      nextMilestoneDto = {
        type: nextMilestone.type,
        title: nextMilestone.title,
        description: nextMilestone.description,
        currentValue: nextMilestone.currentValue,
        threshold: nextMilestone.threshold,
        progress: nextMilestone.progress,
      };
    }

    return {
      allTime: statsOverview.allTime,
      thisWeek: statsOverview.weekly,
      thisMonth: statsOverview.monthly,
      nextMilestone: nextMilestoneDto,
      rank: userRank,
      totalUsers,
    };
  }

  /**
   * Get user's rank based on total distance
   */
  private async getUserRank(userId: string): Promise<number | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { totalDistance: true },
    });

    if (!profile) {
      return null;
    }

    // Count users with more distance than this user
    const higherRanked = await this.prisma.profile.count({
      where: {
        totalDistance: { gt: profile.totalDistance },
      },
    });

    return higherRanked + 1;
  }
}

