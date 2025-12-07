import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';
import { LocationUpdateDto, ValidationResultDto } from '../dto/location.dto';

@Injectable()
export class LocationValidationService {
  private readonly logger = new Logger(LocationValidationService.name);

  // Maximum speed in m/s (about 45 km/h - very fast running)
  private readonly MAX_SPEED = 12.5;

  // Minimum accuracy in meters
  private readonly MIN_ACCURACY = 500;

  // Maximum time gap between updates (5 minutes)
  private readonly MAX_TIME_GAP_MS = 300000;

  // Maximum distance jump without proportional time (in meters)
  private readonly MAX_TELEPORT_DISTANCE = 1000;

  constructor(private readonly redisService: RedisService) {}

  async validateLocation(
    userId: string,
    dto: LocationUpdateDto,
  ): Promise<ValidationResultDto> {
    // Basic validation
    if (!this.isValidCoordinates(dto.latitude, dto.longitude)) {
      return { isValid: false, isAnomalous: false, reason: 'Invalid coordinates' };
    }

    // Check accuracy
    if (dto.accuracy && dto.accuracy > this.MIN_ACCURACY) {
      return { isValid: false, isAnomalous: false, reason: 'Location accuracy too low' };
    }

    // Get previous location for velocity check
    const previousKey = `location:prev:${userId}`;
    const previousData = await this.redisService.get(previousKey);

    if (previousData) {
      const previous = JSON.parse(previousData) as {
        latitude: number;
        longitude: number;
        timestamp: number;
      };

      const timeDiff = (dto.timestamp || Date.now()) - previous.timestamp;
      const distance = this.calculateDistance(
        previous.latitude,
        previous.longitude,
        dto.latitude,
        dto.longitude,
      );

      // Check for teleportation
      if (distance > this.MAX_TELEPORT_DISTANCE && timeDiff < this.MAX_TIME_GAP_MS) {
        const impliedSpeed = distance / (timeDiff / 1000);
        if (impliedSpeed > this.MAX_SPEED) {
          return {
            isValid: true,
            isAnomalous: true,
            reason: `Suspicious movement: ${distance.toFixed(0)}m in ${(timeDiff / 1000).toFixed(0)}s`,
          };
        }
      }

      // Check for impossible speed
      if (dto.speed && dto.speed > this.MAX_SPEED * 2) {
        return {
          isValid: true,
          isAnomalous: true,
          reason: `Impossible speed: ${dto.speed.toFixed(1)} m/s`,
        };
      }
    }

    // Store current location as previous
    await this.redisService.set(
      previousKey,
      JSON.stringify({
        latitude: dto.latitude,
        longitude: dto.longitude,
        timestamp: dto.timestamp || Date.now(),
      }),
      300, // 5 minute TTL
    );

    return { isValid: true, isAnomalous: false };
  }

  async checkReplayAttack(userId: string, dto: LocationUpdateDto): Promise<boolean> {
    if (!dto.signatureHash) return false;

    const usedKey = `location:signature:${userId}:${dto.signatureHash}`;
    const exists = await this.redisService.exists(usedKey);

    if (exists) {
      this.logger.warn(`Replay attack detected for user ${userId}`);
      return true;
    }

    // Mark signature as used
    await this.redisService.set(usedKey, '1', 3600); // 1 hour TTL

    return false;
  }

  private isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
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

