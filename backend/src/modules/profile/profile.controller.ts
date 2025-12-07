import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { EmergencyContactService } from './services/emergency-contact.service';
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

