import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { RedisService } from '@/core/redis/redis.service';
import { DeviceInfoDto } from '../dto/auth.dto';
import { DeviceType } from '@prisma/client';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private readonly DEVICE_ANOMALY_THRESHOLD = 3; // Max new devices in 24h

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
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          isActive: true,
        },
      });
    }

    // Create new device
    return this.prisma.device.create({
      data: {
        userId,
        deviceId: deviceInfo.deviceId,
        deviceType: deviceInfo.deviceType as DeviceType,
        deviceName: deviceInfo.deviceName,
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

  async updatePushToken(userId: string, deviceId: string, pushToken: string): Promise<void> {
    await this.prisma.device.updateMany({
      where: { userId, deviceId },
      data: { pushToken },
    });
  }
}

