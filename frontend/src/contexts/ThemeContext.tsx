'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * SAFRUN Theme Context
 * Consistent theme switching that mirrors landing page behavior
 * Dark mode uses deep navy (#0E172A)
 * Light mode uses light gray (#F7F9FC)
 */

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  /** Current resolved theme (always 'light' or 'dark') */
  theme: 'light' | 'dark';
  /** User's theme preference */
  themePreference: Theme;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Set theme preference */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme preference */
  defaultTheme?: Theme;
  /** Storage key for persistence */
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'safrun-theme',
}: ThemeProviderProps) {
  const [themePreference, setThemePreference] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Resolve system theme
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Resolve theme based on preference
  const resolveTheme = useCallback((preference: Theme): 'light' | 'dark' => {
    if (preference === 'system') {
      return getSystemTheme();
    }
    return preference;
  }, [getSystemTheme]);

  // Apply theme to document
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the new theme class
    root.classList.add(theme);
    
    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0E172A' : '#F7F9FC');
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    const preference = stored || defaultTheme;
    
    setThemePreference(preference);
    const resolved = resolveTheme(preference);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, [storageKey, defaultTheme, resolveTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (themePreference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference, applyTheme]);

  // Set theme function
  const setTheme = useCallback((theme: Theme) => {
    setThemePreference(theme);
    localStorage.setItem(storageKey, theme);
    
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [storageKey, resolveTheme, applyTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Prevent flash during hydration
  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{
          theme: 'dark',
          themePreference: defaultTheme,
          isDark: true,
          setTheme: () => {},
          toggleTheme: () => {},
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themePreference,
        isDark: resolvedTheme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
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
 * Theme Toggle Button Component
 * Pre-styled button for toggling between light and dark modes
 */
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'p-2',
  md: 'p-2.5',
  lg: 'p-3',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        rounded-xl
        text-text-light-body dark:text-text-dark-body
        hover:text-text-light-heading dark:hover:text-text-dark-heading
        bg-navy-100 dark:bg-white/5
        hover:bg-navy-200 dark:hover:bg-white/10
        border border-navy-200/50 dark:border-white/10
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-safrun-500/50
        ${className || ''}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className={iconSizes[size]} />
      ) : (
        <Moon className={iconSizes[size]} />
      )}
    </button>
  );
}

/**
 * Theme Select Component
 * Dropdown for selecting theme preference (light, dark, system)
 */
interface ThemeSelectProps {
  className?: string;
}

export function ThemeSelect({ className }: ThemeSelectProps) {
  const { themePreference, setTheme } = useTheme();

  return (
    <select
      value={themePreference}
      onChange={(e) => setTheme(e.target.value as Theme)}
      className={`
        px-4 py-2
        rounded-[18px]
        bg-white dark:bg-white/5
        border border-navy-200/60 dark:border-white/10
        text-text-light-heading dark:text-text-dark-heading
        text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-safrun-500/20
        cursor-pointer
        ${className || ''}
      `}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}

