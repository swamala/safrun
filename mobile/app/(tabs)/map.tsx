/**
 * SAFRUN Live Map Screen
 * Real-time map with runner locations and session tracking
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, Badge } from '@/components';
import { LiveSessionMap, MapControls } from '@/components/map';
import { DeadManTimer } from '@/components/DeadManTimer';
import { StatsBar } from '@/components/ui/StatsBar';
import { useRunnerStore, useSOSStore, useAuthStore } from '@/lib/store';
import { sdk } from '@/lib/sdk';
import {
  PlayIcon,
  PauseIcon,
  UsersIcon,
  AlertTriangleIcon,
  StopIcon,
  FootprintsIcon,
  ClockIcon,
} from '@/components';
import type { RunnerLocation, RoutePoint } from '@/components/map/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { 
    runningStatus, 
    currentLocation, 
    routePoints,
    duration, 
    distance, 
    pace,
    activeSession,
    startRun,
    pauseRun,
    resumeRun,
    endRun,
    updateLocation,
    updateDuration,
  } = useRunnerStore();
  
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [participants, setParticipants] = useState<RunnerLocation[]>([]);
  const [sessionRoutes, setSessionRoutes] = useState<{ oderId: string; points: RoutePoint[]; color: string }[]>([]);
  const [deadManEnabled, setDeadManEnabled] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationWatcher = useRef<Location.LocationSubscription | null>(null);
  const mapRef = useRef<any>(null);

  // Request location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        // Get initial location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        updateLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude || undefined,
          speed: location.coords.speed || undefined,
          heading: location.coords.heading || undefined,
          accuracy: location.coords.accuracy || undefined,
          timestamp: location.timestamp,
        });
      }
    })();
  }, []);

  // Start location tracking when running
  useEffect(() => {
    if (runningStatus === 'running' && locationPermission) {
      // Start watching location
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (location) => {
          updateLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || undefined,
            speed: location.coords.speed || undefined,
            heading: location.coords.heading || undefined,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          });
        }
      ).then((watcher) => {
        locationWatcher.current = watcher;
      });

      // Start duration timer
      durationInterval.current = setInterval(() => {
        updateDuration(duration + 1);
      }, 1000);
    } else {
      // Stop watching
      if (locationWatcher.current) {
        locationWatcher.current.remove();
        locationWatcher.current = null;
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }

    return () => {
      if (locationWatcher.current) {
        locationWatcher.current.remove();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [runningStatus, locationPermission]);

  // Subscribe to session updates via WebSocket
  useEffect(() => {
    if (activeSession) {
      // Subscribe to location broadcasts
      const unsubscribe = sdk.socket.on('location:broadcast', (data) => {
        if (data.userId !== user?.id) {
          setParticipants((prev) => {
            const existing = prev.find((p) => p.userId === data.userId);
            if (existing) {
              return prev.map((p) =>
                p.userId === data.userId
                  ? {
                      ...p,
                      latitude: data.latitude,
                      longitude: data.longitude,
                      speed: data.speed,
                      heading: data.heading,
                    }
                  : p
              );
            }
            return [
              ...prev,
              {
                userId: data.userId,
                displayName: 'Runner',
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed,
                heading: data.heading,
                status: 'running',
              },
            ];
          });
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [activeSession, user?.id]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  // Handle start run
  const handleStartRun = () => {
    if (!locationPermission) {
      Alert.alert('Location Required', 'Please enable location services to start running.');
      return;
    }
    startRun();
  };

  // Handle end run
  const handleEndRun = () => {
    Alert.alert(
      'End Run?',
      'Are you sure you want to end this run?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Run',
          style: 'destructive',
          onPress: () => endRun(),
        },
      ]
    );
  };

  // Convert route points for map
  const myRoute = routePoints.length > 0
    ? [{
        oderId: user?.id || 'me',
        userId: user?.id || 'me',
        points: routePoints.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
          timestamp: p.timestamp,
          speed: p.speed,
        })),
        color: colors.safrun[500],
      }]
    : [];

  // Current user as participant
  const currentUserParticipant: RunnerLocation | null = currentLocation
    ? {
        userId: user?.id || 'me',
        displayName: user?.displayName || 'You',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        speed: currentLocation.speed,
        heading: currentLocation.heading,
        status: runningStatus === 'running' ? 'running' : runningStatus === 'paused' ? 'paused' : 'idle',
        isCurrentUser: true,
      }
    : null;

  const allParticipants = currentUserParticipant
    ? [currentUserParticipant, ...participants]
    : participants;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Map */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <LiveSessionMap
            participants={allParticipants}
            routes={[...myRoute, ...sessionRoutes]}
            currentUserLocation={currentLocation}
            currentUserId={user?.id}
            sessionName={activeSession?.title}
            showControls
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          />
        ) : (
          <View style={[styles.loadingContainer, { backgroundColor: isDark ? colors.navy[800] : colors.navy[100] }]}>
            <Text style={[styles.loadingText, { color: theme.text.muted }]}>
              {locationPermission === false
                ? 'Location permission denied'
                : 'Getting your location...'}
            </Text>
          </View>
        )}

        {/* SOS Button */}
        <TouchableOpacity
          style={[styles.sosButton, shadows.glowRed]}
          onPress={() => router.push('/sos')}
          activeOpacity={0.8}
        >
          <AlertTriangleIcon size={28} color={colors.white} />
        </TouchableOpacity>

        {/* Map Controls */}
        <MapControls
          onRecenter={() => {
            if (currentLocation && mapRef.current?.animateToRegion) {
              mapRef.current.animateToRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }, 500);
            }
          }}
          compassHeading={compassHeading}
          locationAccuracy={currentLocation?.accuracy}
          showCompass={runningStatus !== 'idle'}
        />
      </View>

      {/* Dead Man Timer */}
      <DeadManTimer
        isEnabled={deadManEnabled && runningStatus === 'running'}
        checkInterval={15}
        responseWindow={60}
        onSOSTriggered={() => {
          Alert.alert('SOS Triggered', 'Emergency services have been notified');
        }}
        onDisable={() => setDeadManEnabled(false)}
      />

      {/* Bottom Panel */}
      <View
        style={[
          styles.bottomPanel,
          {
            backgroundColor: isDark ? colors.background.dark : colors.white,
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
            paddingBottom: insets.bottom + spacing.sm,
          },
        ]}
      >
        {runningStatus !== 'idle' ? (
          // Running Stats
          <View style={styles.runningStats}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <ClockIcon size={18} color={theme.text.muted} />
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  {formatDuration(duration)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Duration</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxMain]}>
                <FootprintsIcon size={18} color={colors.safrun[500]} />
                <Text style={[styles.statValueLarge, { color: theme.text.primary }]}>
                  {formatDistance(distance)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Distance</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.paceIcon, { color: theme.text.muted }]}>⚡</Text>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  {pace || '--:--'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Pace</Text>
              </View>
            </View>

            <View style={styles.runningActions}>
              {runningStatus === 'running' ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[100] },
                    ]}
                    onPress={pauseRun}
                  >
                    <PauseIcon size={24} color={theme.text.primary} />
                  </TouchableOpacity>
                  <Button
                    variant="danger"
                    size="lg"
                    leftIcon={<StopIcon size={20} color={colors.white} />}
                    onPress={handleEndRun}
                    style={{ flex: 1, marginLeft: spacing.md }}
                  >
                    Stop Run
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    leftIcon={<PlayIcon size={20} color={colors.white} />}
                    onPress={resumeRun}
                    style={{ flex: 1 }}
                  >
                    Resume
                  </Button>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      { backgroundColor: colors.danger[500], marginLeft: spacing.md },
                    ]}
                    onPress={handleEndRun}
                  >
                    <StopIcon size={24} color={colors.white} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ) : (
          // Start Run
          <View style={styles.startSection}>
            <View style={styles.startInfo}>
              <Text style={[styles.startTitle, { color: theme.text.primary }]}>
                Ready to run?
              </Text>
              <Text style={[styles.startSubtitle, { color: theme.text.secondary }]}>
                {activeSession
                  ? `You're in "${activeSession.title}" with ${activeSession.participantCount} runners`
                  : 'Your location will be shared during the run'}
              </Text>
            </View>

            <Button
              size="lg"
              fullWidth
              leftIcon={<PlayIcon size={20} color={colors.white} />}
              onPress={handleStartRun}
            >
              Start Running
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...textStyles.body,
  },
  sosButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.xl + 60,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.danger[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPanel: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  runningStats: {},
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxMain: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.navy[200],
    paddingHorizontal: spacing.md,
  },
  statValue: {
    ...textStyles.h4,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  statValueLarge: {
    ...textStyles.h2,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    marginTop: 2,
  },
  paceIcon: {
    fontSize: 18,
  },
  runningActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startSection: {},
  startInfo: {
    marginBottom: spacing.lg,
  },
  startTitle: {
    ...textStyles.h4,
    marginBottom: spacing.xs,
  },
  startSubtitle: {
    ...textStyles.body,
  },
});
