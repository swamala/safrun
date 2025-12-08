/**
 * SAFRUN Screen Component
 * Reusable screen wrapper with SafeAreaView, padding, and theme support
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ScreenProps {
  children: React.ReactNode;
  /** Add horizontal padding */
  padded?: boolean;
  /** Use ScrollView instead of View */
  scrollable?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Safe area edges to respect */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Additional style */
  style?: ViewStyle;
  /** Content container style (for ScrollView) */
  contentContainerStyle?: ViewStyle;
  /** Show/hide status bar */
  statusBarHidden?: boolean;
}

export function Screen({
  children,
  padded = true,
  scrollable = false,
  backgroundColor,
  edges = ['top'],
  style,
  contentContainerStyle,
  statusBarHidden = false,
}: ScreenProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;
  const paddingLeft = edges.includes('left') ? insets.left : 0;
  const paddingRight = edges.includes('right') ? insets.right : 0;

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: backgroundColor || theme.background,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: padded ? spacing.grid[3] : 0,
  };

  if (scrollable) {
    return (
      <View style={[containerStyle, style]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
          hidden={statusBarHidden}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            contentStyle,
            { flexGrow: 1 },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[containerStyle, contentStyle, style]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
        hidden={statusBarHidden}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

export default Screen;

