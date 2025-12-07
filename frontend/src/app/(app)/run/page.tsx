'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Users,
  MapPin,
  Zap,
  Clock,
  Footprints,
  AlertTriangle,
  ChevronUp,
} from 'lucide-react';
import { useRunStore } from '@/stores/run.store';
import { useAuthStore } from '@/stores/auth.store';
import { useSocket } from '@/hooks/useSocket';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistance, formatDuration, formatPace, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RunPage() {
  const { user } = useAuthStore();
  const {
    activeSession,
    currentLocation,
    isTracking,
    distance,
    duration,
    pace,
    setActiveSession,
    setCurrentLocation,
    setIsTracking,
    updateStats,
    resetRun,
  } = useRunStore();
  const { updateLocation } = useSocket();
  const {
    latitude,
    longitude,
    speed,
    heading,
    accuracy,
    startWatching,
    stopWatching,
  } = useGeolocation({ watchPosition: false });

  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update location in store when geolocation changes
  useEffect(() => {
    if (latitude && longitude) {
      setCurrentLocation({
        latitude,
        longitude,
        speed: speed || undefined,
        heading: heading || undefined,
        accuracy: accuracy || undefined,
        timestamp: Date.now(),
      });
    }
  }, [latitude, longitude, speed, heading, accuracy, setCurrentLocation]);

  // Send location updates when tracking
  useEffect(() => {
    if (isTracking && latitude && longitude) {
      updateLocation(latitude, longitude, speed || 0, heading || 0, activeSession?.id);
      
      // Also update via API
      api.updateLocation({
        latitude,
        longitude,
        speed: speed || undefined,
        heading: heading || undefined,
        accuracy: accuracy || undefined,
      }, activeSession?.id).catch(console.error);
    }
  }, [isTracking, latitude, longitude, speed, heading, accuracy, activeSession?.id, updateLocation]);

  // Timer for tracking duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        updateStats({ duration: elapsedTime + 1 });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, elapsedTime, updateStats]);

  // Check for active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const session = await api.getActiveSession();
        if (session) {
          setActiveSession(session);
          setIsTracking(true);
          startWatching();
        }
      } catch {
        // No active session
      }
    };
    checkActiveSession();
  }, [setActiveSession, setIsTracking, startWatching]);

  const handleStartTracking = useCallback(() => {
    setIsTracking(true);
    startWatching();
    toast.success('Location tracking started');
  }, [setIsTracking, startWatching]);

  const handlePauseTracking = useCallback(() => {
    setIsTracking(false);
    stopWatching();
    toast('Tracking paused');
  }, [setIsTracking, stopWatching]);

  const handleStopTracking = useCallback(async () => {
    setIsTracking(false);
    stopWatching();
    
    if (activeSession) {
      try {
        await api.endSession(activeSession.id);
        toast.success('Session ended');
      } catch {
        toast.error('Failed to end session');
      }
    }
    
    resetRun();
    setElapsedTime(0);
  }, [activeSession, setIsTracking, stopWatching, resetRun]);

  const stats = [
    { label: 'Distance', value: formatDistance(distance), icon: Footprints },
    { label: 'Duration', value: formatDuration(elapsedTime), icon: Clock },
    { label: 'Pace', value: pace > 0 ? formatPace(pace) : '--:--', icon: Zap },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Map Area */}
      <div className="flex-1 relative bg-secondary-200 rounded-2xl overflow-hidden">
        {/* Map placeholder - in production, use Mapbox */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-500 text-lg">Live Map View</p>
            {currentLocation ? (
              <p className="text-secondary-400 text-sm mt-2">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </p>
            ) : (
              <p className="text-secondary-400 text-sm mt-2">Waiting for location...</p>
            )}
          </div>
        </div>

        {/* Participants overlay */}
        {activeSession && activeSession.participants.length > 0 && (
          <div className="absolute top-4 left-4 right-4">
            <Card padding="sm" className="flex items-center gap-2 w-fit">
              <Users className="w-4 h-4 text-secondary-500" />
              <span className="text-sm font-medium">
                {activeSession.participants.length} runners
              </span>
              <div className="flex -space-x-2 ml-2">
                {activeSession.participants.slice(0, 3).map((p) => (
                  <Avatar
                    key={p.userId}
                    src={p.avatarUrl}
                    name={p.displayName}
                    size="xs"
                    className="border-2 border-white"
                  />
                ))}
                {activeSession.participants.length > 3 && (
                  <div className="w-6 h-6 bg-secondary-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                    +{activeSession.participants.length - 3}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* SOS Button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="danger"
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg"
            onClick={() => {
              // Navigate to SOS page or trigger SOS
              toast.error('SOS functionality');
            }}
          >
            <AlertTriangle className="w-6 h-6" />
          </Button>
        </div>

        {/* User location indicator */}
        {currentLocation && (
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="relative">
              <div className="w-6 h-6 bg-primary-500 rounded-full border-4 border-white shadow-lg" />
              <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-75" />
            </div>
          </div>
        )}
      </div>

      {/* Stats Panel */}
      <motion.div
        className="bg-white rounded-t-3xl shadow-xl -mt-4 relative z-10"
        animate={{ height: isStatsExpanded ? 'auto' : '180px' }}
      >
        {/* Drag handle */}
        <button
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          className="w-full py-3 flex justify-center"
        >
          <ChevronUp
            className={cn(
              'w-6 h-6 text-secondary-400 transition-transform',
              isStatsExpanded && 'rotate-180'
            )}
          />
        </button>

        <div className="px-6 pb-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 text-secondary-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                <p className="text-xs text-secondary-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {!isTracking ? (
              <Button
                size="lg"
                onClick={handleStartTracking}
                className="w-48 h-14 rounded-full"
              >
                <Play className="w-6 h-6 mr-2" />
                {elapsedTime > 0 ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handlePauseTracking}
                  className="w-14 h-14 rounded-full"
                >
                  <Pause className="w-6 h-6" />
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleStopTracking}
                  className="w-14 h-14 rounded-full"
                >
                  <Square className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Expanded Stats */}
          {isStatsExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 pt-6 border-t border-secondary-100"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <p className="text-sm text-secondary-500">Speed</p>
                  <p className="text-xl font-bold text-secondary-900">
                    {speed ? `${(speed * 3.6).toFixed(1)} km/h` : '--'}
                  </p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <p className="text-sm text-secondary-500">Accuracy</p>
                  <p className="text-xl font-bold text-secondary-900">
                    {accuracy ? `±${Math.round(accuracy)}m` : '--'}
                  </p>
                </div>
              </div>
              
              {activeSession && (
                <div className="mt-4 p-4 bg-primary-50 rounded-xl">
                  <p className="text-sm text-primary-600 font-medium mb-2">
                    Active Session
                  </p>
                  <p className="text-lg font-bold text-secondary-900">
                    {activeSession.name}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {activeSession.participants.length} runners
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

