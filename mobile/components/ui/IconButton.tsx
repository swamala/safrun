/**
 * SAFRUN IconButton Component
 * Circular buttons for toggles, controls, and menus
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { shadows } from '@/theme/shadows';

type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: IconButtonProps) {
  const { theme, isDark } = useTheme();

  const isDisabled = disabled || loading;

  const getSizeStyles = (): { size: number; iconSize: number } => {
    switch (size) {
      case 'sm':
        return { size: 36, iconSize: 18 };
      case 'lg':
        return { size: 52, iconSize: 26 };
      case 'xl':
        return { size: 64, iconSize: 32 };
      default:
        return { size: 44, iconSize: 22 };
    }
  };

  const getVariantStyles = (): { container: ViewStyle; useGradient: boolean; iconColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: shadows.glowOrange,
          useGradient: true,
          iconColor: colors.white,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.navy[100],
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
          },
          useGradient: false,
          iconColor: theme.text.primary,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.danger[500],
            ...shadows.glowRed,
          },
          useGradient: false,
          iconColor: colors.white,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          useGradient: false,
          iconColor: theme.text.secondary,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.navy[200],
          },
          useGradient: false,
          iconColor: theme.text.primary,
        };
      default:
        return {
          container: {},
          useGradient: false,
          iconColor: theme.text.primary,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const buttonStyle: ViewStyle[] = [
    styles.button,
    {
      width: sizeStyles.size,
      height: sizeStyles.size,
      borderRadius: sizeStyles.size / 2,
    },
    variantStyles.container,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const content = loading ? (
    <ActivityIndicator size="small" color={variantStyles.iconColor} />
  ) : (
    icon
  );

  if (variantStyles.useGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.safrun.start, colors.safrun.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[buttonStyle, isDisabled && styles.disabled]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={buttonStyle}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;

