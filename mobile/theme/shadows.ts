/**
 * SAFRUN Shadow System
 * Soft, diffuse shadows (blur 24-32)
 */

import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

// Shadow presets
export const shadows: Record<string, ShadowStyle> = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Soft shadows (subtle, realistic)
  softXs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  softSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },

  softMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },

  softLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },

  // Card shadows
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },

  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },

  // Glow effects (for buttons)
  glowOrange: {
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },

  glowOrangeLg: {
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 12,
  },

  glowRed: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },

  glowGreen: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
};

// Dark mode shadow adjustments
export const darkShadows: Record<string, ShadowStyle> = {
  ...shadows,
  soft: {
    ...shadows.soft,
    shadowOpacity: 0.25,
  },
  softMd: {
    ...shadows.softMd,
    shadowOpacity: 0.35,
  },
  softLg: {
    ...shadows.softLg,
    shadowOpacity: 0.45,
  },
  card: {
    ...shadows.card,
    shadowOpacity: 0.25,
  },
  cardHover: {
    ...shadows.cardHover,
    shadowOpacity: 0.35,
  },
};

// Helper to get shadow based on theme
export function getShadow(name: keyof typeof shadows, isDark: boolean = false): ShadowStyle {
  return isDark ? darkShadows[name] : shadows[name];
}

