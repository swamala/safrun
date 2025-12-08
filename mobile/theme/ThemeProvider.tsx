/**
 * SAFRUN Theme Provider
 * Provides light/dark theme context throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { lightTheme, darkTheme, Theme } from './colors';
import { shadows, darkShadows } from './shadows';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  shadows: typeof shadows;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'system' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  // Determine if dark mode based on mode setting
  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  // Get current theme
  const theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  // Get current shadows
  const currentShadows = useMemo(() => {
    return isDark ? darkShadows : shadows;
  }, [isDark]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setMode((current) => {
      if (current === 'system') {
        return isDark ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if in system mode
      if (mode === 'system') {
        // Force re-render
      }
    });

    return () => subscription.remove();
  }, [mode]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      mode,
      setMode,
      toggleTheme,
      shadows: currentShadows,
    }),
    [theme, isDark, mode, toggleTheme, currentShadows]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook for themed styles
 */
export function useThemedStyles<T>(stylesFn: (theme: Theme, isDark: boolean) => T): T {
  const { theme, isDark } = useTheme();
  return useMemo(() => stylesFn(theme, isDark), [theme, isDark, stylesFn]);
}

export default ThemeProvider;

