/**
 * SAFRUN Pill Component
 * Selectable pill-shaped tags for filters, selections
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

type PillSize = 'sm' | 'md' | 'lg';

interface PillProps {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  size?: PillSize;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function Pill({
  children,
  selected = false,
  onPress,
  size = 'md',
  disabled = false,
  leftIcon,
  rightIcon,
  style,
}: PillProps) {
  const { theme, isDark } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: 12,
          minHeight: 28,
        };
      case 'lg':
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          fontSize: 16,
          minHeight: 48,
        };
      default:
        return {
          paddingHorizontal: 18,
          paddingVertical: 10,
          fontSize: 14,
          minHeight: 40,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const unselectedStyle: ViewStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.white,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
  };

  const content = (
    <View style={styles.content}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyles.fontSize,
            color: selected ? colors.white : theme.text.primary,
          },
        ]}
      >
        {children}
      </Text>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );

  const pillStyle: ViewStyle = {
    borderRadius: radii.full,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    paddingVertical: sizeStyles.paddingVertical,
    minHeight: sizeStyles.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (selected) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={[colors.safrun.start, colors.safrun.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[pillStyle, disabled && styles.disabled]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[pillStyle, unselectedStyle, disabled && styles.disabled, style]}
    >
      {content}
    </TouchableOpacity>
  );
}

/**
 * PillGroup - Container for multiple pills
 */
interface PillGroupProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function PillGroup({ children, style }: PillGroupProps) {
  return <View style={[styles.group, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

export default Pill;

