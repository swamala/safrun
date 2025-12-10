/**
 * SAFRUN Runner Marker
 * Custom map marker for runners with status indicators
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import type { RunnerLocation } from './types';

interface RunnerMarkerProps {
  runner: RunnerLocation;
  onPress?: (runner: RunnerLocation) => void;
}

const statusColors: Record<RunnerLocation['status'], string> = {
  running: colors.safrun[500],
  paused: colors.warning[500],
  idle: colors.navy[400],
  sos: colors.danger[500],
  ahead: colors.safety[500],
  behind: colors.info[500],
};

const RunnerMarker: React.FC<RunnerMarkerProps> = ({ runner, onPress }) => {
  const markerColor = statusColors[runner.status] || colors.safrun[500];
  
  return (
    <Marker
      coordinate={{
        latitude: runner.latitude,
        longitude: runner.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      onPress={() => onPress?.(runner)}
    >
      <View style={styles.container}>
        {/* Pulse effect for running status */}
        {runner.status === 'running' && (
          <View style={[styles.pulse, { backgroundColor: markerColor }]} />
        )}
        
        {/* SOS alert pulse */}
        {runner.status === 'sos' && (
          <>
            <View style={[styles.sosPulse1, { backgroundColor: colors.danger[500] }]} />
            <View style={[styles.sosPulse2, { backgroundColor: colors.danger[500] }]} />
          </>
        )}
        
        {/* Main marker */}
        <View style={[styles.markerOuter, { borderColor: markerColor }]}>
          {runner.avatarUrl ? (
            <Image 
              source={{ uri: runner.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: markerColor }]}>
              <Text style={styles.avatarInitial}>
                {runner.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          {/* Status dot */}
          <View style={[styles.statusDot, { backgroundColor: markerColor }]} />
        </View>
        
        {/* Direction indicator (arrow) */}
        {runner.heading !== undefined && runner.status === 'running' && (
          <View 
            style={[
              styles.directionIndicator,
              { transform: [{ rotate: `${runner.heading}deg` }] }
            ]}
          >
            <View style={[styles.directionArrow, { borderBottomColor: markerColor }]} />
          </View>
        )}
        
        {/* Current user indicator */}
        {runner.isCurrentUser && (
          <View style={styles.currentUserBadge}>
            <Text style={styles.currentUserText}>You</Text>
          </View>
        )}
      </View>
      
      {/* Callout for tap */}
      <Callout tooltip>
        <View style={styles.callout}>
          <Text style={styles.calloutName}>{runner.displayName}</Text>
          {runner.pace && (
            <Text style={styles.calloutPace}>{runner.pace} min/km</Text>
          )}
          {runner.distance !== undefined && (
            <Text style={styles.calloutDistance}>
              {(runner.distance / 1000).toFixed(2)} km
            </Text>
          )}
          <View style={[styles.calloutStatus, { backgroundColor: markerColor }]}>
            <Text style={styles.calloutStatusText}>
              {runner.status.charAt(0).toUpperCase() + runner.status.slice(1)}
            </Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.2,
  },
  sosPulse1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.15,
  },
  sosPulse2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.08,
  },
  markerOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 16,
    fontWeight: fontWeight.bold,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  directionIndicator: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
  },
  directionArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  currentUserBadge: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: colors.safrun[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentUserText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  callout: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  calloutName: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    color: colors.navy[900],
    marginBottom: 4,
  },
  calloutPace: {
    ...textStyles.bodySm,
    color: colors.navy[600],
  },
  calloutDistance: {
    ...textStyles.bodySm,
    color: colors.navy[500],
    marginBottom: 8,
  },
  calloutStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calloutStatusText: {
    ...textStyles.caption,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
});

export default RunnerMarker;

