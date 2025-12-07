import {
  Controller,
  Post,
  Body,
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
import {
  SignUpDto,
  SignInDto,
  RefreshTokenDto,
  AuthResponseDto,
  DeviceInfoDto,
} from './dto/auth.dto';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signUp(
    @Body() dto: SignUpDto,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const deviceInfo: DeviceInfoDto = {
      deviceId: deviceId || this.generateDeviceId(),
      deviceType: this.detectDeviceType(userAgent),
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
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const deviceInfo: DeviceInfoDto = {
      deviceId: deviceId || this.generateDeviceId(),
      deviceType: this.detectDeviceType(userAgent),
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

