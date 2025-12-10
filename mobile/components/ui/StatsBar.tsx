/**
 * SAFRUN StatsBar Component
 * Horizontal bar showing running statistics with SAFRUN design system
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { ClockIcon, FootprintsIcon, NavigationIcon } from '../Icons';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}

function StatItem({ icon, label, value, unit, highlight }: StatItemProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.statItem, highlight && styles.statItemHighlight]}>
      <View style={styles.statIcon}>{icon}</View>
      <Text
        style={[
          styles.statValue,
          { color: highlight ? colors.safrun[500] : theme.text.primary },
        ]}
      >
        {value}
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </Text>
      <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
    </View>
  );
}

interface StatsBarProps {
  duration?: number; // seconds
  distance?: number; // meters
  pace?: string; // "5'30"" format
  speed?: number; // km/h
  calories?: number;
  variant?: 'horizontal' | 'grid';
  compact?: boolean;
}

export function StatsBar({
  duration = 0,
  distance = 0,
  pace,
  speed,
  calories,
  variant = 'horizontal',
  compact = false,
}: StatsBarProps) {
  const { theme, isDark } = useTheme();

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters < 1000) return { value: Math.round(meters).toString(), unit: 'm' };
    return { value: (meters / 1000).toFixed(2), unit: 'km' };
  };

  const distanceFormatted = formatDistance(distance);

  const stats = [
    {
      icon: <ClockIcon size={compact ? 16 : 18} color={theme.text.muted} />,
      label: 'Duration',
      value: formatDuration(duration),
    },
    {
      icon: <FootprintsIcon size={compact ? 16 : 18} color={colors.safrun[500]} />,
      label: 'Distance',
      value: distanceFormatted.value,
      unit: distanceFormatted.unit,
      highlight: true,
    },
    {
      icon: <NavigationIcon size={compact ? 16 : 18} color={theme.text.muted} />,
      label: 'Pace',
      value: pace || '--:--',
    },
  ];

  if (variant === 'grid') {
    return (
      <View
        style={[
          styles.gridContainer,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
          },
          isDark ? shadows.softSm : shadows.card,
        ]}
      >
        <View style={styles.gridRow}>
          {stats.slice(0, 2).map((stat, index) => (
            <View key={index} style={[styles.gridItem, index === 0 && styles.gridItemBorder]}>
              <StatItem {...stat} />
            </View>
          ))}
        </View>
        {stats.length > 2 && (
          <View style={[styles.gridRow, styles.gridRowTop]}>
            {stats.slice(2).map((stat, index) => (
              <View key={index} style={[styles.gridItem, index === 0 && styles.gridItemBorder]}>
                <StatItem {...stat} />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontalContainer,
        compact && styles.horizontalContainerCompact,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
        },
        isDark ? shadows.softSm : shadows.card,
      ]}
    >
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <StatItem {...stat} />
          {index < stats.length - 1 && (
            <View
              style={[
                styles.divider,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200] },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  horizontalContainerCompact: {
    padding: spacing.sm,
  },
  gridContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridRowTop: {
    borderTopWidth: 1,
    borderTopColor: colors.navy[200],
  },
  gridItem: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  gridItemBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.navy[200],
  },
  statItem: {
    alignItems: 'center',
  },
  statItemHighlight: {},
  statIcon: {
    marginBottom: spacing.xs,
  },
  statValue: {
    ...textStyles.h4,
    fontWeight: fontWeight.bold,
  },
  statUnit: {
    ...textStyles.bodySm,
    fontWeight: fontWeight.regular,
  },
  statLabel: {
    ...textStyles.caption,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
  },
});

export default StatsBar;

