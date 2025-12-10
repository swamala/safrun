/**
 * SAFRUN Color System
 * Exact values matching the landing page design system
 */

export const colors = {
  // ===========================================
  // Brand - SAFRUN Orange Gradient
  // ===========================================
  safrun: {
    start: '#FF8A00',
    end: '#FF5E00',
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#FF8A00',
    600: '#FF5E00',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // ===========================================
  // Navy - Primary Dark
  // ===========================================
  navy: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0E172A', // Primary navy
    950: '#0A0F1A',
  },

  // ===========================================
  // Accents
  // ===========================================
  accent: {
    blue: '#E6F4FF',      // Sky Blue
    green: '#DFF7E6',     // Soft Green
    blueDark: '#1E3A5F',
    greenDark: '#1E3A32',
  },

  // ===========================================
  // Backgrounds
  // ===========================================
  background: {
    light: '#F7F9FC',     // Light Gray Background
    dark: '#0E172A',      // Navy Dark
  },

  // ===========================================
  // Text Colors
  // ===========================================
  text: {
    lightHeading: '#0E172A',
    lightBody: '#4B5563',
    darkHeading: '#FFFFFF',
    darkBody: '#CBD5E1',
  },

  // ===========================================
  // Safety - Green
  // ===========================================
  safety: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // ===========================================
  // Danger - Red
  // ===========================================
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // ===========================================
  // Warning - Amber
  // ===========================================
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // ===========================================
  // Info - Blue
  // ===========================================
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // ===========================================
  // Utility Colors
  // ===========================================
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ===========================================
// Light Theme
// ===========================================
export const lightTheme = {
  background: colors.background.light,
  surface: colors.white,
  surfaceElevated: colors.white,
  surfaceMuted: colors.navy[50],
  
  text: {
    primary: colors.text.lightHeading,
    secondary: colors.text.lightBody,
    muted: colors.navy[400],
    inverse: colors.white,
  },
  
  border: {
    default: colors.navy[200],
    muted: colors.navy[100],
    focus: colors.safrun[500],
  },
  
  primary: colors.safrun[500],
  primaryGradient: [colors.safrun.start, colors.safrun.end] as const,
  
  secondary: colors.navy[900],
  
  success: colors.safety[500],
  danger: colors.danger[500],
  warning: colors.warning[500],
  info: '#3B82F6',
};

// ===========================================
// Dark Theme
// ===========================================
export const darkTheme = {
  background: colors.background.dark,
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceElevated: colors.navy[800],
  surfaceMuted: colors.navy[800],
  
  text: {
    primary: colors.text.darkHeading,
    secondary: colors.text.darkBody,
    muted: colors.navy[400],
    inverse: colors.navy[900],
  },
  
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    muted: 'rgba(255, 255, 255, 0.06)',
    focus: colors.safrun[500],
  },
  
  primary: colors.safrun[500],
  primaryGradient: [colors.safrun.start, colors.safrun.end] as const,
  
  secondary: 'rgba(255, 255, 255, 0.1)',
  
  success: colors.safety[400],
  danger: colors.danger[400],
  warning: colors.warning[400],
  info: '#60A5FA',
};

export type Theme = typeof lightTheme;

