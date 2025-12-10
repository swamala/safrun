import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { RedisService } from '@/core/redis/redis.service';
import { MilestoneType, MILESTONE_CONFIG } from '@/shared/enums/milestone.enum';
import { FeedItemType } from '@prisma/client';

interface MilestoneCheck {
  type: MilestoneType;
  achieved: boolean;
  currentValue: number;
  threshold: number;
}

interface UnlockedMilestone {
  type: MilestoneType;
  title: string;
  description: string;
  unlockedAt: Date;
}

@Injectable()
export class MilestoneService {
  private readonly logger = new Logger(MilestoneService.name);
  private readonly MILESTONES_KEY = 'user:milestones:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Check and unlock milestones for a user
   * Call this after updating user stats
   */
  async checkAndUnlockMilestones(userId: string): Promise<UnlockedMilestone[]> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return [];
    }

    const achievedMilestones = await this.getAchievedMilestones(userId);
    const newlyUnlocked: UnlockedMilestone[] = [];

    for (const [milestoneType, config] of Object.entries(MILESTONE_CONFIG)) {
      // Skip if already achieved
      if (achievedMilestones.has(milestoneType as MilestoneType)) {
        continue;
      }

      // Get current value for this milestone type
      const currentValue = this.getProfileValue(profile, config.field);

      // Check if milestone is achieved
      if (currentValue >= config.threshold) {
        const unlocked = await this.unlockMilestone(
          userId,
          milestoneType as MilestoneType,
          config.title,
          config.description,
        );

        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * Get current value from profile for a given field
   */
  private getProfileValue(profile: any, field: string): number {
    const value = profile[field];
    return typeof value === 'number' ? value : 0;
  }

  /**
   * Get set of already achieved milestones for a user
   */
  private async getAchievedMilestones(userId: string): Promise<Set<MilestoneType>> {
    const cacheKey = `${this.MILESTONES_KEY}${userId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return new Set(JSON.parse(cached) as MilestoneType[]);
    }

    // Load from database (feed items with MILESTONE_REACHED type)
    const milestoneItems = await this.prisma.feedItem.findMany({
      where: {
        userId,
        type: FeedItemType.MILESTONE_REACHED,
      },
      select: { metadata: true },
    });

    const achieved = new Set<MilestoneType>();
    for (const item of milestoneItems) {
      const metadata = item.metadata as any;
      if (metadata?.milestoneType) {
        achieved.add(metadata.milestoneType as MilestoneType);
      }
    }

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(Array.from(achieved)), 3600);

    return achieved;
  }

  /**
   * Unlock a milestone for a user
   */
  private async unlockMilestone(
    userId: string,
    type: MilestoneType,
    title: string,
    description: string,
  ): Promise<UnlockedMilestone | null> {
    try {
      const now = new Date();

      // Create feed item for milestone
      await this.prisma.feedItem.create({
        data: {
          userId,
          type: FeedItemType.MILESTONE_REACHED,
          metadata: {
            milestoneType: type,
            title,
            description,
          } as any,
        },
      });

      // Invalidate cache
      const cacheKey = `${this.MILESTONES_KEY}${userId}`;
      await this.redisService.del(cacheKey);

      this.logger.log(`Milestone unlocked for user ${userId}: ${type} - ${title}`);

      return {
        type,
        title,
        description,
        unlockedAt: now,
      };
    } catch (error) {
      this.logger.error(`Failed to unlock milestone ${type} for user ${userId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all milestones for a user (achieved and upcoming)
   */
  async getAllMilestones(userId: string): Promise<{
    achieved: MilestoneCheck[];
    upcoming: MilestoneCheck[];
  }> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const achievedSet = await this.getAchievedMilestones(userId);
    const achieved: MilestoneCheck[] = [];
    const upcoming: MilestoneCheck[] = [];

    for (const [milestoneType, config] of Object.entries(MILESTONE_CONFIG)) {
      const currentValue = profile ? this.getProfileValue(profile, config.field) : 0;
      const isAchieved = achievedSet.has(milestoneType as MilestoneType);

      const check: MilestoneCheck = {
        type: milestoneType as MilestoneType,
        achieved: isAchieved,
        currentValue,
        threshold: config.threshold,
      };

      if (isAchieved) {
        achieved.push(check);
      } else {
        upcoming.push(check);
      }
    }

    // Sort upcoming by progress (closest to completion first)
    upcoming.sort((a, b) => {
      const progressA = a.currentValue / a.threshold;
      const progressB = b.currentValue / b.threshold;
      return progressB - progressA;
    });

    return { achieved, upcoming };
  }

  /**
   * Get next milestone for a user
   */
  async getNextMilestone(userId: string): Promise<{
    type: MilestoneType;
    title: string;
    description: string;
    currentValue: number;
    threshold: number;
    progress: number;
  } | null> {
    const { upcoming } = await this.getAllMilestones(userId);

    if (upcoming.length === 0) {
      return null;
    }

    const next = upcoming[0];
    const config = MILESTONE_CONFIG[next.type];

    return {
      type: next.type,
      title: config.title,
      description: config.description,
      currentValue: next.currentValue,
      threshold: next.threshold,
      progress: Math.min(1, next.currentValue / next.threshold),
    };
  }
}

