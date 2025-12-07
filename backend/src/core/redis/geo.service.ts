import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export interface GeoLocation {
  longitude: number;
  latitude: number;
  member: string;
}

export interface NearbyResult {
  member: string;
  distance: number;
  coordinates?: {
    longitude: number;
    latitude: number;
  };
}

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly ACTIVE_RUNNERS_KEY = 'geo:active_runners';
  private readonly SESSION_RUNNERS_PREFIX = 'geo:session:';

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Add or update a runner's location in the geo index
   */
  async updateRunnerLocation(
    userId: string,
    longitude: number,
    latitude: number,
    sessionId?: string,
  ): Promise<void> {
    const pipe = this.redis.pipeline();

    // Update global active runners index
    pipe.geoadd(this.ACTIVE_RUNNERS_KEY, longitude, latitude, userId);

    // Update session-specific index if in a session
    if (sessionId) {
      pipe.geoadd(`${this.SESSION_RUNNERS_PREFIX}${sessionId}`, longitude, latitude, userId);
    }

    // Set TTL metadata for cleanup
    pipe.hset(`runner:${userId}:meta`, {
      lastUpdate: Date.now().toString(),
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      sessionId: sessionId || '',
    });
    pipe.expire(`runner:${userId}:meta`, 300); // 5 minutes TTL

    await pipe.exec();
  }

  /**
   * Remove a runner from geo indexes
   */
  async removeRunner(userId: string, sessionId?: string): Promise<void> {
    const pipe = this.redis.pipeline();
    pipe.zrem(this.ACTIVE_RUNNERS_KEY, userId);

    if (sessionId) {
      pipe.zrem(`${this.SESSION_RUNNERS_PREFIX}${sessionId}`, userId);
    }

    pipe.del(`runner:${userId}:meta`);
    await pipe.exec();
  }

  /**
   * Find nearby runners within a radius (in meters)
   * Uses Redis GEORADIUS for O(N+log(M)) performance
   */
  async findNearbyRunners(
    longitude: number,
    latitude: number,
    radiusMeters: number,
    limit = 50,
    excludeUserId?: string,
  ): Promise<NearbyResult[]> {
    const results = await this.redis.georadius(
      this.ACTIVE_RUNNERS_KEY,
      longitude,
      latitude,
      radiusMeters,
      'm',
      'WITHDIST',
      'WITHCOORD',
      'ASC',
      'COUNT',
      limit + 1, // +1 to account for potential self
    );

    const nearby: NearbyResult[] = [];

    for (const result of results) {
      if (Array.isArray(result)) {
        const [member, distStr, coords] = result as [
          string,
          string,
          [string, string],
        ];

        if (excludeUserId && member === excludeUserId) continue;

        nearby.push({
          member,
          distance: parseFloat(distStr),
          coordinates: coords
            ? {
                longitude: parseFloat(coords[0]),
                latitude: parseFloat(coords[1]),
              }
            : undefined,
        });
      }
    }

    return nearby.slice(0, limit);
  }

  /**
   * Find runners in a specific session
   */
  async findSessionRunners(
    sessionId: string,
    longitude: number,
    latitude: number,
    radiusMeters = 50000, // 50km default for session scope
  ): Promise<NearbyResult[]> {
    const results = await this.redis.georadius(
      `${this.SESSION_RUNNERS_PREFIX}${sessionId}`,
      longitude,
      latitude,
      radiusMeters,
      'm',
      'WITHDIST',
      'WITHCOORD',
      'ASC',
    );

    const nearby: NearbyResult[] = [];

    for (const result of results) {
      if (Array.isArray(result)) {
        const [member, distStr, coords] = result as [
          string,
          string,
          [string, string],
        ];

        nearby.push({
          member,
          distance: parseFloat(distStr),
          coordinates: coords
            ? {
                longitude: parseFloat(coords[0]),
                latitude: parseFloat(coords[1]),
              }
            : undefined,
        });
      }
    }

    return nearby;
  }

  /**
   * Get distance between two runners
   */
  async getDistanceBetweenRunners(userId1: string, userId2: string): Promise<number | null> {
    const result = await this.redis.geodist(this.ACTIVE_RUNNERS_KEY, userId1, userId2, 'm');
    return result ? parseFloat(result) : null;
  }

  /**
   * Get runner's current position
   */
  async getRunnerPosition(userId: string): Promise<{ longitude: number; latitude: number } | null> {
    const positions = await this.redis.geopos(this.ACTIVE_RUNNERS_KEY, userId);

    if (positions && positions[0]) {
      const [lng, lat] = positions[0] as [string, string];
      return {
        longitude: parseFloat(lng),
        latitude: parseFloat(lat),
      };
    }

    return null;
  }

  /**
   * Get all runners in a session
   */
  async getSessionRunnersCount(sessionId: string): Promise<number> {
    return this.redis.zcard(`${this.SESSION_RUNNERS_PREFIX}${sessionId}`);
  }

  /**
   * Clean up session geo data
   */
  async cleanupSession(sessionId: string): Promise<void> {
    await this.redis.del(`${this.SESSION_RUNNERS_PREFIX}${sessionId}`);
  }

  /**
   * Clean up stale runners (those who haven't updated in X minutes)
   */
  async cleanupStaleRunners(maxAgeMinutes = 5): Promise<number> {
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    let cleaned = 0;

    // Scan through all runner metadata
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', 'runner:*:meta', 'COUNT', 100);
      cursor = nextCursor;

      for (const key of keys) {
        const meta = await this.redis.hgetall(key);
        if (meta.lastUpdate && parseInt(meta.lastUpdate) < cutoff) {
          const userId = key.split(':')[1];
          await this.removeRunner(userId, meta.sessionId || undefined);
          cleaned++;
        }
      }
    } while (cursor !== '0');

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} stale runners`);
    }

    return cleaned;
  }
}

