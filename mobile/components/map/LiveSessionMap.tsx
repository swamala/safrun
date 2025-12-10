/**
 * SAFRUN Live Session Map
 * Real-time map showing all session participants with routes
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafrunMap, { SafrunMapRef } from './SafrunMap';
import RunnerMarker from './RunnerMarker';
import RoutePolyline from './RoutePolyline';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { 
  CrosshairIcon, 
  UsersIcon, 
  LayersIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@/components/Icons';
import type { RunnerLocation, RoutePoint, MapRegion } from './types';

interface ParticipantRoute {
  oderId: string;
  points: RoutePoint[];
  color: string;
}

interface LiveSessionMapProps {
  participants: RunnerLocation[];
  routes?: ParticipantRoute[];
  currentUserLocation?: { latitude: number; longitude: number };
  currentUserId?: string;
  sessionName?: string;
  onRunnerPress?: (runner: RunnerLocation) => void;
  onSOSPress?: () => void;
  showControls?: boolean;
  initialRegion?: MapRegion;
}

const DEFAULT_REGION: MapRegion = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const LiveSessionMap: React.FC<LiveSessionMapProps> = ({
  participants,
  routes = [],
  currentUserLocation,
  currentUserId,
  sessionName,
  onRunnerPress,
  onSOSPress,
  showControls = true,
  initialRegion,
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<SafrunMapRef>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [showAllParticipants, setShowAllParticipants] = useState(true);

  // Calculate region to fit all participants
  const fitToParticipants = useCallback(() => {
    if (participants.length === 0) return;

    const coords = participants.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    if (currentUserLocation) {
      coords.push(currentUserLocation);
    }

    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
      animated: true,
    });
  }, [participants, currentUserLocation]);

  // Center on current user
  const centerOnUser = useCallback(() => {
    if (!currentUserLocation) return;

    mapRef.current?.animateToRegion({
      ...currentUserLocation,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 500);
    setIsFollowingUser(true);
  }, [currentUserLocation]);

  // Auto-center on user location updates when following
  useEffect(() => {
    if (isFollowingUser && currentUserLocation) {
      mapRef.current?.animateToRegion({
        ...currentUserLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 300);
    }
  }, [isFollowingUser, currentUserLocation]);

  // Initial fit to participants
  useEffect(() => {
    if (participants.length > 0 && showAllParticipants) {
      setTimeout(fitToParticipants, 500);
    }
  }, []);

  // Determine color for each participant's route
  const participantColors = [
    colors.safrun[500],
    colors.safety[500],
    colors.info[500],
    '#9333ea',
    '#ec4899',
    '#14b8a6',
  ];

  // Add current user indicator to participants list
  const enhancedParticipants = participants.map(p => ({
    ...p,
    isCurrentUser: p.userId === currentUserId,
  }));

  return (
    <View style={styles.container}>
      <SafrunMap
        ref={mapRef}
        initialRegion={initialRegion || DEFAULT_REGION}
        onPanDrag={() => setIsFollowingUser(false)}
      >
        {/* Route polylines */}
        {routes.map((route, index) => (
          <RoutePolyline
            key={route.oderId || index}
            points={route.points}
            color={route.color || participantColors[index % participantColors.length]}
            isCurrentUser={route.oderId === currentUserId}
          />
        ))}

        {/* Participant markers */}
        {enhancedParticipants.map((participant, index) => (
          <RunnerMarker
            key={participant.userId}
            runner={{
              ...participant,
              // Assign colors if not set
              status: participant.status,
            }}
            onPress={onRunnerPress}
          />
        ))}
      </SafrunMap>

      {/* Session info header */}
      {sessionName && (
        <View style={[styles.sessionHeader, { top: insets.top + spacing.sm }]}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.sessionName}>{sessionName}</Text>
          <View style={styles.participantCount}>
            <UsersIcon size={14} color={colors.navy[500]} />
            <Text style={styles.participantCountText}>{participants.length}</Text>
          </View>
        </View>
      )}

      {/* Map controls */}
      {showControls && (
        <View style={[styles.controls, { bottom: insets.bottom + 100 }]}>
          {/* Center on user */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isFollowingUser && styles.controlButtonActive,
            ]}
            onPress={centerOnUser}
            activeOpacity={0.8}
          >
            <CrosshairIcon 
              size={22} 
              color={isFollowingUser ? colors.white : colors.navy[700]} 
            />
          </TouchableOpacity>

          {/* Fit all participants */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={fitToParticipants}
            activeOpacity={0.8}
          >
            <LayersIcon size={22} color={colors.navy[700]} />
          </TouchableOpacity>

          {/* Zoom controls */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={async () => {
              const camera = await mapRef.current?.getCamera();
              if (camera) {
                mapRef.current?.animateCamera({
                  zoom: (camera.zoom || 15) + 1,
                }, { duration: 200 });
              }
            }}
            activeOpacity={0.8}
          >
            <ZoomInIcon size={22} color={colors.navy[700]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={async () => {
              const camera = await mapRef.current?.getCamera();
              if (camera) {
                mapRef.current?.animateCamera({
                  zoom: (camera.zoom || 15) - 1,
                }, { duration: 200 });
              }
            }}
            activeOpacity={0.8}
          >
            <ZoomOutIcon size={22} color={colors.navy[700]} />
          </TouchableOpacity>
        </View>
      )}

      {/* Pace/status legend */}
      <View style={[styles.legend, { bottom: insets.bottom + 220 }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.safety[500] }]} />
          <Text style={styles.legendText}>Ahead</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.safrun[500] }]} />
          <Text style={styles.legendText}>On Pace</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.info[500] }]} />
          <Text style={styles.legendText}>Behind</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sessionHeader: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.softMd,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    marginRight: 4,
  },
  liveText: {
    ...textStyles.caption,
    color: colors.white,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  sessionName: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    color: colors.navy[900],
    flex: 1,
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  participantCountText: {
    ...textStyles.bodySm,
    color: colors.navy[700],
    fontWeight: fontWeight.medium,
  },
  controls: {
    position: 'absolute',
    right: spacing.md,
    gap: spacing.xs,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.softMd,
  },
  controlButtonActive: {
    backgroundColor: colors.safrun[500],
  },
  legend: {
    position: 'absolute',
    left: spacing.md,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...textStyles.caption,
    color: colors.navy[600],
  },
});

export default LiveSessionMap;

