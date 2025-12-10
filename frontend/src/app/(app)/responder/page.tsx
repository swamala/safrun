'use client';

/**
 * SAFRUN Responder Mode Page
 * Navigate to and help runners in distress
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  AlertTriangle,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  Users,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useSocket } from '@/hooks/useSocket';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/lib/api';
import { sdk } from '@/lib/sdk';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ResponderMap, SafeMapLoader } from '@/components/map';
import { formatDistance, formatRelativeTime, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SOSAlert {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  triggeredAt: string;
  status: 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'FALSE_ALARM';
  triggerType: string;
  distance?: number;
  responders?: Array<{
    id: string;
    displayName: string;
    status: 'NOTIFIED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED';
    avatarUrl?: string;
    location?: { latitude: number; longitude: number };
  }>;
}

type RespondingStatus = 'idle' | 'en_route' | 'arrived';

export default function ResponderPage() {
  const { user } = useAuthStore();
  const { updateLocation: sendLocation } = useSocket();
  const { latitude, longitude, startWatching, stopWatching } = useGeolocation({ watchPosition: false });
  
  const [nearbyAlerts, setNearbyAlerts] = useState<SOSAlert[]>([]);
  const [activeResponse, setActiveResponse] = useState<SOSAlert | null>(null);
  const [respondingStatus, setRespondingStatus] = useState<RespondingStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch nearby alerts
  const fetchNearbyAlerts = useCallback(async () => {
    if (!latitude || !longitude) return;
    
    try {
      const alertsData = await sdk.sos.getNearbyAlerts(latitude, longitude);
      
      // Convert SDK response to UI format
      const alerts: SOSAlert[] = alertsData.map((alert: any) => ({
        id: alert.id,
        userId: alert.userId,
        displayName: alert.userName || 'Unknown',
        location: {
          latitude: alert.location?.latitude || latitude,
          longitude: alert.location?.longitude || longitude,
        },
        triggeredAt: alert.triggeredAt?.toString() || new Date().toISOString(),
        status: alert.status,
        triggerType: alert.triggerType,
        distance: alert.distance,
        responders: alert.responders?.map((r: any) => ({
          id: r.id,
          displayName: r.displayName,
          status: r.status,
        })),
      }));
      
      setNearbyAlerts(alerts);
    } catch (error) {
      console.error('Failed to fetch nearby alerts:', error);
      setNearbyAlerts([]);
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
      fetchNearbyAlerts();
    }
  }, [latitude, longitude, fetchNearbyAlerts]);

  // Subscribe to real-time SOS alerts
  useEffect(() => {
    const handleSOSAlert = (data: {
      alertId: string;
      userId: string;
      userName: string;
      location: { latitude: number; longitude: number };
      triggeredAt: Date;
    }) => {
      const newAlert: SOSAlert = {
        id: data.alertId,
        userId: data.userId,
        displayName: data.userName,
        location: data.location,
        triggeredAt: data.triggeredAt.toString(),
        status: 'ACTIVE',
        triggerType: 'MANUAL',
      };
      setNearbyAlerts((prev) => [newAlert, ...prev]);
      toast('🚨 New SOS alert nearby!', {
        icon: '🆘',
        duration: 5000,
      });
    };

    const handleAlertUpdate = (data: { alertId: string; type: string }) => {
      if (data.type === 'SOS_RESOLVED') {
        setNearbyAlerts((prev) =>
          prev.map((alert) =>
            alert.id === data.alertId
              ? { ...alert, status: 'RESOLVED' as const }
              : alert
          )
        );
        
        if (activeResponse?.id === data.alertId) {
          toast.success('Alert has been resolved');
          setActiveResponse(null);
          setRespondingStatus('idle');
        }
      }
    };

    const unsubAlert = sdk.socket.on('sos:broadcast', handleSOSAlert);
    const unsubUpdate = sdk.socket.on('sos:update', handleAlertUpdate);

    return () => {
      unsubAlert();
      unsubUpdate();
    };
  }, [activeResponse]);

  // Send location updates while responding
  useEffect(() => {
    if (respondingStatus !== 'idle' && latitude && longitude && activeResponse) {
      const interval = setInterval(() => {
        // In production: await api.updateResponderLocation(activeResponse.id, latitude, longitude);
        sendLocation(latitude, longitude, 0, 0, undefined);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [respondingStatus, latitude, longitude, activeResponse, sendLocation]);

  const handleAcceptAlert = async (alert: SOSAlert) => {
    try {
      // In production: await api.respondToSOS(alert.id, true);
      setActiveResponse(alert);
      setRespondingStatus('en_route');
      toast.success('Response accepted - navigating to incident');
    } catch {
      toast.error('Failed to accept response');
    }
  };

  const handleArrived = async () => {
    if (!activeResponse) return;
    
    try {
      // In production: await api.markArrived(activeResponse.id);
      setRespondingStatus('arrived');
      toast.success('Marked as arrived');
    } catch {
      toast.error('Failed to mark arrival');
    }
  };

  const handleCancelResponse = async () => {
    if (!activeResponse) return;
    
    try {
      // In production: await api.cancelResponse(activeResponse.id);
      setActiveResponse(null);
      setRespondingStatus('idle');
      toast('Response cancelled');
    } catch {
      toast.error('Failed to cancel response');
    }
  };

  const myLocation = latitude && longitude ? { latitude, longitude } : { latitude: 40.7128, longitude: -74.006 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            Responder Mode
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Help runners in distress nearby
          </p>
        </div>
        {respondingStatus !== 'idle' && (
          <Button variant="secondary" onClick={handleCancelResponse}>
            <X className="w-5 h-5 mr-2" />
            Cancel Response
          </Button>
        )}
      </div>

      {/* Active Response Map */}
      {activeResponse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden">
            <div className="h-80">
              <SafeMapLoader className="h-full rounded-xl">
                <ResponderMap
                  responderLocation={myLocation}
                  incidentLocation={activeResponse.location}
                  otherResponders={activeResponse.responders?.filter(r => r.location).map(r => ({
                    id: r.id,
                    name: r.displayName,
                    location: r.location!,
                  }))}
                />
              </SafeMapLoader>
            </div>
            
            {/* Response Status Bar */}
            <div className="p-4 bg-red-50 dark:bg-red-500/5 border-t border-red-200 dark:border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center relative">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-500/10 rounded-full animate-ping" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Responding to {activeResponse.displayName}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {activeResponse.distance ? `${Math.round(activeResponse.distance)}m away` : 'Calculating distance...'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {respondingStatus === 'en_route' && (
                    <Button variant="success" onClick={handleArrived}>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      I&apos;ve Arrived
                    </Button>
                  )}
                  {respondingStatus === 'arrived' && (
                    <span className="badge badge-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      On Scene
                    </span>
                  )}
                </div>
              </div>

              {/* Response Actions */}
              <div className="flex gap-3 mt-4">
                <Button variant="secondary" size="sm" fullWidth>
                  <Phone className="w-4 h-4 mr-2" />
                  Call 911
                </Button>
                <Button variant="secondary" size="sm" fullWidth>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="secondary" size="sm" fullWidth>
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigate
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Nearby Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Nearby SOS Alerts ({nearbyAlerts.filter(a => a.status === 'ACTIVE').length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
              Loading nearby alerts...
            </div>
          ) : nearbyAlerts.filter(a => a.status === 'ACTIVE').length > 0 ? (
            <div className="space-y-3">
              {nearbyAlerts
                .filter((a) => a.status === 'ACTIVE')
                .map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'p-4 rounded-xl border transition-colors',
                      activeResponse?.id === alert.id
                        ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar src={alert.avatarUrl} name={alert.displayName} size="md" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {alert.displayName}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {alert.distance ? `${Math.round(alert.distance)}m` : 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatRelativeTime(alert.triggeredAt)}
                          </span>
                          {alert.responders && alert.responders.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {alert.responders.length} responding
                            </span>
                          )}
                        </div>
                      </div>

                      {activeResponse?.id !== alert.id && (
                        <Button variant="danger" size="sm" onClick={() => handleAcceptAlert(alert)}>
                          Respond
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Shield className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                No active SOS alerts nearby
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Stay alert - you&apos;ll be notified when someone needs help
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responder Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Responses</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">3.2 min</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Avg Response Time</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">Gold</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Responder Level</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

