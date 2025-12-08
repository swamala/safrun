/**
 * SAFRUN Spacing System
 * Based on 8/12/16/24/32 grid
 */

// Base spacing unit
const BASE = 4;

export const spacing = {
  // Core spacing values
  0: 0,
  1: BASE * 1,      // 4
  2: BASE * 2,      // 8
  3: BASE * 3,      // 12
  4: BASE * 4,      // 16
  5: BASE * 5,      // 20
  6: BASE * 6,      // 24
  7: BASE * 7,      // 28
  8: BASE * 8,      // 32
  10: BASE * 10,    // 40
  12: BASE * 12,    // 48
  14: BASE * 14,    // 56
  16: BASE * 16,    // 64
  20: BASE * 20,    // 80
  24: BASE * 24,    // 96

  // Semantic spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,

  // Grid spacing (8/12/16/24/32)
  grid: {
    1: 8,
    2: 12,
    3: 16,
    4: 24,
    5: 32,
  },
};

// Border radius - Modern 18-24px
export const borderRadius = {
  none: 0,
  sm: 12,
  DEFAULT: 18,
  md: 18,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  full: 9999,
};

// Safe area insets (approximate defaults)
export const safeArea = {
  top: 44,
  bottom: 34,
  horizontal: 16,
};

// Screen padding
export const screenPadding = {
  horizontal: spacing.grid[3], // 16
  vertical: spacing.grid[4],   // 24
};

// Component specific spacing
export const componentSpacing = {
  // Button padding
  button: {
    sm: { horizontal: 20, vertical: 8 },
    md: { horizontal: 24, vertical: 12 },
    lg: { horizontal: 32, vertical: 16 },
  },
  // Input padding
  input: {
    horizontal: 16,
    vertical: 14,
  },
  // Card padding
  card: {
    sm: 16,
    md: 24,
    lg: 32,
  },
  // List item padding
  listItem: {
    horizontal: 16,
    vertical: 12,
  },
};

