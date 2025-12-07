import { create } from 'zustand';

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

interface Session {
  id: string;
  name: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  participants: Participant[];
  startedAt?: Date;
}

interface RunState {
  activeSession: Session | null;
  currentLocation: Location | null;
  isTracking: boolean;
  distance: number;
  duration: number;
  pace: number;
  
  setActiveSession: (session: Session | null) => void;
  setCurrentLocation: (location: Location) => void;
  setIsTracking: (tracking: boolean) => void;
  updateStats: (stats: { distance?: number; duration?: number; pace?: number }) => void;
  updateParticipantLocation: (userId: string, location: Location) => void;
  resetRun: () => void;
}

export const useRunStore = create<RunState>((set) => ({
  activeSession: null,
  currentLocation: null,
  isTracking: false,
  distance: 0,
  duration: 0,
  pace: 0,

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
    
    const participants = state.activeSession.participants.map((p) =>
      p.userId === userId ? { ...p, location } : p
    );
    
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
}));

