/**
 * SAFRUN Badge Component
 * Pill-shaped status badges
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'secondary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  leftIcon,
  style,
}: BadgeProps) {
  const { isDark } = useTheme();

  const getVariantStyles = () => {
    const variants = {
      primary: {
        bg: isDark ? `${colors.safrun[500]}25` : `${colors.safrun[500]}15`,
        text: isDark ? colors.safrun[400] : colors.safrun[600],
        border: isDark ? `${colors.safrun[500]}40` : `${colors.safrun[500]}30`,
      },
      success: {
        bg: isDark ? `${colors.safety[500]}25` : `${colors.safety[500]}15`,
        text: isDark ? colors.safety[400] : colors.safety[600],
        border: isDark ? `${colors.safety[500]}40` : `${colors.safety[500]}30`,
      },
      danger: {
        bg: isDark ? `${colors.danger[500]}25` : `${colors.danger[500]}15`,
        text: isDark ? colors.danger[400] : colors.danger[600],
        border: isDark ? `${colors.danger[500]}40` : `${colors.danger[500]}30`,
      },
      warning: {
        bg: isDark ? `${colors.warning[500]}25` : `${colors.warning[500]}15`,
        text: isDark ? colors.warning[400] : colors.warning[600],
        border: isDark ? `${colors.warning[500]}40` : `${colors.warning[500]}30`,
      },
      info: {
        bg: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)',
        text: isDark ? '#60A5FA' : '#2563EB',
        border: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
      },
      secondary: {
        bg: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.navy[100],
        text: isDark ? colors.navy[300] : colors.navy[600],
        border: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
      },
    };
    return variants[variant];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 8,
          paddingVertical: 2,
          fontSize: 10,
        };
      case 'lg':
        return {
          paddingHorizontal: 16,
          paddingVertical: 6,
          fontSize: 14,
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 4,
          fontSize: 12,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      {dot && (
        <View style={[styles.dot, { backgroundColor: variantStyles.text }]} />
      )}
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text
        style={[
          styles.text,
          { color: variantStyles.text, fontSize: sizeStyles.fontSize },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

/**
 * Status Badge - Pre-configured for common statuses
 */
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'online' | 'offline' | 'running';
  label?: string;
  size?: BadgeSize;
}

const statusConfig = {
  active: { variant: 'success' as const, label: 'Active', dot: true },
  inactive: { variant: 'secondary' as const, label: 'Inactive', dot: true },
  pending: { variant: 'warning' as const, label: 'Pending', dot: true },
  online: { variant: 'success' as const, label: 'Online', dot: true },
  offline: { variant: 'secondary' as const, label: 'Offline', dot: true },
  running: { variant: 'primary' as const, label: 'Running', dot: true },
};

export function StatusBadge({ status, label, size }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} dot={config.dot} size={size}>
      {label || config.label}
    </Badge>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.grid[1],
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
});

export default Badge;

