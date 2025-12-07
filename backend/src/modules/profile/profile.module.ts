import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { EmergencyContactService } from './services/emergency-contact.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, EmergencyContactService],
  exports: [ProfileService, EmergencyContactService],
})
export class ProfileModule {}

