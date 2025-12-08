/**
 * SAFRUN useColorMode Hook
 * Simplified hook for color mode management
 */

import { useCallback } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

export type ColorMode = 'light' | 'dark' | 'system';

interface UseColorModeReturn {
  /** Current effective color mode (light or dark) */
  colorMode: 'light' | 'dark';
  /** Current setting (light, dark, or system) */
  colorModeSetting: ColorMode;
  /** Whether dark mode is currently active */
  isDark: boolean;
  /** Set the color mode */
  setColorMode: (mode: ColorMode) => void;
  /** Toggle between light and dark mode */
  toggleColorMode: () => void;
}

/**
 * Hook for managing color mode (light/dark theme)
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isDark, toggleColorMode } = useColorMode();
 *   
 *   return (
 *     <Button onPress={toggleColorMode}>
 *       {isDark ? 'Switch to Light' : 'Switch to Dark'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useColorMode(): UseColorModeReturn {
  const { isDark, mode, setMode, toggleTheme } = useTheme();

  const setColorMode = useCallback((newMode: ColorMode) => {
    setMode(newMode);
  }, [setMode]);

  return {
    colorMode: isDark ? 'dark' : 'light',
    colorModeSetting: mode,
    isDark,
    setColorMode,
    toggleColorMode: toggleTheme,
  };
}

export default useColorMode;

