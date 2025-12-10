/**
 * SAFRUN Nearby Runners Screen
 * Discover runners near you and join their sessions
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { textStyles } from '@/theme/typography';
import { NearbyRunnersMap } from '@/components/map';
import { LoadingOverlay } from '@/components/ui';
import { sdk } from '@/lib/sdk';
import { useRunnerStore } from '@/lib/store';
import type { NearbyRunner } from '@safrun/sdk';
import type { RunnerLocation } from '@/components/map/types';

export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { joinSession } = useRunnerStore();
  
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyRunners, setNearbyRunners] = useState<RunnerLocation[]>([]);
  const [radius, setRadius] = useState(1000);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get location permission and current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby runners');
        router.back();
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Fetch nearby runners
  const fetchNearbyRunners = useCallback(async () => {
    if (!currentLocation) return;
    
    try {
      const response = await sdk.nearby.getNearbyRunners(
        currentLocation.latitude,
        currentLocation.longitude,
        radius,
        50
      );
      
      // Convert to map format with actual runner locations
      // Note: NearbyRunner doesn't expose exact location for privacy - simulate based on distance
      const mapped: RunnerLocation[] = response.runners.map((r, index) => {
        // Calculate approximate lat/lng offset based on distance and index
        const angleOffset = (index * (360 / response.runners.length)) * (Math.PI / 180);
        const distanceKm = r.distance / 1000;
        const latOffset = distanceKm * Math.cos(angleOffset) / 111.32; // 1 degree lat ≈ 111.32 km
        const lngOffset = distanceKm * Math.sin(angleOffset) / (111.32 * Math.cos(currentLocation.latitude * Math.PI / 180));
        
        return {
          userId: r.userId,
          displayName: r.displayName,
          avatarUrl: r.avatarUrl || undefined,
          latitude: currentLocation.latitude + latOffset,
          longitude: currentLocation.longitude + lngOffset,
          distance: r.distance,
          status: (r.status === 'sos_active' ? 'sos' :
                 r.status === 'moving' || r.status === 'in_session' ? 'running' :
                 r.status === 'paused' ? 'paused' : 'idle') as 'running' | 'paused' | 'idle' | 'sos' | 'ahead' | 'behind',
        };
      });
      
      setNearbyRunners(mapped);
      setError(null);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to fetch nearby runners:', error);
      }
      setError('Failed to load nearby runners');
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation, radius]);

  useEffect(() => {
    if (currentLocation) {
      fetchNearbyRunners();
      
      // Subscribe to nearby updates
      sdk.socket.subscribeToNearby(currentLocation.latitude, currentLocation.longitude, radius);
      
      const unsubscribe = sdk.socket.on('nearby:update', (data) => {
        const mapped: RunnerLocation[] = data.runners.map((r: any) => ({
          userId: r.userId,
          displayName: r.displayName,
          avatarUrl: r.avatarUrl || undefined,
          latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.01,
          longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.01,
          distance: r.distance,
          status: (r.status === 'sos_active' ? 'sos' :
                 r.status === 'moving' || r.status === 'in_session' ? 'running' :
                 r.status === 'paused' ? 'paused' : 'idle') as 'running' | 'paused' | 'idle' | 'sos' | 'ahead' | 'behind',
        }));
        setNearbyRunners(mapped);
      });
      
      return () => unsubscribe();
    }
  }, [currentLocation, radius, fetchNearbyRunners]);

  // Handle runner press
  const handleRunnerPress = (runner: RunnerLocation) => {
    if (runner.status === 'sos') {
      Alert.alert(
        'SOS Alert',
        `${runner.displayName} has an active SOS alert. Would you like to respond?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Respond', onPress: () => {/* Navigate to responder */} },
        ]
      );
    }
  };

  // Handle join session
  const handleJoinSession = async (sessionId: string) => {
    const success = await joinSession(sessionId);
    if (success) {
      router.push(`/(tabs)/sessions/${sessionId}` as any);
    } else {
      Alert.alert('Error', 'Failed to join session');
    }
  };

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    setIsLoading(true);
  };

  if (!currentLocation) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text.muted }]}>
          Getting your location...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LoadingOverlay visible={isLoading && !error} message="Finding nearby runners..." />
      <NearbyRunnersMap
        runners={nearbyRunners}
        currentUserLocation={currentLocation}
        radius={radius}
        onRunnerPress={handleRunnerPress}
        onJoinSession={handleJoinSession}
        onRadiusChange={handleRadiusChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...textStyles.body,
  },
});

