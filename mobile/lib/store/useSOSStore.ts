/**
 * SAFRUN SOS Store
 * Manages SOS alert state with Zustand + SDK integration
 */

import { create } from 'zustand';
import { sdk } from '@/lib/sdk';
import type { SOSAlert, SOSResponder } from '@safrun/sdk';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface Responder {
  id: string;
  name: string;
  avatarUrl?: string;
  distance: string;
  status: 'responding' | 'arrived' | 'notified';
  eta?: string;
}

type SOSStatus = 'idle' | 'confirming' | 'active' | 'resolved';

interface SOSState {
  // State
  status: SOSStatus;
  activeAlert: SOSAlert | null;
  activatedAt: number | null;
  location: Location | null;
  responders: Responder[];
  confirmationCountdown: number;
  broadcastRadius: number;
  isLoading: boolean;
  error: string | null;

  // Settings
  autoSOSEnabled: boolean;
  fallDetectionEnabled: boolean;
  emergencyContacts: string[];

  // Actions
  initiateAlert: () => void;
  confirmAlert: (location: Location) => Promise<void>;
  cancelAlert: () => Promise<void>;
  resolveAlert: () => Promise<void>;
  updateCountdown: (seconds: number) => void;
  addResponder: (responder: Responder) => void;
  updateResponderStatus: (id: string, status: Responder['status']) => void;
  setAutoSOS: (enabled: boolean) => void;
  setFallDetection: (enabled: boolean) => void;
  setBroadcastRadius: (radius: number) => void;
  reset: () => void;

  // SDK actions
  initiatePendingSOS: (latitude: number, longitude: number) => Promise<SOSAlert | null>;
  activateSOS: (alertId: string) => Promise<boolean>;
  cancelSOS: (alertId: string, reason?: string) => Promise<boolean>;
  respondToSOS: (alertId: string, accepted: boolean) => Promise<boolean>;
  fetchActiveAlert: () => Promise<void>;
  handleSOSUpdate: (data: unknown) => void;
}

const CONFIRMATION_SECONDS = 5;

export const useSOSStore = create<SOSState>((set, get) => ({
  // Initial state
  status: 'idle',
  activeAlert: null,
  activatedAt: null,
  location: null,
  responders: [],
  confirmationCountdown: CONFIRMATION_SECONDS,
  broadcastRadius: 5,
  isLoading: false,
  error: null,

  // Settings
  autoSOSEnabled: true,
  fallDetectionEnabled: false,
  emergencyContacts: [],

  // Actions
  initiateAlert: () => {
    set({
      status: 'confirming',
      confirmationCountdown: CONFIRMATION_SECONDS,
    });
  },

  confirmAlert: async (location) => {
    const { activeAlert } = get();
    
    if (activeAlert && activeAlert.status === 'PENDING') {
      // Activate the pending SOS
      set({ isLoading: true });
      try {
        const alert = await sdk.sos.activate({ alertId: activeAlert.id });
        set({
          status: 'active',
          activeAlert: alert,
          activatedAt: Date.now(),
          location,
          isLoading: false,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to activate SOS';
        set({ error: message, isLoading: false });
      }
    } else {
      // Fallback to legacy flow
      set({
        status: 'active',
        activatedAt: Date.now(),
        location,
        responders: [],
      });
    }
  },

  cancelAlert: async () => {
    const { activeAlert } = get();
    
    if (activeAlert) {
      try {
        await sdk.sos.cancel({ alertId: activeAlert.id });
      } catch {
        // Continue with local cancel
      }
    }

    set({
      status: 'idle',
      activeAlert: null,
      activatedAt: null,
      location: null,
      responders: [],
      confirmationCountdown: CONFIRMATION_SECONDS,
    });
  },

  resolveAlert: async () => {
    const { activeAlert } = get();
    
    if (activeAlert) {
      try {
        await sdk.sos.resolve(activeAlert.id);
      } catch {
        // Continue with local resolve
      }
    }

    set({ status: 'resolved' });

    // Reset after showing resolved state
    setTimeout(() => {
      get().reset();
    }, 3000);
  },

  updateCountdown: (seconds) => {
    set({ confirmationCountdown: seconds });
  },

  addResponder: (responder) => {
    set((state) => ({
      responders: [...state.responders, responder],
    }));
  },

  updateResponderStatus: (id, status) => {
    set((state) => ({
      responders: state.responders.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    }));
  },

  setAutoSOS: (enabled) => {
    set({ autoSOSEnabled: enabled });
  },

  setFallDetection: (enabled) => {
    set({ fallDetectionEnabled: enabled });
  },

  setBroadcastRadius: (radius) => {
    set({ broadcastRadius: radius });
  },

  reset: () => {
    set({
      status: 'idle',
      activeAlert: null,
      activatedAt: null,
      location: null,
      responders: [],
      confirmationCountdown: CONFIRMATION_SECONDS,
      error: null,
    });
  },

  // SDK actions
  initiatePendingSOS: async (latitude, longitude) => {
    set({ isLoading: true, error: null, status: 'confirming' });
    
    try {
      const alert = await sdk.sos.initiatePending({
        latitude,
        longitude,
        countdownSeconds: CONFIRMATION_SECONDS,
      });
      
      set({
        activeAlert: alert,
        isLoading: false,
        confirmationCountdown: alert.countdownRemaining || CONFIRMATION_SECONDS,
      });
      
      return alert;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate SOS';
      set({ error: message, isLoading: false, status: 'idle' });
      return null;
    }
  },

  activateSOS: async (alertId) => {
    set({ isLoading: true, error: null });
    
    try {
      const alert = await sdk.sos.activate({ alertId });
      
      // Map responders from SDK format
      const responders: Responder[] = (alert.responders || []).map(r => ({
        id: r.id,
        name: r.displayName,
        avatarUrl: r.avatarUrl || undefined,
        distance: r.distance ? `${(r.distance / 1000).toFixed(1)}km` : 'Unknown',
        status: r.status === 'ARRIVED' ? 'arrived' : 
               r.status === 'ACCEPTED' || r.status === 'EN_ROUTE' ? 'responding' : 'notified',
        eta: r.estimatedETA ? `${Math.ceil(r.estimatedETA / 60)} min` : undefined,
      }));
      
      set({
        status: 'active',
        activeAlert: alert,
        activatedAt: Date.now(),
        location: {
          latitude: alert.location.latitude,
          longitude: alert.location.longitude,
          timestamp: Date.now(),
        },
        responders,
        isLoading: false,
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate SOS';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  cancelSOS: async (alertId, reason) => {
    set({ isLoading: true, error: null });
    
    try {
      await sdk.sos.cancel({ alertId, reason });
      
      set({
        status: 'idle',
        activeAlert: null,
        activatedAt: null,
        location: null,
        responders: [],
        isLoading: false,
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel SOS';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  respondToSOS: async (alertId, accepted) => {
    try {
      await sdk.sos.respondToAlert({ alertId, accepted });
      return true;
    } catch {
      return false;
    }
  },

  fetchActiveAlert: async () => {
    try {
      const alert = await sdk.sos.getActiveAlert();
      
      if (alert) {
        const responders: Responder[] = (alert.responders || []).map(r => ({
          id: r.id,
          name: r.displayName,
          avatarUrl: r.avatarUrl || undefined,
          distance: r.distance ? `${(r.distance / 1000).toFixed(1)}km` : 'Unknown',
          status: r.status === 'ARRIVED' ? 'arrived' : 
                 r.status === 'ACCEPTED' || r.status === 'EN_ROUTE' ? 'responding' : 'notified',
          eta: r.estimatedETA ? `${Math.ceil(r.estimatedETA / 60)} min` : undefined,
        }));
        
        set({
          status: alert.status === 'PENDING' ? 'confirming' : 
                 alert.status === 'ACTIVE' ? 'active' : 'idle',
          activeAlert: alert,
          activatedAt: alert.activatedAt ? new Date(alert.activatedAt).getTime() : null,
          location: {
            latitude: alert.location.latitude,
            longitude: alert.location.longitude,
            timestamp: Date.now(),
          },
          responders,
        });
      }
    } catch {
      // No active alert
    }
  },

  handleSOSUpdate: (data: unknown) => {
    const update = data as { type: string; responders?: SOSResponder[] };
    
    if (update.type === 'SOS_RESPONDER_ACCEPTED' || update.type === 'SOS_RESPONDER_UPDATE') {
      // Refresh responders
      get().fetchActiveAlert();
    } else if (update.type === 'SOS_RESOLVED') {
      set({ status: 'resolved' });
      setTimeout(() => get().reset(), 3000);
    }
  },
}));

export default useSOSStore;
