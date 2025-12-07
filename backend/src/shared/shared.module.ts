import { Global, Module } from '@nestjs/common';
import { SecurityModule } from './security/security.module';
import { EncryptionService } from './security/encryption.service';
import { AuditLogService } from './security/audit-log.service';
import { RateLimitService } from './security/rate-limit.service';

@Global()
@Module({
  imports: [SecurityModule],
  exports: [SecurityModule],
})
export class SharedModule {}

