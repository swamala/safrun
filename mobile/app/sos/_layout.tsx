/**
 * SAFRUN SOS Flow Layout
 * Handles navigation within the SOS flow
 */

import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function SOSLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background.dark,
        },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="confirming" />
      <Stack.Screen name="broadcast" />
    </Stack>
  );
}

