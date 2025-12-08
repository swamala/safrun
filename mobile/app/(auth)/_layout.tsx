/**
 * SAFRUN Auth Layout
 * Layout for authentication screens
 */

import { Stack } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';

export default function AuthLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.light,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}

