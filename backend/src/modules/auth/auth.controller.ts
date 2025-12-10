import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { DeviceService } from './services/device.service';
import {
  SignUpDto,
  SignInDto,
  RefreshTokenDto,
  AuthResponseDto,
  DeviceInfoDto,
  RegisterPushTokenDto,
  DeviceListResponseDto,
  UpdateDeviceDto,
  SessionResponseDto,
} from './dto/auth.dto';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly deviceService: DeviceService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signUp(
    @Body() dto: SignUpDto,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Headers('x-device-model') deviceModel: string,
    @Headers('x-os-version') osVersion: string,
    @Headers('x-app-version') appVersion: string,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const deviceInfo: DeviceInfoDto = {
      deviceId: deviceId || this.generateDeviceId(),
      deviceType: this.detectDeviceType(userAgent),
      deviceModel,
      osVersion,
      appVersion,
      fingerprint,
      userAgent,
      ipAddress: this.getClientIp(req),
    };

    return this.authService.signUp(dto, deviceInfo);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email/phone and password' })
  @ApiResponse({ status: 200, description: 'User signed in successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(
    @Body() dto: SignInDto,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Headers('x-device-model') deviceModel: string,
    @Headers('x-os-version') osVersion: string,
    @Headers('x-app-version') appVersion: string,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const deviceInfo: DeviceInfoDto = {
      deviceId: deviceId || this.generateDeviceId(),
      deviceType: this.detectDeviceType(userAgent),
      deviceModel,
      osVersion,
      appVersion,
      fingerprint,
      userAgent,
      ipAddress: this.getClientIp(req),
    };

    return this.authService.signIn(dto, deviceInfo);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(dto);
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out from current device' })
  @ApiResponse({ status: 204, description: 'Signed out successfully' })
  async signOut(
    @CurrentUser('id') userId: string,
    @Headers('authorization') authorization: string,
    @Headers('x-device-id') deviceId: string,
  ): Promise<void> {
    const accessToken = authorization?.replace('Bearer ', '');
    await this.authService.signOut(userId, accessToken, deviceId);
  }

  @Post('signout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out from all devices' })
  @ApiResponse({ status: 204, description: 'Signed out from all devices' })
  async signOutAll(@CurrentUser('id') userId: string): Promise<void> {
    await this.authService.signOutAllDevices(userId);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices (alias for signout-all)' })
  @ApiResponse({ status: 204, description: 'Logged out from all devices' })
  async logoutAll(@CurrentUser('id') userId: string): Promise<void> {
    await this.authService.signOutAllDevices(userId);
  }

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of user devices' })
  @ApiResponse({ status: 200, description: 'List of devices', type: DeviceListResponseDto })
  async getDevices(
    @CurrentUser('id') userId: string,
    @Headers('x-device-id') currentDeviceId: string,
  ): Promise<DeviceListResponseDto> {
    return this.deviceService.getUserDevices(userId, currentDeviceId);
  }

  @Delete('devices/:deviceId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a device and revoke its tokens' })
  @ApiResponse({ status: 204, description: 'Device removed successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async removeDevice(
    @CurrentUser('id') userId: string,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    await this.deviceService.removeDevice(userId, deviceId);
  }

  @Post('push-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register or update Expo push notification token' })
  @ApiResponse({ status: 200, description: 'Push token registered successfully' })
  async registerPushToken(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterPushTokenDto,
    @Headers('x-device-id') headerDeviceId: string,
  ): Promise<{ success: boolean }> {
    const deviceId = dto.deviceId || headerDeviceId;
    await this.deviceService.updatePushToken(userId, deviceId, dto.pushToken);
    return { success: true };
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current session and device info' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async getSession(
    @CurrentUser('id') userId: string,
    @Headers('x-device-id') deviceId: string,
  ): Promise<SessionResponseDto> {
    return this.authService.getSession(userId, deviceId);
  }

  @Patch('devices/:deviceDbId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update device metadata' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  async updateDevice(
    @CurrentUser('id') userId: string,
    @Param('deviceDbId') deviceDbId: string,
    @Body() dto: UpdateDeviceDto,
  ): Promise<{ success: boolean }> {
    await this.deviceService.updateDeviceMetadata(userId, deviceDbId, dto);
    return { success: true };
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectDeviceType(userAgent: string): 'IOS' | 'ANDROID' | 'WEB' {
    const ua = userAgent?.toLowerCase() || '';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
      return 'IOS';
    }
    if (ua.includes('android')) {
      return 'ANDROID';
    }
    return 'WEB';
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    return req.ip || req.socket.remoteAddress || '';
  }
}
