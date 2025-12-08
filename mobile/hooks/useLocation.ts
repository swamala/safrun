/**
 * SAFRUN Location Hook
 * Handle location permissions and tracking with SDK integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { sdk } from '@/lib/sdk';
import { useRunnerStore } from '@/lib/store/useRunnerStore';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  updateInterval?: number;
  autoStart?: boolean;
  sendToServer?: boolean;
}

export function useLocation(options: UseLocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    updateInterval = 5000,
    autoStart = false,
    sendToServer = false,
  } = options;

  const { updateLocation: updateStoreLocation, activeSession } = useRunnerStore();
  
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Request permissions
  const requestPermission = useCallback(async () => {
    try {
      const { status: foreground } = await Location.requestForegroundPermissionsAsync();
      
      if (foreground !== 'granted') {
        setHasPermission(false);
        setError('Location permission denied');
        return false;
      }

      // Try to get background permission for tracking during runs
      try {
        await Location.requestBackgroundPermissionsAsync();
      } catch {
        // Background permission is optional
      }
      
      setHasPermission(true);
      return true;
    } catch (err) {
      setError('Failed to request location permission');
      setHasPermission(false);
      return false;
    }
  }, []);

  // Get current location once
  const getCurrentLocation = useCallback(async () => {
    try {
      const permitted = await requestPermission();
      if (!permitted) return null;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: enableHighAccuracy
          ? Location.Accuracy.BestForNavigation
          : Location.Accuracy.Balanced,
      });

      const locationData: LocationState = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        altitude: loc.coords.altitude,
        speed: loc.coords.speed,
        heading: loc.coords.heading,
        timestamp: loc.timestamp,
      };

      setLocation(locationData);
      return locationData;
    } catch (err) {
      setError('Failed to get location');
      return null;
    }
  }, [enableHighAccuracy, requestPermission]);

  // Handle location update
  const handleLocationUpdate = useCallback((loc: Location.LocationObject) => {
    const locationData: LocationState = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      altitude: loc.coords.altitude,
      speed: loc.coords.speed,
      heading: loc.coords.heading,
      timestamp: loc.timestamp,
    };

    setLocation(locationData);
    
    // Update store
    updateStoreLocation(locationData);

    // Send to server if enabled
    if (sendToServer) {
      // Send via WebSocket for real-time
      sdk.socket.sendLocationUpdate({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        altitude: locationData.altitude || undefined,
        speed: locationData.speed || undefined,
        heading: locationData.heading || undefined,
        accuracy: locationData.accuracy || undefined,
        timestamp: locationData.timestamp,
      });
    }
  }, [sendToServer, updateStoreLocation]);

  // Start tracking
  const startTracking = useCallback(async () => {
    const permitted = await requestPermission();
    if (!permitted) return;

    // Clean up any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
    }

    setIsTracking(true);

    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: enableHighAccuracy
          ? Location.Accuracy.BestForNavigation
          : Location.Accuracy.Balanced,
        timeInterval: updateInterval,
        distanceInterval: 5, // meters
      },
      handleLocationUpdate
    );

    // Notify server that tracking started
    if (sendToServer) {
      sdk.location.startTracking(activeSession?.id).catch(console.error);
    }
  }, [requestPermission, enableHighAccuracy, updateInterval, handleLocationUpdate, sendToServer, activeSession?.id]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);

    // Notify server that tracking stopped
    if (sendToServer) {
      sdk.location.stopTracking(activeSession?.id).catch(console.error);
    }
  }, [sendToServer, activeSession?.id]);

  // Send heartbeat
  const sendHeartbeat = useCallback(async (batteryLevel?: number) => {
    try {
      const response = await sdk.location.sendHeartbeat({
        batteryLevel,
        timestamp: Date.now(),
        sessionId: activeSession?.id,
      });
      return response;
    } catch {
      return null;
    }
  }, [activeSession?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }
  }, [autoStart, startTracking]);

  return {
    location,
    error,
    isTracking,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
    sendHeartbeat,
  };
}

export default useLocation;
