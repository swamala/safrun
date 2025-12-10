/**
 * SAFRUN Guardian Mode Screen
 * Live tracking view for guardians watching their contacts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, Badge, Header } from '@/components';
import { LoadingOverlay } from '@/components/ui';
import SafrunMap, { SafrunMapRef } from '@/components/map/SafrunMap';
import RunnerMarker from '@/components/map/RunnerMarker';
import { sdk } from '@/lib/sdk';
import {
  ArrowLeftIcon,
  ShieldIcon,
  AlertTriangleIcon,
  UsersIcon,
  MapPinIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  BellIcon,
} from '@/components/Icons';
import type { RunnerLocation } from '@/components/map/types';

interface GuardedRunner {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  status: 'active' | 'idle' | 'sos' | 'offline';
  batteryLevel?: number;
  lastUpdate?: Date;
}

export default function GuardianScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<SafrunMapRef>(null);
  
  const [guardedRunners, setGuardedRunners] = useState<GuardedRunner[]>([]);
  const [selectedRunner, setSelectedRunner] = useState<GuardedRunner | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sosAlerts, setSOSAlerts] = useState<string[]>([]); // Array of user IDs with active SOS

  // Fetch guarded runners (emergency contacts who listed current user as guardian)
  const fetchGuardedRunners = useCallback(async () => {
    try {
      // Fetch emergency contacts - these are people you're guarding
      const contacts = await sdk.profile.getEmergencyContacts();
      
      // Transform contacts to GuardedRunner format
      // In production, we'd also fetch their current location/status from a guardian API
      const runners: GuardedRunner[] = contacts.map(contact => ({
        userId: contact.id,
        displayName: contact.name,
        status: 'idle' as const, // Default status until we get real-time updates
        lastUpdate: new Date(),
      }));
      
      setGuardedRunners(runners);
      
      if (runners.length > 0) {
        setSelectedRunner(runners[0]);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to fetch guarded runners:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuardedRunners();
    
    // Subscribe to SOS guardian alerts
    const unsubscribe = sdk.socket.on('sos:guardian-alert', (data) => {
      setSOSAlerts(prev => [...prev, data.userId]);
      
      // Update runner status
      setGuardedRunners(prev => 
        prev.map(r => 
          r.userId === data.userId ? { ...r, status: 'sos' } : r
        )
      );
      
      // Show alert
      Alert.alert(
        '🆘 SOS Alert!',
        `${data.userName} has triggered an SOS alert!`,
        [
          { text: 'View on Map', onPress: () => selectRunner(data.userId) },
          { text: 'Respond', onPress: () => router.push(`/sos/responder?alertId=${data.alertId}` as any) },
        ]
      );
    });

    return () => unsubscribe();
  }, [fetchGuardedRunners]);

  // Subscribe to location updates for all guarded runners
  useEffect(() => {
    const unsubscribe = sdk.socket.on('location:broadcast', (data) => {
      setGuardedRunners(prev =>
        prev.map(r =>
          r.userId === data.userId
            ? {
                ...r,
                lastLocation: {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  timestamp: new Date(data.timestamp),
                },
                lastUpdate: new Date(),
                status: 'active',
              }
            : r
        )
      );
    });

    return () => unsubscribe();
  }, []);

  // Select a runner and center map
  const selectRunner = (userId: string) => {
    const runner = guardedRunners.find(r => r.userId === userId);
    if (runner && runner.lastLocation) {
      setSelectedRunner(runner);
      mapRef.current?.animateToRegion({
        latitude: runner.lastLocation.latitude,
        longitude: runner.lastLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  // Convert to map format
  const mapParticipants: RunnerLocation[] = guardedRunners
    .filter(r => r.lastLocation)
    .map(r => ({
      userId: r.userId,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      latitude: r.lastLocation!.latitude,
      longitude: r.lastLocation!.longitude,
      status: r.status === 'sos' ? 'sos' : r.status === 'active' ? 'running' : 'idle',
    }));

  // Get initial region
  const initialRegion = selectedRunner?.lastLocation
    ? {
        latitude: selectedRunner.lastLocation.latitude,
        longitude: selectedRunner.lastLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  // Format time ago
  const formatTimeAgo = (date?: Date) => {
    if (!date) return 'Unknown';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LoadingOverlay visible={isLoading} message="Loading guardians..." />
      {/* Map */}
      <View style={styles.mapContainer}>
        <SafrunMap
          ref={mapRef}
          initialRegion={initialRegion}
        >
          {mapParticipants.map(runner => (
            <RunnerMarker
              key={runner.userId}
              runner={runner}
              onPress={() => selectRunner(runner.userId)}
            />
          ))}
        </SafrunMap>

        {/* Header */}
        <View style={[styles.header, { top: insets.top + spacing.sm }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeftIcon size={24} color={colors.navy[700]} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <ShieldIcon size={20} color={colors.safety[500]} />
            <Text style={[styles.headerTitleText, { color: theme.text.primary }]}>
              Guardian Mode
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* SOS Alert Banner */}
        {sosAlerts.length > 0 && (
          <View style={styles.sosAlertBanner}>
            <AlertTriangleIcon size={20} color={colors.white} />
            <Text style={styles.sosAlertText}>
              {sosAlerts.length} Active SOS Alert{sosAlerts.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Panel */}
      <View style={[
        styles.bottomPanel,
        { paddingBottom: insets.bottom + spacing.md },
        isPanelExpanded && styles.bottomPanelExpanded,
      ]}>
        <TouchableOpacity
          style={styles.panelHandle}
          onPress={() => setIsPanelExpanded(!isPanelExpanded)}
        >
          {isPanelExpanded ? (
            <ChevronDownIcon size={24} color={colors.navy[400]} />
          ) : (
            <ChevronUpIcon size={24} color={colors.navy[400]} />
          )}
        </TouchableOpacity>

        <View style={styles.panelHeader}>
          <View style={styles.panelTitle}>
            <UsersIcon size={20} color={colors.safrun[500]} />
            <Text style={[styles.panelTitleText, { color: theme.text.primary }]}>
              Watching {guardedRunners.length} Runner{guardedRunners.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Selected Runner Info */}
        {selectedRunner && (
          <Card padding="md" style={styles.selectedRunnerCard}>
            <View style={styles.selectedRunnerHeader}>
              <View style={[
                styles.selectedRunnerAvatar,
                selectedRunner.status === 'sos' && { borderColor: colors.danger[500] },
              ]}>
                <Text style={styles.selectedRunnerInitial}>
                  {selectedRunner.displayName.charAt(0)}
                </Text>
              </View>
              <View style={styles.selectedRunnerInfo}>
                <Text style={[styles.selectedRunnerName, { color: theme.text.primary }]}>
                  {selectedRunner.displayName}
                </Text>
                <Text style={[styles.selectedRunnerMeta, { color: theme.text.secondary }]}>
                  Last update: {formatTimeAgo(selectedRunner.lastUpdate)}
                </Text>
              </View>
              <Badge
                variant={
                  selectedRunner.status === 'sos' ? 'danger' :
                  selectedRunner.status === 'active' ? 'success' : 'secondary'
                }
                dot={selectedRunner.status === 'active' || selectedRunner.status === 'sos'}
              >
                {selectedRunner.status === 'sos' ? 'SOS!' : selectedRunner.status}
              </Badge>
            </View>
            
            {selectedRunner.batteryLevel !== undefined && (
              <View style={styles.batteryRow}>
                <Text style={[styles.batteryLabel, { color: theme.text.secondary }]}>
                  Battery
                </Text>
                <View style={styles.batteryBar}>
                  <View style={[
                    styles.batteryFill,
                    {
                      width: `${selectedRunner.batteryLevel}%`,
                      backgroundColor: selectedRunner.batteryLevel < 20 ? colors.danger[500] :
                                       selectedRunner.batteryLevel < 50 ? colors.warning[500] :
                                       colors.safety[500],
                    },
                  ]} />
                </View>
                <Text style={[styles.batteryText, { color: theme.text.primary }]}>
                  {selectedRunner.batteryLevel}%
                </Text>
              </View>
            )}

            {selectedRunner.status === 'sos' && (
              <Button
                variant="danger"
                size="lg"
                fullWidth
                leftIcon={<AlertTriangleIcon size={20} color={colors.white} />}
                onPress={() => {/* Navigate to responder mode */}}
                style={{ marginTop: spacing.md }}
              >
                Respond to SOS
              </Button>
            )}
          </Card>
        )}

        {/* Runners List (when expanded) */}
        {isPanelExpanded && (
          <FlatList
            data={guardedRunners}
            keyExtractor={(item) => item.userId}
            style={styles.runnersList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.runnerItem,
                  selectedRunner?.userId === item.userId && styles.runnerItemSelected,
                ]}
                onPress={() => selectRunner(item.userId)}
              >
                <View style={[
                  styles.runnerAvatar,
                  item.status === 'sos' && { backgroundColor: colors.danger[500] },
                ]}>
                  <Text style={styles.runnerInitial}>
                    {item.displayName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.runnerInfo}>
                  <Text style={[styles.runnerName, { color: theme.text.primary }]}>
                    {item.displayName}
                  </Text>
                  <Text style={[styles.runnerTime, { color: theme.text.secondary }]}>
                    {formatTimeAgo(item.lastUpdate)}
                  </Text>
                </View>
                {item.status === 'sos' && (
                  <AlertTriangleIcon size={20} color={colors.danger[500]} />
                )}
                <Badge
                  variant={
                    item.status === 'sos' ? 'danger' :
                    item.status === 'active' ? 'success' : 'secondary'
                  }
                  size="sm"
                >
                  {item.status}
                </Badge>
              </TouchableOpacity>
            )}
          />
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
  },
  header: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.softMd,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.softMd,
  },
  headerTitleText: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
  },
  sosAlertBanner: {
    position: 'absolute',
    top: 100,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  sosAlertText: {
    ...textStyles.body,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  bottomPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    minHeight: 200,
    ...shadows.softLg,
  },
  bottomPanelExpanded: {
    height: 400,
  },
  panelHandle: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  panelHeader: {
    paddingVertical: spacing.md,
  },
  panelTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  panelTitleText: {
    ...textStyles.h6,
  },
  selectedRunnerCard: {
    marginBottom: spacing.md,
  },
  selectedRunnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedRunnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.safrun[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.safrun[300],
  },
  selectedRunnerInitial: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: 18,
  },
  selectedRunnerInfo: {
    flex: 1,
  },
  selectedRunnerName: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
  },
  selectedRunnerMeta: {
    ...textStyles.bodySm,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  batteryLabel: {
    ...textStyles.caption,
    width: 50,
  },
  batteryBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.navy[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  batteryText: {
    ...textStyles.bodySm,
    fontWeight: fontWeight.medium,
    width: 40,
    textAlign: 'right',
  },
  runnersList: {
    flex: 1,
  },
  runnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.navy[100],
  },
  runnerItemSelected: {
    backgroundColor: `${colors.safrun[500]}10`,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  runnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.safrun[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  runnerInitial: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: 16,
  },
  runnerInfo: {
    flex: 1,
  },
  runnerName: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
  },
  runnerTime: {
    ...textStyles.caption,
  },
});

