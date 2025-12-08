import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';

@Injectable()
export class SOSRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(SOSRateLimitGuard.name);
  
  // Maximum 3 SOS triggers per hour
  private readonly MAX_TRIGGERS_PER_HOUR = 3;
  private readonly WINDOW_SECONDS = 3600; // 1 hour

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const path = request.path;

    // Only apply to trigger/pending endpoints
    if (!path.includes('/pending') && !path.includes('/trigger')) {
      return true;
    }

    if (!userId) {
      return true; // Let auth guard handle this
    }

    const key = `ratelimit:sos:${userId}`;
    const current = await this.redisService.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= this.MAX_TRIGGERS_PER_HOUR) {
      this.logger.warn(`User ${userId} exceeded SOS rate limit (${count}/${this.MAX_TRIGGERS_PER_HOUR})`);
      
      throw new HttpException(
        {
          success: false,
          error: 'Too many SOS triggers. Please contact support if you need assistance.',
          errorCode: 'SOS_RATE_LIMIT',
          retryAfterSeconds: await this.getRetryAfter(key),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    if (count === 0) {
      await this.redisService.set(key, '1', this.WINDOW_SECONDS);
    } else {
      await this.redisService.set(key, String(count + 1), this.WINDOW_SECONDS);
    }

    return true;
  }

  private async getRetryAfter(key: string): Promise<number> {
    const ttl = await this.redisService.ttl(key);
    return ttl > 0 ? ttl : this.WINDOW_SECONDS;
  }
}

