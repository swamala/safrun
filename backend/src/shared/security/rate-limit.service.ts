import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  // Predefined rate limit configurations
  readonly limits = {
    api: { limit: 100, windowSeconds: 60, keyPrefix: 'ratelimit:api' },
    auth: { limit: 5, windowSeconds: 60, keyPrefix: 'ratelimit:auth' },
    sos: { limit: 3, windowSeconds: 60, keyPrefix: 'ratelimit:sos' },
    location: { limit: 60, windowSeconds: 60, keyPrefix: 'ratelimit:location' },
    signup: { limit: 3, windowSeconds: 3600, keyPrefix: 'ratelimit:signup' },
  };

  constructor(private readonly redisService: RedisService) {}

  async checkLimit(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const key = `${config.keyPrefix || 'ratelimit'}:${identifier}`;
    const result = await this.redisService.checkRateLimit(
      key,
      config.limit,
      config.windowSeconds,
    );

    if (!result.allowed) {
      this.logger.warn(`Rate limit exceeded for ${identifier}`);
    }

    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: result.resetAt,
      retryAfter: result.allowed ? undefined : config.windowSeconds,
    };
  }

  async checkApiLimit(userId: string): Promise<RateLimitResult> {
    return this.checkLimit(userId, this.limits.api);
  }

  async checkAuthLimit(ipAddress: string): Promise<RateLimitResult> {
    return this.checkLimit(ipAddress, this.limits.auth);
  }

  async checkSOSLimit(userId: string): Promise<RateLimitResult> {
    return this.checkLimit(userId, this.limits.sos);
  }

  async checkLocationLimit(userId: string): Promise<RateLimitResult> {
    return this.checkLimit(userId, this.limits.location);
  }

  async checkSignupLimit(ipAddress: string): Promise<RateLimitResult> {
    return this.checkLimit(ipAddress, this.limits.signup);
  }

  /**
   * Throws an exception if rate limit is exceeded
   */
  async enforceLimit(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<void> {
    const result = await this.checkLimit(identifier, config);

    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Get remaining requests for a user
   */
  async getRemainingRequests(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<number> {
    const result = await this.checkLimit(identifier, config);
    return result.remaining;
  }

  /**
   * Reset rate limit for a specific identifier
   */
  async resetLimit(identifier: string, config: RateLimitConfig): Promise<void> {
    const key = `${config.keyPrefix || 'ratelimit'}:${identifier}`;
    await this.redisService.del(key);
    this.logger.log(`Rate limit reset for ${identifier}`);
  }
}

