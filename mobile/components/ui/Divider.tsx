/**
 * SAFRUN Divider Component
 * Light opacity line that adapts to dark/light mode
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

type DividerVariant = 'full' | 'inset' | 'middle';
type DividerOrientation = 'horizontal' | 'vertical';

interface DividerProps {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  label?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

export function Divider({
  variant = 'full',
  orientation = 'horizontal',
  label,
  spacing: spacingSize = 'md',
  color,
  thickness = 1,
  style,
}: DividerProps) {
  const { theme, isDark } = useTheme();

  const getSpacing = () => {
    switch (spacingSize) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'lg':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  const getInset = () => {
    switch (variant) {
      case 'inset':
        return spacing.lg + 40 + spacing.md; // Left icon + padding
      case 'middle':
        return spacing.lg;
      default:
        return 0;
    }
  };

  const dividerColor = color || (isDark ? 'rgba(255, 255, 255, 0.08)' : colors.navy[200]);
  const spacingValue = getSpacing();
  const inset = getInset();

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          {
            backgroundColor: dividerColor,
            width: thickness,
            marginHorizontal: spacingValue,
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.labelContainer, { marginVertical: spacingValue }, style]}>
        <View
          style={[
            styles.labelLine,
            { backgroundColor: dividerColor, height: thickness },
          ]}
        />
        <Text style={[styles.label, { color: theme.text.muted }]}>{label}</Text>
        <View
          style={[
            styles.labelLine,
            { backgroundColor: dividerColor, height: thickness },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          backgroundColor: dividerColor,
          height: thickness,
          marginVertical: spacingValue,
          marginLeft: inset,
        },
        style,
      ]}
    />
  );
}

/**
 * Section Divider with more spacing
 */
interface SectionDividerProps {
  style?: ViewStyle;
}

export function SectionDivider({ style }: SectionDividerProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.sectionDivider,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.navy[50],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelLine: {
    flex: 1,
  },
  label: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm.size,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDivider: {
    height: spacing.sm,
    width: '100%',
    marginVertical: spacing.md,
  },
});

export default Divider;

