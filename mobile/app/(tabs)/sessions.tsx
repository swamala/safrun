/**
 * SAFRUN Sessions Screen
 * Browse and join running sessions
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, Badge, Header, SearchInput } from '@/components';
import {
  UsersIcon,
  MapPinIcon,
  ChevronRightIcon,
  PlusIcon,
  SearchIcon,
} from '@/components/Icons';

// Mock data
const sessions = [
  {
    id: '1',
    name: 'Morning Run Club',
    creator: 'Sarah Chen',
    participants: 8,
    distance: '5km',
    status: 'active',
    location: 'Central Park',
  },
  {
    id: '2',
    name: 'Weekend Warriors',
    creator: 'Mike Johnson',
    participants: 12,
    distance: '10km',
    status: 'scheduled',
    location: 'Riverside Trail',
  },
  {
    id: '3',
    name: 'Evening Joggers',
    creator: 'Emma Wilson',
    participants: 5,
    distance: '3km',
    status: 'active',
    location: 'Downtown Loop',
  },
];

export default function SessionsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Sessions" />

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
        {/* Search & Create */}
        <View style={styles.topActions}>
          <View style={styles.searchContainer}>
            <SearchInput
              placeholder="Search sessions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              searchIcon={
                <View style={styles.searchIcon}>
                  <MapPinIcon size={20} color={theme.text.muted} />
                </View>
              }
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: colors.safrun[500],
              },
              shadows.glowOrange,
            ]}
            onPress={() => router.push('/(tabs)/sessions/create')}
          >
            <PlusIcon size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Nearby Sessions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Nearby Sessions
          </Text>

          {filteredSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              activeOpacity={0.8}
              onPress={() => router.push(`/(tabs)/sessions/${session.id}`)}
            >
              <Card padding="none" style={styles.sessionCard}>
                <View style={styles.sessionContent}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionIcon}>
                      <UsersIcon size={24} color={colors.safrun[500]} />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionName, { color: theme.text.primary }]}>
                        {session.name}
                      </Text>
                      <Text style={[styles.sessionCreator, { color: theme.text.secondary }]}>
                        by {session.creator}
                      </Text>
                    </View>
                    <Badge
                      variant={session.status === 'active' ? 'success' : 'secondary'}
                      dot
                    >
                      {session.status === 'active' ? 'Live' : 'Scheduled'}
                    </Badge>
                  </View>

                  <View style={styles.sessionDetails}>
                    <View style={styles.sessionDetail}>
                      <UsersIcon size={16} color={theme.text.muted} />
                      <Text style={[styles.sessionDetailText, { color: theme.text.secondary }]}>
                        {session.participants} runners
                      </Text>
                    </View>
                    <View style={styles.sessionDetail}>
                      <MapPinIcon size={16} color={theme.text.muted} />
                      <Text style={[styles.sessionDetailText, { color: theme.text.secondary }]}>
                        {session.location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sessionFooter}>
                    <Text style={[styles.sessionDistance, { color: theme.text.primary }]}>
                      {session.distance}
                    </Text>
                    <Button
                      variant={session.status === 'active' ? 'primary' : 'secondary'}
                      size="sm"
                      rightIcon={<ChevronRightIcon size={16} color={colors.white} />}
                    >
                      {session.status === 'active' ? 'Join Now' : 'View'}
                    </Button>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Session CTA */}
        <Card
          padding="lg"
          style={[
            styles.ctaCard,
            {
              backgroundColor: isDark ? 'rgba(255, 138, 0, 0.1)' : `${colors.safrun[500]}08`,
              borderColor: isDark ? 'rgba(255, 138, 0, 0.2)' : `${colors.safrun[500]}20`,
            },
          ]}
        >
          <Text style={[styles.ctaTitle, { color: theme.text.primary }]}>
            Can't find a session?
          </Text>
          <Text style={[styles.ctaSubtitle, { color: theme.text.secondary }]}>
            Create your own and invite friends to join
          </Text>
          <Button
            onPress={() => router.push('/(tabs)/sessions/create')}
            leftIcon={<PlusIcon size={20} color={colors.white} />}
            style={{ marginTop: spacing.grid[3] }}
          >
            Create Session
          </Button>
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
  topActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.grid[2],
    marginBottom: spacing.grid[4],
  },
  searchContainer: {
    flex: 1,
  },
  searchIcon: {
    opacity: 0.5,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing.grid[4],
  },
  sectionTitle: {
    ...textStyles.h5,
    marginBottom: spacing.grid[3],
  },
  sessionCard: {
    marginBottom: spacing.grid[3],
  },
  sessionContent: {
    padding: spacing.grid[4],
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.grid[3],
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
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
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  sessionCreator: {
    ...textStyles.bodySm,
  },
  sessionDetails: {
    flexDirection: 'row',
    gap: spacing.grid[4],
    marginBottom: spacing.grid[3],
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.grid[1],
  },
  sessionDetailText: {
    ...textStyles.bodySm,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionDistance: {
    ...textStyles.h5,
    fontWeight: fontWeight.bold,
  },
  ctaCard: {
    alignItems: 'center',
    borderWidth: 1,
  },
  ctaTitle: {
    ...textStyles.h5,
    textAlign: 'center',
    marginBottom: spacing.grid[1],
  },
  ctaSubtitle: {
    ...textStyles.body,
    textAlign: 'center',
  },
});

