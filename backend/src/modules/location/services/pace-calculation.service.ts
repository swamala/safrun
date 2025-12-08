import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';

export interface PaceStats {
  currentPace: number; // min/km
  averagePace: number; // min/km
  currentSpeed: number; // m/s
  averageSpeed: number; // m/s
  totalDistance: number; // meters
  totalDuration: number; // seconds
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number | null;
}

@Injectable()
export class PaceCalculationService {
  private readonly logger = new Logger(PaceCalculationService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Calculate current pace from recent locations
   */
  calculateCurrentPace(recentLocations: LocationPoint[]): number | null {
    if (recentLocations.length < 2) return null;

    // Use last 30 seconds of data
    const now = Date.now();
    const cutoff = now - 30000;
    const recent = recentLocations.filter((l) => l.timestamp > cutoff);

    if (recent.length < 2) return null;

    const first = recent[0];
    const last = recent[recent.length - 1];

    const distance = this.calculateDistance(
      first.latitude,
      first.longitude,
      last.latitude,
      last.longitude,
    );

    const duration = (last.timestamp - first.timestamp) / 1000; // seconds

    if (duration <= 0 || distance < 1) return null;

    // Calculate pace in min/km
    const speed = distance / duration; // m/s
    if (speed < 0.1) return null; // Below walking speed

    const pace = 1000 / speed / 60; // min/km
    return Math.min(pace, 30); // Cap at 30 min/km (very slow walk)
  }

  /**
   * Calculate speed from raw location data
   */
  calculateSpeed(prevLocation: LocationPoint, currLocation: LocationPoint): number {
    const distance = this.calculateDistance(
      prevLocation.latitude,
      prevLocation.longitude,
      currLocation.latitude,
      currLocation.longitude,
    );

    const duration = (currLocation.timestamp - prevLocation.timestamp) / 1000;

    if (duration <= 0) return 0;

    return distance / duration; // m/s
  }

  /**
   * Get full pace statistics for a run
   */
  async getPaceStats(
    userId: string,
    sessionId?: string,
    soloRunId?: string,
  ): Promise<PaceStats | null> {
    const key = sessionId
      ? `pace:session:${sessionId}:${userId}`
      : soloRunId
        ? `pace:solo:${soloRunId}`
        : `pace:user:${userId}`;

    const cached = await this.redisService.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  }

  /**
   * Update pace statistics
   */
  async updatePaceStats(
    userId: string,
    distanceIncrement: number,
    durationIncrement: number,
    currentSpeed: number,
    sessionId?: string,
    soloRunId?: string,
  ): Promise<PaceStats> {
    const key = sessionId
      ? `pace:session:${sessionId}:${userId}`
      : soloRunId
        ? `pace:solo:${soloRunId}`
        : `pace:user:${userId}`;

    // Get existing stats
    let stats: PaceStats = {
      currentPace: 0,
      averagePace: 0,
      currentSpeed: 0,
      averageSpeed: 0,
      totalDistance: 0,
      totalDuration: 0,
    };

    const cached = await this.redisService.get(key);
    if (cached) {
      stats = JSON.parse(cached);
    }

    // Update totals
    stats.totalDistance += distanceIncrement;
    stats.totalDuration += durationIncrement;
    stats.currentSpeed = currentSpeed;

    // Calculate pace
    if (currentSpeed > 0) {
      stats.currentPace = 1000 / currentSpeed / 60; // min/km
    }

    if (stats.totalDuration > 0 && stats.totalDistance > 0) {
      stats.averageSpeed = stats.totalDistance / stats.totalDuration;
      stats.averagePace = 1000 / stats.averageSpeed / 60;
    }

    // Cache for 1 hour
    await this.redisService.set(key, JSON.stringify(stats), 3600);

    return stats;
  }

  /**
   * Reset pace stats (e.g., when starting a new run)
   */
  async resetPaceStats(
    userId: string,
    sessionId?: string,
    soloRunId?: string,
  ): Promise<void> {
    const key = sessionId
      ? `pace:session:${sessionId}:${userId}`
      : soloRunId
        ? `pace:solo:${soloRunId}`
        : `pace:user:${userId}`;

    await this.redisService.del(key);
  }

  /**
   * Calculate splits for a run (per km or per mile)
   */
  calculateSplits(
    locations: LocationPoint[],
    splitDistanceMeters = 1000,
  ): { splitNumber: number; distance: number; duration: number; pace: number }[] {
    const splits: { splitNumber: number; distance: number; duration: number; pace: number }[] = [];

    let totalDistance = 0;
    let splitStart = 0;
    let splitDistance = 0;
    let splitNumber = 1;

    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];

      const segmentDistance = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      );

      totalDistance += segmentDistance;
      splitDistance += segmentDistance;

      if (splitDistance >= splitDistanceMeters) {
        const splitDuration = (curr.timestamp - locations[splitStart].timestamp) / 1000;
        const pace = splitDuration / (splitDistance / 1000) / 60; // min/km

        splits.push({
          splitNumber,
          distance: splitDistance,
          duration: splitDuration,
          pace,
        });

        splitStart = i;
        splitDistance = 0;
        splitNumber++;
      }
    }

    // Add partial last split
    if (splitDistance > 0 && splitStart < locations.length - 1) {
      const splitDuration =
        (locations[locations.length - 1].timestamp - locations[splitStart].timestamp) / 1000;
      const pace = splitDuration / (splitDistance / 1000) / 60;

      splits.push({
        splitNumber,
        distance: splitDistance,
        duration: splitDuration,
        pace,
      });
    }

    return splits;
  }

  /**
   * Calculate ETA to a destination
   */
  calculateETA(
    currentLocation: LocationPoint,
    destination: { latitude: number; longitude: number },
    currentSpeed: number,
  ): number | null {
    if (currentSpeed <= 0) return null;

    const distance = this.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      destination.latitude,
      destination.longitude,
    );

    return Math.round(distance / currentSpeed); // seconds
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

