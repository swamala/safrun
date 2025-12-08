/**
 * SAFRUN Button Component
 * Pill-shaped buttons with SAFRUN orange gradient
 * Matches landing page design exactly
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { borderRadius, componentSpacing } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps) {
  const { theme, isDark } = useTheme();

  const isDisabled = disabled || loading;

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    const padding = componentSpacing.button[size];
    return {
      container: {
        paddingHorizontal: padding.horizontal,
        paddingVertical: padding.vertical,
        minHeight: size === 'sm' ? 36 : size === 'md' ? 44 : 52,
      },
      text: {
        fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 18,
      },
    };
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; useGradient: boolean } => {
    switch (variant) {
      case 'primary':
        return {
          container: shadows.glowOrange,
          text: { color: colors.white },
          useGradient: true,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[900],
            ...shadows.softSm,
          },
          text: { color: colors.white },
          useGradient: false,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.danger[500],
            ...shadows.glowRed,
          },
          text: { color: colors.white },
          useGradient: false,
        };
      case 'success':
        return {
          container: {
            backgroundColor: colors.safety[500],
            ...shadows.glowGreen,
          },
          text: { color: colors.white },
          useGradient: false,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: theme.text.secondary },
          useGradient: false,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
          },
          text: { color: theme.text.primary },
          useGradient: false,
        };
      default:
        return {
          container: {},
          text: {},
          useGradient: false,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const buttonContent = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color || colors.white}
          style={styles.loader}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              variantStyles.text,
              { fontWeight: fontWeight.semibold },
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  const containerStyle: ViewStyle[] = [
    styles.container,
    sizeStyles.container,
    variantStyles.container,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  if (variantStyles.useGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth]}
      >
        <LinearGradient
          colors={[colors.safrun.start, colors.safrun.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[containerStyle, isDisabled && styles.disabled]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={containerStyle}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  loader: {
    marginRight: 8,
  },
});

export default Button;

