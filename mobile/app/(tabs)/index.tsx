/**
 * SAFRUN Home/Dashboard Screen
 * Main dashboard with stats, active sessions, and quick actions
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Header } from '@/components';
import {
  PlayIcon,
  FootprintsIcon,
  ShieldIcon,
  UsersIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  MapPinIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
} from '@/components/Icons';

// Mock data
const stats = [
  { label: 'Total Distance', value: '127.5 km', icon: FootprintsIcon, bgColor: `${colors.safrun[500]}15` },
  { label: 'Total Runs', value: '24', icon: ShieldIcon, bgColor: `${colors.safety[500]}15` },
];

const recentSessions = [
  { id: '1', name: 'Morning Run Club', participants: 8, status: 'active' },
  { id: '2', name: 'Weekend Warriors', participants: 12, status: 'completed' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Header
        title="Dashboard"
        rightIcon={
          isDark ? (
            <SunIcon size={20} color={theme.text.secondary} />
          ) : (
            <MoonIcon size={20} color={theme.text.secondary} />
          )
        }
        onRightPress={toggleTheme}
        rightAction={
          <TouchableOpacity
            style={[
              styles.notificationButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.navy[100],
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
              },
            ]}
          >
            <BellIcon size={20} color={theme.text.secondary} />
          </TouchableOpacity>
        }
      />

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
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: theme.text.primary }]}>
            Welcome back, Runner! 👋
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.text.secondary }]}>
            Ready for your next run?
          </Text>
        </View>

        {/* Start Run CTA */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/map')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.safrun.start, colors.safrun.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.startRunCard, shadows.glowOrange]}
          >
            <View style={styles.startRunContent}>
              <View style={styles.startRunIcon}>
                <PlayIcon size={24} color={colors.white} />
              </View>
              <View style={styles.startRunText}>
                <Text style={styles.startRunTitle}>Start Running</Text>
                <Text style={styles.startRunSubtitle}>Begin your safe run now</Text>
              </View>
            </View>
            <ChevronRightIcon size={24} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={<stat.icon size={24} color={colors.safrun[500]} />}
                iconBgColor={stat.bgColor}
              />
            </View>
          ))}
        </View>

        {/* Safety Status */}
        <Card padding="none" style={styles.sectionCard}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle icon={<ShieldIcon size={20} color={colors.safety[500]} />}>
              Safety Status
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <View style={styles.safetyItem}>
              <View style={styles.safetyItemLeft}>
                <AlertTriangleIcon size={20} color={theme.text.muted} />
                <Text style={[styles.safetyItemText, { color: theme.text.primary }]}>
                  Auto SOS
                </Text>
              </View>
              <Badge variant="success">Enabled</Badge>
            </View>
            <View style={styles.safetyItem}>
              <View style={styles.safetyItemLeft}>
                <ShieldIcon size={20} color={theme.text.muted} />
                <Text style={[styles.safetyItemText, { color: theme.text.primary }]}>
                  Fall Detection
                </Text>
              </View>
              <Badge variant="secondary">Disabled</Badge>
            </View>
            <Button
              variant="ghost"
              fullWidth
              rightIcon={<ChevronRightIcon size={20} color={theme.text.secondary} />}
              onPress={() => router.push('/(tabs)/settings')}
              style={{ marginTop: spacing.grid[2] }}
            >
              Manage Safety Settings
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card padding="none" style={styles.sectionCard}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle icon={<UsersIcon size={20} color={colors.safrun[500]} />}>
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            {recentSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.sessionItem,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.navy[50],
                  },
                ]}
                onPress={() => router.push(`/(tabs)/sessions/${session.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.sessionIcon}>
                  <UsersIcon size={20} color={colors.safrun[500]} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionName, { color: theme.text.primary }]}>
                    {session.name}
                  </Text>
                  <Text style={[styles.sessionMeta, { color: theme.text.secondary }]}>
                    {session.participants} runners • {session.status}
                  </Text>
                </View>
                <ChevronRightIcon size={20} color={theme.text.muted} />
              </TouchableOpacity>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card padding="none" style={styles.sectionCard}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={[
                  styles.quickAction,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
                  },
                ]}
                onPress={() => router.push('/(tabs)/sessions/create' as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.safrun[500]}15` }]}>
                  <PlusIcon size={24} color={colors.safrun[500]} />
                </View>
                <Text style={[styles.quickActionText, { color: theme.text.primary }]}>
                  Create Session
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickAction,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
                  },
                ]}
                onPress={() => router.push('/(tabs)/sessions')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F615' }]}>
                  <MapPinIcon size={24} color="#3B82F6" />
                </View>
                <Text style={[styles.quickActionText, { color: theme.text.primary }]}>
                  Join Session
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickAction,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
                  },
                ]}
                onPress={() => router.push('/(tabs)/settings')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.safety[500]}15` }]}>
                  <ShieldIcon size={24} color={colors.safety[500]} />
                </View>
                <Text style={[styles.quickActionText, { color: theme.text.primary }]}>
                  Safety Settings
                </Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.grid[3],
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: spacing.grid[2],
  },
  welcomeSection: {
    marginBottom: spacing.grid[4],
  },
  welcomeTitle: {
    ...textStyles.h3,
    marginBottom: spacing.grid[1],
  },
  welcomeSubtitle: {
    ...textStyles.body,
  },
  startRunCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.grid[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing.grid[4],
  },
  startRunContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startRunIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[3],
  },
  startRunText: {},
  startRunTitle: {
    ...textStyles.h5,
    color: colors.white,
    marginBottom: 2,
  },
  startRunSubtitle: {
    ...textStyles.bodySm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.grid[3],
    marginBottom: spacing.grid[4],
  },
  statItem: {
    flex: 1,
  },
  sectionCard: {
    marginBottom: spacing.grid[4],
  },
  cardHeader: {
    padding: spacing.grid[4],
    paddingBottom: 0,
  },
  cardContent: {
    padding: spacing.grid[4],
    paddingTop: spacing.grid[3],
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.grid[3],
    paddingHorizontal: spacing.grid[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing.grid[2],
  },
  safetyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.grid[2],
  },
  safetyItemText: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.grid[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing.grid[2],
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.safrun[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[3],
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  sessionMeta: {
    ...textStyles.bodySm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.grid[3],
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.grid[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.grid[2],
  },
  quickActionText: {
    ...textStyles.bodySm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});

