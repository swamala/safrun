/**
 * SAFRUN Socket Hook
 * WebSocket connection management using SDK
 */

import { useEffect, useCallback, useRef } from 'react';
import { sdk } from '@/lib/sdk';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRunnerStore } from '@/lib/store/useRunnerStore';
import { useSOSStore } from '@/lib/store/useSOSStore';
import { Alert } from 'react-native';
import type { 
  WSLocationBroadcast, 
  WSSOSAlert, 
  WSSOSUpdate,
  WSNearbyUpdate,
} from '@safrun/sdk';

export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  const { updateRunnerLocation, addSOSAlert, activeSession } = useRunnerStore();
  const { handleSOSUpdate, addResponder, updateResponderStatus } = useSOSStore();
  const cleanupRef = useRef<(() => void) | null>(null);

  const setupListeners = useCallback(() => {
    // Location broadcasts from session participants
    const unsubLocation = sdk.socket.on('location:broadcast', (data: WSLocationBroadcast) => {
      updateRunnerLocation(data.userId, {
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        timestamp: data.timestamp,
      });
    });

    // Session events
    const unsubJoined = sdk.socket.on('session:participant-joined', (data) => {
      // Could show a toast or update UI
      console.log('[Socket] Participant joined:', data.userId);
    });

    const unsubLeft = sdk.socket.on('session:participant-left', (data) => {
      console.log('[Socket] Participant left:', data.userId);
    });

    // SOS events
    const unsubSOSAlert = sdk.socket.on('sos:alert', (data: WSSOSAlert) => {
      // Show alert for nearby SOS
      Alert.alert(
        '🆘 SOS Alert',
        `${data.userName || 'Someone'} needs help ${data.distance ? `${(data.distance / 1000).toFixed(1)}km away` : 'nearby'}!`,
        [
          { text: 'Ignore', style: 'cancel' },
          { 
            text: 'Help',
            onPress: () => {
              // Navigate to respond screen or respond directly
              sdk.socket.respondToSOS(data.alertId, true);
            }
          },
        ]
      );
      
      // Add to SOS alerts
      addSOSAlert({
        id: data.alertId,
        name: data.userName,
        location: {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          timestamp: Date.now(),
        },
        status: 'sos',
        distance: data.distance ? `${(data.distance / 1000).toFixed(1)}km` : 'Nearby',
      });
    });

    const unsubSOSBroadcast = sdk.socket.on('sos:broadcast', (data: WSSOSAlert) => {
      Alert.alert(
        '🚨 Emergency',
        `${data.userName || 'A runner'} has triggered an SOS alert nearby!`,
        [{ text: 'OK' }]
      );
    });

    const unsubSOSUpdate = sdk.socket.on('sos:update', (data: WSSOSUpdate) => {
      handleSOSUpdate(data);
      
      // Show notifications for important updates
      if (data.type === 'SOS_RESPONDER_ACCEPTED') {
        Alert.alert('Help on the way!', 'Someone is coming to help.');
      } else if (data.type === 'SOS_RESPONDER_ARRIVED') {
        Alert.alert('Help arrived!', 'A responder has reached your location.');
      }
    });

    const unsubGuardian = sdk.socket.on('sos:guardian-alert', (data) => {
      Alert.alert(
        '🆘 Guardian Alert',
        `${data.userName} has triggered an emergency SOS!`,
        [{ text: 'OK' }]
      );
    });

    const unsubPrecise = sdk.socket.on('sos:precise-location', (data) => {
      console.log('[Socket] Precise location received:', data.location);
      // Update map with precise location
    });

    // Nearby updates
    const unsubNearby = sdk.socket.on('nearby:update', (data: WSNearbyUpdate) => {
      // Check for SOS alerts in nearby runners
      data.runners
        .filter(r => r.status === 'sos_active')
        .forEach(r => {
          addSOSAlert({
            id: r.userId,
            name: r.displayName,
            avatarUrl: r.avatarUrl || undefined,
            location: {
              latitude: 0,
              longitude: 0,
              timestamp: Date.now(),
            },
            status: 'sos',
            distance: `${(r.distance / 1000).toFixed(1)}km`,
          });
        });
    });

    // Connection events
    const unsubConnect = sdk.socket.on('connect', () => {
      console.log('[Socket] Connected');
      
      // Rejoin session if active
      if (activeSession) {
        sdk.socket.joinSession(activeSession.id);
      }
    });

    const unsubDisconnect = sdk.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    // Return cleanup function
    return () => {
      unsubLocation();
      unsubJoined();
      unsubLeft();
      unsubSOSAlert();
      unsubSOSBroadcast();
      unsubSOSUpdate();
      unsubGuardian();
      unsubPrecise();
      unsubNearby();
      unsubConnect();
      unsubDisconnect();
    };
  }, [updateRunnerLocation, addSOSAlert, handleSOSUpdate, activeSession]);

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      sdk.connectSocket();
      cleanupRef.current = setupListeners();
    }
    
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isAuthenticated, setupListeners]);

  // Auto-join session
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
    heading?: number
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

  const respondToSOS = useCallback((alertId: string, accepted: boolean) => {
    sdk.socket.respondToSOS(alertId, accepted);
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

export default useSocket;

