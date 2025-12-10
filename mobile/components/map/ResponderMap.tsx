/**
 * SAFRUN Responder Map
 * Shows route to SOS incident and responder locations
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Marker, Polyline, Circle } from 'react-native-maps';
import SafrunMap, { SafrunMapRef } from './SafrunMap';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button } from '@/components';
import { 
  NavigationIcon, 
  AlertTriangleIcon,
  PhoneIcon,
  ClockIcon,
  CheckIcon,
} from '@/components/Icons';
import type { SOSLocation, ResponderInfo, MapRegion } from './types';

interface ResponderMapProps {
  sosLocation: SOSLocation;
  currentLocation: { latitude: number; longitude: number };
  responders?: ResponderInfo[];
  routeCoordinates?: { latitude: number; longitude: number }[];
  eta?: number; // in seconds
  distance?: number; // in meters
  isEnRoute?: boolean;
  onNavigate?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onArrived?: () => void;
  onCall?: () => void;
}

const ResponderMap: React.FC<ResponderMapProps> = ({
  sosLocation,
  currentLocation,
  responders = [],
  routeCoordinates = [],
  eta,
  distance,
  isEnRoute = false,
  onNavigate,
  onAccept,
  onDecline,
  onArrived,
  onCall,
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<SafrunMapRef>(null);

  // Fit map to show both user and SOS location
  useEffect(() => {
    if (sosLocation && currentLocation) {
      mapRef.current?.fitToCoordinates(
        [
          currentLocation,
          { latitude: sosLocation.latitude, longitude: sosLocation.longitude },
        ],
        {
          edgePadding: { top: 150, right: 50, bottom: 250, left: 50 },
          animated: true,
        }
      );
    }
  }, [sosLocation, currentLocation]);

  const formatETA = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <View style={styles.container}>
      <SafrunMap ref={mapRef}>
        {/* Route to SOS */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.danger[500]}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* SOS pulse rings */}
        <Circle
          center={{ latitude: sosLocation.latitude, longitude: sosLocation.longitude }}
          radius={sosLocation.isApproximate ? 200 : 50}
          fillColor={`${colors.danger[500]}15`}
          strokeColor={colors.danger[500]}
          strokeWidth={2}
        />
        <Circle
          center={{ latitude: sosLocation.latitude, longitude: sosLocation.longitude }}
          radius={sosLocation.isApproximate ? 400 : 100}
          fillColor={`${colors.danger[500]}08`}
          strokeColor={`${colors.danger[500]}50`}
          strokeWidth={1}
        />

        {/* SOS marker */}
        <Marker
          coordinate={{ latitude: sosLocation.latitude, longitude: sosLocation.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.sosMarker}>
            <View style={styles.sosPulse} />
            <View style={styles.sosIcon}>
              <AlertTriangleIcon size={28} color={colors.white} />
            </View>
          </View>
        </Marker>

        {/* Current user marker */}
        <Marker
          coordinate={currentLocation}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.userMarker}>
            <View style={styles.userMarkerInner} />
          </View>
        </Marker>

        {/* Other responders */}
        {responders.map(responder => (
          <Marker
            key={responder.id}
            coordinate={{ latitude: responder.latitude, longitude: responder.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[
              styles.responderMarker,
              responder.status === 'arrived' && styles.responderArrived,
            ]}>
              <Text style={styles.responderInitial}>
                {responder.displayName.charAt(0)}
              </Text>
            </View>
          </Marker>
        ))}
      </SafrunMap>

      {/* Header */}
      <View style={[styles.header, { top: insets.top + spacing.sm }]}>
        <View style={styles.sosAlert}>
          <AlertTriangleIcon size={20} color={colors.danger[500]} />
          <View style={styles.sosAlertText}>
            <Text style={styles.sosAlertTitle}>SOS Alert</Text>
            <Text style={styles.sosAlertName}>{sosLocation.displayName} needs help</Text>
          </View>
        </View>
        {sosLocation.distance !== undefined && (
          <Text style={styles.sosDistance}>
            {formatDistance(sosLocation.distance)}
          </Text>
        )}
      </View>

      {/* ETA/Distance info */}
      {(eta !== undefined || distance !== undefined) && isEnRoute && (
        <View style={styles.routeInfo}>
          {eta !== undefined && (
            <View style={styles.routeInfoItem}>
              <ClockIcon size={18} color={colors.navy[500]} />
              <Text style={styles.routeInfoText}>ETA: {formatETA(eta)}</Text>
            </View>
          )}
          {distance !== undefined && (
            <View style={styles.routeInfoItem}>
              <NavigationIcon size={18} color={colors.navy[500]} />
              <Text style={styles.routeInfoText}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom actions */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + spacing.md }]}>
        {!isEnRoute ? (
          // Accept/Decline options
          <View style={styles.responseActions}>
            <Button
              variant="outline"
              size="lg"
              onPress={onDecline}
              style={styles.declineButton}
            >
              Can't Help
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<CheckIcon size={20} color={colors.white} />}
              onPress={onAccept}
              style={styles.acceptButton}
            >
              I'll Respond
            </Button>
          </View>
        ) : (
          // En route actions
          <View style={styles.enRouteActions}>
            <View style={styles.enRouteInfo}>
              <View style={styles.enRouteStatus}>
                <View style={styles.enRouteDot} />
                <Text style={styles.enRouteText}>En Route to Incident</Text>
              </View>
              {responders.length > 0 && (
                <Text style={styles.otherResponders}>
                  {responders.length} other responder{responders.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
            <View style={styles.enRouteButtons}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={onCall}
                activeOpacity={0.8}
              >
                <PhoneIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Button
                size="lg"
                leftIcon={<NavigationIcon size={20} color={colors.white} />}
                onPress={onNavigate}
                style={{ flex: 1 }}
              >
                Navigate
              </Button>
              <Button
                variant="success"
                size="lg"
                onPress={onArrived}
              >
                Arrived
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.danger[500],
    ...shadows.softMd,
  },
  sosAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sosAlertText: {},
  sosAlertTitle: {
    ...textStyles.caption,
    color: colors.danger[600],
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
  },
  sosAlertName: {
    ...textStyles.body,
    color: colors.navy[900],
    fontWeight: fontWeight.semibold,
  },
  sosDistance: {
    ...textStyles.h5,
    color: colors.navy[700],
    fontWeight: fontWeight.bold,
  },
  routeInfo: {
    position: 'absolute',
    top: 130,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeInfoText: {
    ...textStyles.body,
    color: colors.navy[700],
    fontWeight: fontWeight.semibold,
  },
  sosMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.danger[500]}30`,
  },
  sosIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.danger[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.danger[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.safrun[500],
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  responderMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.safety[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  responderArrived: {
    backgroundColor: colors.safety[600],
    borderColor: colors.safety[300],
  },
  responderInitial: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: 14,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.softLg,
  },
  responseActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 2,
    backgroundColor: colors.safety[500],
  },
  enRouteActions: {},
  enRouteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  enRouteStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  enRouteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.safety[500],
  },
  enRouteText: {
    ...textStyles.body,
    color: colors.navy[700],
    fontWeight: fontWeight.semibold,
  },
  otherResponders: {
    ...textStyles.bodySm,
    color: colors.navy[500],
  },
  enRouteButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  callButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.safety[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ResponderMap;

