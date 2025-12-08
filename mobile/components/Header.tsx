/**
 * SAFRUN Header Component
 * App header with navigation and actions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
  centerTitle?: boolean;
  style?: ViewStyle;
}

export function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  rightAction,
  onLeftPress,
  onRightPress,
  transparent = false,
  centerTitle = false,
  style,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const headerStyle: ViewStyle[] = [
    styles.header,
    { paddingTop: insets.top + spacing.grid[2] },
    !transparent && {
      backgroundColor: isDark ? colors.background.dark : colors.white,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : `${colors.navy[200]}80`,
    },
    style,
  ];

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : isDark ? colors.background.dark : colors.white}
        translucent={transparent}
      />
      <View style={headerStyle}>
        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {leftIcon && (
              <TouchableOpacity
                onPress={onLeftPress}
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.navy[100],
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
                  },
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {leftIcon}
              </TouchableOpacity>
            )}
          </View>

          {/* Center Section */}
          <View style={[styles.centerSection, centerTitle && styles.centerSectionCentered]}>
            {title && (
              <Text
                style={[styles.title, { color: theme.text.primary }]}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={[styles.subtitle, { color: theme.text.secondary }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightAction}
            {rightIcon && (
              <TouchableOpacity
                onPress={onRightPress}
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.navy[100],
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
                  },
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

/**
 * Logo Header for auth screens
 */
interface LogoHeaderProps {
  showThemeToggle?: boolean;
  themeIcon?: React.ReactNode;
  onThemeToggle?: () => void;
}

export function LogoHeader({ showThemeToggle, themeIcon, onThemeToggle }: LogoHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.logoHeader, { paddingTop: insets.top + spacing.grid[3] }]}>
      <View style={styles.logoContainer}>
        {/* SAFRUN Logo */}
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <View style={styles.logoShield} />
          </View>
          <Text style={styles.logoText}>
            <Text style={{ color: isDark ? colors.white : colors.navy[900] }}>SAF</Text>
            <Text style={{ color: colors.safrun[500] }}>RUN</Text>
          </Text>
        </View>

        {/* Theme Toggle */}
        {showThemeToggle && (
          <TouchableOpacity
            onPress={onThemeToggle}
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.navy[100],
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
              },
            ]}
          >
            {themeIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.grid[3],
    paddingBottom: spacing.grid[3],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    paddingHorizontal: spacing.grid[2],
  },
  centerSectionCentered: {
    alignItems: 'center',
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.grid[2],
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    ...textStyles.h5,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    ...textStyles.bodySm,
    marginTop: 2,
  },

  // Logo Header
  logoHeader: {
    paddingHorizontal: spacing.grid[3],
    paddingBottom: spacing.grid[3],
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.safrun[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[2],
  },
  logoShield: {
    width: 12,
    height: 16,
    backgroundColor: colors.white,
    borderRadius: 3,
  },
  logoText: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default Header;

