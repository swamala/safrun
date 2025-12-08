import { create } from 'zustand';
import { sdk } from '@/lib/sdk';
import type { Session, SessionParticipant, LocationUpdate } from '@safrun/sdk';

interface Location {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
}

interface Participant {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  location?: Location;
  distance?: number;
  duration?: number;
}

interface RunState {
  activeSession: Session | null;
  currentLocation: Location | null;
  isTracking: boolean;
  distance: number;
  duration: number;
  pace: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setActiveSession: (session: Session | null) => void;
  setCurrentLocation: (location: Location) => void;
  setIsTracking: (tracking: boolean) => void;
  updateStats: (stats: { distance?: number; duration?: number; pace?: number }) => void;
  updateParticipantLocation: (userId: string, location: Location) => void;
  resetRun: () => void;
  
  // SDK actions
  createSession: (data: { title: string; description?: string; maxParticipants?: number; isPrivate?: boolean }) => Promise<Session | null>;
  joinSession: (sessionId: string) => Promise<boolean>;
  joinByInviteCode: (inviteCode: string) => Promise<Session | null>;
  leaveSession: (sessionId: string) => Promise<boolean>;
  startSession: (sessionId: string) => Promise<boolean>;
  endSession: (sessionId: string) => Promise<boolean>;
  fetchActiveSession: () => Promise<void>;
  fetchMySessions: () => Promise<Session[]>;
  sendLocationUpdate: (location: LocationUpdate) => Promise<void>;
}

export const useRunStore = create<RunState>((set, get) => ({
  activeSession: null,
  currentLocation: null,
  isTracking: false,
  distance: 0,
  duration: 0,
  pace: 0,
  isLoading: false,
  error: null,

  setActiveSession: (session) => set({ activeSession: session }),
  
  setCurrentLocation: (location) => set({ currentLocation: location }),
  
  setIsTracking: (isTracking) => set({ isTracking }),
  
  updateStats: (stats) => set((state) => ({
    distance: stats.distance ?? state.distance,
    duration: stats.duration ?? state.duration,
    pace: stats.pace ?? state.pace,
  })),
  
  updateParticipantLocation: (userId, location) => set((state) => {
    if (!state.activeSession) return state;
    
    const participants = state.activeSession.participants.map((p) => {
      if (p.userId === userId) {
        return {
          ...p,
          lastLatitude: location.latitude,
          lastLongitude: location.longitude,
        };
      }
      return p;
    });
    
    return {
      activeSession: { ...state.activeSession, participants },
    };
  }),
  
  resetRun: () => set({
    activeSession: null,
    isTracking: false,
    distance: 0,
    duration: 0,
    pace: 0,
  }),

  // SDK-based actions
  createSession: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sdk.sessions.createSession(data);
      set({ activeSession: session, isLoading: false });
      return session;
    } catch (err: unknown) {
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
      sdk.socket.joinSession(sessionId);
      
      return true;
    } catch (err: unknown) {
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
      
      return session;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join session';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  leaveSession: async (sessionId) => {
    try {
      await sdk.sessions.leaveSession(sessionId);
      
      // Leave WebSocket room
      sdk.socket.leaveSession(sessionId);
      
      set({ activeSession: null });
      return true;
    } catch {
      return false;
    }
  },

  startSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sdk.sessions.startSession(sessionId);
      set({ activeSession: session, isTracking: true, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  endSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sdk.sessions.endSession(sessionId);
      
      // Leave WebSocket room
      sdk.socket.leaveSession(sessionId);
      
      set({ activeSession: session, isTracking: false, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  fetchActiveSession: async () => {
    try {
      const response = await sdk.sessions.getMySessions('ACTIVE', 1);
      const activeSession = response.sessions[0] || null;
      set({ activeSession });
      
      // Join WebSocket room if active
      if (activeSession) {
        sdk.socket.joinSession(activeSession.id);
      }
    } catch {
      set({ activeSession: null });
    }
  },

  fetchMySessions: async () => {
    try {
      const response = await sdk.sessions.getMySessions();
      return response.sessions;
    } catch {
      return [];
    }
  },

  sendLocationUpdate: async (location) => {
    const { activeSession } = get();
    
    // Send via REST
    await sdk.location.updateLocation(location);
    
    // Also send via WebSocket for real-time updates
    if (activeSession) {
      sdk.socket.sendLocationUpdate({
        ...location,
        sessionId: activeSession.id,
      } as LocationUpdate);
    }
    
    // Update local state
    set({
      currentLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
        accuracy: location.accuracy,
        timestamp: location.timestamp || Date.now(),
      },
    });
  },
}));
