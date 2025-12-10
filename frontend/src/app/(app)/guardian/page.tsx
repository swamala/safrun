'use client';

/**
 * SAFRUN Guardian Mode Page
 * View and monitor protected runners in real-time
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  MapPin,
  Activity,
  AlertTriangle,
  Clock,
  Plus,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { sdk } from '@/lib/sdk';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { GuardianMap, SafeMapLoader } from '@/components/map';
import { formatDistance, formatRelativeTime, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Ward {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
  currentSession?: {
    id: string;
    name: string;
    distance: number;
    pace: number;
  };
  hasActiveAlert?: boolean;
  alertStatus?: string;
  addedAt: string;
}

export default function GuardianPage() {
  const { user } = useAuthStore();
  
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Fetch wards (people you're guarding)
  // Note: Guardian API endpoints need to be implemented in backend
  // Currently using emergency contacts from profile API
  const fetchWards = useCallback(async () => {
    try {
      // Get emergency contacts as potential wards
      const contacts = await sdk.profile.getEmergencyContacts();
      
      // Convert emergency contacts to ward format
      const wardsFromContacts: Ward[] = contacts.map((contact: any, index: number) => ({
        id: contact.id || `ward-${index}`,
        userId: contact.id || `user-${index}`,
        displayName: contact.name || contact.displayName || 'Contact',
        isActive: false, // Would need real tracking data
        location: undefined,
        addedAt: contact.createdAt || new Date().toISOString(),
      }));
      
      setWards(wardsFromContacts.length > 0 ? wardsFromContacts : []);
    } catch (error) {
      console.error('Failed to fetch wards:', error);
      setWards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  // Subscribe to real-time updates
  useEffect(() => {
    const handleLocationUpdate = (data: {
      userId: string;
      latitude: number;
      longitude: number;
    }) => {
      setWards((prev) =>
        prev.map((ward) =>
          ward.userId === data.userId
            ? {
                ...ward,
                location: {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  lastUpdated: new Date().toISOString(),
                },
              }
            : ward
        )
      );
    };

    const handleSOSAlert = (data: { userId: string; alertId: string }) => {
      setWards((prev) =>
        prev.map((ward) =>
          ward.userId === data.userId
            ? { ...ward, hasActiveAlert: true, alertStatus: 'ACTIVE' }
            : ward
        )
      );
      toast.error('🚨 SOS Alert from one of your wards!');
    };

    const unsubLocation = sdk.socket.on('location:broadcast', handleLocationUpdate);
    const unsubSOS = sdk.socket.on('sos:guardian-alert', handleSOSAlert);

    return () => {
      unsubLocation();
      unsubSOS();
    };
  }, []);

  const handleAddWard = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      // In production: await api.sendGuardianInvite(inviteEmail);
      toast.success(`Guardian invite sent to ${inviteEmail}`);
      setShowAddModal(false);
      setInviteEmail('');
    } catch {
      toast.error('Failed to send invite');
    }
  };

  const selectedWard = wards.find((w) => w.id === selectedWardId);

  // Prepare map data
  const mapWards = wards
    .filter((w) => w.location)
    .map((w) => ({
      id: w.id,
      name: w.displayName,
      avatarUrl: w.avatarUrl,
      location: {
        latitude: w.location!.latitude,
        longitude: w.location!.longitude,
      },
      isActive: w.isActive,
      pace: w.currentSession?.pace,
      distance: w.currentSession?.distance,
      hasAlert: w.hasActiveAlert,
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-500" />
            Guardian Mode
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Monitor and protect your runners
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setShowAddModal(true)}
        >
          Add Ward
        </Button>
      </div>

      {/* Alert Banner */}
      {wards.some((w) => w.hasActiveAlert) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center relative">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div className="absolute inset-0 bg-red-100 dark:bg-red-500/10 rounded-full animate-ping" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-700 dark:text-red-400">
                  Active SOS Alert!
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  One or more of your wards has triggered an SOS
                </p>
              </div>
              <Button variant="danger" size="sm">
                View Alert
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Map View */}
      <Card className="overflow-hidden">
        <div className="h-96">
          <SafeMapLoader className="h-full rounded-xl">
            <GuardianMap
              wards={mapWards}
              selectedWardId={selectedWardId || undefined}
              onWardSelect={setSelectedWardId}
            />
          </SafeMapLoader>
        </div>
      </Card>

      {/* Wards List */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wards */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                Your Wards ({wards.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="py-8 text-center text-slate-500">Loading...</div>
              ) : wards.length > 0 ? (
                wards.map((ward) => (
                  <motion.div
                    key={ward.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedWardId(ward.id)}
                    className={cn(
                      'p-4 rounded-xl cursor-pointer transition-colors border',
                      selectedWardId === ward.id
                        ? 'bg-primary-50 dark:bg-primary-500/5 border-primary-200 dark:border-primary-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar
                          src={ward.avatarUrl}
                          name={ward.displayName}
                          size="md"
                        />
                        {ward.isActive && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                        )}
                        {ward.hasActiveAlert && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {ward.displayName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {ward.isActive ? (
                            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                              <Activity className="w-4 h-4" />
                              Running
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <Clock className="w-4 h-4" />
                              Last seen {formatRelativeTime(ward.location?.lastUpdated || ward.addedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {ward.isActive && ward.currentSession && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {formatDistance(ward.currentSession.distance)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {ward.currentSession.pace.toFixed(1)} min/km
                            </p>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Shield className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    You haven&apos;t added any wards yet
                  </p>
                  <Button
                    leftIcon={<Plus className="w-5 h-5" />}
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Your First Ward
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Ward Details */}
        <div>
          <AnimatePresence mode="wait">
            {selectedWard ? (
              <motion.div
                key={selectedWard.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Ward Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={selectedWard.avatarUrl}
                        name={selectedWard.displayName}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold text-lg text-slate-900 dark:text-white">
                          {selectedWard.displayName}
                        </p>
                        <span className={cn(
                          'badge',
                          selectedWard.isActive ? 'badge-success' : 'badge-secondary'
                        )}>
                          {selectedWard.isActive ? 'Active' : 'Idle'}
                        </span>
                      </div>
                    </div>

                    {selectedWard.location && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Last Known Location
                        </p>
                        <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                          {selectedWard.location.latitude.toFixed(6)}, {selectedWard.location.longitude.toFixed(6)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Updated {formatRelativeTime(selectedWard.location.lastUpdated)}
                        </p>
                      </div>
                    )}

                    {selectedWard.currentSession && (
                      <div className="p-4 bg-green-50 dark:bg-green-500/5 rounded-xl">
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Current Session
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {selectedWard.currentSession.name}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-slate-500">Distance</p>
                            <p className="font-semibold">{formatDistance(selectedWard.currentSession.distance)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Pace</p>
                            <p className="font-semibold">{selectedWard.currentSession.pace.toFixed(1)} min/km</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button fullWidth variant="secondary" leftIcon={<Eye className="w-5 h-5" />}>
                        View Full History
                      </Button>
                      {selectedWard.hasActiveAlert && (
                        <Button fullWidth variant="danger" leftIcon={<AlertTriangle className="w-5 h-5" />}>
                          Respond to Alert
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card>
                  <CardContent className="py-12 text-center">
                    <Eye className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Select a ward to view details
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Ward Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                Add a Ward
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Send an invite to become someone&apos;s guardian. They&apos;ll need to accept your request.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="runner@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    leftIcon={<Check className="w-5 h-5" />}
                    onClick={handleAddWard}
                    disabled={!inviteEmail.trim()}
                  >
                    Send Invite
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

