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
import { Badge } from '@/components/ui/Badge';
import { formatDistance, formatDuration, cn } from '@/lib/utils';

/**
 * SAFRUN Dashboard Page
 * Uses consistent design system with 18-24px radius, soft shadows
 * Plus Jakarta Sans font, SAFRUN orange gradient
 */

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
      bgColor: 'bg-safrun-500/10',
      iconColor: 'text-safrun-500',
    },
    {
      label: 'Total Runs',
      value: profile?.stats.totalRuns || 0,
      icon: TrendingUp,
      bgColor: 'bg-safety-500/10',
      iconColor: 'text-safety-500',
    },
    {
      label: 'Time Running',
      value: formatDuration(profile?.stats.totalDuration || 0),
      icon: Clock,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Avg Pace',
      value: profile?.stats.averagePace 
        ? `${profile.stats.averagePace.toFixed(1)} min/km`
        : '--',
      icon: Zap,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-safrun-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-light-heading dark:text-text-dark-heading">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Runner'}! 👋
          </h1>
          <p className="text-text-light-body dark:text-text-dark-body mt-1">
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
          transition={{ ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/run">
            <div 
              className={cn(
                'rounded-[24px] p-6 cursor-pointer',
                'bg-gradient-to-r from-safrun-start to-safrun-end',
                'shadow-glow-orange',
                'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-[18px] flex items-center justify-center backdrop-blur-sm">
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
            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card padding="md">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-[18px] flex items-center justify-center',
                  stat.bgColor
                )}>
                  <stat.icon className={cn('w-6 h-6', stat.iconColor)} />
                </div>
                <div>
                  <p className="text-sm text-text-light-body dark:text-text-dark-body">{stat.label}</p>
                  <p className="text-xl font-bold text-text-light-heading dark:text-text-dark-heading">{stat.value}</p>
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
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-safety-500" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div 
                className={cn(
                  'flex items-center justify-between p-4 rounded-[18px]',
                  'bg-navy-100/50 dark:bg-white/[0.03]'
                )}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-text-light-body dark:text-text-dark-body" />
                  <span className="font-medium text-text-light-heading dark:text-text-dark-body">Auto SOS</span>
                </div>
                <Badge variant={profile?.safetySettings.autoSOSEnabled ? 'success' : 'secondary'}>
                  {profile?.safetySettings.autoSOSEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div 
                className={cn(
                  'flex items-center justify-between p-4 rounded-[18px]',
                  'bg-navy-100/50 dark:bg-white/[0.03]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-text-light-body dark:text-text-dark-body" />
                  <span className="font-medium text-text-light-heading dark:text-text-dark-body">Fall Detection</span>
                </div>
                <Badge variant={profile?.safetySettings.fallDetectionEnabled ? 'success' : 'secondary'}>
                  {profile?.safetySettings.fallDetectionEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
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
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-safrun-500" />
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
                      className={cn(
                        'flex items-center justify-between p-4 rounded-[18px]',
                        'bg-navy-100/30 dark:bg-white/[0.02]',
                        'transition-all duration-200',
                        'hover:bg-navy-100 dark:hover:bg-white/[0.05]',
                        'group'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-safrun-500/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-safrun-500" />
                        </div>
                        <div>
                          <p className="font-medium text-text-light-heading dark:text-text-dark-heading">{session.name}</p>
                          <p className="text-sm text-text-light-body dark:text-text-dark-body">
                            {session.participantCount} runners • {session.status}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-navy-300 group-hover:text-safrun-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-navy-200 dark:text-navy-600 mx-auto mb-3" />
                  <p className="text-text-light-body dark:text-text-dark-body">No recent sessions</p>
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
        transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                  className="h-auto py-6 flex-col gap-3 !rounded-[24px]"
                >
                  <div className="w-12 h-12 rounded-[18px] bg-safrun-500/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-safrun-500" />
                  </div>
                  <span className="text-text-light-heading dark:text-text-dark-body">Create Session</span>
                </Button>
              </Link>
              <Link href="/sessions">
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="h-auto py-6 flex-col gap-3 !rounded-[24px]"
                >
                  <div className="w-12 h-12 rounded-[18px] bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-text-light-heading dark:text-text-dark-body">Join Session</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="h-auto py-6 flex-col gap-3 !rounded-[24px]"
                >
                  <div className="w-12 h-12 rounded-[18px] bg-safety-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-safety-500" />
                  </div>
                  <span className="text-text-light-heading dark:text-text-dark-body">Safety Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
