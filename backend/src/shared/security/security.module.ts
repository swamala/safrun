import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { AuditLogService } from './audit-log.service';
import { RateLimitService } from './rate-limit.service';

@Global()
@Module({
  providers: [EncryptionService, AuditLogService, RateLimitService],
  exports: [EncryptionService, AuditLogService, RateLimitService],
})
export class SecurityModule {}

