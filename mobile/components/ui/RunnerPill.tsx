/**
 * SAFRUN RunnerPill Component
 * Round pill showing runner name + live speed/status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Avatar } from './Avatar';

type RunnerStatus = 'running' | 'paused' | 'sos' | 'offline';

interface RunnerPillProps {
  name: string;
  avatarUrl?: string;
  speed?: string; // e.g., "5'32"/km"
  status?: RunnerStatus;
  distance?: string; // e.g., "0.3km away"
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function RunnerPill({
  name,
  avatarUrl,
  speed,
  status = 'offline',
  distance,
  selected = false,
  onPress,
  style,
}: RunnerPillProps) {
  const { theme, isDark } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          color: colors.safety[500],
          bgColor: `${colors.safety[500]}15`,
          label: speed || 'Running',
          dotColor: colors.safety[500],
        };
      case 'paused':
        return {
          color: colors.warning[500],
          bgColor: `${colors.warning[500]}15`,
          label: 'Paused',
          dotColor: colors.warning[500],
        };
      case 'sos':
        return {
          color: colors.danger[500],
          bgColor: `${colors.danger[500]}15`,
          label: 'SOS',
          dotColor: colors.danger[500],
        };
      default:
        return {
          color: colors.navy[400],
          bgColor: isDark ? 'rgba(255,255,255,0.05)' : colors.navy[100],
          label: distance || 'Offline',
          dotColor: colors.navy[400],
        };
    }
  };

  const statusConfig = getStatusConfig();

  const containerStyle: ViewStyle = {
    backgroundColor: isDark ? 'rgba(10, 14, 25, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    borderColor: selected
      ? colors.safrun[500]
      : isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : colors.navy[200],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.9}
      style={[styles.container, containerStyle, shadows.softSm, style]}
    >
      {/* Avatar */}
      <Avatar
        name={name}
        source={avatarUrl ? { uri: avatarUrl } : undefined}
        size="xs"
        showRing={status === 'sos'}
        ringColor={status === 'sos' ? 'danger' : 'primary'}
      />

      {/* Name */}
      <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
        {name.split(' ')[0]}
      </Text>

      {/* Status/Speed Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusConfig.bgColor },
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: statusConfig.dotColor }]} />
        <Text style={[styles.statusText, { color: statusConfig.color }]}>
          {statusConfig.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * SOS RunnerPill - Special variant for SOS alerts
 */
interface SOSRunnerPillProps {
  name: string;
  avatarUrl?: string;
  distance: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function SOSRunnerPill({ name, avatarUrl, distance, onPress, style }: SOSRunnerPillProps) {
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.9}
      style={[styles.sosContainer, shadows.glowRed, style]}
    >
      <LinearGradient
        colors={[colors.danger[500], colors.danger[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sosGradient}
      >
        <Avatar
          name={name}
          source={avatarUrl ? { uri: avatarUrl } : undefined}
          size="xs"
        />
        <View style={styles.sosInfo}>
          <Text style={styles.sosName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.sosDistance}>{distance} away</Text>
        </View>
        <View style={styles.sosBadge}>
          <Text style={styles.sosBadgeText}>SOS</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/**
 * RunnerPillList - Horizontal scrollable list of runner pills
 */
interface RunnerPillListProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function RunnerPillList({ children, style }: RunnerPillListProps) {
  return (
    <View style={[styles.list, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.sm,
  },
  name: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    maxWidth: 80,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
  // SOS styles
  sosContainer: {
    borderRadius: borderRadius.full,
  },
  sosGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  sosInfo: {
    flex: 1,
  },
  sosName: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  sosDistance: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sosBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  sosBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 1,
  },
  // List styles
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

export default RunnerPill;

