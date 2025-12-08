import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';

export interface PresenceInfo {
  userId: string;
  status: 'online' | 'idle' | 'away' | 'offline';
  lastSeen: Date;
  connectedAt: Date;
  deviceCount: number;
  currentSessionId?: string | null;
  currentSOSAlertId?: string | null;
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly PRESENCE_KEY = 'presence:';
  private readonly PRESENCE_TTL = 300; // 5 minutes

  constructor(private readonly redisService: RedisService) {}

  /**
   * Set user as online
   */
  async setOnline(
    userId: string,
    deviceId?: string,
    sessionId?: string,
  ): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    const existing = await this.getPresence(userId);

    const presence: PresenceInfo = {
      userId,
      status: 'online',
      lastSeen: new Date(),
      connectedAt: existing?.connectedAt || new Date(),
      deviceCount: (existing?.deviceCount || 0) + 1,
      currentSessionId: sessionId || existing?.currentSessionId || null,
      currentSOSAlertId: existing?.currentSOSAlertId || null,
    };

    await this.redisService.set(key, JSON.stringify(presence), this.PRESENCE_TTL);
    this.logger.debug(`User ${userId} is now online (${presence.deviceCount} devices)`);
  }

  /**
   * Set user as offline (when all devices disconnect)
   */
  async setOffline(userId: string): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    const existing = await this.getPresence(userId);

    if (!existing) return;

    const newDeviceCount = Math.max(0, existing.deviceCount - 1);

    if (newDeviceCount === 0) {
      // User fully offline
      const presence: PresenceInfo = {
        ...existing,
        status: 'offline',
        lastSeen: new Date(),
        deviceCount: 0,
      };

      await this.redisService.set(key, JSON.stringify(presence), this.PRESENCE_TTL * 12); // Keep offline status longer
      this.logger.debug(`User ${userId} is now offline`);
    } else {
      // Still has other devices connected
      const presence: PresenceInfo = {
        ...existing,
        deviceCount: newDeviceCount,
        lastSeen: new Date(),
      };

      await this.redisService.set(key, JSON.stringify(presence), this.PRESENCE_TTL);
    }
  }

  /**
   * Update user activity (heartbeat)
   */
  async updateActivity(userId: string, sessionId?: string): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    const existing = await this.getPresence(userId);

    if (!existing) {
      await this.setOnline(userId, undefined, sessionId);
      return;
    }

    const presence: PresenceInfo = {
      ...existing,
      status: 'online',
      lastSeen: new Date(),
      currentSessionId: sessionId ?? existing.currentSessionId,
    };

    await this.redisService.set(key, JSON.stringify(presence), this.PRESENCE_TTL);
  }

  /**
   * Set user as idle (not actively moving)
   */
  async setIdle(userId: string): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    const existing = await this.getPresence(userId);

    if (!existing) return;

    const presence: PresenceInfo = {
      ...existing,
      status: 'idle',
      lastSeen: new Date(),
    };

    await this.redisService.set(key, JSON.stringify(presence), this.PRESENCE_TTL);
  }

  /**
   * Set active SOS alert for user
   */
  async setSOSActive(userId: string, alertId: string): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    const existing = await this.getPresence(userId);

    const presence: PresenceInfo = {
      userId,
      status: 'online',
      lastSeen: new Date(),
      connectedAt: existing?.connectedAt || new Date(),
      deviceCount: existing?.deviceCount || 1,
      currentSessionId: existing?.currentSessionId || null,
      currentSOSAlertId: alertId,
    };

    await this.redisService.set(key, JSON.stringify(presence), 3600); // 1 hour for SOS
    this.logger.log(`User ${userId} has active SOS: ${alertId}`);
  }

  /**
   * Clear SOS alert for user
   */
  async clearSOS(userId: string): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    const existing = await this.getPresence(userId);

    if (!existing) return;

    const presence: PresenceInfo = {
      ...existing,
      currentSOSAlertId: null,
      lastSeen: new Date(),
    };

    await this.redisService.set(key, JSON.stringify(presence), this.PRESENCE_TTL);
  }

  /**
   * Get user presence
   */
  async getPresence(userId: string): Promise<PresenceInfo | null> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    const data = await this.redisService.get(key);

    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        lastSeen: new Date(parsed.lastSeen),
        connectedAt: new Date(parsed.connectedAt),
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if user is online
   */
  async isOnline(userId: string): Promise<boolean> {
    const presence = await this.getPresence(userId);
    return presence?.status === 'online';
  }

  /**
   * Get multiple users' presence
   */
  async getBulkPresence(userIds: string[]): Promise<Map<string, PresenceInfo>> {
    const result = new Map<string, PresenceInfo>();

    await Promise.all(
      userIds.map(async (userId) => {
        const presence = await this.getPresence(userId);
        if (presence) {
          result.set(userId, presence);
        }
      }),
    );

    return result;
  }

  /**
   * Get all online users (from a list)
   */
  async getOnlineUsers(userIds: string[]): Promise<string[]> {
    const presences = await this.getBulkPresence(userIds);
    return Array.from(presences.entries())
      .filter(([, presence]) => presence.status === 'online')
      .map(([userId]) => userId);
  }
}

