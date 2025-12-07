import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsOptional, IsInt, Min, Max } from 'class-validator';

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

  @ApiProperty({ type: RunnerStatsDto })
  stats: RunnerStatsDto;
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

