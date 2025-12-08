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
  IsInt,
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

export class InitiatePendingSOSDto {
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

  @ApiPropertyOptional({ description: 'Countdown seconds before auto-activate (default 5)' })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(30)
  countdownSeconds?: number;

  @ApiPropertyOptional({ description: 'Battery level 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;
}

export class ActivateSOSDto {
  @ApiProperty({ description: 'Pending SOS Alert ID' })
  @IsString()
  alertId: string;

  @ApiPropertyOptional({ description: 'Additional notes about the emergency' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CancelSOSDto {
  @ApiProperty({ description: 'SOS Alert ID to cancel' })
  @IsString()
  alertId: string;

  @ApiPropertyOptional({ description: 'Reason for cancellation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
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

export class RespondToSOSDto {
  @ApiProperty({ description: 'SOS Alert ID' })
  @IsString()
  alertId: string;

  @ApiProperty({ description: 'true if accepting to respond, false if declining' })
  @IsBoolean()
  accepted: boolean;

  @ApiPropertyOptional({ description: 'Current latitude of responder' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Current longitude of responder' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class UpdateResponderLocationDto {
  @ApiProperty({ description: 'SOS Alert ID' })
  @IsString()
  alertId: string;

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

  @ApiPropertyOptional({ description: 'Estimated time of arrival in seconds' })
  estimatedETA?: number | null;

  @ApiPropertyOptional()
  lastLatitude?: number | null;

  @ApiPropertyOptional()
  lastLongitude?: number | null;
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

  @ApiPropertyOptional({ description: 'Countdown seconds remaining (for PENDING status)' })
  countdownRemaining?: number;

  @ApiProperty()
  triggeredAt: Date;

  @ApiPropertyOptional()
  activatedAt: Date | null;

  @ApiPropertyOptional()
  verificationSentAt: Date | null;

  @ApiPropertyOptional()
  acknowledgedAt: Date | null;

  @ApiPropertyOptional()
  resolvedAt: Date | null;

  @ApiPropertyOptional()
  cancelledAt: Date | null;

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

export class RespondersListDto {
  @ApiProperty({ type: [SOSResponderDto] })
  responders: SOSResponderDto[];

  @ApiProperty()
  totalAccepted: number;

  @ApiProperty()
  totalNotified: number;

  @ApiProperty()
  totalArrived: number;
}

export class SOSTimelineEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  timestamp: Date;

  @ApiPropertyOptional()
  actorId?: string | null;

  @ApiPropertyOptional()
  actorName?: string | null;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;
}

export class SOSTimelineResponseDto {
  @ApiProperty()
  alertId: string;

  @ApiProperty({ type: [SOSTimelineEventDto] })
  events: SOSTimelineEventDto[];

  @ApiProperty()
  totalDurationSeconds: number;

  @ApiPropertyOptional()
  responseTimeSeconds?: number | null;

  @ApiPropertyOptional()
  resolutionTimeSeconds?: number | null;
}

export class ETACalculationDto {
  @ApiProperty({ description: 'Estimated time in seconds' })
  etaSeconds: number;

  @ApiProperty({ description: 'Distance to destination in meters' })
  distanceMeters: number;

  @ApiProperty({ description: 'Confidence level (0-1)' })
  confidence: number;

  @ApiPropertyOptional({ description: 'Heading towards target (degrees)' })
  headingToTarget?: number;
}
