import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { StatsController } from './stats.controller';
import { FeedService } from './feed.service';
import { MilestoneService } from './services/milestone.service';

@Module({
  controllers: [FeedController, StatsController],
  providers: [FeedService, MilestoneService],
  exports: [FeedService, MilestoneService],
})
export class FeedModule {}

