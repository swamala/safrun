import { create } from 'zustand';

interface SOSAlert {
  id: string;
  userId: string;
  triggerType: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_ALARM' | 'ESCALATED';
  escalationLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  location: {
    latitude: number;
    longitude: number;
    isApproximate: boolean;
  };
  triggeredAt: Date;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  responders?: Array<{
    id: string;
    responderId: string;
    displayName: string;
    status: string;
    distance?: number;
  }>;
}

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
  
  setActiveAlert: (alert: SOSAlert | null) => void;
  setNearbyAlerts: (alerts: NearbyAlert[]) => void;
  showVerificationModal: (show: boolean) => void;
  setVerificationCountdown: (seconds: number) => void;
  addResponder: (responderId: string, displayName: string, distance?: number) => void;
  updateResponderStatus: (responderId: string, status: string) => void;
  clearSOS: () => void;
}

export const useSOSStore = create<SOSState>((set) => ({
  activeAlert: null,
  nearbyAlerts: [],
  showVerification: false,
  verificationCountdown: 10,

  setActiveAlert: (activeAlert) => set({ activeAlert }),
  
  setNearbyAlerts: (nearbyAlerts) => set({ nearbyAlerts }),
  
  showVerificationModal: (showVerification) => set({ showVerification }),
  
  setVerificationCountdown: (verificationCountdown) => set({ verificationCountdown }),
  
  addResponder: (responderId, displayName, distance) => set((state) => {
    if (!state.activeAlert) return state;
    
    const responders = [
      ...(state.activeAlert.responders || []),
      { id: responderId, responderId, displayName, status: 'NOTIFIED', distance },
    ];
    
    return {
      activeAlert: { ...state.activeAlert, responders },
    };
  }),
  
  updateResponderStatus: (responderId, status) => set((state) => {
    if (!state.activeAlert?.responders) return state;
    
    const responders = state.activeAlert.responders.map((r) =>
      r.responderId === responderId ? { ...r, status } : r
    );
    
    return {
      activeAlert: { ...state.activeAlert, responders },
    };
  }),
  
  clearSOS: () => set({
    activeAlert: null,
    showVerification: false,
    verificationCountdown: 10,
  }),
}));

