import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocationUpdateDto {
  @ApiProperty({ example: 37.7749, description: 'Latitude in decimal degrees' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -122.4194, description: 'Longitude in decimal degrees' })
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

  @ApiPropertyOptional({ description: 'Timestamp in milliseconds' })
  @IsOptional()
  @IsNumber()
  timestamp?: number;

  @ApiPropertyOptional({ description: 'Battery level (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCharging?: boolean;

  @ApiPropertyOptional({ description: 'Network type (wifi, cellular, etc)' })
  @IsOptional()
  @IsString()
  networkType?: string;

  @ApiPropertyOptional({ description: 'HMAC signature for location verification' })
  @IsOptional()
  @IsString()
  signatureHash?: string;
}

export class BulkLocationUpdateDto {
  @ApiProperty({ type: [LocationUpdateDto] })
  @IsArray()
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
  altitude: number | null;

  @ApiPropertyOptional()
  speed: number | null;

  @ApiPropertyOptional()
  heading: number | null;

  @ApiProperty()
  timestamp: Date;

  @ApiPropertyOptional()
  sessionId: string | null;
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

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;
}

export class ValidationResultDto {
  isValid: boolean;
  isAnomalous: boolean;
  reason?: string;
}

