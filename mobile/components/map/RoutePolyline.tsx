/**
 * SAFRUN Route Polyline
 * Displays running route with gradient effect
 */

import React from 'react';
import { Polyline } from 'react-native-maps';
import { colors } from '@/theme/colors';
import type { RoutePoint } from './types';

interface RoutePolylineProps {
  points: RoutePoint[];
  color?: string;
  strokeWidth?: number;
  showSpeedGradient?: boolean;
  isCurrentUser?: boolean;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({
  points,
  color = colors.safrun[500],
  strokeWidth = 4,
  showSpeedGradient = false,
  isCurrentUser = false,
}) => {
  if (points.length < 2) return null;

  const coordinates = points.map(p => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  // For speed gradient, we could segment the polyline
  // For now, use a single color with different styling for current user
  
  if (isCurrentUser) {
    return (
      <>
        {/* Outer glow */}
        <Polyline
          coordinates={coordinates}
          strokeColor={`${color}40`}
          strokeWidth={strokeWidth + 8}
          lineCap="round"
          lineJoin="round"
        />
        {/* Main line */}
        <Polyline
          coordinates={coordinates}
          strokeColor={color}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
        />
      </>
    );
  }

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor={`${color}B0`}
      strokeWidth={strokeWidth - 1}
      lineCap="round"
      lineJoin="round"
      lineDashPattern={[1]}
    />
  );
};

export default RoutePolyline;

