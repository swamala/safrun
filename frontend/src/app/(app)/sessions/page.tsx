'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Filter,
  Search,
  Play,
} from 'lucide-react';
import { sdk } from '@/lib/sdk';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Session as SDKSession, SessionStatus } from '@safrun/sdk';

const statusColors: Record<SessionStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-safety-100 text-safety-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-secondary-100 text-secondary-600',
  CANCELLED: 'bg-danger-100 text-danger-600',
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SDKSession[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        let status: string | undefined;
        if (filter === 'active') status = 'ACTIVE';
        if (filter === 'scheduled') status = 'SCHEDULED';

        const data = await sdk.sessions.getMySessions(status, 50);
        setSessions(data.sessions);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, [filter]);

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinSession = async (sessionId: string) => {
    try {
      await sdk.sessions.joinSession(sessionId);
      // Refresh sessions
      const data = await sdk.sessions.getMySessions(undefined, 50);
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Running Sessions</h1>
          <p className="text-secondary-600">Join a group run or create your own</p>
        </div>
        <Link href="/sessions/create">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Create Session
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'scheduled', 'mine'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'mine' ? 'My Sessions' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className={cn('badge', statusColors[session.status])}>
                      {session.status === 'ACTIVE' && (
                        <span className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse" />
                      )}
                      {session.status}
                    </span>
                    <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded">
                      {session.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {session.title}
                  </h3>
                  
                  {session.description && (
                    <p className="text-sm text-secondary-500 mb-4 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-secondary-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{session.participantCount}/{session.maxParticipants}</span>
                    </div>
                    {(session.scheduledAt || session.startedAt) && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatRelativeTime((session.startedAt || session.scheduledAt)?.toString() || '')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-secondary-100">
                    {session.participants.length > 0 && (
                      <>
                        <Avatar
                          src={session.participants.find(p => p.userId === session.hostId)?.avatarUrl || undefined}
                          name={session.participants.find(p => p.userId === session.hostId)?.displayName || 'Host'}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">
                            {session.participants.find(p => p.userId === session.hostId)?.displayName || 'Host'}
                          </p>
                          <p className="text-xs text-secondary-500">Organizer</p>
                        </div>
                      </>
                    )}
                    {session.status === 'ACTIVE' || session.status === 'SCHEDULED' ? (
                      <Button
                        size="sm"
                        onClick={() => handleJoinSession(session.id)}
                      >
                        Join
                      </Button>
                    ) : (
                      <Link href={`/sessions/${session.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No sessions found
            </h3>
            <p className="text-secondary-500 mb-6">
              {filter === 'mine'
                ? "You haven't joined any sessions yet"
                : 'No sessions match your search'}
            </p>
            <Link href="/sessions/create">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Create Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

