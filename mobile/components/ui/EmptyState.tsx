/**
 * SAFRUN EmptyState Component
 * Displays when a list or collection is empty
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { Button } from '@/components/Button';

interface EmptyStateProps {
  icon?: React.ReactElement;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'minimal';
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const { theme, isDark } = useTheme();

  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        {icon && <View style={styles.minimalIcon}>{icon}</View>}
        <Text style={[styles.minimalTitle, { color: theme.text.secondary }]}>
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : `${colors.safrun[500]}15`,
            },
          ]}
        >
          {icon}
        </View>
      )}

      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>

      {description && (
        <Text style={[styles.description, { color: theme.text.secondary }]}>
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button onPress={onAction} style={styles.action}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h5,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...textStyles.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  action: {
    marginTop: spacing.md,
  },
  // Minimal variant
  minimalContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  minimalIcon: {
    marginBottom: spacing.sm,
    opacity: 0.5,
  },
  minimalTitle: {
    ...textStyles.body,
    textAlign: 'center',
  },
});

export default EmptyState;

