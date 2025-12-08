/**
 * Notification types for push notifications and SMS
 */
export enum NotificationType {
  // SOS related
  SOS_NEARBY = 'sos_nearby',
  SOS_ESCALATED = 'sos_escalated',
  SOS_RESOLVED = 'sos_resolved',
  SOS_CANCELLED = 'sos_cancelled',
  
  // Responder related
  RESPONDER_JOINED = 'responder_joined',
  RESPONDER_ARRIVED = 'responder_arrived',
  RESPONDER_UPDATE = 'responder_update',
  
  // Session related
  SESSION_STARTING_SOON = 'session_starting_soon',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  PARTICIPANT_JOINED = 'participant_joined',
  
  // Achievement related
  MILESTONE_UNLOCKED = 'milestone_unlocked',
  
  // System
  TEST = 'test',
  GENERAL = 'general',
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Notification channel for delivery method
 */
export enum NotificationChannel {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  WEBSOCKET = 'websocket',
}

