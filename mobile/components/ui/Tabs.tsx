/**
 * SAFRUN Tabs Component
 * Pill-based tabs with gradient active state
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

type TabsVariant = 'pill' | 'underline' | 'filled';
type TabsSize = 'sm' | 'md' | 'lg';

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  fullWidth?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pill',
  size = 'md',
  fullWidth = false,
  scrollable = false,
  style,
}: TabsProps) {
  const { theme, isDark } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: 12,
          height: 32,
        };
      case 'lg':
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          fontSize: 16,
          height: 48,
        };
      default:
        return {
          paddingHorizontal: 18,
          paddingVertical: 10,
          fontSize: 14,
          height: 40,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.navy[100],
          borderRadius: radii.lg,
          padding: 4,
        };
      case 'underline':
        return {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
        };
      default:
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.navy[50],
          borderRadius: radii.full,
          padding: 4,
        };
    }
  };

  const renderTab = (tab: TabItem) => {
    const isActive = activeTab === tab.key;

    const getTabStyle = (): ViewStyle => {
      if (variant === 'underline') {
        return {
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderBottomWidth: 2,
          borderBottomColor: isActive ? colors.safrun[500] : 'transparent',
          marginBottom: -1,
        };
      }

      return {
        paddingHorizontal: sizeStyles.paddingHorizontal,
        paddingVertical: sizeStyles.paddingVertical,
        borderRadius: variant === 'pill' ? radii.full : radii.md,
      };
    };

    const tabContent = (
      <View style={styles.tabContent}>
        {tab.icon && <View style={styles.tabIcon}>{tab.icon}</View>}
        <Text
          style={[
            styles.tabText,
            {
              fontSize: sizeStyles.fontSize,
              color: isActive
                ? variant === 'underline' || variant === 'filled'
                  ? colors.safrun[500]
                  : colors.white
                : theme.text.secondary,
            },
          ]}
        >
          {tab.label}
        </Text>
        {tab.badge !== undefined && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isActive
                  ? colors.white
                  : colors.safrun[500],
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isActive ? colors.safrun[500] : colors.white,
                },
              ]}
            >
              {tab.badge}
            </Text>
          </View>
        )}
      </View>
    );

    if (isActive && variant === 'pill') {
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.8}
          style={fullWidth && styles.fullWidthTab}
        >
          <LinearGradient
            colors={[colors.safrun.start, colors.safrun.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[getTabStyle(), fullWidth && styles.fullWidthTab]}
          >
            {tabContent}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (isActive && variant === 'filled') {
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.8}
          style={[
            getTabStyle(),
            {
              backgroundColor: isDark ? 'rgba(255, 138, 0, 0.15)' : `${colors.safrun[500]}15`,
            },
            fullWidth && styles.fullWidthTab,
          ]}
        >
          {tabContent}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => onTabChange(tab.key)}
        activeOpacity={0.7}
        style={[getTabStyle(), fullWidth && styles.fullWidthTab]}
      >
        {tabContent}
      </TouchableOpacity>
    );
  };

  const containerStyle = getContainerStyle();
  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable
    ? { horizontal: true, showsHorizontalScrollIndicator: false }
    : {};

  return (
    <View style={[containerStyle, style]}>
      <Container
        {...containerProps}
        style={[styles.tabsContainer, fullWidth && styles.fullWidth]}
      >
        {tabs.map(renderTab)}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidth: {
    justifyContent: 'space-between',
  },
  fullWidthTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: spacing.xs,
  },
  tabText: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  badge: {
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
});

export default Tabs;

