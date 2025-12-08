import { Injectable, Logger } from '@nestjs/common';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  speed?: number | null;
  timestamp: number;
}

export interface SmoothedLocation {
  latitude: number;
  longitude: number;
  smoothedLat: number;
  smoothedLng: number;
  speed: number | null;
  smoothedSpeed: number | null;
}

@Injectable()
export class LocationSmoothingService {
  private readonly logger = new Logger(LocationSmoothingService.name);

  // Kalman filter state per user
  private userFilters: Map<
    string,
    {
      lat: KalmanFilter;
      lng: KalmanFilter;
      speed: KalmanFilter;
      lastUpdate: number;
    }
  > = new Map();

  private readonly FILTER_TIMEOUT = 30000; // 30 seconds

  /**
   * Apply smoothing to a location update using Kalman filter
   */
  smoothLocation(userId: string, point: LocationPoint): SmoothedLocation {
    // Get or create filter for this user
    let filter = this.userFilters.get(userId);

    if (!filter || point.timestamp - filter.lastUpdate > this.FILTER_TIMEOUT) {
      // Initialize new filter
      filter = {
        lat: new KalmanFilter(point.latitude),
        lng: new KalmanFilter(point.longitude),
        speed: new KalmanFilter(point.speed || 0),
        lastUpdate: point.timestamp,
      };
      this.userFilters.set(userId, filter);
    }

    // Update filters with new measurements
    const smoothedLat = filter.lat.update(point.latitude);
    const smoothedLng = filter.lng.update(point.longitude);
    const smoothedSpeed = point.speed !== null && point.speed !== undefined
      ? filter.speed.update(point.speed)
      : null;

    filter.lastUpdate = point.timestamp;

    return {
      latitude: point.latitude,
      longitude: point.longitude,
      smoothedLat,
      smoothedLng,
      speed: point.speed ?? null,
      smoothedSpeed,
    };
  }

  /**
   * Reset filter for a user (e.g., when starting a new run)
   */
  resetFilter(userId: string): void {
    this.userFilters.delete(userId);
  }

  /**
   * Apply exponential moving average to a series of locations
   */
  applyEMASmoothing(
    locations: LocationPoint[],
    alpha = 0.3,
  ): SmoothedLocation[] {
    if (locations.length === 0) return [];

    const result: SmoothedLocation[] = [];
    let prevSmoothedLat = locations[0].latitude;
    let prevSmoothedLng = locations[0].longitude;
    let prevSmoothedSpeed = locations[0].speed || 0;

    for (const loc of locations) {
      const smoothedLat = alpha * loc.latitude + (1 - alpha) * prevSmoothedLat;
      const smoothedLng = alpha * loc.longitude + (1 - alpha) * prevSmoothedLng;
      const smoothedSpeed =
        loc.speed !== null && loc.speed !== undefined
          ? alpha * loc.speed + (1 - alpha) * prevSmoothedSpeed
          : null;

      result.push({
        latitude: loc.latitude,
        longitude: loc.longitude,
        smoothedLat,
        smoothedLng,
        speed: loc.speed ?? null,
        smoothedSpeed,
      });

      prevSmoothedLat = smoothedLat;
      prevSmoothedLng = smoothedLng;
      if (smoothedSpeed !== null) {
        prevSmoothedSpeed = smoothedSpeed;
      }
    }

    return result;
  }

  /**
   * Remove GPS jitter from a location history
   * Uses a simple moving average with outlier removal
   */
  removeJitter(
    locations: LocationPoint[],
    windowSize = 5,
    maxJumpMeters = 50,
  ): LocationPoint[] {
    if (locations.length <= windowSize) return locations;

    const result: LocationPoint[] = [];

    for (let i = 0; i < locations.length; i++) {
      const windowStart = Math.max(0, i - Math.floor(windowSize / 2));
      const windowEnd = Math.min(locations.length, i + Math.floor(windowSize / 2) + 1);
      const window = locations.slice(windowStart, windowEnd);

      // Check if current point is an outlier
      if (i > 0) {
        const prevLoc = locations[i - 1];
        const currLoc = locations[i];
        const distance = this.calculateDistance(
          prevLoc.latitude,
          prevLoc.longitude,
          currLoc.latitude,
          currLoc.longitude,
        );
        const timeDiff = (currLoc.timestamp - prevLoc.timestamp) / 1000;
        const maxReasonableDistance = Math.max(maxJumpMeters, timeDiff * 15); // 15 m/s = ~54 km/h max

        if (distance > maxReasonableDistance) {
          // Skip this point as it's likely GPS error
          this.logger.debug(`Removed outlier: ${distance}m jump`);
          continue;
        }
      }

      // Calculate average of window
      const avgLat = window.reduce((sum, l) => sum + l.latitude, 0) / window.length;
      const avgLng = window.reduce((sum, l) => sum + l.longitude, 0) / window.length;

      result.push({
        latitude: avgLat,
        longitude: avgLng,
        speed: locations[i].speed,
        timestamp: locations[i].timestamp,
      });
    }

    return result;
  }

  /**
   * Clean up old filters to prevent memory leaks
   */
  cleanupOldFilters(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, filter] of this.userFilters.entries()) {
      if (now - filter.lastUpdate > this.FILTER_TIMEOUT * 2) {
        this.userFilters.delete(userId);
        cleaned++;
      }
    }

    return cleaned;
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

/**
 * Simple 1D Kalman Filter implementation
 */
class KalmanFilter {
  private estimate: number;
  private errorEstimate: number;
  private errorMeasurement: number;
  private q: number; // Process noise

  constructor(
    initialValue: number,
    errorEstimate = 1,
    errorMeasurement = 0.0001,
    q = 0.125,
  ) {
    this.estimate = initialValue;
    this.errorEstimate = errorEstimate;
    this.errorMeasurement = errorMeasurement;
    this.q = q;
  }

  update(measurement: number): number {
    // Prediction update
    this.errorEstimate += this.q;

    // Measurement update
    const kalmanGain = this.errorEstimate / (this.errorEstimate + this.errorMeasurement);
    this.estimate = this.estimate + kalmanGain * (measurement - this.estimate);
    this.errorEstimate = (1 - kalmanGain) * this.errorEstimate;

    return this.estimate;
  }
}

