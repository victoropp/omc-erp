import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActualTheme = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  actualTheme: ActualTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'omc-erp-theme',
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<ActualTheme>('dark');

  // Get system theme preference
  const getSystemTheme = (): ActualTheme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Calculate actual theme based on mode
  const calculateActualTheme = (themeMode: ThemeMode): ActualTheme => {
    if (themeMode === 'system') {
      return getSystemTheme();
    }
    return themeMode;
  };

  // Apply theme to document
  const applyTheme = (theme: ActualTheme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0C0C0F' : '#FFFFFF');
    }
  };

  // Set theme mode and persist to storage
  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(storageKey, newMode);
    
    const newActualTheme = calculateActualTheme(newMode);
    setActualTheme(newActualTheme);
    applyTheme(newActualTheme);
  };

  // Toggle between themes (dark -> light -> system -> dark)
  const toggleTheme = () => {
    const themeOrder: ThemeMode[] = ['dark', 'light', 'system'];
    const currentIndex = themeOrder.indexOf(mode);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  // Initialize theme on mount
  useEffect(() => {
    let initialMode: ThemeMode = defaultTheme;
    
    // Try to get stored theme
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey) as ThemeMode;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        initialMode = stored;
      }
    }
    
    const initialActualTheme = calculateActualTheme(initialMode);
    setMode(initialMode);
    setActualTheme(initialActualTheme);
    applyTheme(initialActualTheme);
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const newSystemTheme = getSystemTheme();
      setActualTheme(newSystemTheme);
      applyTheme(newSystemTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [mode]);

  const value: ThemeContextType = {
    mode,
    actualTheme,
    setTheme,
    toggleTheme,
    isSystemTheme: mode === 'system',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}