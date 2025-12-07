import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEmail,
  IsPhoneNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}

export class SafetySettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoSOSEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fallDetectionEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Seconds before triggering no-movement SOS' })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(600)
  noMovementTimeout?: number;

  @ApiPropertyOptional({ description: 'Seconds for SOS verification countdown' })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(30)
  sosVerificationTime?: number;
}

export class PrivacySettingsDto {
  @ApiPropertyOptional({ enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] })
  @IsOptional()
  @IsString()
  @IsIn(['PUBLIC', 'FRIENDS', 'PRIVATE'])
  profileVisibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showOnNearbyRadar?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowGroupInvites?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shareLocationDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  anonymousModeEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  homeLocationFuzzing?: boolean;
}

export class RunningStatsDto {
  @ApiProperty()
  totalDistance: number;

  @ApiProperty()
  totalRuns: number;

  @ApiProperty()
  totalDuration: number;

  @ApiPropertyOptional()
  averagePace: number | null;
}

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiProperty({ type: RunningStatsDto })
  stats: RunningStatsDto;

  @ApiProperty({ type: SafetySettingsDto })
  safetySettings: {
    autoSOSEnabled: boolean;
    fallDetectionEnabled: boolean;
    noMovementTimeout: number;
    sosVerificationTime: number;
  };

  @ApiProperty({ type: PrivacySettingsDto })
  privacySettings: {
    profileVisibility: string;
    showOnNearbyRadar: boolean;
    allowGroupInvites: boolean;
    shareLocationDefault: boolean;
    anonymousModeEnabled: boolean;
    homeLocationFuzzing: boolean;
  };

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  isPhoneVerified: boolean;

  @ApiProperty()
  memberSince: Date;
}

// Emergency Contact DTOs
export class CreateEmergencyContactDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'spouse' })
  @IsString()
  relationship: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canViewLocation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canReceiveSOS?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateEmergencyContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canViewLocation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canReceiveSOS?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class EmergencyContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiProperty()
  relationship: string;

  @ApiProperty()
  canViewLocation: boolean;

  @ApiProperty()
  canReceiveSOS: boolean;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  isVerified: boolean;

  @ApiPropertyOptional()
  verifiedAt?: Date | null;
}

