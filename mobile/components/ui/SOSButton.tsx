/**
 * SAFRUN SOSButton Component
 * Prominent SOS panic button with SAFRUN design system
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Vibration,
  PanResponder,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { AlertTriangleIcon, ShieldIcon } from '../Icons';

interface SOSButtonProps {
  onActivate: () => void;
  onCancel?: () => void;
  holdDuration?: number; // milliseconds
  size?: 'sm' | 'md' | 'lg';
  variant?: 'danger' | 'safe';
  disabled?: boolean;
}

export function SOSButton({
  onActivate,
  onCancel,
  holdDuration = 3000,
  size = 'lg',
  variant = 'danger',
  disabled = false,
}: SOSButtonProps) {
  const { isDark } = useTheme();

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation
  React.useEffect(() => {
    if (variant === 'danger' && !disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    return () => pulseAnim.stopAnimation();
  }, [variant, disabled, pulseAnim]);

  const handlePressIn = useCallback(() => {
    if (disabled) return;

    setIsHolding(true);
    Vibration.vibrate(50);

    // Scale animation
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: holdDuration,
      useNativeDriver: false,
    }).start();

    // Update progress state
    let progress = 0;
    progressInterval.current = setInterval(() => {
      progress += 100 / (holdDuration / 100);
      setHoldProgress(Math.min(progress, 100));
    }, 100);

    // Trigger activation
    holdTimer.current = setTimeout(() => {
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);
      onActivate();
    }, holdDuration);
  }, [disabled, holdDuration, onActivate, progressAnim, scaleAnim]);

  const handlePressOut = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);

    // Clear timers
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    // Reset animations
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    onCancel?.();
  }, [onCancel, progressAnim, scaleAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: handlePressIn,
      onPanResponderRelease: handlePressOut,
      onPanResponderTerminate: handlePressOut,
    })
  ).current;

  const getSize = () => {
    switch (size) {
      case 'sm':
        return { width: 80, height: 80, fontSize: 28 };
      case 'md':
        return { width: 120, height: 120, fontSize: 36 };
      case 'lg':
      default:
        return { width: 160, height: 160, fontSize: 48 };
    }
  };

  const sizeConfig = getSize();
  const buttonColor = variant === 'danger' ? colors.danger[500] : colors.safety[500];
  const progressColor = variant === 'danger' ? colors.danger[700] : colors.safety[700];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.button,
          {
            width: sizeConfig.width,
            height: sizeConfig.height,
            backgroundColor: buttonColor,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
            opacity: disabled ? 0.5 : 1,
          },
          shadows.glowRed,
        ]}
        {...panResponder.panHandlers}
      >
        {/* Progress overlay */}
        <Animated.View
          style={[
            styles.progressOverlay,
            {
              backgroundColor: progressColor,
              width: progressWidth,
            },
          ]}
        />

        {/* Icon */}
        <View style={styles.iconContainer}>
          {variant === 'danger' ? (
            <AlertTriangleIcon size={sizeConfig.fontSize} color={colors.white} />
          ) : (
            <ShieldIcon size={sizeConfig.fontSize} color={colors.white} />
          )}
        </View>
      </Animated.View>

      {/* Label */}
      <Text style={styles.label}>
        {isHolding ? `Hold... ${Math.round(holdProgress)}%` : 'Hold for SOS'}
      </Text>

      {/* Sub-label */}
      <Text style={[styles.subLabel, { color: isDark ? colors.navy[400] : colors.navy[500] }]}>
        Press and hold to activate emergency alert
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  iconContainer: {
    zIndex: 1,
  },
  label: {
    ...textStyles.h5,
    color: colors.white,
    marginTop: spacing.lg,
    fontWeight: fontWeight.bold,
  },
  subLabel: {
    ...textStyles.bodySm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default SOSButton;

