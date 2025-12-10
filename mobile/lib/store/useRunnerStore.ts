/**
 * SAFRUN Runner Store
 * Manages running session and nearby runners with Zustand + SDK
 */

import { create } from 'zustand';
import { sdk } from '@/lib/sdk';
import { calculateDistance } from '@safrun/sdk';
import type { Session, NearbyRunner as SDKNearbyRunner, LocationUpdate } from '@safrun/sdk';

interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
}

interface NearbyRunner {
  id: string;
  name: string;
  avatarUrl?: string;
  location: Location;
  status: 'running' | 'paused' | 'idle' | 'sos';
  speed?: string;
  distance: string;
  sessionId?: string;
}

interface RunSession {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  participants: number;
  status: 'active' | 'scheduled' | 'completed';
  distance?: string;
  location?: string;
}

type RunningStatus = 'idle' | 'running' | 'paused';

interface RunnerState {
  // Current run
  runningStatus: RunningStatus;
  currentLocation: Location | null;
  routePoints: Location[];
  startTime: number | null;
  duration: number;
  distance: number;
  pace: string | null;
  currentSpeed: number | null;

  // Nearby runners
  nearbyRunners: NearbyRunner[];
  sosAlerts: NearbyRunner[];

  // Sessions
  activeSession: Session | null;
  availableSessions: RunSession[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  endRun: () => void;
  updateLocation: (location: Location) => void;
  updateDuration: (seconds: number) => void;
  setNearbyRunners: (runners: NearbyRunner[]) => void;
  addNearbyRunner: (runner: NearbyRunner) => void;
  removeNearbyRunner: (id: string) => void;
  updateRunnerLocation: (id: string, location: Location) => void;
  addSOSAlert: (runner: NearbyRunner) => void;
  removeSOSAlert: (id: string) => void;
  setAvailableSessions: (sessions: RunSession[]) => void;
  reset: () => void;

  // SDK actions
  createSession: (data: { title: string; description?: string }) => Promise<Session | null>;
  joinSession: (sessionId: string) => Promise<boolean>;
  joinByInviteCode: (inviteCode: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  startSession: () => Promise<boolean>;
  endSession: () => Promise<boolean>;
  fetchNearbySessions: (latitude: number, longitude: number) => Promise<void>;
  fetchNearbyRunners: (latitude: number, longitude: number) => Promise<void>;
  sendLocationToServer: (location: Location) => Promise<void>;
}

export const useRunnerStore = create<RunnerState>((set, get) => ({
  // Initial state
  runningStatus: 'idle',
  currentLocation: null,
  routePoints: [],
  startTime: null,
  duration: 0,
  distance: 0,
  pace: null,
  currentSpeed: null,

  nearbyRunners: [],
  sosAlerts: [],

  activeSession: null,
  availableSessions: [],

  isLoading: false,
  error: null,

  // Actions
  startRun: () => {
    const { activeSession, currentLocation } = get();
    
    set({
      runningStatus: 'running',
      startTime: Date.now(),
      duration: 0,
      distance: 0,
      routePoints: currentLocation ? [currentLocation] : [],
      pace: null,
    });
    
    // Start tracking on backend
    sdk.location.startTracking(activeSession?.id).catch(console.error);
  },

  pauseRun: () => {
    set({ runningStatus: 'paused' });
  },

  resumeRun: () => {
    set({ runningStatus: 'running' });
  },

  endRun: () => {
    const { duration, distance, activeSession } = get();
    
    // Calculate final stats before resetting
    const avgPace = distance > 0 
      ? `${Math.floor((duration / 60) / (distance / 1000))}'${Math.floor(((duration / 60) / (distance / 1000)) % 1 * 60).toString().padStart(2, '0')}"`
      : null;

    // Stop tracking on backend
    sdk.location.stopTracking(activeSession?.id).catch(console.error);

    set({
      runningStatus: 'idle',
      pace: avgPace,
    });
  },

  updateLocation: (location) => {
    const { routePoints, runningStatus, currentLocation, activeSession } = get();
    
    // Calculate distance from last point
    let addedDistance = 0;
    if (currentLocation && runningStatus === 'running') {
      addedDistance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        location.latitude,
        location.longitude
      );
    }

    // Calculate current pace
    const speed = location.speed || 0;
    const currentPace = speed > 0
      ? `${Math.floor(1000 / speed / 60)}'${Math.floor((1000 / speed) % 60).toString().padStart(2, '0')}"`
      : null;

    set({
      currentLocation: location,
      currentSpeed: speed,
      pace: currentPace,
      distance: get().distance + addedDistance,
      routePoints: runningStatus === 'running'
        ? [...routePoints, location]
        : routePoints,
    });

    // Send to server if running
    if (runningStatus === 'running') {
      get().sendLocationToServer(location);
    }
  },

  updateDuration: (seconds) => {
    set({ duration: seconds });
  },

  setNearbyRunners: (runners) => {
    set({ nearbyRunners: runners });
  },

  addNearbyRunner: (runner) => {
    set((state) => ({
      nearbyRunners: [...state.nearbyRunners.filter(r => r.id !== runner.id), runner],
    }));
  },

  removeNearbyRunner: (id) => {
    set((state) => ({
      nearbyRunners: state.nearbyRunners.filter(r => r.id !== id),
    }));
  },

  updateRunnerLocation: (id, location) => {
    set((state) => ({
      nearbyRunners: state.nearbyRunners.map(r =>
        r.id === id ? { ...r, location } : r
      ),
    }));
  },

  addSOSAlert: (runner) => {
    set((state) => ({
      sosAlerts: [...state.sosAlerts.filter(r => r.id !== runner.id), { ...runner, status: 'sos' as const }],
    }));
  },

  removeSOSAlert: (id) => {
    set((state) => ({
      sosAlerts: state.sosAlerts.filter(r => r.id !== id),
    }));
  },

  setAvailableSessions: (sessions) => {
    set({ availableSessions: sessions });
  },

  reset: () => {
    set({
      runningStatus: 'idle',
      currentLocation: null,
      routePoints: [],
      startTime: null,
      duration: 0,
      distance: 0,
      pace: null,
      currentSpeed: null,
    });
  },

  // SDK actions
  createSession: async (data: { title: string; description?: string }) => {
    set({ isLoading: true, error: null });
    try {
      // Map title to name for backend compatibility
      const session = await sdk.sessions.createSession({
        name: data.title,
        description: data.description,
      });
      set({ activeSession: session, isLoading: false });
      
      // Join WebSocket room
      sdk.socket.joinSession(session.id);
      
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  joinSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sdk.sessions.joinSession(sessionId);
      set({ activeSession: session, isLoading: false });
      
      // Join WebSocket room
      sdk.socket.joinSession(session.id);
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join session';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  joinByInviteCode: async (inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sdk.sessions.joinByInviteCode(inviteCode);
      set({ activeSession: session, isLoading: false });
      
      // Join WebSocket room
      sdk.socket.joinSession(session.id);
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid invite code';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  leaveSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;
    
    try {
      await sdk.sessions.leaveSession(activeSession.id);
      sdk.socket.leaveSession(activeSession.id);
    } catch {
      // Continue anyway
    }
    
    set({ activeSession: null });
  },

  startSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return false;
    
    set({ isLoading: true });
    try {
      const session = await sdk.sessions.startSession(activeSession.id);
      set({ activeSession: session, isLoading: false });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  endSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return false;
    
    set({ isLoading: true });
    try {
      const session = await sdk.sessions.endSession(activeSession.id);
      sdk.socket.leaveSession(activeSession.id);
      set({ activeSession: session, isLoading: false });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  fetchNearbySessions: async (latitude, longitude) => {
    try {
      const response = await sdk.sessions.getNearbySessions(latitude, longitude);
      const sessions: RunSession[] = response.sessions.map(s => ({
        id: s.id,
        name: s.title,
        creatorId: s.hostId,
        creatorName: s.participants.find(p => p.userId === s.hostId)?.displayName || 'Unknown',
        participants: s.participantCount,
        status: s.status.toLowerCase() as 'active' | 'scheduled' | 'completed',
      }));
      set({ availableSessions: sessions });
    } catch {
      // Ignore errors
    }
  },

  fetchNearbyRunners: async (latitude, longitude) => {
    try {
      const response = await sdk.nearby.getNearbyRunners(latitude, longitude, 1000);
      const runners: NearbyRunner[] = response.runners.map(r => ({
        id: r.userId,
        name: r.displayName,
        avatarUrl: r.avatarUrl || undefined,
        location: {
          latitude: 0,
          longitude: 0,
          timestamp: Date.now(),
        },
        status: r.status === 'sos_active' ? 'sos' : r.status === 'moving' ? 'running' : 'idle',
        distance: `${(r.distance / 1000).toFixed(1)}km`,
        sessionId: r.sessionId || undefined,
      }));
      set({ nearbyRunners: runners });
    } catch {
      // Ignore errors
    }
  },

  sendLocationToServer: async (location) => {
    const { activeSession } = get();
    
    const update: LocationUpdate = {
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude,
      speed: location.speed,
      heading: location.heading,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
    };
    
    // Send via WebSocket for real-time
    sdk.socket.sendLocationUpdate(update);
    
    // Also send via REST for persistence
    try {
      await sdk.location.updateLocation(update);
    } catch {
      // WebSocket should have it
    }
  },
}));

export default useRunnerStore;
