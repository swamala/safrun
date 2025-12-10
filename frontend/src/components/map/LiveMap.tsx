'use client';

/**
 * SAFRUN Live Map Component (Web)
 * Real-time map with runners, routes, and SOS alerts using react-map-gl
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import Map, { 
  Marker, 
  Source, 
  Layer, 
  NavigationControl,
  GeolocateControl,
  MapRef,
} from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, Navigation, Crosshair, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

import 'mapbox-gl/dist/mapbox-gl.css';

// Types
interface RunnerLocation {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  pace?: string;
  distance?: number;
  status: 'running' | 'paused' | 'idle' | 'sos' | 'ahead' | 'behind';
  isCurrentUser?: boolean;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface SOSAlert {
  alertId: string;
  userId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  distance?: number;
  triggeredAt: Date;
}

interface LiveMapProps {
  participants: RunnerLocation[];
  routes?: { userId: string; points: RoutePoint[]; color: string }[];
  sosAlerts?: SOSAlert[];
  currentUserLocation?: { latitude: number; longitude: number };
  currentUserId?: string;
  sessionName?: string;
  onRunnerClick?: (runner: RunnerLocation) => void;
  onSOSClick?: (alert: SOSAlert) => void;
  className?: string;
  showControls?: boolean;
}

// Status colors
const statusColors: Record<RunnerLocation['status'], string> = {
  running: '#FF8A00',
  paused: '#F59E0B',
  idle: '#6B7280',
  sos: '#EF4444',
  ahead: '#22C55E',
  behind: '#3B82F6',
};

// Map style (dark mode optimized)
const mapStyle = 'mapbox://styles/mapbox/dark-v11';

export default function LiveMap({
  participants,
  routes = [],
  sosAlerts = [],
  currentUserLocation,
  currentUserId,
  sessionName,
  onRunnerClick,
  onSOSClick,
  className,
  showControls = true,
}: LiveMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    latitude: currentUserLocation?.latitude || 37.7749,
    longitude: currentUserLocation?.longitude || -122.4194,
    zoom: 14,
  });
  const [isFollowing, setIsFollowing] = useState(true);
  const [selectedRunner, setSelectedRunner] = useState<RunnerLocation | null>(null);

  // Center on user when following
  useEffect(() => {
    if (isFollowing && currentUserLocation) {
      setViewState((prev) => ({
        ...prev,
        latitude: currentUserLocation.latitude,
        longitude: currentUserLocation.longitude,
      }));
    }
  }, [currentUserLocation, isFollowing]);

  // Fit to all participants
  const fitToParticipants = useCallback(() => {
    if (participants.length === 0 && !currentUserLocation) return;

    const bounds: [[number, number], [number, number]] = [
      [180, 90],
      [-180, -90],
    ];

    const allPoints = [
      ...participants.map((p) => [p.longitude, p.latitude] as [number, number]),
      ...(currentUserLocation ? [[currentUserLocation.longitude, currentUserLocation.latitude] as [number, number]] : []),
    ];

    allPoints.forEach(([lng, lat]) => {
      bounds[0][0] = Math.min(bounds[0][0], lng);
      bounds[0][1] = Math.min(bounds[0][1], lat);
      bounds[1][0] = Math.max(bounds[1][0], lng);
      bounds[1][1] = Math.max(bounds[1][1], lat);
    });

    mapRef.current?.fitBounds(bounds, { padding: 100, duration: 500 });
    setIsFollowing(false);
  }, [participants, currentUserLocation]);

  // Center on current user
  const centerOnUser = useCallback(() => {
    if (currentUserLocation) {
      mapRef.current?.flyTo({
        center: [currentUserLocation.longitude, currentUserLocation.latitude],
        zoom: 15,
        duration: 500,
      });
      setIsFollowing(true);
    }
  }, [currentUserLocation]);

  // Generate route GeoJSON
  const routeGeoJSON = routes.map((route) => ({
    type: 'Feature' as const,
    properties: { color: route.color, userId: route.userId },
    geometry: {
      type: 'LineString' as const,
      coordinates: route.points.map((p) => [p.longitude, p.latitude]),
    },
  }));

  return (
    <div className={cn('relative w-full h-full', className)}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => {
          setViewState(evt.viewState);
          setIsFollowing(false);
        }}
        mapStyle={mapStyle}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Routes */}
        {routes.map((route, index) => (
          <Source
            key={`route-${route.userId}`}
            id={`route-${route.userId}`}
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.points.map((p) => [p.longitude, p.latitude]),
              },
            }}
          >
            <Layer
              id={`route-line-${route.userId}`}
              type="line"
              paint={{
                'line-color': route.color,
                'line-width': route.userId === currentUserId ? 5 : 3,
                'line-opacity': route.userId === currentUserId ? 1 : 0.7,
              }}
              layout={{
                'line-cap': 'round',
                'line-join': 'round',
              }}
            />
          </Source>
        ))}

        {/* SOS Alerts */}
        {sosAlerts.map((alert) => (
          <Marker
            key={alert.alertId}
            latitude={alert.latitude}
            longitude={alert.longitude}
            anchor="center"
            onClick={() => onSOSClick?.(alert)}
          >
            <motion.div
              className="relative cursor-pointer"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              {/* Pulse rings */}
              <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping" />
              <div className="absolute -inset-6 bg-red-500/10 rounded-full animate-pulse" />
              
              {/* SOS marker */}
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </Marker>
        ))}

        {/* Runner markers */}
        {participants.map((runner) => (
          <Marker
            key={runner.userId}
            latitude={runner.latitude}
            longitude={runner.longitude}
            anchor="center"
            onClick={() => {
              setSelectedRunner(runner);
              onRunnerClick?.(runner);
            }}
          >
            <motion.div
              className="relative cursor-pointer"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              {/* Running pulse */}
              {runner.status === 'running' && (
                <div
                  className="absolute -inset-2 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: statusColors[runner.status] }}
                />
              )}

              {/* Direction indicator */}
              {runner.heading !== undefined && runner.status === 'running' && (
                <div
                  className="absolute -top-5 left-1/2 -translate-x-1/2"
                  style={{ transform: `translateX(-50%) rotate(${runner.heading}deg)` }}
                >
                  <div
                    className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-transparent"
                    style={{ borderBottomColor: statusColors[runner.status] }}
                  />
                </div>
              )}

              {/* Avatar */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-[3px]',
                  runner.isCurrentUser && 'ring-2 ring-offset-2 ring-orange-500'
                )}
                style={{
                  backgroundColor: runner.avatarUrl ? 'transparent' : statusColors[runner.status],
                  borderColor: statusColors[runner.status],
                }}
              >
                {runner.avatarUrl ? (
                  <img
                    src={runner.avatarUrl}
                    alt={runner.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  runner.displayName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Status dot */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: statusColors[runner.status] }}
              />

              {/* "You" label */}
              {runner.isCurrentUser && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  You
                </div>
              )}
            </motion.div>
          </Marker>
        ))}

        {/* Controls */}
        {showControls && (
          <NavigationControl position="top-right" showCompass showZoom />
        )}
      </Map>

      {/* Session info overlay */}
      {sessionName && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {sessionName}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {participants.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map controls */}
      {showControls && (
        <div className="absolute right-4 bottom-24 flex flex-col gap-2">
          <button
            onClick={centerOnUser}
            className={cn(
              'w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center transition-colors',
              isFollowing && 'bg-orange-500 text-white'
            )}
          >
            <Crosshair className={cn('w-5 h-5', isFollowing ? 'text-white' : 'text-slate-700 dark:text-slate-300')} />
          </button>
          <button
            onClick={fitToParticipants}
            className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
          >
            <Layers className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.ahead }} />
          <span className="text-xs text-slate-600 dark:text-slate-400">Ahead</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.running }} />
          <span className="text-xs text-slate-600 dark:text-slate-400">On Pace</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.behind }} />
          <span className="text-xs text-slate-600 dark:text-slate-400">Behind</span>
        </div>
      </div>

      {/* Runner popup */}
      <AnimatePresence>
        {selectedRunner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 min-w-[200px]"
          >
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
              onClick={() => setSelectedRunner(null)}
            >
              ×
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: statusColors[selectedRunner.status] }}
              >
                {selectedRunner.avatarUrl ? (
                  <img
                    src={selectedRunner.avatarUrl}
                    alt={selectedRunner.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  selectedRunner.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedRunner.displayName}
                </p>
                {selectedRunner.pace && (
                  <p className="text-sm text-slate-500">{selectedRunner.pace} min/km</p>
                )}
              </div>
            </div>
            {selectedRunner.distance !== undefined && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Distance: {(selectedRunner.distance / 1000).toFixed(2)} km
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

