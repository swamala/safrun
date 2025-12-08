/**
 * SAFRUN Input Component
 * Rounded inputs with soft shadows, 14-16px fonts
 * Matches landing page design exactly
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { borderRadius, componentSpacing, spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputSize?: 'sm' | 'md' | 'lg';
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputSize = 'md',
  style,
  ...props
}: InputProps) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getInputHeight = () => {
    switch (inputSize) {
      case 'sm':
        return 40;
      case 'lg':
        return 56;
      default:
        return 48;
    }
  };

  const inputContainerStyle: ViewStyle[] = [
    styles.inputContainer,
    {
      height: getInputHeight(),
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.white,
      borderColor: error
        ? colors.danger[500]
        : isFocused
        ? `${colors.safrun[500]}80`
        : isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : `${colors.navy[200]}99`,
    },
    isFocused && {
      borderColor: error ? colors.danger[500] : `${colors.safrun[500]}80`,
      ...(!isDark && shadows.softXs),
    },
    !isDark && shadows.softXs,
  ];

  const inputStyle: TextStyle[] = [
    styles.input,
    {
      color: theme.text.primary,
      fontSize: inputSize === 'sm' ? 14 : inputSize === 'lg' ? 16 : 15,
    },
    leftIcon && { paddingLeft: 44 },
    rightIcon && { paddingRight: 44 },
    style as TextStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text.primary }]}>{label}</Text>
      )}

      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={inputStyle}
          placeholderTextColor={isDark ? 'rgba(203, 213, 225, 0.5)' : 'rgba(75, 85, 99, 0.5)'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && (
        <Text style={[styles.hint, { color: theme.text.secondary }]}>{hint}</Text>
      )}
    </View>
  );
}

/**
 * Password Input with toggle visibility
 */
interface PasswordInputProps extends Omit<InputProps, 'rightIcon' | 'secureTextEntry'> {
  showPasswordIcon?: React.ReactNode;
  hidePasswordIcon?: React.ReactNode;
}

export function PasswordInput({
  showPasswordIcon,
  hidePasswordIcon,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  return (
    <Input
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={{ opacity: 0.6 }}>
            {showPassword ? hidePasswordIcon : showPasswordIcon}
          </View>
        </TouchableOpacity>
      }
    />
  );
}

/**
 * Search Input
 */
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  searchIcon: React.ReactNode;
  onSearch?: (text: string) => void;
}

export function SearchInput({ searchIcon, onSearch, ...props }: SearchInputProps) {
  return (
    <Input
      {...props}
      leftIcon={<View style={{ opacity: 0.5 }}>{searchIcon}</View>}
      returnKeyType="search"
      onSubmitEditing={(e) => onSearch?.(e.nativeEvent.text)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.grid[3],
  },
  label: {
    fontSize: fontSize.sm.size,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.grid[1],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md, // 18px
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: componentSpacing.input.horizontal,
    paddingVertical: componentSpacing.input.vertical,
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  error: {
    fontSize: fontSize.sm.size,
    color: colors.danger[500],
    marginTop: spacing.grid[1],
  },
  hint: {
    fontSize: fontSize.sm.size,
    marginTop: spacing.grid[1],
  },
});

export default Input;

