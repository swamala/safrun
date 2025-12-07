'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';
import { useRunStore } from '@/stores/run.store';
import { useSOSStore } from '@/stores/sos.store';
import toast from 'react-hot-toast';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/events';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { updateParticipantLocation, activeSession } = useRunStore();
  const { setActiveAlert, showVerificationModal, setNearbyAlerts } = useSOSStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    socketRef.current = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Location broadcasts from session participants
    socketRef.current.on('location:broadcast', (data) => {
      updateParticipantLocation(data.userId, {
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        timestamp: data.timestamp,
      });
    });

    // Session events
    socketRef.current.on('session:participant-joined', (data) => {
      toast.success(`${data.displayName || 'A runner'} joined the session`);
    });

    socketRef.current.on('session:participant-left', (data) => {
      toast(`${data.displayName || 'A runner'} left the session`);
    });

    socketRef.current.on('session:update', (data) => {
      console.log('Session update:', data);
    });

    // SOS events
    socketRef.current.on('sos:verify', (data) => {
      showVerificationModal(true);
      setActiveAlert(data);
    });

    socketRef.current.on('sos:alert', (data) => {
      toast.error(`🆘 SOS Alert: ${data.userName || 'A runner'} needs help nearby!`, {
        duration: 10000,
      });
      setNearbyAlerts((prev: unknown) => [...(prev as unknown[]), data]);
    });

    socketRef.current.on('sos:update', (data) => {
      if (data.type === 'SOS_RESPONDER_ACCEPTED') {
        toast.success(`${data.responderName} is coming to help!`);
      } else if (data.type === 'SOS_RESPONDER_ARRIVED') {
        toast.success(`${data.responderName} has arrived!`);
      } else if (data.type === 'SOS_RESOLVED') {
        toast.success('SOS alert has been resolved');
      }
    });

    socketRef.current.on('sos:guardian-alert', (data) => {
      toast.error(`🆘 Emergency: ${data.userName} triggered an SOS!`, {
        duration: 15000,
      });
    });

    socketRef.current.on('sos:precise-location', (data) => {
      toast.success('Precise location received');
      console.log('Precise location:', data.location);
    });
  }, [updateParticipantLocation, showVerificationModal, setActiveAlert, setNearbyAlerts]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinSession = useCallback((sessionId: string) => {
    emit('session:join', { sessionId });
  }, [emit]);

  const leaveSession = useCallback((sessionId: string) => {
    emit('session:leave', { sessionId });
  }, [emit]);

  const updateLocation = useCallback((
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number,
    sessionId?: string
  ) => {
    emit('location:update', { latitude, longitude, speed, heading, sessionId });
  }, [emit]);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  // Auto-join session when active
  useEffect(() => {
    if (activeSession?.id) {
      joinSession(activeSession.id);
    }
  }, [activeSession?.id, joinSession]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    joinSession,
    leaveSession,
    updateLocation,
  };
}

