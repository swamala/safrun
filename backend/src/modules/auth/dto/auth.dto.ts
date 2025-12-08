import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  ValidateIf,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class SignUpDto {
  @ApiPropertyOptional({ example: 'runner@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'StrongP@ss123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'John Runner' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;

  @ApiPropertyOptional({ description: 'Cloudflare Turnstile token' })
  @IsOptional()
  @IsString()
  turnstileToken?: string;

  @ValidateIf((o) => !o.email && !o.phone)
  @IsString({ message: 'Either email or phone is required' })
  emailOrPhone?: string;
}

export class SignInDto {
  @ApiProperty({ example: 'runner@example.com', description: 'Email or phone number' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'StrongP@ss123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class DeviceInfoDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty({ enum: ['IOS', 'ANDROID', 'WEB'] })
  deviceType: 'IOS' | 'ANDROID' | 'WEB';

  @ApiPropertyOptional()
  deviceName?: string;

  @ApiPropertyOptional({ description: 'Device model (e.g., iPhone 15 Pro)' })
  deviceModel?: string;

  @ApiPropertyOptional({ description: 'OS version (e.g., iOS 17.2)' })
  osVersion?: string;

  @ApiPropertyOptional({ description: 'App version (e.g., 1.0.0)' })
  appVersion?: string;

  @ApiPropertyOptional()
  fingerprint?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Expo push notification token' })
  pushToken?: string;
}

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Expo push notification token' })
  @IsString()
  pushToken: string;

  @ApiPropertyOptional({ description: 'Device ID to associate with token' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  deviceId: string;
}

export class TokenPayloadDto {
  userId: string;
  deviceId?: string;
  iat: number;
  exp: number;
}

export class DeviceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['IOS', 'ANDROID', 'WEB'] })
  deviceType: 'IOS' | 'ANDROID' | 'WEB';

  @ApiPropertyOptional()
  deviceName?: string | null;

  @ApiPropertyOptional()
  deviceModel?: string | null;

  @ApiPropertyOptional()
  osVersion?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isCurrent: boolean;
}

export class DeviceListResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  devices: DeviceResponseDto[];

  @ApiProperty()
  total: number;
}

export class UpdateDeviceDto {
  @ApiPropertyOptional({ description: 'Device name (e.g., My iPhone)' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({ description: 'Device model (e.g., iPhone 15 Pro)' })
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @ApiPropertyOptional({ description: 'OS version (e.g., iOS 17.2)' })
  @IsOptional()
  @IsString()
  osVersion?: string;

  @ApiPropertyOptional({ description: 'App version (e.g., 1.0.0)' })
  @IsOptional()
  @IsString()
  appVersion?: string;
}

export class SessionResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;

  @ApiProperty({ type: DeviceResponseDto })
  currentDevice: DeviceResponseDto;

  @ApiProperty()
  activeDevices: number;

  @ApiProperty()
  maxDevices: number;

  @ApiProperty()
  sessionCreatedAt: Date;

  @ApiProperty()
  lastActivity: Date;
}
