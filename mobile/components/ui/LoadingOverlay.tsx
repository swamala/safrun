/**
 * SAFRUN LoadingOverlay Component
 * Full-screen loading overlay with spinner
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({ visible, message, transparent = false }: LoadingOverlayProps) {
  const { theme, isDark } = useTheme();

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="fade">
      <View style={[styles.overlay, transparent && styles.transparentOverlay]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? colors.navy[800] : colors.white,
            },
            shadows.xl,
          ]}
        >
          <LinearGradient
            colors={[colors.safrun[500], colors.safrun[600]]}
            style={styles.spinner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ActivityIndicator size="large" color={colors.white} />
          </LinearGradient>
          
          {message && (
            <Text style={[styles.message, { color: theme.text.primary }]}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  transparentOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 160,
  },
  spinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});

export default LoadingOverlay;

