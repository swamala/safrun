import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SosEscalationService } from '../services/sos-escalation.service';

@Processor('sos-escalation')
export class SosEscalationProcessor extends WorkerHost {
  private readonly logger = new Logger(SosEscalationProcessor.name);

  constructor(private readonly escalationService: SosEscalationService) {
    super();
  }

  async process(job: Job<{ alertId: string }>): Promise<void> {
    const { alertId } = job.data;

    this.logger.log(`Processing ${job.name} for SOS ${alertId}`);

    try {
      switch (job.name) {
        case 'verification-timeout':
          await this.escalationService.processVerificationTimeout(alertId);
          break;
        case 'escalate-level2':
          await this.escalationService.processLevel2Escalation(alertId);
          break;
        case 'escalate-level3':
          await this.escalationService.processLevel3Escalation(alertId);
          break;
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process ${job.name}: ${(error as Error).message}`);
      throw error;
    }
  }
}

