import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ParticipantService } from './services/participant.service';
import { LeaderboardService } from './services/leaderboard.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService, ParticipantService, LeaderboardService],
  exports: [SessionService, ParticipantService, LeaderboardService],
})
export class SessionModule {}

