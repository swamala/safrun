/**
 * SAFRUN Switch Component
 * Toggle switch with SAFRUN orange gradient when active
 */

import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: SwitchSize;
  disabled?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right';
  style?: ViewStyle;
}

export function Switch({
  value,
  onValueChange,
  size = 'md',
  disabled = false,
  label,
  labelPosition = 'left',
  style,
}: SwitchProps) {
  const { theme, isDark } = useTheme();
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          trackWidth: 40,
          trackHeight: 24,
          thumbSize: 18,
          thumbMargin: 3,
        };
      case 'lg':
        return {
          trackWidth: 60,
          trackHeight: 34,
          thumbSize: 28,
          thumbMargin: 3,
        };
      default:
        return {
          trackWidth: 52,
          trackHeight: 30,
          thumbSize: 24,
          thumbMargin: 3,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const thumbTranslate = sizeStyles.trackWidth - sizeStyles.thumbSize - sizeStyles.thumbMargin * 2;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [value, translateX]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const interpolatedTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [sizeStyles.thumbMargin, thumbTranslate + sizeStyles.thumbMargin],
  });

  const trackStyle: ViewStyle = {
    width: sizeStyles.trackWidth,
    height: sizeStyles.trackHeight,
    borderRadius: sizeStyles.trackHeight / 2,
  };

  const inactiveTrackStyle: ViewStyle = {
    ...trackStyle,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[300],
  };

  const thumbStyle: ViewStyle = {
    width: sizeStyles.thumbSize,
    height: sizeStyles.thumbSize,
    borderRadius: sizeStyles.thumbSize / 2,
  };

  const renderSwitch = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={disabled && styles.disabled}
    >
      {value ? (
        <LinearGradient
          colors={[colors.safrun.start, colors.safrun.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[trackStyle, styles.track]}
        >
          <Animated.View
            style={[
              thumbStyle,
              styles.thumb,
              {
                transform: [{ translateX: interpolatedTranslateX }],
                backgroundColor: colors.white,
                shadowColor: colors.safrun[500],
                shadowOpacity: 0.3,
              },
            ]}
          />
        </LinearGradient>
      ) : (
        <View style={[inactiveTrackStyle, styles.track]}>
          <Animated.View
            style={[
              thumbStyle,
              styles.thumb,
              {
                transform: [{ translateX: interpolatedTranslateX }],
                backgroundColor: isDark ? colors.navy[300] : colors.white,
              },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  if (label) {
    return (
      <View style={[styles.container, style]}>
        {labelPosition === 'left' && (
          <Text style={[styles.label, { color: theme.text.primary }]}>{label}</Text>
        )}
        {renderSwitch()}
        {labelPosition === 'right' && (
          <Text style={[styles.label, { color: theme.text.primary }]}>{label}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={style}>
      {renderSwitch()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  track: {
    justifyContent: 'center',
  },
  thumb: {
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: fontSize.base.size,
    fontWeight: fontWeight.medium,
    marginHorizontal: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Switch;

