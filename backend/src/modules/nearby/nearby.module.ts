import { Module } from '@nestjs/common';
import { NearbyService } from './nearby.service';
import { NearbyController } from './nearby.controller';
import { ClusteringService } from './services/clustering.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [LocationModule],
  controllers: [NearbyController],
  providers: [NearbyService, ClusteringService],
  exports: [NearbyService, ClusteringService],
})
export class NearbyModule {}

