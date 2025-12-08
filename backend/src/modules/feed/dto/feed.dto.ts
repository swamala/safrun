import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';

export enum FeedItemType {
  RUN_STARTED = 'RUN_STARTED',
  RUN_COMPLETED = 'RUN_COMPLETED',
  SOS_TRIGGERED = 'SOS_TRIGGERED',
  SOS_RESOLVED = 'SOS_RESOLVED',
  RESPONDER_JOINED = 'RESPONDER_JOINED',
  SESSION_JOINED = 'SESSION_JOINED',
  SESSION_CREATED = 'SESSION_CREATED',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
}

export class FeedQueryDto {
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ enum: FeedItemType })
  @IsOptional()
  @IsEnum(FeedItemType)
  type?: FeedItemType;
}

export class FeedUserDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;
}

export class FeedItemMetadataDto {
  @ApiPropertyOptional()
  distance?: number;

  @ApiPropertyOptional()
  duration?: number;

  @ApiPropertyOptional()
  pace?: number;

  @ApiPropertyOptional()
  sessionName?: string;

  @ApiPropertyOptional()
  responderCount?: number;

  @ApiPropertyOptional()
  milestone?: string;

  @ApiPropertyOptional()
  milestoneValue?: number;
}

export class FeedItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: FeedItemType })
  type: FeedItemType;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty({ type: FeedUserDto })
  user: FeedUserDto;

  @ApiPropertyOptional({ type: FeedUserDto })
  targetUser?: FeedUserDto;

  @ApiPropertyOptional()
  sessionId?: string | null;

  @ApiPropertyOptional()
  sosAlertId?: string | null;

  @ApiProperty({ type: FeedItemMetadataDto })
  metadata: FeedItemMetadataDto;
}

export class FeedResponseDto {
  @ApiProperty({ type: [FeedItemDto] })
  items: FeedItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasMore: boolean;
}

export class WeeklyStatsDto {
  @ApiProperty()
  weekStart: Date;

  @ApiProperty()
  weekEnd: Date;

  @ApiProperty()
  totalDistance: number;

  @ApiProperty()
  totalDuration: number;

  @ApiProperty()
  totalRuns: number;

  @ApiPropertyOptional()
  avgPace?: number | null;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  sosTriggered: number;

  @ApiProperty()
  sosResponded: number;

  @ApiPropertyOptional()
  previousWeekDistance?: number;

  @ApiPropertyOptional()
  distanceChange?: number;
}

export class MonthlyStatsDto {
  @ApiProperty()
  monthStart: Date;

  @ApiProperty()
  monthEnd: Date;

  @ApiProperty()
  totalDistance: number;

  @ApiProperty()
  totalDuration: number;

  @ApiProperty()
  totalRuns: number;

  @ApiPropertyOptional()
  avgPace?: number | null;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  sosTriggered: number;

  @ApiProperty()
  sosResponded: number;

  @ApiProperty()
  longestRun: number;

  @ApiPropertyOptional()
  fastestPace?: number | null;

  @ApiPropertyOptional()
  previousMonthDistance?: number;

  @ApiPropertyOptional()
  distanceChange?: number;
}

export class AllTimeStatsDto {
  @ApiProperty()
  totalDistance: number;

  @ApiProperty()
  totalRuns: number;

  @ApiProperty()
  totalDuration: number;

  @ApiPropertyOptional()
  avgPace?: number | null;

  @ApiProperty()
  currentStreak: number;

  @ApiProperty()
  longestStreak: number;

  @ApiProperty()
  sosTriggered: number;

  @ApiProperty()
  sosResponded: number;
}

export class StatsOverviewDto {
  @ApiProperty({ type: WeeklyStatsDto })
  weekly: WeeklyStatsDto;

  @ApiProperty({ type: MonthlyStatsDto })
  monthly: MonthlyStatsDto;

  @ApiProperty({ type: AllTimeStatsDto })
  allTime: AllTimeStatsDto;
}

export class MilestoneProgressDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  currentValue: number;

  @ApiProperty()
  threshold: number;

  @ApiProperty({ description: 'Progress between 0 and 1' })
  progress: number;
}

export class MilestoneAchievedDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  achievedAt: Date;
}

export class MilestonesResponseDto {
  @ApiProperty({ type: [MilestoneAchievedDto] })
  achieved: MilestoneAchievedDto[];

  @ApiProperty({ type: [MilestoneProgressDto] })
  upcoming: MilestoneProgressDto[];

  @ApiPropertyOptional({ type: MilestoneProgressDto })
  nextMilestone?: MilestoneProgressDto | null;
}

export class TopStatsResponseDto {
  @ApiProperty({ type: AllTimeStatsDto })
  allTime: AllTimeStatsDto;

  @ApiProperty({ type: WeeklyStatsDto })
  thisWeek: WeeklyStatsDto;

  @ApiProperty({ type: MonthlyStatsDto })
  thisMonth: MonthlyStatsDto;

  @ApiPropertyOptional({ type: MilestoneProgressDto })
  nextMilestone?: MilestoneProgressDto | null;

  @ApiProperty()
  rank?: number | null;

  @ApiProperty()
  totalUsers: number;
}

