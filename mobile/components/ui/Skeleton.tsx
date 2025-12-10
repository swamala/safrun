/**
 * SAFRUN Skeleton Component
 * Loading placeholder with shimmer effect
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  style,
}: SkeletonProps) {
  const { isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: isDark ? colors.navy[700] : colors.navy[200],
          opacity,
          overflow: 'hidden',
        },
        style,
      ]}
    />
  );
}

// Predefined skeleton components
export function SkeletonCard() {
  const { isDark } = useTheme();
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.03)'
            : colors.white,
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : colors.navy[200],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Skeleton width={48} height={48} borderRadius={borderRadius.md} />
        <View style={styles.cardHeaderText}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={14} style={{ marginTop: spacing.xs }} />
        </View>
        <Skeleton width={60} height={24} borderRadius={borderRadius.full} />
      </View>
      <Skeleton width="100%" height={14} style={{ marginTop: spacing.md }} />
      <Skeleton width="80%" height={14} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

export function SkeletonListItem() {
  const { isDark } = useTheme();
  
  return (
    <View
      style={[
        styles.listItem,
        {
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.03)'
            : colors.white,
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : colors.navy[200],
        },
      ]}
    >
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.listItemText}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height={14}
          style={{ marginTop: index > 0 ? spacing.xs : 0 }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  listItemText: {
    flex: 1,
    marginLeft: spacing.md,
  },
});

export default Skeleton;

