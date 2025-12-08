import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';

export enum RunnerStatusFilter {
  ALL = 'all',
  RUNNING = 'running',
  IDLE = 'idle',
  IN_SESSION = 'in_session',
}

export class NearbySearchDto {
  @ApiProperty({ example: 37.7749 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -122.4194 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ default: 1000, description: 'Search radius in meters' })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(10000)
  radiusMeters?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ enum: RunnerStatusFilter, default: RunnerStatusFilter.ALL })
  @IsOptional()
  @IsEnum(RunnerStatusFilter)
  status?: RunnerStatusFilter;
}

export class NearbySessionSearchDto {
  @ApiProperty({ example: 37.7749 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -122.4194 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ default: 5000, description: 'Search radius in meters' })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(50000)
  radiusMeters?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class VisibilityDto {
  @ApiProperty()
  @IsBoolean()
  isVisible: boolean;
}

export class RunnerLocationDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}

export class RunnerStatsDto {
  @ApiProperty()
  totalDistance: number;

  @ApiProperty()
  totalRuns: number;

  @ApiPropertyOptional()
  averagePace: number | null;
}

export class NearbyRunnerDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiProperty({ description: 'Distance in meters' })
  distance: number;

  @ApiPropertyOptional({ type: RunnerLocationDto })
  location: RunnerLocationDto | null;

  @ApiProperty()
  isAnonymous: boolean;

  @ApiPropertyOptional()
  speed?: number | null;

  @ApiPropertyOptional()
  sessionId?: string | null;

  @ApiProperty()
  status: 'idle' | 'running' | 'in_session';

  @ApiProperty({ type: RunnerStatsDto })
  stats: RunnerStatsDto;
}

export class NearbySessionDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  creatorName: string;

  @ApiProperty()
  participantCount: number;

  @ApiProperty()
  maxParticipants: number;

  @ApiProperty()
  distance: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  scheduledStartAt?: Date | null;

  @ApiProperty({ type: RunnerLocationDto })
  location: RunnerLocationDto;
}

export class SearchLocationDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}

export class NearbyResponseDto {
  @ApiProperty({ type: [NearbyRunnerDto] })
  runners: NearbyRunnerDto[];

  @ApiProperty({ type: SearchLocationDto })
  searchLocation: SearchLocationDto;

  @ApiProperty()
  radiusMeters: number;

  @ApiProperty()
  count: number;

  @ApiProperty({ description: 'Search response time in milliseconds' })
  responseTimeMs: number;
}

export class NearbySessionsResponseDto {
  @ApiProperty({ type: [NearbySessionDto] })
  sessions: NearbySessionDto[];

  @ApiProperty({ type: SearchLocationDto })
  searchLocation: SearchLocationDto;

  @ApiProperty()
  radiusMeters: number;

  @ApiProperty()
  count: number;
}

export class ClusterMemberDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}

export class ClusterDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Center latitude of the cluster' })
  centerLatitude: number;

  @ApiProperty({ description: 'Center longitude of the cluster' })
  centerLongitude: number;

  @ApiProperty({ description: 'Number of runners in this cluster' })
  size: number;

  @ApiProperty({ description: 'Radius of the cluster in meters' })
  radiusMeters: number;

  @ApiProperty({ type: [ClusterMemberDto] })
  runners: ClusterMemberDto[];
}

export class NearbyClustersResponseDto {
  @ApiProperty({ type: [ClusterDto] })
  clusters: ClusterDto[];

  @ApiProperty({ type: SearchLocationDto })
  searchLocation: SearchLocationDto;

  @ApiProperty()
  radiusMeters: number;

  @ApiProperty()
  totalRunners: number;

  @ApiProperty()
  clusterCount: number;

  @ApiProperty({ description: 'Search response time in milliseconds' })
  responseTimeMs: number;
}
