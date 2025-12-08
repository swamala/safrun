import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';

interface LocationData {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  speed?: number;
  locations?: Array<{
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    speed?: number;
  }>;
}

@Injectable()
export class LocationValidationPipe implements PipeTransform<LocationData, LocationData> {
  private readonly logger = new Logger(LocationValidationPipe.name);
  
  // Maximum acceptable accuracy in meters
  private readonly MAX_ACCURACY_METERS = 100;
  
  // Maximum realistic speed in m/s (about 45 km/h - Usain Bolt max)
  private readonly MAX_SPEED_MS = 12.5;
  
  // Minimum interval between updates in milliseconds
  private readonly MIN_UPDATE_INTERVAL_MS = 100;

  transform(value: LocationData, metadata: ArgumentMetadata): LocationData {
    if (!value) {
      return value;
    }

    // Handle single location
    if (value.latitude !== undefined && value.longitude !== undefined) {
      this.validateSingleLocation(value);
    }

    // Handle batch locations
    if (value.locations && Array.isArray(value.locations)) {
      value.locations = value.locations.filter((loc) => {
        try {
          this.validateSingleLocation(loc);
          return true;
        } catch (error) {
          this.logger.debug(`Filtered out invalid location: ${error.message}`);
          return false;
        }
      });

      if (value.locations.length === 0) {
        throw new BadRequestException({
          success: false,
          error: 'All locations were invalid',
          errorCode: 'INVALID_LOCATIONS',
        });
      }
    }

    return value;
  }

  private validateSingleLocation(location: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    speed?: number;
  }): void {
    // Validate latitude range
    if (location.latitude !== undefined) {
      if (location.latitude < -90 || location.latitude > 90) {
        throw new BadRequestException({
          success: false,
          error: 'Invalid latitude value (must be -90 to 90)',
          errorCode: 'INVALID_LATITUDE',
        });
      }
    }

    // Validate longitude range
    if (location.longitude !== undefined) {
      if (location.longitude < -180 || location.longitude > 180) {
        throw new BadRequestException({
          success: false,
          error: 'Invalid longitude value (must be -180 to 180)',
          errorCode: 'INVALID_LONGITUDE',
        });
      }
    }

    // Reject low accuracy locations
    if (location.accuracy !== undefined && location.accuracy > this.MAX_ACCURACY_METERS) {
      throw new BadRequestException({
        success: false,
        error: `Location accuracy too low (${location.accuracy}m, max ${this.MAX_ACCURACY_METERS}m)`,
        errorCode: 'LOW_ACCURACY',
      });
    }

    // Reject unrealistic speeds (potential spoofing)
    if (location.speed !== undefined && location.speed > this.MAX_SPEED_MS) {
      this.logger.warn(`Suspicious speed detected: ${location.speed} m/s`);
      throw new BadRequestException({
        success: false,
        error: 'Unrealistic speed detected',
        errorCode: 'SUSPICIOUS_SPEED',
      });
    }
  }
}

