/**
 * SAFRUN Tab Navigation Layout
 * Bottom tab bar with SAFRUN design system styling
 */

import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontWeight } from '@/theme/typography';
import {
  HomeIcon,
  MapPinIcon,
  UsersIcon,
  AlertTriangleIcon,
  SettingsIcon,
} from '@/components/Icons';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.safrun[500],
        tabBarInactiveTintColor: theme.text.muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: fontWeight.medium,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.white,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : `${colors.navy[200]}80`,
          height: 60 + insets.bottom,
          paddingTop: spacing.grid[1],
          paddingBottom: insets.bottom,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.25 : 0.06,
              shadowRadius: 16,
            },
            android: {
              elevation: 8,
            },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapPinIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => <UsersIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.sosIconContainer,
                {
                  backgroundColor: focused
                    ? `${colors.danger[500]}20`
                    : 'transparent',
                },
              ]}
            >
              <AlertTriangleIcon
                size={size}
                color={focused ? colors.danger[500] : color}
              />
            </View>
          ),
          tabBarActiveTintColor: colors.danger[500],
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sosIconContainer: {
    padding: 4,
    borderRadius: 8,
  },
});

