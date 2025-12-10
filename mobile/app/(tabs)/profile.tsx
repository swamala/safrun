/**
 * SAFRUN Profile Screen
 * User profile with stats, settings, and account management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, CardContent, Badge, Header } from '@/components';
import { LoadingOverlay } from '@/components/ui';
import { sdk } from '@/lib/sdk';
import { useAuthStore } from '@/lib/store';
import type { Profile, UserStats } from '@safrun/sdk';
import {
  UserIcon,
  FootprintsIcon,
  ClockIcon,
  ShieldIcon,
  SettingsIcon,
  ChevronRightIcon,
  MapPinIcon,
  UsersIcon,
} from '@/components/Icons';

// Simple Edit icon since it might not exist
function EditIconLocal({ size = 24, color = colors.navy[500] }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.7, color }}>✏️</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user, signOut } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        sdk.profile.getProfile(),
        sdk.stats.getMyStats(),
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to fetch profile:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/signin');
        },
      },
    ]);
  };

  // Format stats
  const formatDistance = (meters: number = 0) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const statItems = [
    {
      label: 'Total Distance',
      value: formatDistance(stats?.totalDistance),
      icon: <FootprintsIcon size={20} color={colors.safrun[500]} />,
      bgColor: `${colors.safrun[500]}15`,
    },
    {
      label: 'Total Time',
      value: formatDuration(stats?.totalDuration),
      icon: <ClockIcon size={20} color={theme.info} />,
      bgColor: `${theme.info}15`,
    },
    {
      label: 'Sessions',
      value: (stats?.totalRuns || 0).toString(),
      icon: <UsersIcon size={20} color={colors.safety[500]} />,
      bgColor: `${colors.safety[500]}15`,
    },
    {
      label: 'Avg Pace',
      value: stats?.averagePace ? `${Math.floor(stats.averagePace)}'${Math.floor((stats.averagePace % 1) * 60).toString().padStart(2, '0')}"` : '--:--',
      icon: <FootprintsIcon size={20} color={colors.warning[500]} />,
      bgColor: `${colors.warning[500]}15`,
    },
  ];

  const menuItems = [
    {
      icon: <ShieldIcon size={20} color={colors.safrun[500]} />,
      label: 'Emergency Contacts',
      onPress: () => router.push('/(tabs)/settings' as any),
    },
    {
      icon: <MapPinIcon size={20} color={colors.info[500]} />,
      label: 'Privacy & Location',
      onPress: () => router.push('/(tabs)/settings' as any),
    },
    {
      icon: <SettingsIcon size={20} color={colors.navy[500]} />,
      label: 'App Settings',
      onPress: () => router.push('/(tabs)/settings' as any),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LoadingOverlay visible={isLoading} message="Loading profile..." />
      <Header title="Profile" />

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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isDark ? colors.navy[700] : colors.navy[100],
              },
            ]}
          >
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <UserIcon size={48} color={colors.safrun[500]} />
            )}
          </View>

          <Text style={[styles.name, { color: theme.text.primary }]}>
            {profile?.displayName || user?.displayName || 'Runner'}
          </Text>

          {profile?.bio && (
            <Text style={[styles.bio, { color: theme.text.secondary }]}>{profile.bio}</Text>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<EditIconLocal size={16} color={theme.text.primary} />}
            onPress={() => router.push('/(tabs)/settings' as any)}
            style={{ marginTop: spacing.md }}
          >
            Edit Profile
          </Button>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statItems.map((stat, index) => (
            <Card key={index} padding="md" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>{stat.icon}</View>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Safety Status */}
        <Card padding="lg" style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <View style={[styles.safetyIcon, { backgroundColor: `${colors.safety[500]}15` }]}>
              <ShieldIcon size={24} color={colors.safety[500]} />
            </View>
            <View style={styles.safetyInfo}>
              <Text style={[styles.safetyTitle, { color: theme.text.primary }]}>
                Safety Status
              </Text>
            <Text style={[styles.safetySubtitle, { color: theme.text.secondary }]}>
              Safety features enabled
            </Text>
            </View>
            <Badge variant="success">Active</Badge>
          </View>
        </Card>

        {/* Menu */}
        <Card padding="none" style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[100],
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>{item.icon}</View>
                <Text style={[styles.menuItemLabel, { color: theme.text.primary }]}>
                  {item.label}
                </Text>
              </View>
              <ChevronRightIcon size={20} color={theme.text.muted} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size="lg"
          onPress={handleSignOut}
          style={{ marginTop: spacing.xl }}
        >
          <Text style={{ color: colors.danger[500], fontWeight: fontWeight.semibold }}>
            Sign Out
          </Text>
        </Button>

        {/* Version */}
        <Text style={[styles.version, { color: theme.text.muted }]}>
          SAFRUN v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    ...textStyles.h3,
    marginBottom: spacing.xs,
  },
  bio: {
    ...textStyles.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...textStyles.h4,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    ...textStyles.caption,
    marginTop: 2,
  },
  safetyCard: {
    marginBottom: spacing.lg,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  safetyInfo: {
    flex: 1,
  },
  safetyTitle: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  safetySubtitle: {
    ...textStyles.bodySm,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: spacing.md,
  },
  menuItemLabel: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
  },
  version: {
    ...textStyles.caption,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

