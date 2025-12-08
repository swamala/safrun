/**
 * SAFRUN Border Radius System
 * Modern, soft rounded radii (18-24px primary)
 */

// Border radius values - matching SAFRUN design system
export const radii = {
  // Base values
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,      // Primary rounded - SAFRUN default
  xl: 24,      // Large rounded - Cards, modals
  '2xl': 28,
  '3xl': 32,
  '4xl': 40,
  full: 9999,  // Pill shape

  // Semantic aliases
  DEFAULT: 18,
  button: 9999,       // Pill buttons
  input: 18,          // Input fields
  card: 24,           // Cards
  modal: 24,          // Modals
  avatar: 9999,       // Avatars (full circle)
  badge: 9999,        // Badges (pill)
  tab: 9999,          // Tab pills
  iconButton: 12,     // Icon buttons
  listItem: 18,       // List items
};

export type RadiiKey = keyof typeof radii;

export default radii;

