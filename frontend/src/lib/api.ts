/**
 * @deprecated Use sdk from '@/lib/sdk' instead
 * 
 * This file is kept for backwards compatibility but all new code should use:
 * 
 * import { sdk } from '@/lib/sdk';
 * 
 * Example:
 * - sdk.auth.signIn({ identifier, password })
 * - sdk.profile.getProfile()
 * - sdk.sos.trigger({ latitude, longitude, triggerType })
 * - sdk.sessions.createSession({ title })
 */

import { sdk } from './sdk';

// Re-export sdk methods for backwards compatibility
export const api = {
  // Auth
  signUp: (data: Parameters<typeof sdk.auth.signUp>[0]) => sdk.auth.signUp(data),
  signIn: (data: Parameters<typeof sdk.auth.signIn>[0]) => sdk.auth.signIn(data),
  signOut: () => sdk.auth.signOut(),

  // Profile
  getProfile: () => sdk.profile.getProfile(),
  updateProfile: (data: Parameters<typeof sdk.profile.updateProfile>[0]) => sdk.profile.updateProfile(data),
  updateSafetySettings: (data: Parameters<typeof sdk.profile.updateSafetySettings>[0]) => sdk.profile.updateSafetySettings(data),
  getEmergencyContacts: () => sdk.profile.getEmergencyContacts(),
  addEmergencyContact: (data: Parameters<typeof sdk.profile.addEmergencyContact>[0]) => sdk.profile.addEmergencyContact(data),

  // Sessions
  createSession: (data: Parameters<typeof sdk.sessions.createSession>[0]) => sdk.sessions.createSession(data),
  getSessions: (params?: { status?: string; limit?: number; offset?: number }) => sdk.sessions.getMySessions(params?.status, params?.limit, params?.offset),
  getSession: (sessionId: string) => sdk.sessions.getSession(sessionId),
  joinSession: (sessionId: string) => sdk.sessions.joinSession(sessionId),
  leaveSession: (sessionId: string) => sdk.sessions.leaveSession(sessionId),
  startSession: (sessionId: string) => sdk.sessions.startSession(sessionId),
  endSession: (sessionId: string) => sdk.sessions.endSession(sessionId),

  // Location
  updateLocation: (data: Parameters<typeof sdk.location.updateLocation>[0]) => sdk.location.updateLocation(data),
  getSessionLocations: (sessionId: string) => sdk.location.getSessionRoute(sessionId),

  // SOS
  triggerSOS: (data: Parameters<typeof sdk.sos.trigger>[0]) => sdk.sos.trigger(data),
  verifySOS: (alertId: string, isSafe: boolean) => sdk.sos.verify({ alertId, isSafe }),
  acknowledgeSOS: (alertId: string, accepted: boolean) => sdk.sos.respondToAlert({ alertId, accepted }),
  resolveSOSAlert: (alertId: string) => sdk.sos.resolve(alertId),
  getActiveSOSAlert: () => sdk.sos.getActiveAlert(),
  getSOSHistory: (limit?: number, offset?: number) => sdk.sos.getAlertHistory(limit, offset),
  getNearbySOSAlerts: (latitude: number, longitude: number) => sdk.sos.getNearbyAlerts(latitude, longitude),

  // Nearby
  searchNearbyRunners: (data: { latitude: number; longitude: number; radiusMeters?: number; limit?: number }) =>
    sdk.nearby.getNearbyRunners(data.latitude, data.longitude, data.radiusMeters, data.limit),
  updateNearbyVisibility: (isVisible: boolean) => sdk.nearby.setVisibility(isVisible),

  // Helpers from old API
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};
