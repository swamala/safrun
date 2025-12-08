import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { RedisService } from '@/core/redis/redis.service';
import {
  FeedQueryDto,
  FeedResponseDto,
  FeedItemDto,
  FeedItemType,
  WeeklyStatsDto,
  MonthlyStatsDto,
  StatsOverviewDto,
} from './dto/feed.dto';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getFeed(userId: string, query: FeedQueryDto): Promise<FeedResponseDto> {
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    const whereClause: any = { userId };
    if (query.type) {
      whereClause.type = query.type;
    }

    const [items, total] = await Promise.all([
      this.prisma.feedItem.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      }),
      this.prisma.feedItem.count({ where: whereClause }),
    ]);

    const feedItems: FeedItemDto[] = await Promise.all(
      items.map(async (item) => {
        let targetUser;
        if (item.targetUserId) {
          const target = await this.prisma.user.findUnique({
            where: { id: item.targetUserId },
            select: {
              id: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          });
          if (target) {
            targetUser = {
              userId: target.id,
              displayName: target.profile?.displayName || 'Unknown',
              avatarUrl: target.profile?.avatarUrl,
            };
          }
        }

        return {
          id: item.id,
          type: item.type as FeedItemType,
          timestamp: item.createdAt,
          user: {
            userId: item.user.id,
            displayName: item.user.profile?.displayName || 'Unknown',
            avatarUrl: item.user.profile?.avatarUrl,
          },
          targetUser,
          sessionId: item.sessionId,
          sosAlertId: item.sosAlertId,
          metadata: (item.metadata as any) || {},
        };
      }),
    );

    return {
      items: feedItems,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    };
  }

  async getWeeklyStats(userId: string): Promise<WeeklyStatsDto> {
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Try cache first
    const cacheKey = `stats:weekly:${userId}:${weekStart.toISOString().split('T')[0]}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Check if we have pre-computed stats
    let weeklyStats = await this.prisma.weeklyStats.findUnique({
      where: {
        userId_weekStart: { userId, weekStart },
      },
    });

    // If not, calculate from runs
    if (!weeklyStats) {
      weeklyStats = await this.calculateWeeklyStats(userId, weekStart);
    }

    // Get previous week for comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekStats = await this.prisma.weeklyStats.findUnique({
      where: {
        userId_weekStart: { userId, weekStart: prevWeekStart },
      },
    });

    const result: WeeklyStatsDto = {
      weekStart,
      weekEnd,
      totalDistance: weeklyStats.totalDistance,
      totalDuration: weeklyStats.totalDuration,
      totalRuns: weeklyStats.totalRuns,
      avgPace: weeklyStats.avgPace,
      calories: weeklyStats.calories,
      sosTriggered: weeklyStats.sosTriggered,
      sosResponded: weeklyStats.sosResponded,
      previousWeekDistance: prevWeekStats?.totalDistance,
      distanceChange: prevWeekStats
        ? weeklyStats.totalDistance - prevWeekStats.totalDistance
        : undefined,
    };

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  async getMonthlyStats(userId: string): Promise<MonthlyStatsDto> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Try cache first
    const cacheKey = `stats:monthly:${userId}:${monthStart.toISOString().split('T')[0]}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Check if we have pre-computed stats
    let monthlyStats = await this.prisma.monthlyStats.findUnique({
      where: {
        userId_monthStart: { userId, monthStart },
      },
    });

    // If not, calculate from runs
    if (!monthlyStats) {
      monthlyStats = await this.calculateMonthlyStats(userId, monthStart);
    }

    // Get previous month for comparison
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthStats = await this.prisma.monthlyStats.findUnique({
      where: {
        userId_monthStart: { userId, monthStart: prevMonthStart },
      },
    });

    const result: MonthlyStatsDto = {
      monthStart,
      monthEnd,
      totalDistance: monthlyStats.totalDistance,
      totalDuration: monthlyStats.totalDuration,
      totalRuns: monthlyStats.totalRuns,
      avgPace: monthlyStats.avgPace,
      calories: monthlyStats.calories,
      sosTriggered: monthlyStats.sosTriggered,
      sosResponded: monthlyStats.sosResponded,
      longestRun: monthlyStats.longestRun,
      fastestPace: monthlyStats.fastestPace,
      previousMonthDistance: prevMonthStats?.totalDistance,
      distanceChange: prevMonthStats
        ? monthlyStats.totalDistance - prevMonthStats.totalDistance
        : undefined,
    };

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  async getStatsOverview(userId: string): Promise<StatsOverviewDto> {
    const [weekly, monthly, profile] = await Promise.all([
      this.getWeeklyStats(userId),
      this.getMonthlyStats(userId),
      this.prisma.profile.findUnique({
        where: { userId },
        select: {
          totalDistance: true,
          totalRuns: true,
          totalDuration: true,
          averagePace: true,
          currentStreak: true,
          longestStreak: true,
        },
      }),
    ]);

    return {
      weekly,
      monthly,
      allTime: {
        totalDistance: profile?.totalDistance || 0,
        totalRuns: profile?.totalRuns || 0,
        totalDuration: profile?.totalDuration || 0,
        avgPace: profile?.averagePace || null,
        currentStreak: profile?.currentStreak || 0,
        longestStreak: profile?.longestStreak || 0,
      },
    };
  }

  async createFeedItem(
    userId: string,
    type: FeedItemType,
    metadata: Record<string, any>,
    sessionId?: string,
    sosAlertId?: string,
    targetUserId?: string,
  ): Promise<void> {
    await this.prisma.feedItem.create({
      data: {
        userId,
        type: type as any,
        metadata,
        sessionId,
        sosAlertId,
        targetUserId,
      },
    });

    this.logger.log(`Feed item created: ${type} for user ${userId}`);
  }

  private async calculateWeeklyStats(
    userId: string,
    weekStart: Date,
  ): Promise<any> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Aggregate from solo runs
    const soloRuns = await this.prisma.soloRun.findMany({
      where: {
        userId,
        startedAt: { gte: weekStart, lt: weekEnd },
        endedAt: { not: null },
      },
    });

    // Aggregate from session participations
    const participations = await this.prisma.runParticipant.findMany({
      where: {
        userId,
        joinedAt: { gte: weekStart, lt: weekEnd },
        status: { in: ['JOINED', 'LEFT'] },
      },
    });

    let totalDistance = 0;
    let totalDuration = 0;
    let totalRuns = 0;

    for (const run of soloRuns) {
      totalDistance += run.distance;
      totalDuration += run.duration;
      totalRuns++;
    }

    for (const p of participations) {
      totalDistance += p.distance;
      totalDuration += p.duration;
      totalRuns++;
    }

    const avgPace = totalDuration > 0 && totalDistance > 0
      ? totalDuration / (totalDistance / 1000) / 60
      : null;

    // Estimate calories (rough: 60 cal per km)
    const calories = Math.round(totalDistance / 1000 * 60);

    // Count SOS events
    const sosTriggered = await this.prisma.sOSAlert.count({
      where: {
        userId,
        triggeredAt: { gte: weekStart, lt: weekEnd },
      },
    });

    const sosResponded = await this.prisma.sOSResponder.count({
      where: {
        responderId: userId,
        createdAt: { gte: weekStart, lt: weekEnd },
        status: { in: ['ACCEPTED', 'ARRIVED'] },
      },
    });

    // Save to database
    const stats = await this.prisma.weeklyStats.upsert({
      where: {
        userId_weekStart: { userId, weekStart },
      },
      create: {
        userId,
        weekStart,
        totalDistance,
        totalDuration,
        totalRuns,
        avgPace,
        calories,
        sosTriggered,
        sosResponded,
      },
      update: {
        totalDistance,
        totalDuration,
        totalRuns,
        avgPace,
        calories,
        sosTriggered,
        sosResponded,
      },
    });

    return stats;
  }

  private async calculateMonthlyStats(
    userId: string,
    monthStart: Date,
  ): Promise<any> {
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    // Aggregate from solo runs
    const soloRuns = await this.prisma.soloRun.findMany({
      where: {
        userId,
        startedAt: { gte: monthStart, lt: monthEnd },
        endedAt: { not: null },
      },
    });

    // Aggregate from session participations
    const participations = await this.prisma.runParticipant.findMany({
      where: {
        userId,
        joinedAt: { gte: monthStart, lt: monthEnd },
        status: { in: ['JOINED', 'LEFT'] },
      },
    });

    let totalDistance = 0;
    let totalDuration = 0;
    let totalRuns = 0;
    let longestRun = 0;
    let fastestPace: number | null = null;

    for (const run of soloRuns) {
      totalDistance += run.distance;
      totalDuration += run.duration;
      totalRuns++;
      if (run.distance > longestRun) longestRun = run.distance;
      if (run.averagePace && (!fastestPace || run.averagePace < fastestPace)) {
        fastestPace = run.averagePace;
      }
    }

    for (const p of participations) {
      totalDistance += p.distance;
      totalDuration += p.duration;
      totalRuns++;
      if (p.distance > longestRun) longestRun = p.distance;
      if (p.averagePace && (!fastestPace || p.averagePace < fastestPace)) {
        fastestPace = p.averagePace;
      }
    }

    const avgPace = totalDuration > 0 && totalDistance > 0
      ? totalDuration / (totalDistance / 1000) / 60
      : null;

    const calories = Math.round(totalDistance / 1000 * 60);

    // Count SOS events
    const sosTriggered = await this.prisma.sOSAlert.count({
      where: {
        userId,
        triggeredAt: { gte: monthStart, lt: monthEnd },
      },
    });

    const sosResponded = await this.prisma.sOSResponder.count({
      where: {
        responderId: userId,
        createdAt: { gte: monthStart, lt: monthEnd },
        status: { in: ['ACCEPTED', 'ARRIVED'] },
      },
    });

    // Save to database
    const stats = await this.prisma.monthlyStats.upsert({
      where: {
        userId_monthStart: { userId, monthStart },
      },
      create: {
        userId,
        monthStart,
        totalDistance,
        totalDuration,
        totalRuns,
        avgPace,
        calories,
        sosTriggered,
        sosResponded,
        longestRun,
        fastestPace,
      },
      update: {
        totalDistance,
        totalDuration,
        totalRuns,
        avgPace,
        calories,
        sosTriggered,
        sosResponded,
        longestRun,
        fastestPace,
      },
    });

    return stats;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

