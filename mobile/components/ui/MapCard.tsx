/**
 * SAFRUN MapCard Component
 * Small runner preview card showing avatar, speed, distance
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Avatar } from './Avatar';
import { MapPinIcon, FootprintsIcon } from '@/components/icons';

interface MapCardProps {
  name: string;
  avatarUrl?: string;
  speed?: string;
  distance?: string;
  status?: 'running' | 'stopped' | 'idle';
  isNearby?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MapCard({
  name,
  avatarUrl,
  speed,
  distance,
  status = 'idle',
  isNearby = false,
  onPress,
  style,
}: MapCardProps) {
  const { theme, isDark } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return colors.safety[500];
      case 'stopped':
        return colors.danger[500];
      default:
        return colors.navy[400];
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'stopped':
        return 'Stopped';
      default:
        return 'Idle';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(10, 14, 25, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
        },
        shadows.softMd,
        style,
      ]}
    >
      {/* Avatar with status indicator */}
      <View style={styles.avatarSection}>
        <Avatar
          name={name}
          source={avatarUrl ? { uri: avatarUrl } : undefined}
          size="sm"
          online={status === 'running'}
        />
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor() },
          ]}
        />
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.statsRow}>
          {speed && (
            <View style={styles.stat}>
              <FootprintsIcon size={12} color={theme.text.muted} />
              <Text style={[styles.statText, { color: theme.text.secondary }]}>
                {speed}
              </Text>
            </View>
          )}
          {distance && (
            <View style={styles.stat}>
              <MapPinIcon size={12} color={theme.text.muted} />
              <Text style={[styles.statText, { color: theme.text.secondary }]}>
                {distance}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor()}20` },
        ]}
      >
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusLabel()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Compact version for map markers
 */
interface MapCardCompactProps {
  name: string;
  avatarUrl?: string;
  status?: 'running' | 'stopped' | 'idle';
  onPress?: () => void;
}

export function MapCardCompact({ name, avatarUrl, status = 'idle', onPress }: MapCardCompactProps) {
  const { theme, isDark } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return colors.safety[500];
      case 'stopped':
        return colors.danger[500];
      default:
        return colors.navy[400];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.9}
      style={[
        styles.compactContainer,
        {
          backgroundColor: isDark ? colors.navy[800] : colors.white,
          borderColor: getStatusColor(),
        },
        shadows.softSm,
      ]}
    >
      <Avatar
        name={name}
        source={avatarUrl ? { uri: avatarUrl } : undefined}
        size="xs"
      />
      <Text
        style={[styles.compactName, { color: theme.text.primary }]}
        numberOfLines={1}
      >
        {name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.grid[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minWidth: 200,
  },
  avatarSection: {
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  infoSection: {
    flex: 1,
    marginLeft: spacing.grid[2],
  },
  name: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.grid[2],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...textStyles.caption,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.grid[2],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginLeft: spacing.grid[2],
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: fontWeight.semibold,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    gap: spacing.xs,
  },
  compactName: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
});

export default MapCard;

