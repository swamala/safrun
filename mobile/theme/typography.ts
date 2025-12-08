/**
 * SAFRUN Typography System
 * Primary: Plus Jakarta Sans
 * Weights: 400 (body), 500-600 (labels/CTA), 700-800 (headings)
 */

import { Platform } from 'react-native';

// Font family configuration
// Note: For Expo, you'll need to load Plus Jakarta Sans via expo-font
// For now, we use system fonts that closely match
export const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  extrabold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
};

// Font weights
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Font sizes with line heights
export const fontSize = {
  xs: {
    size: 12,
    lineHeight: 16,
  },
  sm: {
    size: 14,
    lineHeight: 20,
  },
  base: {
    size: 16,
    lineHeight: 26,
  },
  lg: {
    size: 18,
    lineHeight: 28,
  },
  xl: {
    size: 20,
    lineHeight: 28,
  },
  '2xl': {
    size: 24,
    lineHeight: 32,
  },
  '3xl': {
    size: 30,
    lineHeight: 38,
  },
  '4xl': {
    size: 36,
    lineHeight: 44,
  },
  '5xl': {
    size: 48,
    lineHeight: 56,
  },
};

// Pre-defined text styles
export const textStyles = {
  // Headings - 700-800 weight
  h1: {
    fontSize: fontSize['4xl'].size,
    lineHeight: fontSize['4xl'].lineHeight,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1,
  },
  h2: {
    fontSize: fontSize['3xl'].size,
    lineHeight: fontSize['3xl'].lineHeight,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: fontSize['2xl'].size,
    lineHeight: fontSize['2xl'].lineHeight,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  h4: {
    fontSize: fontSize.xl.size,
    lineHeight: fontSize.xl.lineHeight,
    fontWeight: fontWeight.semibold,
  },
  h5: {
    fontSize: fontSize.lg.size,
    lineHeight: fontSize.lg.lineHeight,
    fontWeight: fontWeight.semibold,
  },
  h6: {
    fontSize: fontSize.base.size,
    lineHeight: fontSize.base.lineHeight,
    fontWeight: fontWeight.semibold,
  },

  // Body - 400 weight
  body: {
    fontSize: fontSize.base.size,
    lineHeight: fontSize.base.lineHeight,
    fontWeight: fontWeight.regular,
  },
  bodyLg: {
    fontSize: fontSize.lg.size,
    lineHeight: fontSize.lg.lineHeight,
    fontWeight: fontWeight.regular,
  },
  bodySm: {
    fontSize: fontSize.sm.size,
    lineHeight: fontSize.sm.lineHeight,
    fontWeight: fontWeight.regular,
  },

  // Labels & CTA - 500-600 weight
  label: {
    fontSize: fontSize.sm.size,
    lineHeight: fontSize.sm.lineHeight,
    fontWeight: fontWeight.medium,
  },
  labelLg: {
    fontSize: fontSize.base.size,
    lineHeight: fontSize.base.lineHeight,
    fontWeight: fontWeight.medium,
  },
  cta: {
    fontSize: fontSize.base.size,
    lineHeight: fontSize.base.lineHeight,
    fontWeight: fontWeight.semibold,
  },
  ctaLg: {
    fontSize: fontSize.lg.size,
    lineHeight: fontSize.lg.lineHeight,
    fontWeight: fontWeight.semibold,
  },

  // Utility
  caption: {
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    fontWeight: fontWeight.regular,
  },
  overline: {
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
};

