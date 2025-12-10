/**
 * SAFRUN RunnerListItem Component
 * List item for displaying runner information with SAFRUN design system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { Badge } from '../Badge';
import {
  MapPinIcon,
  FootprintsIcon,
  NavigationIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
} from '../Icons';

type RunnerStatus = 'running' | 'paused' | 'idle' | 'sos' | 'ahead' | 'behind';

interface RunnerListItemProps {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  status: RunnerStatus;
  distance?: number | string; // meters or formatted string
  pace?: string;
  speed?: number;
  isCurrentUser?: boolean;
  onPress?: () => void;
  showDistance?: boolean;
  showPace?: boolean;
  compact?: boolean;
}

export function RunnerListItem({
  displayName,
  avatarUrl,
  status,
  distance,
  pace,
  speed,
  isCurrentUser,
  onPress,
  showDistance = true,
  showPace = true,
  compact = false,
}: RunnerListItemProps) {
  const { theme, isDark } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          variant: 'success' as const,
          text: 'Running',
          color: colors.safety[500],
        };
      case 'paused':
        return {
          variant: 'warning' as const,
          text: 'Paused',
          color: colors.warning[500],
        };
      case 'sos':
        return {
          variant: 'danger' as const,
          text: 'SOS',
          color: colors.danger[500],
        };
      case 'ahead':
        return {
          variant: 'primary' as const,
          text: 'Ahead',
          color: colors.safrun[500],
        };
      case 'behind':
        return {
          variant: 'secondary' as const,
          text: 'Behind',
          color: colors.info[500],
        };
      default:
        return {
          variant: 'secondary' as const,
          text: 'Idle',
          color: colors.navy[400],
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isSOS = status === 'sos';

  const formatDistance = (d: number | string | undefined) => {
    if (!d) return '--';
    if (typeof d === 'string') return d;
    if (d < 1000) return `${Math.round(d)}m`;
    return `${(d / 1000).toFixed(1)}km`;
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactItem,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.white,
          },
        ]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View
          style={[
            styles.compactAvatar,
            { borderColor: statusConfig.color },
          ]}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.compactAvatarImage} />
          ) : (
            <Text style={[styles.compactAvatarInitial, { color: statusConfig.color }]}>
              {displayName.charAt(0)}
            </Text>
          )}
          {isSOS && (
            <View style={styles.sosDot} />
          )}
        </View>
        <Text style={[styles.compactName, { color: theme.text.primary }]} numberOfLines={1}>
          {isCurrentUser ? 'You' : displayName.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.white,
          borderColor: isSOS
            ? colors.danger[500]
            : isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : colors.navy[100],
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          {
            borderColor: statusConfig.color,
            backgroundColor: statusConfig.color + '15',
          },
        ]}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarInitial, { color: statusConfig.color }]}>
            {displayName.charAt(0)}
          </Text>
        )}
        {isSOS && (
          <View style={styles.sosIndicator}>
            <AlertTriangleIcon size={12} color={colors.white} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
            {isCurrentUser ? 'You' : displayName}
          </Text>
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.text}
          </Badge>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {showDistance && distance !== undefined && (
            <View style={styles.statItem}>
              <MapPinIcon size={12} color={theme.text.muted} />
              <Text style={[styles.statText, { color: theme.text.secondary }]}>
                {formatDistance(distance)}
              </Text>
            </View>
          )}
          {showPace && pace && (
            <View style={styles.statItem}>
              <FootprintsIcon size={12} color={theme.text.muted} />
              <Text style={[styles.statText, { color: theme.text.secondary }]}>
                {pace}/km
              </Text>
            </View>
          )}
          {speed !== undefined && (
            <View style={styles.statItem}>
              <NavigationIcon size={12} color={theme.text.muted} />
              <Text style={[styles.statText, { color: theme.text.secondary }]}>
                {speed.toFixed(1)} km/h
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow */}
      {onPress && <ChevronRightIcon size={20} color={theme.text.muted} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
  },
  sosIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
    flex: 1,
    marginRight: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...textStyles.caption,
  },
  // Compact styles
  compactItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 60,
  },
  compactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  compactAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  compactAvatarInitial: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
  },
  compactName: {
    ...textStyles.caption,
    textAlign: 'center',
  },
  sosDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.danger[500],
    borderWidth: 2,
    borderColor: colors.white,
  },
});

export default RunnerListItem;

