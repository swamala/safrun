import { create } from 'zustand';
import { sdk } from '@/lib/sdk';
import type { SOSAlert, SOSResponder } from '@safrun/sdk';

interface NearbyAlert {
  id: string;
  userId: string;
  displayName: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  triggeredAt: Date;
}

interface SOSState {
  activeAlert: SOSAlert | null;
  nearbyAlerts: NearbyAlert[];
  showVerification: boolean;
  verificationCountdown: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setActiveAlert: (alert: SOSAlert | null) => void;
  setNearbyAlerts: (alerts: NearbyAlert[]) => void;
  showVerificationModal: (show: boolean) => void;
  setVerificationCountdown: (seconds: number) => void;
  addResponder: (responderId: string, displayName: string, distance?: number) => void;
  updateResponderStatus: (responderId: string, status: string) => void;
  clearSOS: () => void;
  
  // SDK actions
  initiatePendingSOS: (latitude: number, longitude: number) => Promise<SOSAlert | null>;
  activateSOS: (alertId: string, notes?: string) => Promise<SOSAlert | null>;
  cancelSOS: (alertId: string, reason?: string) => Promise<boolean>;
  triggerSOS: (latitude: number, longitude: number, triggerType: string) => Promise<SOSAlert | null>;
  verifySOS: (alertId: string, isSafe: boolean) => Promise<SOSAlert | null>;
  respondToSOS: (alertId: string, accepted: boolean, latitude?: number, longitude?: number) => Promise<boolean>;
  resolveSOS: (alertId: string) => Promise<boolean>;
  fetchActiveAlert: () => Promise<void>;
  fetchNearbyAlerts: (latitude: number, longitude: number) => Promise<void>;
}

export const useSOSStore = create<SOSState>((set, get) => ({
  activeAlert: null,
  nearbyAlerts: [],
  showVerification: false,
  verificationCountdown: 10,
  isLoading: false,
  error: null,

  setActiveAlert: (activeAlert) => set({ activeAlert }),
  
  setNearbyAlerts: (nearbyAlerts) => set({ nearbyAlerts }),
  
  showVerificationModal: (showVerification) => set({ showVerification }),
  
  setVerificationCountdown: (verificationCountdown) => set({ verificationCountdown }),
  
  addResponder: (responderId, displayName, distance) => set((state) => {
    if (!state.activeAlert) return state;
    
    const newResponder: SOSResponder = {
      id: responderId,
      responderId,
      displayName,
      status: 'NOTIFIED',
      distance: distance ?? null,
      avatarUrl: null,
      estimatedETA: null,
      lastLatitude: null,
      lastLongitude: null,
    };
    
    const responders = [
      ...(state.activeAlert.responders || []),
      newResponder,
    ];
    
    return {
      activeAlert: { ...state.activeAlert, responders },
    };
  }),
  
  updateResponderStatus: (responderId, status) => set((state) => {
    if (!state.activeAlert?.responders) return state;
    
    const responders = state.activeAlert.responders.map((r) =>
      r.responderId === responderId ? { ...r, status: status as SOSResponder['status'] } : r
    );
    
    return {
      activeAlert: { ...state.activeAlert, responders },
    };
  }),
  
  clearSOS: () => set({
    activeAlert: null,
    showVerification: false,
    verificationCountdown: 10,
    error: null,
  }),

  // SDK-based actions
  initiatePendingSOS: async (latitude, longitude) => {
    set({ isLoading: true, error: null });
    try {
      const alert = await sdk.sos.initiatePending({ latitude, longitude });
      set({ activeAlert: alert, isLoading: false });
      return alert;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate SOS';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  activateSOS: async (alertId, notes) => {
    set({ isLoading: true, error: null });
    try {
      const alert = await sdk.sos.activate({ alertId, notes });
      set({ activeAlert: alert, isLoading: false });
      return alert;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to activate SOS';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  cancelSOS: async (alertId, reason) => {
    set({ isLoading: true, error: null });
    try {
      await sdk.sos.cancel({ alertId, reason });
      set({ activeAlert: null, isLoading: false, showVerification: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel SOS';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  triggerSOS: async (latitude, longitude, triggerType) => {
    set({ isLoading: true, error: null });
    try {
      const alert = await sdk.sos.trigger({
        latitude,
        longitude,
        triggerType: triggerType as 'MANUAL' | 'FALL_DETECTION' | 'NO_MOVEMENT' | 'ABDUCTION_SPEED' | 'DEVICE_SNATCH' | 'HEART_RATE_ANOMALY',
      });
      set({ activeAlert: alert, isLoading: false, showVerification: true });
      return alert;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to trigger SOS';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  verifySOS: async (alertId, isSafe) => {
    set({ isLoading: true, error: null });
    try {
      const alert = await sdk.sos.verify({ alertId, isSafe });
      set({
        activeAlert: isSafe ? null : alert,
        isLoading: false,
        showVerification: false,
      });
      return alert;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to verify SOS';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  respondToSOS: async (alertId, accepted, latitude, longitude) => {
    try {
      await sdk.sos.respondToAlert({ alertId, accepted, latitude, longitude });
      return true;
    } catch {
      return false;
    }
  },

  resolveSOS: async (alertId) => {
    set({ isLoading: true, error: null });
    try {
      await sdk.sos.resolve(alertId);
      set({ activeAlert: null, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resolve SOS';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  fetchActiveAlert: async () => {
    try {
      const alert = await sdk.sos.getActiveAlert();
      set({ activeAlert: alert });
    } catch {
      set({ activeAlert: null });
    }
  },

  fetchNearbyAlerts: async (latitude, longitude) => {
    try {
      const alerts = await sdk.sos.getNearbyAlerts(latitude, longitude);
      const nearbyAlerts: NearbyAlert[] = alerts.map((a) => ({
        id: a.id,
        userId: a.userId,
        displayName: a.user.displayName,
        location: {
          latitude: a.location.latitude,
          longitude: a.location.longitude,
        },
        distance: 0, // Would need to calculate
        triggeredAt: a.triggeredAt,
      }));
      set({ nearbyAlerts });
    } catch {
      // Ignore errors for nearby alerts
    }
  },
}));
