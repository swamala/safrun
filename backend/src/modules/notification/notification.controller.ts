import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  RegisterTokenDto,
  SendPushDto,
  SendBulkPushDto,
  SOSNotificationDto,
  SessionReminderDto,
  NotificationResponseDto,
  BulkNotificationResponseDto,
} from './dto/notification.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Register push notification token' })
  async registerToken(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterTokenDto,
  ): Promise<void> {
    await this.notificationService.registerPushToken(
      userId,
      dto.deviceId,
      dto.pushToken,
      dto.voipToken,
    );
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test push notification to yourself' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async sendTestNotification(
    @CurrentUser('id') userId: string,
  ): Promise<NotificationResponseDto> {
    const result = await this.notificationService.sendTestNotification(userId);
    return {
      success: result.success,
      devices: result.devices,
    };
  }

  @Post('push')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send push notification to yourself' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async sendPush(
    @CurrentUser('id') userId: string,
    @Body() dto: SendPushDto,
  ): Promise<NotificationResponseDto> {
    await this.notificationService.queuePushNotification(
      userId,
      dto.type,
      dto.title,
      dto.body,
      dto.data,
      dto.priority,
    );
    return { success: true };
  }

  @Post('push/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send bulk push notification (admin only)' })
  @ApiResponse({ status: 200, type: BulkNotificationResponseDto })
  async sendBulkPush(
    @Body() dto: SendBulkPushDto,
  ): Promise<BulkNotificationResponseDto> {
    const result = await this.notificationService.queueBulkPushNotification(
      dto.userIds,
      dto.type,
      dto.title,
      dto.body,
      dto.data,
    );
    return {
      success: result.success,
      failed: result.failed,
      total: dto.userIds.length,
    };
  }

  @Post('sos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Notify nearby runners about SOS alert' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async sendSOSNotification(
    @CurrentUser('id') userId: string,
    @Body() dto: SOSNotificationDto,
  ): Promise<NotificationResponseDto> {
    await this.notificationService.notifySOSTriggered(
      userId,
      dto.alertId,
      dto.victimName,
      dto.radiusMeters,
    );
    return { success: true };
  }

  @Post('session-reminder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule session starting notification' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async scheduleSessionReminder(
    @CurrentUser('id') userId: string,
    @Body() dto: SessionReminderDto,
  ): Promise<NotificationResponseDto> {
    await this.notificationService.scheduleSessionReminder(
      userId,
      dto.sessionId,
      dto.sessionName,
      dto.minutesBefore,
    );
    return { success: true };
  }
}
