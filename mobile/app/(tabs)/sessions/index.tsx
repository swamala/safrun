/**
 * SAFRUN Sessions List Screen
 * Browse and join running sessions
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Header } from '@/components';
import { SessionCard } from '@/components/ui/SessionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { sdk } from '@/lib/sdk';
import { useRunnerStore } from '@/lib/store';
import type { Session } from '@safrun/sdk';
import {
  UsersIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@/components/Icons';

export default function SessionsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { activeSession, joinSession } = useRunnerStore();
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [nearbySessions, setNearbySessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'nearby' | 'mine'>('all');

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const [allResponse, myResponse] = await Promise.all([
        sdk.sessions.getActiveSessions(20),
        sdk.sessions.getMySessions(undefined, 10),
      ]);
      
      setSessions(allResponse.sessions);
      
      // Get nearby sessions if we have location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const nearbyResponse = await sdk.sessions.getNearbySessions(
          location.coords.latitude,
          location.coords.longitude,
          5000
        );
        setNearbySessions(nearbyResponse.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  }, [fetchSessions]);

  // Handle join session
  const handleJoinSession = async (sessionId: string) => {
    const success = await joinSession(sessionId);
    if (success) {
      router.push(`/(tabs)/sessions/${sessionId}` as any);
    } else {
      Alert.alert('Error', 'Failed to join session');
    }
  };

  // Filter sessions
  const displayedSessions = filter === 'nearby' 
    ? nearbySessions 
    : filter === 'mine' 
      ? sessions.filter(s => s.participants.some(p => p.role === 'HOST'))
      : sessions;

  // Format relative time
  const formatRelativeTime = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 0) {
      const absDiff = Math.abs(diffMins);
      if (absDiff < 60) return `${absDiff}m ago`;
      if (absDiff < 1440) return `${Math.round(absDiff / 60)}h ago`;
      return `${Math.round(absDiff / 1440)}d ago`;
    } else {
      if (diffMins < 60) return `in ${diffMins}m`;
      if (diffMins < 1440) return `in ${Math.round(diffMins / 60)}h`;
      return `in ${Math.round(diffMins / 1440)}d`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="Sessions" 
        rightAction={
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.safrun[500] }]}
            onPress={() => router.push('/(tabs)/sessions/create' as any)}
          >
            <PlusIcon size={20} color={colors.white} />
          </TouchableOpacity>
        }
      />

      {/* Filters */}
      <View style={styles.filters}>
        {(['all', 'nearby', 'mine'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
              { backgroundColor: filter === f ? colors.safrun[500] : isDark ? 'rgba(255,255,255,0.05)' : colors.navy[100] },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? colors.white : theme.text.secondary },
            ]}>
              {f === 'all' ? 'All Active' : f === 'nearby' ? 'Nearby' : 'My Sessions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.safrun[500]}
          />
        }
      >
        {/* Active Session Banner */}
        {activeSession && (
          <TouchableOpacity
            style={[styles.activeSessionBanner, shadows.glowOrange]}
            onPress={() => router.push(`/(tabs)/sessions/${activeSession.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={styles.activeSessionContent}>
              <View style={styles.activeSessionLeft}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Text style={styles.activeSessionName}>{activeSession.title}</Text>
                <Text style={styles.activeSessionMeta}>
                  {activeSession.participantCount} runners
                </Text>
              </View>
              <ChevronRightIcon size={24} color={colors.white} />
            </View>
          </TouchableOpacity>
        )}

        {/* Sessions List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.text.muted }]}>
              Loading sessions...
            </Text>
          </View>
        ) : displayedSessions.length > 0 ? (
          displayedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => router.push(`/(tabs)/sessions/${session.id}` as any)}
              onJoin={() => handleJoinSession(session.id)}
            />
          ))
        ) : (
          <EmptyState
            icon={<UsersIcon size={48} color={theme.text.muted} />}
            title="No sessions found"
            description={
              filter === 'nearby'
                ? 'No active sessions nearby. Create one!'
                : 'Be the first to start a group run'
            }
            actionLabel="Create Session"
            onAction={() => router.push('/(tabs)/sessions/create' as any)}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  filterButtonActive: {},
  filterText: {
    ...textStyles.bodySm,
    fontWeight: fontWeight.medium,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  activeSessionBanner: {
    backgroundColor: colors.safrun[500],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  activeSessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeSessionLeft: {},
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    marginRight: 4,
  },
  liveText: {
    ...textStyles.caption,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  activeSessionName: {
    ...textStyles.h5,
    color: colors.white,
    marginBottom: 2,
  },
  activeSessionMeta: {
    ...textStyles.bodySm,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
  },
  sessionCard: {
    marginBottom: spacing.md,
  },
  sessionContent: {
    padding: spacing.lg,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sessionInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  sessionName: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  sessionDescription: {
    ...textStyles.bodySm,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    ...textStyles.bodySm,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.navy[100],
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hostAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.navy[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostInitial: {
    ...textStyles.caption,
    color: colors.navy[600],
    fontWeight: fontWeight.semibold,
  },
  hostName: {
    ...textStyles.bodySm,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyTitle: {
    ...textStyles.h5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.body,
    textAlign: 'center',
  },
});

