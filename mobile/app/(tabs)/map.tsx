/**
 * SAFRUN Live Map Screen
 * Real-time map with runner locations and session tracking
 */

import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, Badge } from '@/components';
import {
  PlayIcon,
  MapPinIcon,
  UsersIcon,
  ShieldIcon,
  AlertTriangleIcon,
  PlusIcon,
  XIcon,
} from '@/components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock session data
const mockSession = {
  name: "Morning Run Club",
  participants: 4,
  isActive: true,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Map Placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: isDark ? colors.navy[800] : colors.navy[100] }]}>
        <View style={styles.mapPlaceholder}>
          <MapPinIcon size={48} color={theme.text.muted} />
          <Text style={[styles.mapPlaceholderText, { color: theme.text.muted }]}>
            Map View
          </Text>
          <Text style={[styles.mapPlaceholderSubtext, { color: theme.text.muted }]}>
            Requires MapView component
          </Text>
        </View>

        {/* Top Overlay - Session Info */}
        <View style={[styles.topOverlay, { paddingTop: insets.top + spacing.grid[2] }]}>
          {mockSession.isActive && (
            <View
              style={[
                styles.sessionBadge,
                {
                  backgroundColor: isDark ? 'rgba(10, 14, 25, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
                },
                shadows.softMd,
              ]}
            >
              <View style={styles.sessionBadgeContent}>
                <View style={styles.sessionBadgeLeft}>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                  </View>
                  <Text style={[styles.sessionBadgeName, { color: theme.text.primary }]}>
                    {mockSession.name}
                  </Text>
                </View>
                <Badge variant="success" size="sm">
                  {mockSession.participants} runners
                </Badge>
              </View>
            </View>
          )}
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          style={[styles.sosButton, shadows.glowRed]}
          activeOpacity={0.8}
        >
          <AlertTriangleIcon size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      <View
        style={[
          styles.bottomPanel,
          {
            backgroundColor: isDark ? colors.background.dark : colors.white,
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
            paddingBottom: insets.bottom + spacing.grid[2],
          },
        ]}
      >
        {isRunning ? (
          // Running Stats
          <View style={styles.runningStats}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  {formatDuration(duration)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Duration</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  {distance.toFixed(2)} km
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Distance</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  5'32"
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Pace</Text>
              </View>
            </View>

            <View style={styles.runningActions}>
              <TouchableOpacity
                style={[
                  styles.pauseButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[100],
                  },
                ]}
                onPress={() => setIsRunning(false)}
              >
                <View style={styles.pauseIcon}>
                  <View style={[styles.pauseBar, { backgroundColor: theme.text.primary }]} />
                  <View style={[styles.pauseBar, { backgroundColor: theme.text.primary }]} />
                </View>
              </TouchableOpacity>
              <Button
                variant="danger"
                size="lg"
                onPress={() => setIsRunning(false)}
                style={{ flex: 1, marginLeft: spacing.grid[3] }}
              >
                Stop Run
              </Button>
            </View>
          </View>
        ) : (
          // Start Run
          <View style={styles.startSection}>
            <View style={styles.startInfo}>
              <Text style={[styles.startTitle, { color: theme.text.primary }]}>
                Ready to run?
              </Text>
              <Text style={[styles.startSubtitle, { color: theme.text.secondary }]}>
                Your location will be shared with your group
              </Text>
            </View>

            <Button
              size="lg"
              fullWidth
              leftIcon={<PlayIcon size={20} color={colors.white} />}
              onPress={() => setIsRunning(true)}
            >
              Start Running
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    ...textStyles.h4,
    marginTop: spacing.grid[2],
  },
  mapPlaceholderSubtext: {
    ...textStyles.bodySm,
    marginTop: spacing.grid[1],
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.grid[3],
  },
  sessionBadge: {
    borderRadius: borderRadius.lg,
    padding: spacing.grid[3],
    borderWidth: 1,
  },
  sessionBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    marginRight: spacing.grid[2],
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.safety[500],
  },
  sessionBadgeName: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
  },
  sosButton: {
    position: 'absolute',
    right: spacing.grid[3],
    bottom: spacing.grid[4],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.danger[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPanel: {
    borderTopWidth: 1,
    padding: spacing.grid[4],
  },
  runningStats: {},
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.grid[4],
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h3,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    ...textStyles.bodySm,
    marginTop: 2,
  },
  runningActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  startSection: {},
  startInfo: {
    marginBottom: spacing.grid[4],
  },
  startTitle: {
    ...textStyles.h4,
    marginBottom: spacing.grid[1],
  },
  startSubtitle: {
    ...textStyles.body,
  },
});

