import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { NotificationType, NotificationPriority } from '@/shared/enums/notification-type.enum';

export class SendPushDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;
}

export class SendBulkPushDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: Record<string, any>;
}

export class SendSMSDto {
  @ApiProperty({ description: 'Phone number in E.164 format (e.g., +1234567890)' })
  @IsString()
  to: string;

  @ApiProperty()
  @IsString()
  message: string;
}

export class RegisterTokenDto {
  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty({ description: 'Expo push token' })
  @IsString()
  pushToken: string;

  @ApiPropertyOptional({ description: 'VoIP token for call notifications' })
  @IsOptional()
  @IsString()
  voipToken?: string;
}

export class SOSNotificationDto {
  @ApiProperty()
  @IsString()
  alertId: string;

  @ApiProperty()
  @IsString()
  victimName: string;

  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  radiusMeters: number;
}

export class SessionReminderDto {
  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty()
  @IsString()
  sessionName: string;

  @ApiProperty({ description: 'Minutes before session starts' })
  @IsNumber()
  @Min(1)
  @Max(60)
  minutesBefore: number;
}

export class NotificationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  messageId?: string;

  @ApiPropertyOptional()
  devices?: number;

  @ApiPropertyOptional()
  error?: string;
}

export class BulkNotificationResponseDto {
  @ApiProperty()
  success: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  total: number;
}

