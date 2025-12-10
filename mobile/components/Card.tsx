/**
 * SAFRUN Card Component
 * Cards with soft, diffuse shadows (blur 24-32)
 * Border radius: 18-24px
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { borderRadius, spacing, componentSpacing } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';

type CardVariant = 'default' | 'elevated' | 'outline';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
}: CardProps) {
  const { theme, isDark, shadows } = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return componentSpacing.card.sm;
      case 'lg':
        return componentSpacing.card.lg;
      default:
        return componentSpacing.card.md;
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : `${colors.navy[200]}99`,
          ...shadows.softMd,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
        };
      default:
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : `${colors.navy[200]}99`,
          ...shadows.card,
        };
    }
  };

  const cardStyle = [
    styles.card,
    { padding: getPadding() },
    getVariantStyles(),
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

/**
 * Card Header
 */
interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

/**
 * Card Title
 */
interface CardTitleProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function CardTitle({ children, icon }: CardTitleProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.titleContainer}>
      {icon && <View style={styles.titleIcon}>{icon}</View>}
      <Text style={[styles.title, { color: theme.text.primary }]}>{children}</Text>
    </View>
  );
}

/**
 * Card Content
 */
interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

/**
 * Card Footer
 */
interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : `${colors.navy[200]}99`,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Stat Card
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBgColor?: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, icon, iconBgColor, style }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <Card padding="md" style={style}>
      <View style={styles.statContainer}>
        {icon && (
          <View
            style={[
              styles.statIcon,
              { backgroundColor: iconBgColor || `${colors.safrun[500]}15` },
            ]}
          >
            {icon}
          </View>
        )}
        <View style={styles.statContent}>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
          <Text style={[styles.statValue, { color: theme.text.primary }]}>{value}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg, // 24px
    overflow: 'hidden',
  },
  header: {
    marginBottom: spacing.grid[3],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: spacing.grid[1],
  },
  title: {
    ...textStyles.h5,
    fontWeight: fontWeight.semibold,
  },
  content: {},
  footer: {
    marginTop: spacing.grid[3],
    paddingTop: spacing.grid[3],
    borderTopWidth: 1,
  },
  // Stat Card
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[3],
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    ...textStyles.bodySm,
    marginBottom: 2,
  },
  statValue: {
    ...textStyles.h4,
    fontWeight: fontWeight.bold,
  },
});

export default Card;

