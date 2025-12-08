import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { SosEscalationService } from './services/sos-escalation.service';
import { SosResponderService } from './services/sos-responder.service';
import { SosNotificationService } from './services/sos-notification.service';
import { SosEscalationProcessor } from './processors/sos-escalation.processor';
import { SosTimelineService } from './services/sos-timeline.service';
import { EtaCalculationService } from './services/eta-calculation.service';
import { ProfileModule } from '../profile/profile.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sos-escalation',
    }),
    BullModule.registerQueue({
      name: 'sos-notifications',
    }),
    ProfileModule,
    forwardRef(() => LocationModule),
  ],
  controllers: [SosController],
  providers: [
    SosService,
    SosEscalationService,
    SosResponderService,
    SosNotificationService,
    SosEscalationProcessor,
    SosTimelineService,
    EtaCalculationService,
  ],
  exports: [SosService, SosResponderService, SosTimelineService, EtaCalculationService],
})
export class SosModule {}

