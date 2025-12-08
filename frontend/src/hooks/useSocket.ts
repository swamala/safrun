'use client';

import { useEffect, useCallback } from 'react';
import { sdk } from '@/lib/sdk';
import { useAuthStore } from '@/stores/auth.store';
import { useRunStore } from '@/stores/run.store';
import { useSOSStore } from '@/stores/sos.store';
import toast from 'react-hot-toast';
import type { 
  WSLocationBroadcast, 
  WSSOSAlert, 
  WSSOSUpdate, 
  WSSOSVerify,
  WSNearbyUpdate,
  WSSessionParticipantEvent,
} from '@safrun/sdk';

export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  const { updateParticipantLocation, activeSession } = useRunStore();
  const { setActiveAlert, showVerificationModal, setNearbyAlerts } = useSOSStore();

  // Setup event listeners
  const setupListeners = useCallback(() => {
    // Location broadcasts from session participants
    const unsubLocation = sdk.socket.on('location:broadcast', (data: WSLocationBroadcast) => {
      updateParticipantLocation(data.userId, {
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        timestamp: data.timestamp,
      });
    });

    // Session events
    const unsubJoined = sdk.socket.on('session:participant-joined', (data: WSSessionParticipantEvent) => {
      toast.success(`A runner joined the session`);
    });

    const unsubLeft = sdk.socket.on('session:participant-left', (data: WSSessionParticipantEvent) => {
      toast(`A runner left the session`);
    });

    // SOS events
    const unsubSOSVerify = sdk.socket.on('sos:verify', (data: WSSOSVerify) => {
      showVerificationModal(true);
    });

    const unsubSOSAlert = sdk.socket.on('sos:alert', (data: WSSOSAlert) => {
      toast.error(`🆘 SOS Alert: ${data.userName || 'A runner'} needs help nearby!`, {
        duration: 10000,
      });
    });

    const unsubSOSBroadcast = sdk.socket.on('sos:broadcast', (data: WSSOSAlert) => {
      toast.error(`🆘 Emergency nearby! ${data.userName} needs help!`, {
        duration: 15000,
      });
    });

    const unsubSOSUpdate = sdk.socket.on('sos:update', (data: WSSOSUpdate) => {
      if (data.type === 'SOS_RESPONDER_ACCEPTED') {
        toast.success(`Help is on the way!`);
      } else if (data.type === 'SOS_RESPONDER_ARRIVED') {
        toast.success(`Help has arrived!`);
      } else if (data.type === 'SOS_RESOLVED') {
        toast.success('SOS alert has been resolved');
      }
    });

    const unsubGuardian = sdk.socket.on('sos:guardian-alert', (data) => {
      toast.error(`🆘 Emergency: ${data.userName} triggered an SOS!`, {
        duration: 15000,
      });
    });

    const unsubPrecise = sdk.socket.on('sos:precise-location', (data) => {
      toast.success('Precise location received');
      console.log('Precise location:', data.location);
    });

    // Nearby updates
    const unsubNearby = sdk.socket.on('nearby:update', (data: WSNearbyUpdate) => {
      // Update nearby alerts for SOS
      const sosAlerts = data.runners
        .filter((r) => r.status === 'sos_active')
        .map((r) => ({
          id: r.userId,
          userId: r.userId,
          displayName: r.displayName,
          location: { latitude: 0, longitude: 0 }, // Would need actual location
          distance: r.distance,
          triggeredAt: new Date(),
        }));
      
      if (sosAlerts.length > 0) {
        setNearbyAlerts(sosAlerts);
      }
    });

    // Return cleanup function
    return () => {
      unsubLocation();
      unsubJoined();
      unsubLeft();
      unsubSOSVerify();
      unsubSOSAlert();
      unsubSOSBroadcast();
      unsubSOSUpdate();
      unsubGuardian();
      unsubPrecise();
      unsubNearby();
    };
  }, [updateParticipantLocation, showVerificationModal, setNearbyAlerts]);

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      sdk.connectSocket();
      const cleanup = setupListeners();
      
      return () => {
        cleanup();
      };
    } else {
      sdk.disconnectSocket();
    }
  }, [isAuthenticated, setupListeners]);

  // Auto-join session when active
  useEffect(() => {
    if (activeSession?.id && sdk.isSocketConnected) {
      sdk.socket.joinSession(activeSession.id);
    }
  }, [activeSession?.id]);

  // Helper methods
  const joinSession = useCallback((sessionId: string) => {
    sdk.socket.joinSession(sessionId);
  }, []);

  const leaveSession = useCallback((sessionId: string) => {
    sdk.socket.leaveSession(sessionId);
  }, []);

  const updateLocation = useCallback((
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number,
    sessionId?: string
  ) => {
    sdk.socket.sendLocationUpdate({
      latitude,
      longitude,
      speed,
      heading,
      timestamp: Date.now(),
    });
  }, []);

  const subscribeToNearby = useCallback((latitude: number, longitude: number, radius?: number) => {
    sdk.socket.subscribeToNearby(latitude, longitude, radius);
  }, []);

  const triggerSOS = useCallback((latitude: number, longitude: number) => {
    sdk.socket.triggerSOS(latitude, longitude, 'MANUAL');
  }, []);

  const respondToSOS = useCallback((alertId: string, accepted: boolean, latitude?: number, longitude?: number) => {
    sdk.socket.respondToSOS(alertId, accepted, latitude, longitude);
  }, []);

  return {
    isConnected: sdk.isSocketConnected,
    connect: () => sdk.connectSocket(),
    disconnect: () => sdk.disconnectSocket(),
    joinSession,
    leaveSession,
    updateLocation,
    subscribeToNearby,
    triggerSOS,
    respondToSOS,
  };
}
