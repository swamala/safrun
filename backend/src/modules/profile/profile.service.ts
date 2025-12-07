import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { UpdateProfileDto, SafetySettingsDto, ProfileResponseDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      stats: {
        totalDistance: profile.totalDistance,
        totalRuns: profile.totalRuns,
        totalDuration: profile.totalDuration,
        averagePace: profile.averagePace,
      },
      safetySettings: {
        autoSOSEnabled: profile.autoSOSEnabled,
        fallDetectionEnabled: profile.fallDetectionEnabled,
        noMovementTimeout: profile.noMovementTimeout,
        sosVerificationTime: profile.sosVerificationTime,
      },
      privacySettings: {
        profileVisibility: profile.profileVisibility,
        showOnNearbyRadar: profile.showOnNearbyRadar,
        allowGroupInvites: profile.allowGroupInvites,
        shareLocationDefault: profile.shareLocationDefault,
        anonymousModeEnabled: profile.anonymousModeEnabled,
        homeLocationFuzzing: profile.homeLocationFuzzing,
      },
      email: profile.user.email,
      phone: profile.user.phone,
      isEmailVerified: profile.user.isEmailVerified,
      isPhoneVerified: profile.user.isPhoneVerified,
      memberSince: profile.user.createdAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
        bio: dto.bio,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
      },
    });

    this.logger.log(`Profile updated for user ${userId}`);

    return this.mapProfileToResponse(profile);
  }

  async updateSafetySettings(userId: string, dto: SafetySettingsDto): Promise<ProfileResponseDto> {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        autoSOSEnabled: dto.autoSOSEnabled,
        fallDetectionEnabled: dto.fallDetectionEnabled,
        noMovementTimeout: dto.noMovementTimeout,
        sosVerificationTime: dto.sosVerificationTime,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
      },
    });

    this.logger.log(`Safety settings updated for user ${userId}`);

    return this.mapProfileToResponse(profile);
  }

  async updatePrivacySettings(
    userId: string,
    dto: {
      profileVisibility?: string;
      showOnNearbyRadar?: boolean;
      allowGroupInvites?: boolean;
      shareLocationDefault?: boolean;
      anonymousModeEnabled?: boolean;
      homeLocationFuzzing?: boolean;
    },
  ): Promise<ProfileResponseDto> {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
      },
    });

    this.logger.log(`Privacy settings updated for user ${userId}`);

    return this.mapProfileToResponse(profile);
  }

  async updateRunningStats(
    userId: string,
    distance: number,
    duration: number,
  ): Promise<void> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return;

    const totalDistance = profile.totalDistance + distance;
    const totalDuration = profile.totalDuration + duration;
    const totalRuns = profile.totalRuns + 1;
    const averagePace = totalDuration > 0 ? totalDuration / (totalDistance / 1000) : null; // min/km

    await this.prisma.profile.update({
      where: { userId },
      data: {
        totalDistance,
        totalDuration,
        totalRuns,
        averagePace,
      },
    });
  }

  async getPublicProfile(userId: string): Promise<Partial<ProfileResponseDto> | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || profile.profileVisibility === 'PRIVATE') {
      return null;
    }

    return {
      displayName: profile.anonymousModeEnabled ? 'Anonymous Runner' : profile.displayName,
      avatarUrl: profile.anonymousModeEnabled ? null : profile.avatarUrl,
      stats: {
        totalDistance: profile.totalDistance,
        totalRuns: profile.totalRuns,
        totalDuration: profile.totalDuration,
        averagePace: profile.averagePace,
      },
    };
  }

  private mapProfileToResponse(profile: {
    id: string;
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    totalDistance: number;
    totalRuns: number;
    totalDuration: number;
    averagePace: number | null;
    autoSOSEnabled: boolean;
    fallDetectionEnabled: boolean;
    noMovementTimeout: number;
    sosVerificationTime: number;
    profileVisibility: string;
    showOnNearbyRadar: boolean;
    allowGroupInvites: boolean;
    shareLocationDefault: boolean;
    anonymousModeEnabled: boolean;
    homeLocationFuzzing: boolean;
    user: {
      id: string;
      email: string | null;
      phone: string | null;
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      createdAt: Date;
    };
  }): ProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      stats: {
        totalDistance: profile.totalDistance,
        totalRuns: profile.totalRuns,
        totalDuration: profile.totalDuration,
        averagePace: profile.averagePace,
      },
      safetySettings: {
        autoSOSEnabled: profile.autoSOSEnabled,
        fallDetectionEnabled: profile.fallDetectionEnabled,
        noMovementTimeout: profile.noMovementTimeout,
        sosVerificationTime: profile.sosVerificationTime,
      },
      privacySettings: {
        profileVisibility: profile.profileVisibility,
        showOnNearbyRadar: profile.showOnNearbyRadar,
        allowGroupInvites: profile.allowGroupInvites,
        shareLocationDefault: profile.shareLocationDefault,
        anonymousModeEnabled: profile.anonymousModeEnabled,
        homeLocationFuzzing: profile.homeLocationFuzzing,
      },
      email: profile.user.email,
      phone: profile.user.phone,
      isEmailVerified: profile.user.isEmailVerified,
      isPhoneVerified: profile.user.isPhoneVerified,
      memberSince: profile.user.createdAt,
    };
  }
}

