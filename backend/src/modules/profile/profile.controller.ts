import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { EmergencyContactService } from './services/emergency-contact.service';
import { FileUploadService, UploadedFile as UploadFileType } from './services/file-upload.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  UpdateProfileDto,
  SafetySettingsDto,
  PrivacySettingsDto,
  ProfileResponseDto,
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
  EmergencyContactResponseDto,
} from './dto/profile.dto';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly emergencyContactService: EmergencyContactService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async getProfile(@CurrentUser('id') userId: string): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(userId);
  }

  @Get(':userId/public')
  @ApiOperation({ summary: 'Get public profile of another user' })
  async getPublicProfile(@Param('userId') userId: string) {
    return this.profileService.getPublicProfile(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(userId, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPEG, PNG, WebP, GIF - max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: any,
  ): Promise<{ avatarUrl: string; thumbnailUrl: string }> {
    const uploadedFile: UploadFileType = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    const result = await this.fileUploadService.uploadAvatar(userId, uploadedFile);

    // Update profile with new avatar URL
    await this.profileService.updateAvatar(userId, result.url, result.thumbnailUrl);

    return {
      avatarUrl: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
    };
  }

  @Patch('safety')
  @ApiOperation({ summary: 'Update safety settings' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async updateSafetySettings(
    @CurrentUser('id') userId: string,
    @Body() dto: SafetySettingsDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateSafetySettings(userId, dto);
  }

  @Patch('privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async updatePrivacySettings(
    @CurrentUser('id') userId: string,
    @Body() dto: PrivacySettingsDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updatePrivacySettings(userId, dto);
  }

  // Emergency Contacts
  @Get('emergency-contacts')
  @ApiOperation({ summary: 'Get emergency contacts' })
  @ApiResponse({ status: 200, type: [EmergencyContactResponseDto] })
  async getEmergencyContacts(
    @CurrentUser('id') userId: string,
  ): Promise<EmergencyContactResponseDto[]> {
    return this.emergencyContactService.getContacts(userId);
  }

  @Put('emergency-contacts')
  @ApiOperation({ summary: 'Add emergency contact' })
  @ApiResponse({ status: 201, type: EmergencyContactResponseDto })
  async addEmergencyContact(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEmergencyContactDto,
  ): Promise<EmergencyContactResponseDto> {
    return this.emergencyContactService.createContact(userId, dto);
  }

  @Patch('emergency-contacts/:contactId')
  @ApiOperation({ summary: 'Update emergency contact' })
  @ApiResponse({ status: 200, type: EmergencyContactResponseDto })
  async updateEmergencyContact(
    @CurrentUser('id') userId: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateEmergencyContactDto,
  ): Promise<EmergencyContactResponseDto> {
    return this.emergencyContactService.updateContact(userId, contactId, dto);
  }

  @Patch('emergency-contacts/:contactId/delete')
  @ApiOperation({ summary: 'Delete emergency contact' })
  async deleteEmergencyContact(
    @CurrentUser('id') userId: string,
    @Param('contactId') contactId: string,
  ): Promise<void> {
    await this.emergencyContactService.deleteContact(userId, contactId);
  }
}
