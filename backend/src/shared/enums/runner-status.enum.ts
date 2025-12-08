/**
 * Runner status for real-time tracking
 */
export enum RunnerStatus {
  OFFLINE = 'offline',
  IDLE = 'idle',
  MOVING = 'moving',
  PAUSED = 'paused',
  IN_SESSION = 'in_session',
  SOS_ACTIVE = 'sos_active',
}

/**
 * Thresholds for status detection
 */
export const STATUS_THRESHOLDS = {
  // No movement for this many seconds = paused
  PAUSED_TIMEOUT_SECONDS: 600, // 10 minutes
  
  // No updates for this many seconds = offline
  OFFLINE_TIMEOUT_SECONDS: 45,
  
  // Minimum speed (m/s) to be considered moving
  MIN_MOVING_SPEED: 0.5, // 1.8 km/h
  
  // Maximum accuracy to accept location (meters)
  MAX_ACCURACY_METERS: 100,
  
  // TTL for location data in Redis (seconds)
  LOCATION_TTL_SECONDS: 30,
};

