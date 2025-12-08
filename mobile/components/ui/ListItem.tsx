/**
 * SAFRUN ListItem Component
 * List items for settings, menus, and navigation
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing, componentSpacing } from '@/theme/spacing';
import { fontSize, fontWeight, textStyles } from '@/theme/typography';
import { ChevronRightIcon } from '@/components/Icons';

type ListItemVariant = 'default' | 'card' | 'plain';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  variant?: ListItemVariant;
  disabled?: boolean;
  destructive?: boolean;
  style?: ViewStyle;
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  rightContent,
  onPress,
  showChevron = true,
  variant = 'default',
  disabled = false,
  destructive = false,
  style,
}: ListItemProps) {
  const { theme, isDark } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'card':
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : `${colors.navy[200]}99`,
          marginVertical: spacing.xs,
        };
      case 'plain':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[100],
        };
    }
  };

  const variantStyles = getVariantStyles();

  const titleColor = destructive
    ? colors.danger[500]
    : theme.text.primary;

  const iconColor = destructive
    ? colors.danger[500]
    : theme.text.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      style={[styles.container, variantStyles, disabled && styles.disabled, style]}
    >
      {/* Left Icon */}
      {leftIcon && (
        <View
          style={[
            styles.leftIconContainer,
            {
              backgroundColor: destructive
                ? `${colors.danger[500]}15`
                : isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : colors.navy[100],
            },
          ]}
        >
          {leftIcon}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: titleColor }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: theme.text.secondary }]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightContent}
        {rightIcon}
        {showChevron && onPress && !rightIcon && !rightContent && (
          <ChevronRightIcon size={20} color={theme.text.muted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * ListItemGroup - Container for grouped list items
 */
interface ListItemGroupProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}

export function ListItemGroup({ children, title, style }: ListItemGroupProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.group, style]}>
      {title && (
        <Text style={[styles.groupTitle, { color: theme.text.secondary }]}>
          {title}
        </Text>
      )}
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: componentSpacing.listItem.horizontal,
    paddingVertical: componentSpacing.listItem.vertical,
    minHeight: 56,
  },
  leftIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.base.size,
    fontWeight: fontWeight.medium,
  },
  subtitle: {
    fontSize: fontSize.sm.size,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  group: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    ...textStyles.overline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});

export default ListItem;

