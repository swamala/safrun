import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  ValidateIf,
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

  @ApiPropertyOptional()
  fingerprint?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  pushToken?: string;
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

