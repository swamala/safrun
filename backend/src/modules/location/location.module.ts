import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationValidationService } from './services/location-validation.service';
import { LocationHistoryService } from './services/location-history.service';
import { LocationSmoothingService } from './services/location-smoothing.service';
import { PaceCalculationService } from './services/pace-calculation.service';
import { RouteReconstructionService } from './services/route-reconstruction.service';
import { StatusDetectionService } from './services/status-detection.service';

@Module({
  controllers: [LocationController],
  providers: [
    LocationService,
    LocationValidationService,
    LocationHistoryService,
    LocationSmoothingService,
    PaceCalculationService,
    RouteReconstructionService,
    StatusDetectionService,
  ],
  exports: [
    LocationService,
    LocationValidationService,
    LocationHistoryService,
    LocationSmoothingService,
    PaceCalculationService,
    RouteReconstructionService,
    StatusDetectionService,
  ],
})
export class LocationModule {}
