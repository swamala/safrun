import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/core/prisma/prisma.service';
import { RedisService } from '@/core/redis/redis.service';
import { nanoid } from 'nanoid';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenPayload {
  userId: string;
  deviceId?: string;
  tokenId: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {
    this.jwtSecret = this.configService.get('JWT_SECRET', 'secret');
    this.jwtRefreshSecret = this.configService.get('JWT_REFRESH_SECRET', 'refresh-secret');
    this.jwtExpiresIn = this.configService.get('JWT_EXPIRES_IN', '15m');
    this.jwtRefreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  async generateTokenPair(userId: string, deviceId?: string): Promise<TokenPair> {
    const tokenId = nanoid();
    const expiresIn = this.parseExpiresIn(this.jwtExpiresIn);

    // Generate access token
    const accessToken = this.jwtService.sign(
      { userId, deviceId },
      {
        secret: this.jwtSecret,
        expiresIn: this.jwtExpiresIn,
      },
    );

    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      { userId, deviceId, tokenId },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiresIn,
      },
    );

    // Store refresh token in database
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setSeconds(refreshExpiresAt.getSeconds() + this.parseExpiresIn(this.jwtRefreshExpiresIn));

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: tokenId,
        deviceId,
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken, expiresIn };
  }

  async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.jwtRefreshSecret,
      });

      // Check if token is in database and not revoked
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: payload.tokenId,
          userId: payload.userId,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      this.logger.warn(`Refresh token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.jwtRefreshSecret,
      });

      await this.prisma.refreshToken.updateMany({
        where: { token: payload.tokenId },
        data: { isRevoked: true },
      });
    } catch {
      // Token already invalid, ignore
    }
  }

  async revokeDeviceTokens(userId: string, deviceId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, deviceId },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async decodeToken(token: string): Promise<{ userId: string; exp: number } | null> {
    try {
      return this.jwtService.decode(token) as { userId: string; exp: number };
    } catch {
      return null;
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.redisService.isTokenBlacklisted(token);
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}

