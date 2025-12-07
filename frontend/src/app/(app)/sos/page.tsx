'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  Phone,
  MapPin,
  Clock,
  Users,
  Check,
  X,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { useSOSStore } from '@/stores/sos.store';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SOSPage() {
  const {
    activeAlert,
    nearbyAlerts,
    showVerification,
    verificationCountdown,
    setActiveAlert,
    showVerificationModal,
    setVerificationCountdown,
    clearSOS,
  } = useSOSStore();
  
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const [isTriggering, setIsTriggering] = useState(false);
  const [sosHistory, setSOSHistory] = useState<Array<{
    id: string;
    status: string;
    triggerType: string;
    triggeredAt: string;
  }>>([]);

  // Countdown timer for verification
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVerification && verificationCountdown > 0) {
      timer = setInterval(() => {
        setVerificationCountdown(verificationCountdown - 1);
      }, 1000);
    } else if (verificationCountdown === 0 && showVerification) {
      handleVerifyResponse(false);
    }
    return () => clearInterval(timer);
  }, [showVerification, verificationCountdown, setVerificationCountdown]);

  // Fetch SOS history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getSOSHistory(10);
        setSOSHistory(data.alerts);
      } catch {
        // Handle error
      }
    };
    fetchHistory();

    const checkActive = async () => {
      try {
        const alert = await api.getActiveSOSAlert();
        if (alert) {
          setActiveAlert(alert);
        }
      } catch {
        // No active alert
      }
    };
    checkActive();
  }, [setActiveAlert]);

  const handleTriggerSOS = async () => {
    getCurrentPosition();
    
    if (!latitude || !longitude) {
      toast.error('Unable to get your location');
      return;
    }

    setIsTriggering(true);

    try {
      const response = await api.triggerSOS({
        latitude,
        longitude,
        triggerType: 'MANUAL',
        batteryLevel: 80,
      });

      setActiveAlert(response);
      showVerificationModal(true);
      setVerificationCountdown(10);
      toast('SOS triggered - confirm your status');
    } catch (error) {
      toast.error('Failed to trigger SOS');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleVerifyResponse = async (isSafe: boolean) => {
    if (!activeAlert) return;

    try {
      await api.verifySOS(activeAlert.id, isSafe);
      showVerificationModal(false);

      if (isSafe) {
        toast.success('SOS cancelled - stay safe!');
        clearSOS();
      } else {
        toast('Help is on the way!', { icon: '🆘' });
      }
    } catch {
      toast.error('Failed to verify SOS');
    }
  };

  const handleResolveAlert = async () => {
    if (!activeAlert) return;

    try {
      await api.resolveSOSAlert(activeAlert.id);
      clearSOS();
      toast.success('SOS resolved - glad you\'re safe!');
    } catch {
      toast.error('Failed to resolve SOS');
    }
  };

  const handleRespondToAlert = async (alertId: string, accepted: boolean) => {
    try {
      await api.acknowledgeSOS(alertId, accepted);
      toast.success(accepted ? 'Thank you for responding!' : 'Response recorded');
    } catch {
      toast.error('Failed to respond');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Verification Modal */}
      <AnimatePresence>
        {showVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
              }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center relative">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <div className="absolute inset-0 bg-red-100 dark:bg-red-500/10 rounded-full animate-ping" />
              </div>
              
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Are you safe?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Respond within {verificationCountdown} seconds or SOS will be activated
              </p>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6 overflow-hidden">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(verificationCountdown / 10) * 100}%` }}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="success"
                  size="lg"
                  fullWidth
                  leftIcon={<Check className="w-5 h-5" />}
                  onClick={() => handleVerifyResponse(true)}
                >
                  I&apos;m Safe
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  fullWidth
                  leftIcon={<X className="w-5 h-5" />}
                  onClick={() => handleVerifyResponse(false)}
                >
                  Need Help
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Alert */}
      {activeAlert && activeAlert.status === 'ACTIVE' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center relative">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-500/10 rounded-full animate-ping" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">SOS Active</p>
                    <p className="text-sm text-red-600 dark:text-red-300">Help is being notified</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={handleResolveAlert}>
                  I&apos;m Safe Now
                </Button>
              </div>

              {activeAlert.responders && activeAlert.responders.length > 0 && (
                <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-500/20">
                  <p className="text-sm text-red-600 dark:text-red-300 mb-3">Responders</p>
                  <div className="space-y-2">
                    {activeAlert.responders.map((r) => (
                      <div key={r.id} className="flex items-center justify-between bg-white/50 dark:bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.displayName} size="sm" />
                          <span className="font-medium text-slate-900 dark:text-white">{r.displayName}</span>
                        </div>
                        <span className={cn(
                          'badge',
                          r.status === 'ACCEPTED' ? 'badge-success' : 
                          r.status === 'ARRIVED' ? 'badge-primary' : 'badge-secondary'
                        )}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main SOS Button */}
      {!activeAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-12"
        >
          <button
            onClick={handleTriggerSOS}
            disabled={isTriggering}
            className={cn(
              'w-48 h-48 rounded-full flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95',
              isTriggering && 'opacity-70'
            )}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 8px 40px rgba(239, 68, 68, 0.4)',
            }}
          >
            <AlertTriangle className="w-16 h-16 text-white mb-2" />
            <span className="text-xl font-bold text-white">
              {isTriggering ? 'Triggering...' : 'SOS'}
            </span>
          </button>
          <p className="text-slate-500 dark:text-slate-400 mt-6 text-center max-w-xs">
            Press and hold to trigger emergency alert. Nearby runners and your guardians will be notified.
          </p>
        </motion.div>
      )}

      {/* Nearby Alerts */}
      {nearbyAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Radio className="w-5 h-5" />
              Nearby SOS Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbyAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-200 dark:border-red-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{alert.displayName} needs help</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {Math.round(alert.distance)}m away
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRespondToAlert(alert.id, true)}
                >
                  Respond
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Safety Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Guardian Protection</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your contacts will be notified</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Community Response</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Nearby runners get alerted</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SOS History */}
      <Card padding="none">
        <CardHeader className="p-6 pb-0">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            SOS History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {sosHistory.length > 0 ? (
            <div className="space-y-3">
              {sosHistory.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: 'rgba(var(--muted), 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      alert.status === 'RESOLVED' ? 'bg-green-100 dark:bg-green-500/10' :
                      alert.status === 'FALSE_ALARM' ? 'bg-slate-100 dark:bg-slate-500/10' :
                      'bg-red-100 dark:bg-red-500/10'
                    )}>
                      {alert.status === 'RESOLVED' ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : alert.status === 'FALSE_ALARM' ? (
                        <X className="w-5 h-5 text-slate-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {alert.triggerType.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatRelativeTime(alert.triggeredAt)}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'badge',
                    alert.status === 'RESOLVED' ? 'badge-success' :
                    alert.status === 'FALSE_ALARM' ? 'badge-secondary' :
                    'badge-danger'
                  )}>
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No SOS history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
