'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  Users,
  TrendingUp,
  Clock,
  Footprints,
  Shield,
  ChevronRight,
  AlertTriangle,
  MapPin,
  Zap,
  Plus,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useRunStore } from '@/stores/run.store';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistance, formatDuration, cn } from '@/lib/utils';

interface Session {
  id: string;
  name: string;
  status: string;
  participantCount: number;
  creator: {
    displayName: string;
  };
}

interface Profile {
  stats: {
    totalDistance: number;
    totalRuns: number;
    totalDuration: number;
    averagePace: number | null;
  };
  safetySettings: {
    autoSOSEnabled: boolean;
    fallDetectionEnabled: boolean;
  };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeSession } = useRunStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, sessionsData] = await Promise.all([
          api.getProfile(),
          api.getSessions({ limit: 5 }),
        ]);
        setProfile(profileData);
        setRecentSessions(sessionsData.sessions);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Distance',
      value: formatDistance(profile?.stats.totalDistance || 0),
      icon: Footprints,
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-100 dark:bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
    {
      label: 'Total Runs',
      value: profile?.stats.totalRuns || 0,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100 dark:bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      label: 'Time Running',
      value: formatDuration(profile?.stats.totalDuration || 0),
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100 dark:bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Avg Pace',
      value: profile?.stats.averagePace 
        ? `${profile.stats.averagePace.toFixed(1)} min/km`
        : '--',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100 dark:bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Runner'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Ready for your next run?
          </p>
        </div>
        <Link href="/run">
          <Button 
            size="lg" 
            leftIcon={<Play className="w-5 h-5" />}
          >
            Start Running
          </Button>
        </Link>
      </motion.div>

      {/* Active Session Alert */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Link href="/run">
            <div 
              className="rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FF8A2B 0%, #FF6A00 100%)',
                boxShadow: '0 8px 32px rgba(255, 140, 0, 0.35)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Active Session</p>
                    <p className="text-lg font-semibold text-white">{activeSession.name}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card padding="md">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  stat.bgColor
                )}>
                  <stat.icon className={cn('w-6 h-6', stat.iconColor)} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Safety Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div 
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: 'rgba(var(--muted), 0.5)',
                }}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Auto SOS</span>
                </div>
                <span className={cn(
                  'badge',
                  profile?.safetySettings.autoSOSEnabled ? 'badge-success' : 'badge-secondary'
                )}>
                  {profile?.safetySettings.autoSOSEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div 
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: 'rgba(var(--muted), 0.5)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Fall Detection</span>
                </div>
                <span className={cn(
                  'badge',
                  profile?.safetySettings.fallDetectionEnabled ? 'badge-success' : 'badge-secondary'
                )}>
                  {profile?.safetySettings.fallDetectionEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <Link href="/settings">
                <Button variant="ghost" fullWidth rightIcon={<ChevronRight className="w-5 h-5" />}>
                  Manage Safety Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/5 group"
                      style={{
                        background: 'rgba(var(--muted), 0.3)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{session.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {session.participantCount} runners • {session.status}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No recent sessions</p>
                  <Link href="/sessions">
                    <Button variant="ghost" size="sm" className="mt-3">
                      Browse Sessions
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card padding="none">
          <CardHeader className="p-6 pb-0">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/sessions/create">
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="h-auto py-6 flex-col gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Create Session</span>
                </Button>
              </Link>
              <Link href="/sessions">
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="h-auto py-6 flex-col gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Join Session</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="h-auto py-6 flex-col gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Safety Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
