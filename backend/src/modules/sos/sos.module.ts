import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { SosEscalationService } from './services/sos-escalation.service';
import { SosResponderService } from './services/sos-responder.service';
import { SosNotificationService } from './services/sos-notification.service';
import { SosEscalationProcessor } from './processors/sos-escalation.processor';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sos-escalation',
    }),
    ProfileModule,
  ],
  controllers: [SosController],
  providers: [
    SosService,
    SosEscalationService,
    SosResponderService,
    SosNotificationService,
    SosEscalationProcessor,
  ],
  exports: [SosService, SosResponderService],
})
export class SosModule {}

