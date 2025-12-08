import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { RedisService } from '@/core/redis/redis.service';
import { DeviceInfoDto, DeviceListResponseDto, DeviceResponseDto, UpdateDeviceDto } from '../dto/auth.dto';
import { DeviceType } from '@prisma/client';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private readonly DEVICE_ANOMALY_THRESHOLD = 3; // Max new devices in 24h
  private readonly MAX_ACTIVE_DEVICES = 5; // Max active devices per user

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async registerDevice(userId: string, deviceInfo: DeviceInfoDto) {
    const existingDevice = await this.prisma.device.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId: deviceInfo.deviceId,
        },
      },
    });

    if (existingDevice) {
      // Update existing device
      return this.prisma.device.update({
        where: { id: existingDevice.id },
        data: {
          lastActiveAt: new Date(),
          pushToken: deviceInfo.pushToken || existingDevice.pushToken,
          fingerprint: deviceInfo.fingerprint || existingDevice.fingerprint,
          deviceModel: deviceInfo.deviceModel || existingDevice.deviceModel,
          osVersion: deviceInfo.osVersion || existingDevice.osVersion,
          appVersion: deviceInfo.appVersion || existingDevice.appVersion,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          isActive: true,
        },
      });
    }

    // Check device limit before creating new device
    const activeDeviceCount = await this.prisma.device.count({
      where: { userId, isActive: true },
    });

    if (activeDeviceCount >= this.MAX_ACTIVE_DEVICES) {
      // Deactivate oldest device
      const oldestDevice = await this.prisma.device.findFirst({
        where: { userId, isActive: true },
        orderBy: { lastActiveAt: 'asc' },
      });

      if (oldestDevice) {
        await this.prisma.device.update({
          where: { id: oldestDevice.id },
          data: { isActive: false },
        });
        // Revoke tokens for oldest device
        await this.prisma.refreshToken.updateMany({
          where: { userId, deviceId: oldestDevice.deviceId },
          data: { isRevoked: true },
        });
        this.logger.log(`Deactivated oldest device ${oldestDevice.id} due to device limit`);
      }
    }

    // Create new device
    return this.prisma.device.create({
      data: {
        userId,
        deviceId: deviceInfo.deviceId,
        deviceType: deviceInfo.deviceType as DeviceType,
        deviceName: deviceInfo.deviceName,
        deviceModel: deviceInfo.deviceModel,
        osVersion: deviceInfo.osVersion,
        appVersion: deviceInfo.appVersion,
        pushToken: deviceInfo.pushToken,
        fingerprint: deviceInfo.fingerprint,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        isActive: true,
      },
    });
  }

  async checkDeviceAnomaly(userId: string, deviceInfo: DeviceInfoDto): Promise<boolean> {
    // Check if this is a known device
    const knownDevice = await this.prisma.device.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId: deviceInfo.deviceId,
        },
      },
    });

    if (knownDevice) {
      // Device is known, check for fingerprint changes
      if (knownDevice.fingerprint && deviceInfo.fingerprint) {
        if (knownDevice.fingerprint !== deviceInfo.fingerprint) {
          this.logger.warn(`Device fingerprint mismatch for user ${userId}`);
          return true;
        }
      }
      return false;
    }

    // New device - check rate of new device registrations
    const recentDevicesKey = `device:rate:${userId}`;
    const { allowed, remaining } = await this.redisService.checkRateLimit(
      recentDevicesKey,
      this.DEVICE_ANOMALY_THRESHOLD,
      86400, // 24 hours
    );

    if (!allowed) {
      this.logger.warn(`Too many new devices for user ${userId}. Remaining: ${remaining}`);
      return true;
    }

    // Check for suspicious IP patterns
    const recentIpKey = `device:ip:${userId}`;
    if (deviceInfo.ipAddress) {
      await this.redisService.sadd(recentIpKey, deviceInfo.ipAddress);
      await this.redisService.expire(recentIpKey, 86400);

      const recentIps = await this.redisService.smembers(recentIpKey);
      if (recentIps.length > 5) {
        this.logger.warn(`Multiple IPs detected for user ${userId}: ${recentIps.length} unique IPs`);
        // This could trigger additional verification
        return true;
      }
    }

    return false;
  }

  async deactivateDevice(userId: string, deviceId: string): Promise<void> {
    await this.prisma.device.updateMany({
      where: { userId, deviceId },
      data: { isActive: false },
    });
  }

  async deactivateAllDevices(userId: string): Promise<void> {
    await this.prisma.device.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async getActiveDevices(userId: string) {
    return this.prisma.device.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  async getUserDevices(userId: string, currentDeviceId?: string): Promise<DeviceListResponseDto> {
    const devices = await this.prisma.device.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
    });

    const deviceResponses: DeviceResponseDto[] = devices.map((device) => ({
      id: device.id,
      deviceType: device.deviceType,
      deviceName: device.deviceName,
      deviceModel: device.deviceModel,
      osVersion: device.osVersion,
      isActive: device.isActive,
      lastActiveAt: device.lastActiveAt,
      createdAt: device.createdAt,
      isCurrent: device.deviceId === currentDeviceId,
    }));

    return {
      devices: deviceResponses,
      total: devices.length,
    };
  }

  async removeDevice(userId: string, deviceDbId: string): Promise<void> {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceDbId, userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Revoke all refresh tokens for this device
    await this.prisma.refreshToken.updateMany({
      where: { userId, deviceId: device.deviceId },
      data: { isRevoked: true },
    });

    // Delete the device
    await this.prisma.device.delete({
      where: { id: deviceDbId },
    });

    this.logger.log(`Device ${deviceDbId} removed for user ${userId}`);
  }

  async updatePushToken(userId: string, deviceId: string, pushToken: string): Promise<void> {
    // First, remove this token from any other devices (token should be unique)
    await this.prisma.device.updateMany({
      where: {
        pushToken,
        NOT: { userId, deviceId },
      },
      data: { pushToken: null },
    });

    // Update the device with the new token
    const result = await this.prisma.device.updateMany({
      where: { userId, deviceId },
      data: { pushToken, lastActiveAt: new Date() },
    });

    if (result.count === 0) {
      this.logger.warn(`No device found for userId: ${userId}, deviceId: ${deviceId}`);
    } else {
      this.logger.log(`Push token updated for device ${deviceId}`);
    }
  }

  async getDevicesWithPushToken(userId: string): Promise<{ pushToken: string; deviceType: DeviceType }[]> {
    const devices = await this.prisma.device.findMany({
      where: {
        userId,
        isActive: true,
        pushToken: { not: null },
      },
      select: {
        pushToken: true,
        deviceType: true,
      },
    });

    return devices.filter((d) => d.pushToken !== null) as { pushToken: string; deviceType: DeviceType }[];
  }

  async getDevicesByPushTokens(pushTokens: string[]): Promise<Map<string, string>> {
    const devices = await this.prisma.device.findMany({
      where: {
        pushToken: { in: pushTokens },
        isActive: true,
      },
      select: {
        userId: true,
        pushToken: true,
      },
    });

    const tokenToUserMap = new Map<string, string>();
    for (const device of devices) {
      if (device.pushToken) {
        tokenToUserMap.set(device.pushToken, device.userId);
      }
    }

    return tokenToUserMap;
  }

  async updateDeviceMetadata(
    userId: string,
    deviceDbId: string,
    dto: UpdateDeviceDto,
  ): Promise<void> {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceDbId, userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await this.prisma.device.update({
      where: { id: deviceDbId },
      data: {
        deviceName: dto.deviceName ?? device.deviceName,
        deviceModel: dto.deviceModel ?? device.deviceModel,
        osVersion: dto.osVersion ?? device.osVersion,
        appVersion: dto.appVersion ?? device.appVersion,
        lastActiveAt: new Date(),
      },
    });

    this.logger.log(`Device ${deviceDbId} metadata updated for user ${userId}`);
  }
}
