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
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useRunStore } from '@/stores/run.store';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistance, formatDuration, formatPace } from '@/lib/utils';

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
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Total Runs',
      value: profile?.stats.totalRuns || 0,
      icon: TrendingUp,
      color: 'text-safety-500',
      bgColor: 'bg-safety-50',
    },
    {
      label: 'Time Running',
      value: formatDuration(profile?.stats.totalDuration || 0),
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Avg Pace',
      value: profile?.stats.averagePace 
        ? `${profile.stats.averagePace.toFixed(1)} min/km`
        : '--',
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Runner'}! 👋
          </h1>
          <p className="text-secondary-600 mt-1">Ready for your next run?</p>
        </div>
        <Link href="/run">
          <Button size="lg" className="w-full sm:w-auto">
            <Play className="w-5 h-5 mr-2" />
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
            <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Active Session</p>
                    <p className="text-lg font-semibold">{activeSession.name}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6" />
              </CardContent>
            </Card>
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
            transition={{ delay: index * 0.1 }}
          >
            <Card padding="md">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">{stat.label}</p>
                  <p className="text-lg font-bold text-secondary-900">{stat.value}</p>
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
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-safety-500" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-secondary-500" />
                  <span className="font-medium">Auto SOS</span>
                </div>
                <span className={`badge ${profile?.safetySettings.autoSOSEnabled ? 'badge-success' : 'badge-secondary'}`}>
                  {profile?.safetySettings.autoSOSEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-secondary-500" />
                  <span className="font-medium">Fall Detection</span>
                </div>
                <span className={`badge ${profile?.safetySettings.fallDetectionEnabled ? 'badge-success' : 'badge-secondary'}`}>
                  {profile?.safetySettings.fallDetectionEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <Link href="/settings">
                <Button variant="ghost" className="w-full justify-between">
                  Manage Safety Settings
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{session.name}</p>
                          <p className="text-sm text-secondary-500">
                            {session.participantCount} runners • {session.status}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-secondary-400" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">No recent sessions</p>
                  <Link href="/sessions">
                    <Button variant="ghost" size="sm" className="mt-2">
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
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/sessions/create">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span>Create Session</span>
                </Button>
              </Link>
              <Link href="/sessions">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <MapPin className="w-6 h-6" />
                  <span>Join Session</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Shield className="w-6 h-6" />
                  <span>Safety Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

