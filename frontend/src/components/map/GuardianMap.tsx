'use client';

/**
 * SAFRUN Web Guardian Map Component
 * Map showing live location of protected runners for guardians
 */

import { useMemo } from 'react';
import { MapView, MapMarker, MapRoute } from './MapView';

interface Ward {
  id: string;
  name: string;
  avatarUrl?: string;
  location: { latitude: number; longitude: number };
  isActive: boolean;
  pace?: number; // min/km
  distance?: number; // km
  route?: Array<{ latitude: number; longitude: number }>;
  hasAlert?: boolean;
}

interface GuardianMapProps {
  wards: Ward[];
  selectedWardId?: string;
  onWardSelect?: (wardId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function GuardianMap({
  wards,
  selectedWardId,
  onWardSelect,
  className,
  style,
}: GuardianMapProps) {
  const markers: MapMarker[] = useMemo(() => {
    return wards.map((ward) => ({
      id: ward.id,
      coordinates: [ward.location.longitude, ward.location.latitude] as [number, number],
      type: ward.hasAlert ? 'sos' : 'runner',
      color: ward.hasAlert
        ? '#EF4444'
        : ward.isActive
        ? '#10B981'
        : '#6B7280',
      label: ward.name.charAt(0).toUpperCase(),
      popup: `
        <div style="min-width: 150px;">
          <strong>${ward.name}</strong>
          <div style="margin-top: 4px; font-size: 12px; color: #666;">
            ${ward.hasAlert ? '⚠️ SOS Active!' : ''}
            ${ward.isActive ? '🏃 Running' : '⏸️ Idle'}
            ${ward.pace ? `<br/>Pace: ${ward.pace.toFixed(1)} min/km` : ''}
            ${ward.distance ? `<br/>Distance: ${ward.distance.toFixed(2)} km` : ''}
          </div>
        </div>
      `,
    }));
  }, [wards]);

  const routes: MapRoute[] = useMemo(() => {
    const selectedWard = wards.find((w) => w.id === selectedWardId);
    if (!selectedWard?.route || selectedWard.route.length < 2) {
      return [];
    }

    return [
      {
        id: `route-${selectedWardId}`,
        coordinates: selectedWard.route.map(
          (p) => [p.longitude, p.latitude] as [number, number]
        ),
        color: selectedWard.hasAlert ? '#EF4444' : '#10B981',
        width: 4,
      },
    ];
  }, [wards, selectedWardId]);

  const center: [number, number] = useMemo(() => {
    if (selectedWardId) {
      const ward = wards.find((w) => w.id === selectedWardId);
      if (ward) {
        return [ward.location.longitude, ward.location.latitude];
      }
    }
    
    if (wards.length > 0) {
      const avgLng = wards.reduce((sum, w) => sum + w.location.longitude, 0) / wards.length;
      const avgLat = wards.reduce((sum, w) => sum + w.location.latitude, 0) / wards.length;
      return [avgLng, avgLat];
    }
    
    return [-73.935242, 40.73061]; // NYC default
  }, [wards, selectedWardId]);

  const handleMarkerClick = (markerId: string) => {
    onWardSelect?.(markerId);
  };

  return (
    <MapView
      center={center}
      zoom={selectedWardId ? 15 : 12}
      markers={markers}
      routes={routes}
      fitBounds={!selectedWardId && wards.length > 1}
      showUserLocation
      onMarkerClick={handleMarkerClick}
      className={className}
      style={style}
    />
  );
}

export default GuardianMap;

