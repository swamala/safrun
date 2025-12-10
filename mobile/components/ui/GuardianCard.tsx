/**
 * SAFRUN GuardianCard Component
 * Card for displaying guardian/ward information with SAFRUN design system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Badge } from '../Badge';
import {
  ShieldIcon,
  MapPinIcon,
  PhoneIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
} from '../Icons';

// CheckCircleIcon inline since it may not be exported
function CheckCircleIconLocal({ size = 14, color = '#22C55E' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.8, color }}>✓</Text>
    </View>
  );
}

interface GuardianCardProps {
  name: string;
  relationship?: string;
  phone?: string;
  avatarUrl?: string;
  status?: 'safe' | 'sos' | 'inactive' | 'tracking';
  lastLocation?: string;
  lastSeen?: string;
  distance?: string;
  isGuardian?: boolean; // true = showing guardian to user, false = showing ward to guardian
  onPress?: () => void;
  onCall?: () => void;
  onLocate?: () => void;
}

export function GuardianCard({
  name,
  relationship,
  phone,
  avatarUrl,
  status = 'inactive',
  lastLocation,
  lastSeen,
  distance,
  isGuardian = true,
  onPress,
  onCall,
  onLocate,
}: GuardianCardProps) {
  const { theme, isDark } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'safe':
        return {
          variant: 'success' as const,
          text: 'Safe',
          icon: <CheckCircleIconLocal size={14} color={colors.safety[500]} />,
          color: colors.safety[500],
        };
      case 'sos':
        return {
          variant: 'danger' as const,
          text: 'SOS Active',
          icon: <AlertTriangleIcon size={14} color={colors.danger[500]} />,
          color: colors.danger[500],
        };
      case 'tracking':
        return {
          variant: 'primary' as const,
          text: 'Tracking',
          icon: <MapPinIcon size={14} color={colors.safrun[500]} />,
          color: colors.safrun[500],
        };
      default:
        return {
          variant: 'secondary' as const,
          text: 'Inactive',
          icon: null,
          color: colors.navy[400],
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isSOS = status === 'sos';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
          borderColor: isSOS
            ? colors.danger[500]
            : isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : colors.navy[200],
        },
        isDark ? shadows.softMd : shadows.card,
        isSOS && shadows.glowRed,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header Row */}
      <View style={styles.header}>
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: statusConfig.color + '20',
              borderColor: statusConfig.color,
            },
          ]}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarInitial, { color: statusConfig.color }]}>
              {name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
              {name}
            </Text>
            {isGuardian && (
              <ShieldIcon size={16} color={colors.safrun[500]} />
            )}
          </View>
          {relationship && (
            <Text style={[styles.relationship, { color: theme.text.secondary }]}>
              {relationship}
            </Text>
          )}
        </View>

        {/* Status Badge */}
        <Badge variant={statusConfig.variant} dot={isSOS || status === 'tracking'}>
          {statusConfig.text}
        </Badge>
      </View>

      {/* Location Info */}
      {(lastLocation || lastSeen || distance) && (
        <View style={styles.locationInfo}>
          {lastLocation && (
            <View style={styles.locationItem}>
              <MapPinIcon size={14} color={theme.text.muted} />
              <Text style={[styles.locationText, { color: theme.text.secondary }]} numberOfLines={1}>
                {lastLocation}
              </Text>
            </View>
          )}
          {distance && (
            <Text style={[styles.distance, { color: theme.text.muted }]}>
              {distance} away
            </Text>
          )}
          {lastSeen && (
            <Text style={[styles.lastSeen, { color: theme.text.muted }]}>
              {lastSeen}
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {phone && onCall && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.safety[500] }]}
            onPress={onCall}
          >
            <PhoneIcon size={16} color={colors.white} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
        )}
        
        {onLocate && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[100] },
            ]}
            onPress={onLocate}
          >
            <MapPinIcon size={16} color={theme.text.primary} />
            <Text style={[styles.actionText, { color: theme.text.primary }]}>Locate</Text>
          </TouchableOpacity>
        )}

        {!onCall && !onLocate && (
          <ChevronRightIcon size={20} color={theme.text.muted} />
        )}
      </View>

      {/* SOS Banner */}
      {isSOS && (
        <View style={styles.sosBanner}>
          <AlertTriangleIcon size={16} color={colors.white} />
          <Text style={styles.sosBannerText}>Emergency Alert Active</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
  },
  relationship: {
    ...textStyles.bodySm,
    marginTop: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    ...textStyles.bodySm,
    flex: 1,
  },
  distance: {
    ...textStyles.bodySm,
  },
  lastSeen: {
    ...textStyles.caption,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionText: {
    ...textStyles.bodySm,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  sosBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger[500],
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  sosBannerText: {
    ...textStyles.bodySm,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
});

export default GuardianCard;

