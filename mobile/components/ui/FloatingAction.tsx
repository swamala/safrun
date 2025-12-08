/**
 * SAFRUN FloatingAction Component
 * Floating action button with glowing animation for SOS
 */

import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { shadows } from '@/theme/shadows';

type FloatingActionVariant = 'primary' | 'danger' | 'success';
type FloatingActionSize = 'md' | 'lg' | 'xl';

interface FloatingActionProps {
  icon: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  variant?: FloatingActionVariant;
  size?: FloatingActionSize;
  glowing?: boolean;
  pulsing?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function FloatingAction({
  icon,
  onPress,
  onLongPress,
  variant = 'primary',
  size = 'lg',
  glowing = false,
  pulsing = false,
  disabled = false,
  style,
}: FloatingActionProps) {
  const { isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (pulsing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pulsing, pulseAnim]);

  useEffect(() => {
    if (glowing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0.3);
    }
  }, [glowing, glowAnim]);

  const getSizeStyles = () => {
    switch (size) {
      case 'md':
        return { size: 56, iconSize: 24 };
      case 'xl':
        return { size: 80, iconSize: 36 };
      default:
        return { size: 64, iconSize: 28 };
    }
  };

  const getVariantColors = (): [string, string] => {
    switch (variant) {
      case 'danger':
        return [colors.danger[500], colors.danger[600]];
      case 'success':
        return [colors.safety[500], colors.safety[600]];
      default:
        return [colors.safrun.start, colors.safrun.end];
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case 'danger':
        return colors.danger[500];
      case 'success':
        return colors.safety[500];
      default:
        return colors.safrun[500];
    }
  };

  const getShadow = () => {
    switch (variant) {
      case 'danger':
        return shadows.glowRed;
      case 'success':
        return shadows.glowGreen;
      default:
        return shadows.glowOrange;
    }
  };

  const sizeStyles = getSizeStyles();
  const variantColors = getVariantColors();
  const glowColor = getGlowColor();

  return (
    <View style={[styles.container, style]}>
      {/* Glow rings */}
      {(glowing || pulsing) && (
        <>
          <Animated.View
            style={[
              styles.glowRing,
              {
                width: sizeStyles.size + 32,
                height: sizeStyles.size + 32,
                borderRadius: (sizeStyles.size + 32) / 2,
                backgroundColor: glowColor,
                opacity: glowAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing,
              {
                width: sizeStyles.size + 56,
                height: sizeStyles.size + 56,
                borderRadius: (sizeStyles.size + 56) / 2,
                backgroundColor: glowColor,
                opacity: Animated.multiply(glowAnim, 0.5),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        </>
      )}

      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
        disabled={disabled}
        style={disabled && styles.disabled}
      >
        <Animated.View
          style={[
            { transform: [{ scale: pulsing ? pulseAnim : 1 }] },
          ]}
        >
          <LinearGradient
            colors={variantColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              {
                width: sizeStyles.size,
                height: sizeStyles.size,
                borderRadius: sizeStyles.size / 2,
              },
              getShadow(),
            ]}
          >
            {icon}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default FloatingAction;

