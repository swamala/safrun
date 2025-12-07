import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { DeviceService } from './services/device.service';
import { TurnstileService } from './services/turnstile.service';
import { RedisService } from '@/core/redis/redis.service';
import {
  SignUpDto,
  SignInDto,
  RefreshTokenDto,
  AuthResponseDto,
  DeviceInfoDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly deviceService: DeviceService,
    private readonly turnstileService: TurnstileService,
    private readonly redisService: RedisService,
  ) {}

  async signUp(dto: SignUpDto, deviceInfo: DeviceInfoDto): Promise<AuthResponseDto> {
    // Verify Turnstile token if provided
    if (dto.turnstileToken) {
      const isValid = await this.turnstileService.verify(dto.turnstileToken);
      if (!isValid) {
        throw new BadRequestException('Captcha verification failed');
      }
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email?.toLowerCase() },
          { phone: dto.phone },
        ].filter((condition) => Object.values(condition).some(Boolean)),
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(dto.password);

    // Create user with profile
    const user = await this.prisma.user.create({
      data: {
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        profile: {
          create: {
            displayName: dto.displayName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Register device
    const device = await this.deviceService.registerDevice(user.id, deviceInfo);

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user.id, device.id);

    this.logger.log(`User signed up: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: user.profile?.displayName || '',
        avatarUrl: user.profile?.avatarUrl,
      },
      ...tokens,
      deviceId: device.id,
    };
  }

  async signIn(dto: SignInDto, deviceInfo: DeviceInfoDto): Promise<AuthResponseDto> {
    // Find user by email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier?.toLowerCase() },
          { phone: dto.identifier },
        ],
        status: 'ACTIVE',
      },
      include: {
        profile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verify(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check device anomaly
    const isAnomalous = await this.deviceService.checkDeviceAnomaly(user.id, deviceInfo);
    if (isAnomalous) {
      this.logger.warn(`Anomalous device detected for user ${user.id}`);
      // Could trigger additional verification here
    }

    // Register or update device
    const device = await this.deviceService.registerDevice(user.id, deviceInfo);

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user.id, device.id);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User signed in: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: user.profile?.displayName || '',
        avatarUrl: user.profile?.avatarUrl,
      },
      ...tokens,
      deviceId: device.id,
    };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId, status: 'ACTIVE' },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old refresh token
    await this.tokenService.revokeRefreshToken(dto.refreshToken);

    // Generate new tokens
    const tokens = await this.tokenService.generateTokenPair(user.id, payload.deviceId);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: user.profile?.displayName || '',
        avatarUrl: user.profile?.avatarUrl,
      },
      ...tokens,
      deviceId: payload.deviceId,
    };
  }

  async signOut(userId: string, accessToken: string, deviceId?: string): Promise<void> {
    // Blacklist the access token
    const tokenPayload = await this.tokenService.decodeToken(accessToken);
    if (tokenPayload) {
      const ttl = tokenPayload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redisService.blacklistToken(accessToken, ttl);
      }
    }

    // Revoke refresh tokens
    if (deviceId) {
      await this.tokenService.revokeDeviceTokens(userId, deviceId);
      await this.deviceService.deactivateDevice(userId, deviceId);
    } else {
      await this.tokenService.revokeAllUserTokens(userId);
    }

    // Clear session
    await this.redisService.deleteUserSession(userId);

    this.logger.log(`User signed out: ${userId}`);
  }

  async signOutAllDevices(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
    await this.deviceService.deactivateAllDevices(userId);
    await this.redisService.deleteUserSession(userId);

    this.logger.log(`User signed out from all devices: ${userId}`);
  }

  async validateUser(userId: string): Promise<{ id: string; email: string | null; status: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}

