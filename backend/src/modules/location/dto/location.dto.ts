import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocationUpdateDto {
  @ApiProperty({ description: 'Latitude in degrees', example: 40.7128 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude in degrees', example: -74.006 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ description: 'Altitude in meters' })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiPropertyOptional({ description: 'Accuracy in meters' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @ApiPropertyOptional({ description: 'Speed in m/s' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @ApiPropertyOptional({ description: 'Heading in degrees (0-360)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiPropertyOptional({ description: 'Battery level (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Is device charging' })
  @IsOptional()
  @IsBoolean()
  isCharging?: boolean;

  @ApiPropertyOptional({ description: 'Network type (wifi/cellular/etc)' })
  @IsOptional()
  @IsString()
  networkType?: string;

  @ApiPropertyOptional({ description: 'Timestamp of location capture (Unix ms)' })
  @IsOptional()
  @IsNumber()
  timestamp?: number;

  @ApiPropertyOptional({ description: 'HMAC signature for anti-spoofing' })
  @IsOptional()
  @IsString()
  signatureHash?: string;
}

export class BulkLocationUpdateDto {
  @ApiProperty({ type: [LocationUpdateDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LocationUpdateDto)
  locations: LocationUpdateDto[];
}

export class LocationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional()
  altitude?: number | null;

  @ApiPropertyOptional()
  speed?: number | null;

  @ApiPropertyOptional()
  heading?: number | null;

  @ApiProperty()
  timestamp: Date;

  @ApiPropertyOptional()
  sessionId?: string | null;
}

export class LocationStreamDto {
  @ApiProperty({ type: [LocationUpdateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationUpdateDto)
  locations: LocationUpdateDto[];

  @ApiPropertyOptional({ description: 'Solo run ID if running alone' })
  @IsOptional()
  @IsString()
  soloRunId?: string;

  @ApiPropertyOptional({ description: 'Session ID if in group session' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class StopLocationDto {
  @ApiPropertyOptional({ description: 'Solo run ID to stop tracking' })
  @IsOptional()
  @IsString()
  soloRunId?: string;

  @ApiPropertyOptional({ description: 'Session ID to stop tracking' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class RoutePointDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional()
  altitude?: number | null;

  @ApiPropertyOptional()
  speed?: number | null;

  @ApiProperty()
  timestamp: Date;
}

export class SessionRouteResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty({ type: [RoutePointDto] })
  points: RoutePointDto[];

  @ApiProperty()
  totalDistance: number;

  @ApiProperty()
  totalDuration: number;

  @ApiPropertyOptional()
  averagePace?: number | null;

  @ApiPropertyOptional()
  polyline?: string;
}

export class SmoothedLocationDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  smoothedLat: number;

  @ApiProperty()
  smoothedLng: number;

  @ApiPropertyOptional()
  speed?: number | null;

  @ApiPropertyOptional()
  smoothedSpeed?: number | null;
}

export class PaceStatsDto {
  @ApiProperty({ description: 'Current pace in min/km' })
  currentPace: number;

  @ApiProperty({ description: 'Average pace in min/km' })
  averagePace: number;

  @ApiProperty({ description: 'Current speed in m/s' })
  currentSpeed: number;

  @ApiProperty({ description: 'Average speed in m/s' })
  averageSpeed: number;

  @ApiProperty({ description: 'Total distance in meters' })
  totalDistance: number;

  @ApiProperty({ description: 'Total duration in seconds' })
  totalDuration: number;
}

export class HeartbeatDto {
  @ApiPropertyOptional({ description: 'Battery level (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Is device charging' })
  @IsOptional()
  @IsBoolean()
  isCharging?: boolean;

  @ApiPropertyOptional({ description: 'Client timestamp (Unix ms)' })
  @IsOptional()
  @IsNumber()
  timestamp?: number;

  @ApiPropertyOptional({ description: 'Session ID if in session' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Solo run ID if solo' })
  @IsOptional()
  @IsString()
  soloRunId?: string;
}

export class HeartbeatResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ description: 'Server timestamp' })
  serverTime: number;

  @ApiProperty({ description: 'Current runner status' })
  status: string;

  @ApiPropertyOptional({ description: 'Session sync required' })
  syncRequired?: boolean;
}

export class RunnerStatusDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ['offline', 'idle', 'moving', 'paused', 'in_session', 'sos_active'] })
  status: string;

  @ApiPropertyOptional()
  batteryLevel?: number | null;

  @ApiPropertyOptional()
  lastUpdate?: Date;

  @ApiPropertyOptional()
  sessionId?: string | null;
}

export class ValidationResultDto {
  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  isAnomalous: boolean;

  @ApiPropertyOptional()
  reason?: string;
}

export class LocationPointDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional()
  altitude?: number | null;

  @ApiPropertyOptional()
  speed?: number | null;

  @ApiPropertyOptional()
  heading?: number | null;

  @ApiPropertyOptional()
  accuracy?: number | null;

  @ApiProperty()
  timestamp: Date;
}

export class LocationHistoryResponseDto {
  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  sessionId?: string | null;

  @ApiProperty({ type: [LocationPointDto] })
  points: LocationPointDto[];

  @ApiProperty()
  totalDistance: number;

  @ApiProperty()
  duration: number;

  @ApiPropertyOptional()
  averageSpeed?: number | null;

  @ApiPropertyOptional()
  startTime?: Date;

  @ApiPropertyOptional()
  endTime?: Date;
}
