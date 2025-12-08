import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { EmergencyContactService } from './services/emergency-contact.service';
import { FileUploadService } from './services/file-upload.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, EmergencyContactService, FileUploadService],
  exports: [ProfileService, EmergencyContactService, FileUploadService],
})
export class ProfileModule {}
