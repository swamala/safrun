import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';

@Injectable()
export class LocationRateLimitGuard implements CanActivate {
  // Maximum 5 location updates per second
  private readonly MAX_REQUESTS_PER_SECOND = 5;
  private readonly WINDOW_SECONDS = 1;

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return true; // Let auth guard handle this
    }

    const key = `ratelimit:location:${userId}`;
    const current = await this.redisService.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= this.MAX_REQUESTS_PER_SECOND) {
      throw new HttpException(
        {
          success: false,
          error: 'Too many location updates. Please slow down.',
          errorCode: 'LOCATION_RATE_LIMIT',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter with TTL
    await this.redisService.set(key, String(count + 1), this.WINDOW_SECONDS);

    return true;
  }
}

