/**
 * SAFRUN Base Map Component
 * Reusable map with SAFRUN styling and dark mode support
 */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { 
  PROVIDER_GOOGLE, 
  MapViewProps,
  Region,
  Camera,
} from 'react-native-maps';
import { useTheme } from '@/theme/ThemeProvider';

// Dark mode map style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a0e19' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0e19' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f1723' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d4a5c' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a2332' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f1723' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2d3748' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a2332' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1a2332' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#060912' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d4a5c' }],
  },
];

const lightMapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
];

export interface SafrunMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
  animateCamera: (camera: Partial<Camera>, options?: { duration?: number }) => void;
  fitToCoordinates: (coordinates: { latitude: number; longitude: number }[], options?: {
    edgePadding?: { top: number; right: number; bottom: number; left: number };
    animated?: boolean;
  }) => void;
  getCamera: () => Promise<Camera>;
}

interface SafrunMapProps extends Omit<MapViewProps, 'provider' | 'customMapStyle'> {
  children?: React.ReactNode;
}

const SafrunMap = forwardRef<SafrunMapRef, SafrunMapProps>(
  ({ children, style, ...props }, ref) => {
    const mapRef = useRef<MapView>(null);
    const { isDark } = useTheme();

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        mapRef.current?.animateToRegion(region, duration);
      },
      animateCamera: (camera: Partial<Camera>, options?: { duration?: number }) => {
        mapRef.current?.animateCamera(camera, options);
      },
      fitToCoordinates: (coordinates, options) => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: options?.edgePadding || { top: 100, right: 100, bottom: 100, left: 100 },
          animated: options?.animated ?? true,
        });
      },
      getCamera: async () => {
        const camera = await mapRef.current?.getCamera();
        return camera!;
      },
    }));

    return (
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={[styles.map, style]}
        customMapStyle={isDark ? darkMapStyle : lightMapStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        toolbarEnabled={false}
        rotateEnabled={true}
        pitchEnabled={true}
        {...props}
      >
        {children}
      </MapView>
    );
  }
);

SafrunMap.displayName = 'SafrunMap';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default SafrunMap;

