import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';
import { RunnerStatus, STATUS_THRESHOLDS } from '@/shared/enums/runner-status.enum';

interface RunnerState {
  userId: string;
  status: RunnerStatus;
  lastLatitude: number;
  lastLongitude: number;
  lastSpeed: number;
  lastUpdate: number;
  batteryLevel: number | null;
  isCharging: boolean;
  sessionId: string | null;
  soloRunId: string | null;
}

@Injectable()
export class StatusDetectionService {
  private readonly logger = new Logger(StatusDetectionService.name);
  private readonly RUNNER_STATE_KEY = 'runner:state:';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Update runner state and detect status changes
   */
  async updateRunnerState(
    userId: string,
    latitude: number,
    longitude: number,
    speed: number,
    batteryLevel?: number,
    isCharging?: boolean,
    sessionId?: string,
    soloRunId?: string,
  ): Promise<{ status: RunnerStatus; changed: boolean }> {
    const key = `${this.RUNNER_STATE_KEY}${userId}`;
    const now = Date.now();

    // Get previous state
    const prevStateStr = await this.redisService.get(key);
    const prevState: RunnerState | null = prevStateStr ? JSON.parse(prevStateStr) : null;

    // Determine new status
    let newStatus = this.determineStatus(
      speed,
      prevState,
      now,
      sessionId,
      soloRunId,
    );

    // Create new state
    const newState: RunnerState = {
      userId,
      status: newStatus,
      lastLatitude: latitude,
      lastLongitude: longitude,
      lastSpeed: speed,
      lastUpdate: now,
      batteryLevel: batteryLevel ?? prevState?.batteryLevel ?? null,
      isCharging: isCharging ?? prevState?.isCharging ?? false,
      sessionId: sessionId ?? null,
      soloRunId: soloRunId ?? null,
    };

    // Save state with TTL
    await this.redisService.set(
      key,
      JSON.stringify(newState),
      STATUS_THRESHOLDS.OFFLINE_TIMEOUT_SECONDS * 2, // TTL slightly longer than offline threshold
    );

    const changed = prevState?.status !== newStatus;

    if (changed) {
      this.logger.debug(`Runner ${userId} status changed: ${prevState?.status || 'unknown'} -> ${newStatus}`);
    }

    return { status: newStatus, changed };
  }

  /**
   * Determine runner status based on current data
   */
  private determineStatus(
    speed: number,
    prevState: RunnerState | null,
    now: number,
    sessionId?: string,
    soloRunId?: string,
  ): RunnerStatus {
    // Check for SOS active (would be set externally)
    // This is handled by SOS module

    // Check if in session
    if (sessionId || soloRunId) {
      if (speed >= STATUS_THRESHOLDS.MIN_MOVING_SPEED) {
        return RunnerStatus.MOVING;
      }

      // Check if paused (no movement for threshold period)
      if (prevState) {
        const timeSinceMovement = now - prevState.lastUpdate;
        if (
          prevState.lastSpeed < STATUS_THRESHOLDS.MIN_MOVING_SPEED &&
          timeSinceMovement > STATUS_THRESHOLDS.PAUSED_TIMEOUT_SECONDS * 1000
        ) {
          return RunnerStatus.PAUSED;
        }
      }

      return RunnerStatus.IN_SESSION;
    }

    // Not in session
    if (speed >= STATUS_THRESHOLDS.MIN_MOVING_SPEED) {
      return RunnerStatus.MOVING;
    }

    return RunnerStatus.IDLE;
  }

  /**
   * Get current runner status
   */
  async getRunnerStatus(userId: string): Promise<RunnerStatus> {
    const key = `${this.RUNNER_STATE_KEY}${userId}`;
    const stateStr = await this.redisService.get(key);

    if (!stateStr) {
      return RunnerStatus.OFFLINE;
    }

    const state: RunnerState = JSON.parse(stateStr);
    const now = Date.now();
    const timeSinceUpdate = now - state.lastUpdate;

    // Check if offline (no updates for threshold period)
    if (timeSinceUpdate > STATUS_THRESHOLDS.OFFLINE_TIMEOUT_SECONDS * 1000) {
      return RunnerStatus.OFFLINE;
    }

    return state.status;
  }

  /**
   * Get full runner state
   */
  async getRunnerState(userId: string): Promise<RunnerState | null> {
    const key = `${this.RUNNER_STATE_KEY}${userId}`;
    const stateStr = await this.redisService.get(key);

    if (!stateStr) {
      return null;
    }

    return JSON.parse(stateStr);
  }

  /**
   * Record heartbeat to keep runner alive
   */
  async recordHeartbeat(
    userId: string,
    batteryLevel?: number,
    isCharging?: boolean,
    sessionId?: string,
    soloRunId?: string,
  ): Promise<RunnerStatus> {
    const key = `${this.RUNNER_STATE_KEY}${userId}`;
    const now = Date.now();

    const prevStateStr = await this.redisService.get(key);
    
    if (prevStateStr) {
      const prevState: RunnerState = JSON.parse(prevStateStr);
      
      // Update with heartbeat data
      prevState.lastUpdate = now;
      if (batteryLevel !== undefined) {
        prevState.batteryLevel = batteryLevel;
      }
      if (isCharging !== undefined) {
        prevState.isCharging = isCharging;
      }
      if (sessionId !== undefined) {
        prevState.sessionId = sessionId;
      }
      if (soloRunId !== undefined) {
        prevState.soloRunId = soloRunId;
      }

      await this.redisService.set(
        key,
        JSON.stringify(prevState),
        STATUS_THRESHOLDS.OFFLINE_TIMEOUT_SECONDS * 2,
      );

      return prevState.status;
    }

    // Create minimal state from heartbeat
    const newState: RunnerState = {
      userId,
      status: sessionId || soloRunId ? RunnerStatus.IN_SESSION : RunnerStatus.IDLE,
      lastLatitude: 0,
      lastLongitude: 0,
      lastSpeed: 0,
      lastUpdate: now,
      batteryLevel: batteryLevel ?? null,
      isCharging: isCharging ?? false,
      sessionId: sessionId ?? null,
      soloRunId: soloRunId ?? null,
    };

    await this.redisService.set(
      key,
      JSON.stringify(newState),
      STATUS_THRESHOLDS.OFFLINE_TIMEOUT_SECONDS * 2,
    );

    return newState.status;
  }

  /**
   * Clear runner state (on logout or disconnect)
   */
  async clearRunnerState(userId: string): Promise<void> {
    const key = `${this.RUNNER_STATE_KEY}${userId}`;
    await this.redisService.del(key);
    this.logger.debug(`Cleared runner state for ${userId}`);
  }

  /**
   * Mark runner as offline
   */
  async markOffline(userId: string): Promise<void> {
    const key = `${this.RUNNER_STATE_KEY}${userId}`;
    const stateStr = await this.redisService.get(key);

    if (stateStr) {
      const state: RunnerState = JSON.parse(stateStr);
      state.status = RunnerStatus.OFFLINE;
      
      await this.redisService.set(
        key,
        JSON.stringify(state),
        STATUS_THRESHOLDS.OFFLINE_TIMEOUT_SECONDS, // Short TTL for offline state
      );
    }
  }

  /**
   * Mark runner as SOS active
   */
  async markSOSActive(userId: string): Promise<void> {
    const key = `${this.RUNNER_STATE_KEY}${userId}`;
    const stateStr = await this.redisService.get(key);

    if (stateStr) {
      const state: RunnerState = JSON.parse(stateStr);
      state.status = RunnerStatus.SOS_ACTIVE;
      state.lastUpdate = Date.now();
      
      await this.redisService.set(
        key,
        JSON.stringify(state),
        3600, // 1 hour TTL for SOS active
      );
    }
  }
}

