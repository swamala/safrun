/**
 * SAFRUN Nearby Runners Map
 * Shows runners within a radius, with option to join sessions
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle } from 'react-native-maps';
import SafrunMap, { SafrunMapRef } from './SafrunMap';
import RunnerMarker from './RunnerMarker';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button } from '@/components';
import { 
  CrosshairIcon, 
  UsersIcon,
  FilterIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@/components/Icons';
import type { RunnerLocation, MapRegion } from './types';

interface NearbyRunnersMapProps {
  runners: RunnerLocation[];
  currentUserLocation: { latitude: number; longitude: number };
  radius?: number; // in meters
  onRunnerPress?: (runner: RunnerLocation) => void;
  onJoinSession?: (sessionId: string) => void;
  onRadiusChange?: (radius: number) => void;
}

const RADIUS_OPTIONS = [500, 1000, 2000, 5000];

const NearbyRunnersMap: React.FC<NearbyRunnersMapProps> = ({
  runners,
  currentUserLocation,
  radius = 1000,
  onRunnerPress,
  onJoinSession,
  onRadiusChange,
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<SafrunMapRef>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(radius);

  // Center map on user
  const centerOnUser = useCallback(() => {
    mapRef.current?.animateToRegion({
      ...currentUserLocation,
      latitudeDelta: (selectedRadius / 111000) * 2.5,
      longitudeDelta: (selectedRadius / 111000) * 2.5,
    }, 500);
  }, [currentUserLocation, selectedRadius]);

  useEffect(() => {
    centerOnUser();
  }, [selectedRadius]);

  const handleRadiusChange = (newRadius: number) => {
    setSelectedRadius(newRadius);
    onRadiusChange?.(newRadius);
  };

  // Filter runners by status
  const availableRunners = runners.filter(r => r.status !== 'sos');
  const sosRunners = runners.filter(r => r.status === 'sos');
  const runnersWithSessions = runners.filter(r => r.sessionId);

  return (
    <View style={styles.container}>
      <SafrunMap
        ref={mapRef}
        initialRegion={{
          ...currentUserLocation,
          latitudeDelta: (radius / 111000) * 2.5,
          longitudeDelta: (radius / 111000) * 2.5,
        }}
      >
        {/* Radius circle */}
        <Circle
          center={currentUserLocation}
          radius={selectedRadius}
          fillColor={`${colors.safrun[500]}15`}
          strokeColor={colors.safrun[500]}
          strokeWidth={2}
        />

        {/* Current user marker */}
        <RunnerMarker
          runner={{
            userId: 'current',
            displayName: 'You',
            latitude: currentUserLocation.latitude,
            longitude: currentUserLocation.longitude,
            status: 'running',
            isCurrentUser: true,
          }}
        />

        {/* Nearby runners */}
        {runners.map(runner => (
          <RunnerMarker
            key={runner.userId}
            runner={runner}
            onPress={onRunnerPress}
          />
        ))}
      </SafrunMap>

      {/* Radius selector */}
      <View style={[styles.radiusSelector, { top: insets.top + spacing.md }]}>
        <Text style={styles.radiusLabel}>Radius</Text>
        <View style={styles.radiusOptions}>
          {RADIUS_OPTIONS.map(r => (
            <TouchableOpacity
              key={r}
              style={[
                styles.radiusOption,
                selectedRadius === r && styles.radiusOptionActive,
              ]}
              onPress={() => handleRadiusChange(r)}
            >
              <Text style={[
                styles.radiusOptionText,
                selectedRadius === r && styles.radiusOptionTextActive,
              ]}>
                {r >= 1000 ? `${r / 1000}km` : `${r}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Center button */}
      <TouchableOpacity
        style={[styles.centerButton, { bottom: isPanelExpanded ? 320 : 170 }]}
        onPress={centerOnUser}
        activeOpacity={0.8}
      >
        <CrosshairIcon size={22} color={colors.navy[700]} />
      </TouchableOpacity>

      {/* Bottom panel */}
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
            <Text style={styles.panelTitleText}>
              {runners.length} Runner{runners.length !== 1 ? 's' : ''} Nearby
            </Text>
          </View>
          {sosRunners.length > 0 && (
            <View style={styles.sosWarning}>
              <Text style={styles.sosWarningText}>
                {sosRunners.length} SOS Alert{sosRunners.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {isPanelExpanded && (
          <FlatList
            data={runners}
            keyExtractor={item => item.userId}
            style={styles.runnerList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: runner }) => (
              <TouchableOpacity
                style={styles.runnerItem}
                onPress={() => onRunnerPress?.(runner)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.runnerAvatar,
                  { backgroundColor: runner.status === 'sos' ? colors.danger[500] : colors.safrun[500] }
                ]}>
                  <Text style={styles.runnerInitial}>
                    {runner.displayName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.runnerInfo}>
                  <Text style={styles.runnerName}>{runner.displayName}</Text>
                  <Text style={styles.runnerDistance}>{runner.distance} away</Text>
                </View>
                {runner.sessionId ? (
                  <Button
                    size="sm"
                    onPress={() => onJoinSession?.(runner.sessionId!)}
                  >
                    Join
                  </Button>
                ) : (
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: runner.status === 'sos' ? colors.danger[100] : colors.navy[100] }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: runner.status === 'sos' ? colors.danger[600] : colors.navy[600] }
                    ]}>
                      {runner.status === 'sos' ? 'SOS' : runner.status}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  radiusSelector: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.softMd,
  },
  radiusLabel: {
    ...textStyles.caption,
    color: colors.navy[500],
    marginBottom: spacing.xs,
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  radiusOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.navy[100],
    alignItems: 'center',
  },
  radiusOptionActive: {
    backgroundColor: colors.safrun[500],
  },
  radiusOptionText: {
    ...textStyles.bodySm,
    color: colors.navy[600],
    fontWeight: fontWeight.medium,
  },
  radiusOptionTextActive: {
    color: colors.white,
  },
  centerButton: {
    position: 'absolute',
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.softMd,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    minHeight: 130,
    ...shadows.softLg,
  },
  bottomPanelExpanded: {
    height: 350,
  },
  panelHandle: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  panelTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  panelTitleText: {
    ...textStyles.h6,
    color: colors.navy[900],
  },
  sosWarning: {
    backgroundColor: colors.danger[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sosWarningText: {
    ...textStyles.caption,
    color: colors.danger[600],
    fontWeight: fontWeight.semibold,
  },
  runnerList: {
    flex: 1,
  },
  runnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.navy[100],
  },
  runnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    color: colors.navy[900],
    fontWeight: fontWeight.medium,
  },
  runnerDistance: {
    ...textStyles.bodySm,
    color: colors.navy[500],
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
});

export default NearbyRunnersMap;

