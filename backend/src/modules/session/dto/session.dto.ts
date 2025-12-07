import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  IsEnum,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RunSessionStatus, RunSessionPrivacy, ParticipantRole, ParticipantStatus } from '@prisma/client';

export class CreateSessionDto {
  @ApiProperty({ example: 'Morning Run Club' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledStartAt?: Date;

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'], default: 'PUBLIC' })
  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'])
  privacy?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  startLatitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  startLongitude?: number;

  @ApiPropertyOptional({ description: 'Planned distance in meters' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  plannedDistance?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(200)
  maxParticipants?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowLateJoin?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  shareRoutePublic?: boolean;
}

export class UpdateSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(200)
  maxParticipants?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowLateJoin?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shareRoutePublic?: boolean;
}

export class SessionFiltersDto {
  @ApiPropertyOptional({ enum: RunSessionStatus })
  @IsOptional()
  @IsEnum(RunSessionStatus)
  status?: RunSessionStatus;

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'] })
  @IsOptional()
  @IsString()
  privacy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creatorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  participating?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class ParticipantStatsDto {
  @ApiProperty()
  distance: number;

  @ApiProperty()
  duration: number;

  @ApiPropertyOptional()
  averagePace: number | null;
}

export class ParticipantDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ParticipantRole })
  role: ParticipantRole;

  @ApiProperty({ enum: ParticipantStatus })
  status: ParticipantStatus;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl: string | null | undefined;

  @ApiProperty({ type: ParticipantStatsDto })
  stats: ParticipantStatsDto;
}

export class CreatorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;
}

export class LocationDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: RunSessionStatus })
  status: RunSessionStatus;

  @ApiProperty()
  privacy: string;

  @ApiPropertyOptional()
  scheduledStartAt: Date | null;

  @ApiPropertyOptional()
  actualStartAt: Date | null;

  @ApiPropertyOptional()
  endedAt: Date | null;

  @ApiPropertyOptional({ type: LocationDto })
  startLocation: LocationDto | null;

  @ApiPropertyOptional()
  plannedDistance: number | null;

  @ApiPropertyOptional()
  actualDistance: number | null;

  @ApiProperty()
  maxParticipants: number;

  @ApiProperty()
  allowLateJoin: boolean;

  @ApiProperty()
  shareRoutePublic: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: CreatorDto })
  creator: CreatorDto;

  @ApiProperty({ type: [ParticipantDto] })
  participants: ParticipantDto[];

  @ApiProperty()
  participantCount: number;
}

export class SessionSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: RunSessionStatus })
  status: RunSessionStatus;

  @ApiProperty()
  privacy: string;

  @ApiPropertyOptional()
  scheduledStartAt: Date | null;

  @ApiPropertyOptional()
  actualStartAt: Date | null;

  @ApiProperty()
  participantCount: number;

  @ApiProperty()
  maxParticipants: number;

  @ApiProperty({ type: CreatorDto })
  creator: CreatorDto;
}

export class SessionListDto {
  @ApiProperty({ type: [SessionSummaryDto] })
  sessions: SessionSummaryDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;
}

// Leaderboard
export class LeaderboardEntryDto {
  @ApiProperty()
  rank: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl: string | null | undefined;

  @ApiProperty()
  distance: number;

  @ApiProperty()
  duration: number;

  @ApiPropertyOptional()
  averagePace: number | null;

  @ApiPropertyOptional()
  maxSpeed: number | null;
}

export class LeaderboardResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty({ type: [LeaderboardEntryDto] })
  byDistance: LeaderboardEntryDto[];

  @ApiProperty({ type: [LeaderboardEntryDto] })
  byPace: LeaderboardEntryDto[];
}

