'use client';

/**
 * SAFRUN Web Responder Map Component
 * Map showing route to SOS incident for responders
 */

import { useMemo } from 'react';
import { MapView, MapMarker, MapRoute } from './MapView';

interface ResponderMapProps {
  responderLocation: { latitude: number; longitude: number };
  incidentLocation: { latitude: number; longitude: number };
  otherResponders?: Array<{
    id: string;
    location: { latitude: number; longitude: number };
    name?: string;
  }>;
  className?: string;
  style?: React.CSSProperties;
}

export function ResponderMap({
  responderLocation,
  incidentLocation,
  otherResponders = [],
  className,
  style,
}: ResponderMapProps) {
  const markers: MapMarker[] = useMemo(() => {
    const result: MapMarker[] = [
      // SOS incident location
      {
        id: 'incident',
        coordinates: [incidentLocation.longitude, incidentLocation.latitude],
        type: 'sos',
        color: '#EF4444',
        popup: '<strong>🚨 SOS Alert</strong><br/>Incident location',
      },
      // My location (responder)
      {
        id: 'me',
        coordinates: [responderLocation.longitude, responderLocation.latitude],
        type: 'responder',
        color: '#3B82F6',
        popup: '<strong>You</strong><br/>Responding to alert',
      },
    ];

    // Other responders
    otherResponders.forEach((responder) => {
      result.push({
        id: `responder-${responder.id}`,
        coordinates: [responder.location.longitude, responder.location.latitude],
        type: 'responder',
        color: '#60A5FA',
        label: responder.name?.charAt(0) || 'R',
        popup: `<strong>${responder.name || 'Responder'}</strong><br/>Also responding`,
      });
    });

    return result;
  }, [responderLocation, incidentLocation, otherResponders]);

  const routes: MapRoute[] = useMemo(() => {
    // Simple direct route - in production, use routing API for actual directions
    return [
      {
        id: 'route-to-incident',
        coordinates: [
          [responderLocation.longitude, responderLocation.latitude],
          [incidentLocation.longitude, incidentLocation.latitude],
        ],
        color: '#3B82F6',
        width: 5,
      },
    ];
  }, [responderLocation, incidentLocation]);

  const center: [number, number] = useMemo(() => {
    const midLng = (responderLocation.longitude + incidentLocation.longitude) / 2;
    const midLat = (responderLocation.latitude + incidentLocation.latitude) / 2;
    return [midLng, midLat];
  }, [responderLocation, incidentLocation]);

  return (
    <MapView
      center={center}
      markers={markers}
      routes={routes}
      fitBounds
      showUserLocation
      className={className}
      style={style}
    />
  );
}

export default ResponderMap;

