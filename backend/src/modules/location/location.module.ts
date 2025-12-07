import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationValidationService } from './services/location-validation.service';
import { LocationHistoryService } from './services/location-history.service';

@Module({
  controllers: [LocationController],
  providers: [LocationService, LocationValidationService, LocationHistoryService],
  exports: [LocationService, LocationValidationService, LocationHistoryService],
})
export class LocationModule {}

