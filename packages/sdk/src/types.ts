// ============================================================================
// SAFRUN SDK Types - Derived from Backend DTOs
// ============================================================================

// Enums
export type DeviceType = 'IOS' | 'ANDROID' | 'WEB';
export type SOSTriggerType = 'MANUAL' | 'FALL_DETECTION' | 'NO_MOVEMENT' | 'ABDUCTION_SPEED' | 'DEVICE_SNATCH' | 'HEART_RATE_ANOMALY';
export type SOSStatus = 'PENDING' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED' | 'FALSE_ALARM';
export type SOSEscalationLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
export type ResponderStatus = 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'EN_ROUTE' | 'ARRIVED';
export type RunnerStatus = 'offline' | 'idle' | 'moving' | 'paused' | 'in_session' | 'sos_active';
export type SessionStatus = 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type NotificationType = 'SOS_ALERT' | 'SOS_UPDATE' | 'SESSION_INVITE' | 'MILESTONE' | 'SYSTEM';

// ============================================================================
// Auth Types
// ============================================================================

export interface SignUpRequest {
  email?: string;
  phone?: string;
  password: string;
  displayName: string;
  turnstileToken?: string;
}

export interface SignInRequest {
  identifier: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: DeviceType;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  fingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  pushToken?: string;
}

export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  displayName: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  deviceId: string;
}

export interface DeviceResponse {
  id: string;
  deviceType: DeviceType;
  deviceName?: string | null;
  deviceModel?: string | null;
  osVersion?: string | null;
  isActive: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  isCurrent: boolean;
}

export interface SessionResponse {
  user: AuthUser;
  currentDevice: DeviceResponse;
  activeDevices: number;
  maxDevices: number;
  sessionCreatedAt: Date;
  lastActivity: Date;
}

// ============================================================================
// Profile Types
// ============================================================================

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  thumbnailUrl?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  preferredUnit: 'METRIC' | 'IMPERIAL';
  autoShareLocation: boolean;
  sosCountdownSeconds: number;
  showOnNearby: boolean;
  shareLocationWithFollowers: boolean;
  shareStatsPublicly: boolean;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  preferredUnit?: 'METRIC' | 'IMPERIAL';
}

export interface SafetySettings {
  autoShareLocation?: boolean;
  sosCountdownSeconds?: number;
}

export interface PrivacySettings {
  showOnNearby?: boolean;
  shareLocationWithFollowers?: boolean;
  shareStatsPublicly?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  relationship?: string | null;
  priority: number;
  notifyOnSOS: boolean;
  notifyOnSessionStart: boolean;
  notifyOnSessionEnd: boolean;
}

export interface CreateEmergencyContactRequest {
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  priority?: number;
  notifyOnSOS?: boolean;
  notifyOnSessionStart?: boolean;
  notifyOnSessionEnd?: boolean;
}

// ============================================================================
// Location Types
// ============================================================================

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  isCharging?: boolean;
  networkType?: string;
  timestamp?: number;
  signatureHash?: string;
}

export interface LocationResponse {
  id: string;
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: Date;
  sessionId?: string | null;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null;
  timestamp: Date;
}

export interface SessionRoute {
  sessionId: string;
  points: RoutePoint[];
  totalDistance: number;
  totalDuration: number;
  averagePace?: number | null;
  polyline?: string;
}

export interface PaceStats {
  currentPace: number;
  averagePace: number;
  currentSpeed: number;
  averageSpeed: number;
  totalDistance: number;
  totalDuration: number;
}

export interface HeartbeatRequest {
  batteryLevel?: number;
  isCharging?: boolean;
  timestamp?: number;
  sessionId?: string;
  soloRunId?: string;
}

export interface HeartbeatResponse {
  success: boolean;
  serverTime: number;
  status: string;
  syncRequired?: boolean;
}

export interface RunnerStatusInfo {
  userId: string;
  status: RunnerStatus;
  batteryLevel?: number | null;
  lastUpdate?: Date;
  sessionId?: string | null;
}

// ============================================================================
// SOS Types
// ============================================================================

export interface TriggerSOSRequest {
  latitude: number;
  longitude: number;
  triggerType: SOSTriggerType;
  notes?: string;
  batteryLevel?: number;
}

export interface InitiatePendingSOSRequest {
  latitude: number;
  longitude: number;
  countdownSeconds?: number;
  batteryLevel?: number;
}

export interface ActivateSOSRequest {
  alertId: string;
  notes?: string;
}

export interface CancelSOSRequest {
  alertId: string;
  reason?: string;
}

export interface VerifySOSRequest {
  alertId: string;
  isSafe: boolean;
}

export interface RespondToSOSRequest {
  alertId: string;
  accepted: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UpdateResponderLocationRequest {
  alertId: string;
  latitude: number;
  longitude: number;
}

export interface SOSLocation {
  latitude: number;
  longitude: number;
  isApproximate: boolean;
}

export interface SOSUser {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface SOSResponder {
  id: string;
  responderId: string;
  displayName: string;
  avatarUrl?: string | null;
  status: ResponderStatus;
  distance?: number | null;
  estimatedETA?: number | null;
  lastLatitude?: number | null;
  lastLongitude?: number | null;
}

export interface SOSAlert {
  id: string;
  userId: string;
  triggerType: SOSTriggerType;
  status: SOSStatus;
  escalationLevel: SOSEscalationLevel;
  location: SOSLocation;
  countdownRemaining?: number;
  triggeredAt: Date;
  activatedAt: Date | null;
  verificationSentAt: Date | null;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  cancelledAt: Date | null;
  notes: string | null;
  batteryLevel: number | null;
  user: SOSUser;
  responders?: SOSResponder[];
}

export interface SOSListResponse {
  alerts: SOSAlert[];
  total: number;
  offset: number;
  limit: number;
}

export interface RespondersListResponse {
  responders: SOSResponder[];
  totalAccepted: number;
  totalNotified: number;
  totalArrived: number;
}

export interface SOSTimelineEvent {
  id: string;
  type: string;
  timestamp: Date;
  actorId?: string | null;
  actorName?: string | null;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface SOSTimeline {
  alertId: string;
  events: SOSTimelineEvent[];
  totalDurationSeconds: number;
  responseTimeSeconds?: number | null;
  resolutionTimeSeconds?: number | null;
}

// ============================================================================
// Session Types
// ============================================================================

export interface CreateSessionRequest {
  title: string;
  description?: string;
  scheduledAt?: Date;
  maxParticipants?: number;
  isPrivate?: boolean;
  startLatitude?: number;
  startLongitude?: number;
}

export interface JoinSessionRequest {
  inviteCode?: string;
}

export interface SessionParticipant {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  role: 'HOST' | 'PARTICIPANT';
  joinedAt: Date;
  leftAt?: Date | null;
  distanceCovered: number;
  currentPace?: number | null;
  lastLatitude?: number | null;
  lastLongitude?: number | null;
}

export interface Session {
  id: string;
  title: string;
  description?: string | null;
  status: SessionStatus;
  hostId: string;
  inviteCode: string;
  maxParticipants: number;
  isPrivate: boolean;
  scheduledAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  totalDistance: number;
  totalDuration: number;
  participants: SessionParticipant[];
  participantCount: number;
  createdAt: Date;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
  offset: number;
  limit: number;
}

// ============================================================================
// Nearby Types
// ============================================================================

export interface NearbyRunner {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  distance: number;
  status: RunnerStatus;
  sessionId?: string | null;
  lastUpdate?: Date;
}

export interface NearbyRunnersList {
  runners: NearbyRunner[];
  radius: number;
  center: { latitude: number; longitude: number };
  timestamp: Date;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface UserStats {
  totalRuns: number;
  totalDistance: number;
  totalDuration: number;
  averagePace: number;
  longestRun: number;
  fastestPace: number;
  currentStreak: number;
  longestStreak: number;
  thisWeekDistance: number;
  thisWeekRuns: number;
  thisMonthDistance: number;
  thisMonthRuns: number;
}

export interface RunHistory {
  id: string;
  type: 'SOLO' | 'SESSION';
  title?: string;
  distance: number;
  duration: number;
  averagePace: number;
  startedAt: Date;
  endedAt: Date;
  route?: RoutePoint[];
}

export interface RunHistoryList {
  runs: RunHistory[];
  total: number;
  offset: number;
  limit: number;
}

// ============================================================================
// Feed Types
// ============================================================================

export interface FeedItem {
  id: string;
  type: 'RUN_COMPLETED' | 'MILESTONE' | 'SOS_RESOLVED' | 'SESSION_COMPLETED';
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string | null;
  content: string;
  metadata?: Record<string, unknown>;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface FeedResponse {
  items: FeedItem[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationList {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  offset: number;
  limit: number;
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// SDK Configuration
// ============================================================================

export interface SDKConfig {
  baseURL: string;
  wsURL?: string;
  timeout?: number;
  onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string }) => void;
  onAuthError?: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
}

