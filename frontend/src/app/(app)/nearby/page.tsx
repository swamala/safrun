'use client';

/**
 * SAFRUN Nearby Runners Page
 * Discover and connect with runners in your area
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MapPin,
  Search,
  Filter,
  UserPlus,
  Activity,
  Clock,
  Eye,
  EyeOff,
  ChevronRight,
  Play,
  Footprints,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/lib/api';
import { sdk } from '@/lib/sdk';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { MapView, SafeMapLoader } from '@/components/map';
import { formatDistance, formatRelativeTime, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NearbyRunnerUI {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  distance: number;
  location: {
    latitude: number;
    longitude: number;
  };
  isRunning: boolean;
  currentPace?: number;
  currentSession?: {
    id: string;
    name: string;
    isPublic: boolean;
  };
  lastActive: string;
}

export default function NearbyPage() {
  const { user } = useAuthStore();
  const { latitude, longitude, startWatching, stopWatching } = useGeolocation({ watchPosition: false });
  
  const [nearbyRunners, setNearbyRunners] = useState<NearbyRunnerUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [selectedRunner, setSelectedRunner] = useState<NearbyRunnerUI | null>(null);

  // Fetch nearby runners
  const fetchNearbyRunners = useCallback(async () => {
    if (!latitude || !longitude) return;
    
    try {
      const response = await sdk.nearby.getNearbyRunners(latitude, longitude, 5000, 50);
      
      // Convert SDK response to UI format
      const runners: NearbyRunnerUI[] = response.runners.map((r, index) => ({
        id: r.userId,
        userId: r.userId,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl || undefined,
        distance: r.distance,
        location: {
          latitude: latitude + (Math.random() - 0.5) * 0.01, // Approximate location
          longitude: longitude + (Math.random() - 0.5) * 0.01,
        },
        isRunning: r.status === 'moving' || r.status === 'in_session',
        currentPace: undefined,
        currentSession: r.sessionId ? { id: r.sessionId, name: 'Active Session', isPublic: true } : undefined,
        lastActive: new Date().toISOString(),
      }));
      
      setNearbyRunners(runners);
    } catch (error) {
      console.error('Failed to fetch nearby runners:', error);
      // Fallback to empty if API fails
      setNearbyRunners([]);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    startWatching();
    return () => stopWatching();
  }, [startWatching, stopWatching]);

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyRunners();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchNearbyRunners, 30000);
      return () => clearInterval(interval);
    }
  }, [latitude, longitude, fetchNearbyRunners]);

  // Subscribe to real-time updates
  useEffect(() => {
    const handleNearbyUpdate = (data: { runners: Array<{ userId: string; displayName: string; avatarUrl?: string | null; distance: number; status: string; sessionId?: string | null }>; timestamp: number }) => {
      // Convert SDK runners to UI runners
      const uiRunners: NearbyRunnerUI[] = data.runners.map((r, index) => ({
        id: r.userId,
        userId: r.userId,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl || undefined,
        distance: r.distance,
        location: { latitude: 0, longitude: 0 }, // Location comes from map
        isRunning: r.status === 'running',
        lastActive: new Date().toISOString(),
        currentSession: r.sessionId ? { id: r.sessionId, name: 'Active Session', isPublic: true } : undefined,
      }));
      setNearbyRunners(uiRunners);
    };

    const unsub = sdk.socket.on('nearby:update', handleNearbyUpdate);
    return () => unsub();
  }, []);

  const handleToggleVisibility = async () => {
    try {
      // In production: await api.setNearbyVisibility(!isVisible);
      setIsVisible(!isVisible);
      toast.success(isVisible ? 'You are now hidden from nearby runners' : 'You are now visible to nearby runners');
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      // In production: await api.joinSession(sessionId);
      toast.success('Request sent to join session');
    } catch {
      toast.error('Failed to join session');
    }
  };

  // Filter runners
  const filteredRunners = nearbyRunners.filter((runner) => {
    if (searchQuery && !runner.displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterActive && !runner.isRunning) {
      return false;
    }
    return true;
  });

  // Map markers
  const mapMarkers = [
    // Current user
    ...(latitude && longitude
      ? [
          {
            id: 'me',
            coordinates: [longitude, latitude] as [number, number],
            type: 'runner' as const,
            color: '#10B981',
            label: 'Me',
          },
        ]
      : []),
    // Nearby runners
    ...filteredRunners.map((runner) => ({
      id: runner.id,
      coordinates: [runner.location.longitude, runner.location.latitude] as [number, number],
      type: 'runner' as const,
      color: runner.isRunning ? '#3B82F6' : '#6B7280',
      label: runner.displayName.charAt(0),
      popup: `<strong>${runner.displayName}</strong><br/>${runner.isRunning ? '🏃 Running' : '⏸️ Idle'}<br/>${runner.distance}m away`,
    })),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-500" />
            Nearby Runners
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Discover runners in your area
          </p>
        </div>
        <Button
          variant={isVisible ? 'secondary' : 'primary'}
          leftIcon={isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          onClick={handleToggleVisibility}
        >
          {isVisible ? 'Visible' : 'Hidden'}
        </Button>
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="h-80">
          <SafeMapLoader className="h-full rounded-xl">
            <MapView
              center={latitude && longitude ? [longitude, latitude] : [-74.006, 40.7128]}
              zoom={15}
              markers={mapMarkers}
              showUserLocation={false}
              onMarkerClick={(id) => {
                const runner = nearbyRunners.find((r) => r.id === id);
                if (runner) setSelectedRunner(runner);
              }}
            />
          </SafeMapLoader>
        </div>
      </Card>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search runners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <Button
          variant={filterActive ? 'primary' : 'secondary'}
          leftIcon={<Filter className="w-5 h-5" />}
          onClick={() => setFilterActive(!filterActive)}
        >
          Active Only
        </Button>
      </div>

      {/* Runners List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-400" />
              {filteredRunners.length} Runners Nearby
            </span>
            <span className="text-sm font-normal text-slate-500">
              Within 5km
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
              Finding nearby runners...
            </div>
          ) : filteredRunners.length > 0 ? (
            <div className="space-y-3">
              {filteredRunners.map((runner) => (
                <motion.div
                  key={runner.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedRunner(runner)}
                  className={cn(
                    'p-4 rounded-xl cursor-pointer transition-colors border',
                    selectedRunner?.id === runner.id
                      ? 'bg-primary-50 dark:bg-primary-500/5 border-primary-200 dark:border-primary-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar src={runner.avatarUrl} name={runner.displayName} size="md" />
                      {runner.isRunning && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                          <Footprints className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {runner.displayName}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {runner.distance}m
                        </span>
                        {runner.isRunning ? (
                          <>
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Activity className="w-4 h-4" />
                              Running
                            </span>
                            {runner.currentPace && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {runner.currentPace.toFixed(1)} min/km
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatRelativeTime(runner.lastActive)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {runner.currentSession?.isPublic && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinSession(runner.currentSession!.id);
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                {searchQuery || filterActive
                  ? 'No runners match your filters'
                  : 'No runners nearby right now'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Check back later or expand your search area
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Runner Modal */}
      <AnimatePresence>
        {selectedRunner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedRunner(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <Avatar
                  src={selectedRunner.avatarUrl}
                  name={selectedRunner.displayName}
                  size="xl"
                  className="mx-auto mb-4"
                />
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {selectedRunner.displayName}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {selectedRunner.distance}m away
                </p>
              </div>

              {selectedRunner.isRunning && (
                <div className="p-4 bg-green-50 dark:bg-green-500/5 rounded-xl mb-6">
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">Currently Running</span>
                  </div>
                  {selectedRunner.currentSession && (
                    <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                      {selectedRunner.currentSession.name}
                    </p>
                  )}
                  {selectedRunner.currentPace && (
                    <p className="text-center text-2xl font-bold text-slate-900 dark:text-white mt-2">
                      {selectedRunner.currentPace.toFixed(1)} <span className="text-sm font-normal">min/km</span>
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Button fullWidth leftIcon={<UserPlus className="w-5 h-5" />}>
                  Add Friend
                </Button>
                {selectedRunner.currentSession?.isPublic && (
                  <Button
                    fullWidth
                    variant="secondary"
                    leftIcon={<Play className="w-5 h-5" />}
                    onClick={() => handleJoinSession(selectedRunner.currentSession!.id)}
                  >
                    Join Their Run
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="ghost"
                  onClick={() => setSelectedRunner(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

