/**
 * SAFRUN Theme System - Main Export
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './radii';

import { colors, lightTheme, darkTheme, Theme } from './colors';
import { fontFamily, fontWeight, fontSize, textStyles } from './typography';
import { spacing, borderRadius, safeArea, screenPadding, componentSpacing } from './spacing';
import { shadows, darkShadows, getShadow } from './shadows';
import { radii } from './radii';

// Combined theme object
export const theme = {
  colors,
  light: lightTheme,
  dark: darkTheme,
  fontFamily,
  fontWeight,
  fontSize,
  textStyles,
  spacing,
  borderRadius,
  radii,
  safeArea,
  screenPadding,
  componentSpacing,
  shadows,
  darkShadows,
  getShadow,
};

export type { Theme };
export default theme;
