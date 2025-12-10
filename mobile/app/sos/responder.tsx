/**
 * SAFRUN Responder Mode Screen
 * Shows route to SOS incident with navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { ResponderMap } from '@/components/map';
import { sdk } from '@/lib/sdk';
import { useAuthStore, useSOSStore } from '@/lib/store';
import type { SOSAlert } from '@safrun/sdk';
import type { ResponderInfo } from '@/components/map/types';

export default function ResponderScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { respondToSOS } = useSOSStore();
  
  const [alert, setAlert] = useState<SOSAlert | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isEnRoute, setIsEnRoute] = useState(false);
  const [responders, setResponders] = useState<ResponderInfo[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch alert details
  const fetchAlert = useCallback(async () => {
    if (!alertId) return;
    try {
      const data = await sdk.sos.getAlert(alertId);
      setAlert(data);
      
      // Convert responders
      if (data.responders) {
        const mapped: ResponderInfo[] = data.responders
          .filter(r => r.responderId !== user?.id && r.lastLatitude && r.lastLongitude)
          .map(r => ({
            id: r.id,
            displayName: r.displayName,
            avatarUrl: r.avatarUrl || undefined,
            latitude: r.lastLatitude!,
            longitude: r.lastLongitude!,
            status: r.status === 'ARRIVED' ? 'arrived' :
                   r.status === 'EN_ROUTE' ? 'en_route' :
                   r.status === 'ACCEPTED' ? 'accepted' : 'notified',
            eta: r.estimatedETA || undefined,
            distance: r.distance || undefined,
          }));
        setResponders(mapped);
      }
      
      // Check if current user has accepted
      const myResponse = data.responders?.find(r => r.responderId === user?.id);
      if (myResponse && (myResponse.status === 'ACCEPTED' || myResponse.status === 'EN_ROUTE')) {
        setIsEnRoute(true);
      }
    } catch (error) {
      console.error('Failed to fetch alert:', error);
      Alert.alert('Error', 'Failed to load alert details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [alertId, user?.id]);

  // Get current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Fetch alert on mount
  useEffect(() => {
    fetchAlert();
    
    // Subscribe to SOS updates
    const unsubscribe = sdk.socket.on('sos:update', (data) => {
      if (data.alertId === alertId) {
        fetchAlert();
      }
    });

    return () => unsubscribe();
  }, [alertId, fetchAlert]);

  // Send location updates while en route
  useEffect(() => {
    let locationWatcher: Location.LocationSubscription | null = null;
    
    if (isEnRoute && alertId) {
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          // Update server with our location
          try {
            await sdk.sos.updateResponderLocation({
              alertId,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          } catch (error) {
            console.error('Failed to update responder location:', error);
          }
        }
      ).then(watcher => {
        locationWatcher = watcher;
      });
    }

    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, [isEnRoute, alertId]);

  // Handle accept response
  const handleAccept = async () => {
    if (!alertId || !currentLocation) return;
    
    const success = await respondToSOS(alertId, true);
    if (success) {
      setIsEnRoute(true);
      // Generate simple route (in production, use a routing API)
      if (alert) {
        setRouteCoordinates([
          currentLocation,
          { latitude: alert.location.latitude, longitude: alert.location.longitude },
        ]);
      }
    } else {
      Alert.alert('Error', 'Failed to accept alert');
    }
  };

  // Handle decline
  const handleDecline = async () => {
    if (!alertId) return;
    await respondToSOS(alertId, false);
    router.back();
  };

  // Handle navigate (open in maps app)
  const handleNavigate = () => {
    if (!alert) return;
    
    const { latitude, longitude } = alert.location;
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?daddr=${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}?q=${latitude},${longitude}`,
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };

  // Handle call
  const handleCall = () => {
    // In a real app, you'd have the victim's phone or emergency services
    Linking.openURL('tel:911');
  };

  // Handle arrived
  const handleArrived = async () => {
    if (!alertId) return;
    
    try {
      await sdk.sos.markArrived(alertId);
      Alert.alert('Thank you!', 'You have been marked as arrived. Stay with the person until help arrives.', [
        { text: 'OK', onPress: () => fetchAlert() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as arrived');
    }
  };

  if (isLoading || !alert || !currentLocation) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text.muted }]}>
          Loading alert details...
        </Text>
      </View>
    );
  }

  // Calculate distance
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    alert.location.latitude,
    alert.location.longitude
  );

  // Estimate ETA (rough estimate: 5min/km walking, 2min/km running)
  const etaSeconds = Math.round(distance * 3); // ~3 seconds per meter running

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ResponderMap
        sosLocation={{
          alertId: alert.id,
          userId: alert.userId,
          displayName: alert.user.displayName,
          latitude: alert.location.latitude,
          longitude: alert.location.longitude,
          isApproximate: alert.location.isApproximate,
          distance,
          triggeredAt: alert.triggeredAt,
        }}
        currentLocation={currentLocation}
        responders={responders}
        routeCoordinates={routeCoordinates}
        eta={etaSeconds}
        distance={distance}
        isEnRoute={isEnRoute}
        onNavigate={handleNavigate}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onArrived={handleArrived}
        onCall={handleCall}
      />
    </View>
  );
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
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

