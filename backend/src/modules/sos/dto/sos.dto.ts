import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { SOSStatus, SOSTriggerType, SOSEscalationLevel, ResponderStatus } from '@prisma/client';

export class TriggerSOSDto {
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

  @ApiProperty({
    enum: ['MANUAL', 'FALL_DETECTION', 'NO_MOVEMENT', 'ABDUCTION_SPEED', 'DEVICE_SNATCH', 'HEART_RATE_ANOMALY'],
    example: 'MANUAL',
  })
  @IsEnum(['MANUAL', 'FALL_DETECTION', 'NO_MOVEMENT', 'ABDUCTION_SPEED', 'DEVICE_SNATCH', 'HEART_RATE_ANOMALY'])
  triggerType: string;

  @ApiPropertyOptional({ description: 'Additional notes about the emergency' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Battery level 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;
}

export class VerifySOSDto {
  @ApiProperty({ description: 'SOS Alert ID' })
  @IsString()
  alertId: string;

  @ApiProperty({ description: 'true if user is safe (false alarm), false if emergency is real' })
  @IsBoolean()
  isSafe: boolean;
}

export class AcknowledgeSOSDto {
  @ApiProperty({ description: 'SOS Alert ID' })
  @IsString()
  alertId: string;

  @ApiProperty({ description: 'true if accepting to help, false if declining' })
  @IsBoolean()
  accepted: boolean;
}

export class SOSLocationDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty({ description: 'Whether location is fuzzed for privacy' })
  isApproximate: boolean;
}

export class SOSUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;
}

export class SOSResponderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  responderId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiProperty({ enum: ResponderStatus })
  status: ResponderStatus;

  @ApiPropertyOptional()
  distance?: number | null;
}

export class SOSAlertResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: SOSTriggerType })
  triggerType: SOSTriggerType;

  @ApiProperty({ enum: SOSStatus })
  status: SOSStatus;

  @ApiProperty({ enum: SOSEscalationLevel })
  escalationLevel: SOSEscalationLevel;

  @ApiProperty({ type: SOSLocationDto })
  location: SOSLocationDto;

  @ApiProperty()
  triggeredAt: Date;

  @ApiPropertyOptional()
  verificationSentAt: Date | null;

  @ApiPropertyOptional()
  acknowledgedAt: Date | null;

  @ApiPropertyOptional()
  resolvedAt: Date | null;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiPropertyOptional()
  batteryLevel: number | null;

  @ApiProperty({ type: SOSUserDto })
  user: SOSUserDto;

  @ApiPropertyOptional({ type: [SOSResponderDto] })
  responders?: SOSResponderDto[];
}

export class SOSListResponseDto {
  @ApiProperty({ type: [SOSAlertResponseDto] })
  alerts: SOSAlertResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;
}

