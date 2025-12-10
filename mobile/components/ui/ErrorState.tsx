/**
 * SAFRUN ErrorState Component
 * Displays error messages with retry action
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { Button } from '@/components/Button';
import { AlertTriangleIcon } from '@/components/Icons';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'default' | 'inline';
}

// Simple Refresh Icon
function RefreshIconLocal({ size = 24, color = colors.navy[500] }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.8, color }}>🔄</Text>
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  variant = 'default',
}: ErrorStateProps) {
  const { theme, isDark } = useTheme();

  if (variant === 'inline') {
    return (
      <View
        style={[
          styles.inlineContainer,
          {
            backgroundColor: isDark
              ? 'rgba(239, 68, 68, 0.1)'
              : `${colors.danger[500]}10`,
            borderColor: isDark
              ? 'rgba(239, 68, 68, 0.2)'
              : `${colors.danger[500]}30`,
          },
        ]}
      >
        <AlertTriangleIcon size={20} color={colors.danger[500]} />
        <Text style={[styles.inlineMessage, { color: theme.text.primary }]}>
          {message}
        </Text>
        {onRetry && (
          <Button size="sm" variant="outline" onPress={onRetry}>
            Retry
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${colors.danger[500]}15` },
        ]}
      >
        <AlertTriangleIcon size={40} color={colors.danger[500]} />
      </View>

      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>

      <Text style={[styles.message, { color: theme.text.secondary }]}>
        {message}
      </Text>

      {onRetry && (
        <Button
          onPress={onRetry}
          leftIcon={<RefreshIconLocal size={18} color={colors.white} />}
          style={styles.retryButton}
        >
          {retryLabel}
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
  message: {
    ...textStyles.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  inlineMessage: {
    ...textStyles.bodySm,
    flex: 1,
  },
});

export default ErrorState;

