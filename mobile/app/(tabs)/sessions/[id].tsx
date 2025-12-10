/**
 * SAFRUN Session Detail Screen
 * Live session view with map and participants
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Note: expo-clipboard not installed, using Alert for copy functionality
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, Badge } from '@/components';
import { LiveSessionMap } from '@/components/map';
import { sdk } from '@/lib/sdk';
import { useRunnerStore, useAuthStore } from '@/lib/store';
import type { Session, SessionParticipant } from '@safrun/sdk';
import {
  ArrowLeftIcon,
  UsersIcon,
  PlayIcon,
  XIcon,
  MapPinIcon,
  MessageIcon,
} from '@/components/Icons';
import type { RunnerLocation } from '@/components/map/types';

// Simple Share icon (native icon not available)
function ShareIconLocal({ size = 24, color = colors.navy[500] }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.7, color }}>📤</Text>
    </View>
  );
}

// Simple Copy icon (native icon not available)
function CopyIconLocal({ size = 24, color = colors.navy[500] }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.7, color }}>📋</Text>
    </View>
  );
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { activeSession, joinSession, leaveSession, startSession: startSessionAction, endSession: endSessionAction } = useRunnerStore();
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<RunnerLocation[]>([]);

  // Fetch session details
  const fetchSession = useCallback(async () => {
    if (!id) return;
    try {
      const data = await sdk.sessions.getSession(id);
      setSession(data);
      
      // Convert participants to map format
      const mapParticipants: RunnerLocation[] = data.participants.map(p => ({
        userId: p.userId,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl || undefined,
        latitude: p.lastLatitude || 0,
        longitude: p.lastLongitude || 0,
        pace: p.currentPace ? `${Math.floor(p.currentPace)}'${Math.floor((p.currentPace % 1) * 60).toString().padStart(2, '0')}"` : undefined,
        distance: p.distanceCovered,
        status: (p.leftAt ? 'idle' : 'running') as 'running' | 'idle' | 'paused' | 'sos' | 'ahead' | 'behind',
        isCurrentUser: p.userId === user?.id,
      })).filter(p => p.latitude !== 0 && p.longitude !== 0);
      
      setParticipants(mapParticipants);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      Alert.alert('Error', 'Failed to load session');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchSession();
    
    // Subscribe to session updates
    const unsubscribe = sdk.socket.on('session:update', (data) => {
      if (data.sessionId === id) {
        fetchSession();
      }
    });

    // Subscribe to location broadcasts
    const unsubLocation = sdk.socket.on('location:broadcast', (data) => {
      setParticipants(prev => {
        const existing = prev.find(p => p.userId === data.userId);
        if (existing) {
          return prev.map(p =>
            p.userId === data.userId
              ? { ...p, latitude: data.latitude, longitude: data.longitude, speed: data.speed, heading: data.heading }
              : p
          );
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
      unsubLocation();
    };
  }, [id, fetchSession]);

  const isHost = session?.hostId === user?.id;
  const isParticipant = session?.participants.some(p => p.userId === user?.id);
  const isActive = session?.status === 'ACTIVE';

  // Handle join session
  const handleJoin = async () => {
    if (!id) return;
    const success = await joinSession(id);
    if (success) {
      fetchSession();
    }
  };

  // Handle leave session
  const handleLeave = async () => {
    if (!id) return;
    Alert.alert('Leave Session', 'Are you sure you want to leave this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          await leaveSession();
          router.back();
        },
      },
    ]);
  };

  // Handle start session (host only)
  const handleStart = async () => {
    if (!id) return;
    const success = await startSessionAction();
    if (success) {
      fetchSession();
    }
  };

  // Handle end session (host only)
  const handleEnd = async () => {
    if (!id) return;
    Alert.alert('End Session', 'This will end the session for all participants.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: async () => {
          await endSessionAction();
          router.back();
        },
      },
    ]);
  };

  // Share session
  const handleShare = async () => {
    if (!session) return;
    try {
      await Share.share({
        message: `Join my running session "${session.title}" on SAFRUN!\n\nInvite code: ${session.inviteCode}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Copy invite code (showing in alert since expo-clipboard not installed)
  const handleCopyCode = async () => {
    if (!session) return;
    Alert.alert('Invite Code', `Share this code: ${session.inviteCode}`, [
      { text: 'OK' },
      { text: 'Share', onPress: () => handleShare() }
    ]);
  };

  if (isLoading || !session) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text.muted }]}>Loading session...</Text>
      </View>
    );
  }

  // Get center location from participants
  const centerLocation = participants.length > 0
    ? {
        latitude: participants.reduce((sum, p) => sum + p.latitude, 0) / participants.length,
        longitude: participants.reduce((sum, p) => sum + p.longitude, 0) / participants.length,
      }
    : { latitude: 37.7749, longitude: -122.4194 };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <LiveSessionMap
          participants={participants}
          currentUserId={user?.id}
          sessionName={session.title}
          currentUserLocation={participants.find(p => p.isCurrentUser) || centerLocation}
          showControls
          initialRegion={{
            ...centerLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        />

        {/* Back button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + spacing.sm }]}
          onPress={() => router.back()}
        >
          <ArrowLeftIcon size={24} color={colors.navy[700]} />
        </TouchableOpacity>

        {/* Actions */}
        <View style={[styles.topActions, { top: insets.top + spacing.sm }]}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <ShareIconLocal size={20} color={colors.navy[700]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopyCode}>
            <CopyIconLocal size={20} color={colors.navy[700]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/(tabs)/sessions/${id}/chat` as any)}>
            <MessageIcon size={20} color={colors.navy[700]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Panel */}
      <View
        style={[
          styles.bottomPanel,
          {
            backgroundColor: isDark ? colors.background.dark : colors.white,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <View style={styles.sessionHeader}>
            <View style={{ flex: 1 }}>
              <Badge
                variant={isActive ? 'success' : session.status === 'SCHEDULED' ? 'primary' : 'secondary'}
                dot={isActive}
                style={{ alignSelf: 'flex-start', marginBottom: spacing.xs }}
              >
                {isActive ? 'Live' : session.status}
              </Badge>
              <Text style={[styles.sessionTitle, { color: theme.text.primary }]}>
                {session.title}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.participantsButton}
              onPress={() => setShowParticipants(!showParticipants)}
            >
              <UsersIcon size={18} color={colors.safrun[500]} />
              <Text style={styles.participantsCount}>{session.participantCount}</Text>
            </TouchableOpacity>
          </View>

          {session.description && (
            <Text style={[styles.sessionDescription, { color: theme.text.secondary }]}>
              {session.description}
            </Text>
          )}

          {/* Invite Code */}
          <TouchableOpacity
            style={[styles.inviteCode, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.navy[50] }]}
            onPress={handleCopyCode}
          >
            <Text style={[styles.inviteCodeLabel, { color: theme.text.secondary }]}>
              Invite Code
            </Text>
            <Text style={[styles.inviteCodeValue, { color: theme.text.primary }]}>
              {session.inviteCode}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Participants List */}
        {showParticipants && (
          <View style={styles.participantsList}>
            <FlatList
              data={session.participants}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.participantItem}>
                  <View style={[
                    styles.participantAvatar,
                    item.userId === user?.id && styles.participantAvatarCurrent,
                  ]}>
                    <Text style={styles.participantInitial}>
                      {item.displayName.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.participantName, { color: theme.text.secondary }]} numberOfLines={1}>
                    {item.userId === user?.id ? 'You' : item.displayName.split(' ')[0]}
                  </Text>
                  {item.role === 'HOST' && (
                    <Badge variant="warning" size="sm">Host</Badge>
                  )}
                </View>
              )}
            />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!isParticipant ? (
            <Button size="lg" fullWidth leftIcon={<PlayIcon size={20} color={colors.white} />} onPress={handleJoin}>
              Join Session
            </Button>
          ) : isHost ? (
            <View style={styles.hostActions}>
              {session.status === 'SCHEDULED' && (
                <Button size="lg" style={{ flex: 1 }} leftIcon={<PlayIcon size={20} color={colors.white} />} onPress={handleStart}>
                  Start Session
                </Button>
              )}
              {isActive && (
                <Button size="lg" variant="danger" style={{ flex: 1 }} onPress={handleEnd}>
                  End Session
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                style={{ marginLeft: spacing.sm }}
                onPress={() => router.push(`/(tabs)/sessions/${id}/chat` as any)}
              >
                <MessageIcon size={20} color={theme.text.primary} />
              </Button>
            </View>
          ) : (
            <View style={styles.participantActions}>
              <Button
                size="lg"
                variant="outline"
                style={{ flex: 1 }}
                leftIcon={<XIcon size={20} color={theme.text.primary} />}
                onPress={handleLeave}
              >
                Leave
              </Button>
              <Button
                size="lg"
                style={{ flex: 1, marginLeft: spacing.sm }}
                leftIcon={<MapPinIcon size={20} color={colors.white} />}
                onPress={() => router.push('/(tabs)/map')}
              >
                Go to Map
              </Button>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...textStyles.body,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.softMd,
  },
  topActions: {
    position: 'absolute',
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.softMd,
  },
  bottomPanel: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -20,
    padding: spacing.lg,
    ...shadows.softLg,
  },
  sessionInfo: {},
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sessionTitle: {
    ...textStyles.h4,
  },
  participantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.safrun[500]}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  participantsCount: {
    ...textStyles.body,
    color: colors.safrun[500],
    fontWeight: fontWeight.semibold,
  },
  sessionDescription: {
    ...textStyles.body,
    marginBottom: spacing.md,
  },
  inviteCode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  inviteCodeLabel: {
    ...textStyles.bodySm,
  },
  inviteCodeValue: {
    ...textStyles.h5,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
  },
  participantsList: {
    marginBottom: spacing.md,
  },
  participantItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 60,
  },
  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  participantAvatarCurrent: {
    backgroundColor: colors.safrun[500],
    borderWidth: 2,
    borderColor: colors.safrun[300],
  },
  participantInitial: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: 16,
  },
  participantName: {
    ...textStyles.caption,
    textAlign: 'center',
  },
  actions: {},
  hostActions: {
    flexDirection: 'row',
  },
  participantActions: {
    flexDirection: 'row',
  },
});

