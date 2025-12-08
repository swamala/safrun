import { Injectable, Logger } from '@nestjs/common';
import { PaceCalculationService } from '@/modules/location/services/pace-calculation.service';

interface Location {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

interface ETAResult {
  etaSeconds: number;
  distanceMeters: number;
  confidence: number;
  headingToTarget?: number;
}

@Injectable()
export class EtaCalculationService {
  private readonly logger = new Logger(EtaCalculationService.name);

  // Average running speed in m/s (approximately 10 km/h)
  private readonly DEFAULT_RUNNING_SPEED = 2.78;
  
  // Minimum confidence when we have no speed data
  private readonly MIN_CONFIDENCE = 0.3;
  
  // Maximum confidence when we have all data
  private readonly MAX_CONFIDENCE = 0.95;

  constructor(private readonly paceService: PaceCalculationService) {}

  /**
   * Calculate ETA from responder to victim
   */
  calculateETA(
    responder: Location,
    victim: Location,
  ): ETAResult {
    // Calculate distance
    const distance = this.paceService.calculateDistance(
      responder.latitude,
      responder.longitude,
      victim.latitude,
      victim.longitude,
    );

    // Calculate bearing/heading to target
    const headingToTarget = this.calculateBearing(
      responder.latitude,
      responder.longitude,
      victim.latitude,
      victim.longitude,
    );

    // Determine effective speed
    let effectiveSpeed = this.DEFAULT_RUNNING_SPEED;
    let confidence = this.MIN_CONFIDENCE;

    if (responder.speed && responder.speed > 0) {
      effectiveSpeed = responder.speed;
      confidence = 0.7;

      // Adjust confidence based on heading alignment
      if (responder.heading !== undefined) {
        const headingDiff = Math.abs(this.normalizeAngle(responder.heading - headingToTarget));
        
        // If heading towards target, higher confidence
        if (headingDiff < 45) {
          confidence = this.MAX_CONFIDENCE;
        } else if (headingDiff < 90) {
          confidence = 0.8;
          // Reduce effective speed as they're not heading directly
          effectiveSpeed *= Math.cos((headingDiff * Math.PI) / 180);
        } else {
          // Heading away, use default speed assumption
          confidence = 0.4;
          effectiveSpeed = this.DEFAULT_RUNNING_SPEED;
        }
      }
    }

    // Calculate ETA in seconds
    const etaSeconds = Math.round(distance / effectiveSpeed);

    this.logger.debug(
      `ETA calculation: distance=${distance.toFixed(0)}m, speed=${effectiveSpeed.toFixed(2)}m/s, ETA=${etaSeconds}s, confidence=${confidence}`,
    );

    return {
      etaSeconds,
      distanceMeters: Math.round(distance),
      confidence,
      headingToTarget,
    };
  }

  /**
   * Calculate bearing from point A to point B
   */
  private calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    const bearing = ((θ * 180) / Math.PI + 360) % 360;

    return bearing;
  }

  /**
   * Normalize angle to [-180, 180]
   */
  private normalizeAngle(angle: number): number {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  }

  /**
   * Check if responder has arrived (within threshold distance)
   */
  hasArrived(
    responder: Location,
    victim: Location,
    thresholdMeters: number = 10,
  ): boolean {
    const distance = this.paceService.calculateDistance(
      responder.latitude,
      responder.longitude,
      victim.latitude,
      victim.longitude,
    );

    return distance <= thresholdMeters;
  }

  /**
   * Calculate time until responder arrives
   */
  estimateArrivalTime(
    responder: Location,
    victim: Location,
    startTime: Date,
  ): Date | null {
    const eta = this.calculateETA(responder, victim);
    
    if (eta.etaSeconds <= 0) {
      return null;
    }

    return new Date(startTime.getTime() + eta.etaSeconds * 1000);
  }
}

