// src/theme/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ColorScheme, Mode, ThemeContextType, ThemeProviderProps } from '../types';
import { DEFAULT_MODE } from '../constants';
import {
  getDefaultColorScheme,
  getSystemMode,
  getColorSchemeClasses,
  setTheme,
  saveColorScheme,
  saveMode,
} from '../utils';
import { STORAGE_KEYS } from '../constants';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialConfig = {},
}) => {
  // Initialize state with stored preferences or defaults
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() =>
    initialConfig.colorScheme || getDefaultColorScheme()
  );

  const [mode, setModeState] = useState<Mode>(() =>
    initialConfig.mode || DEFAULT_MODE
  );

  const [systemMode, setSystemMode] = useState<Mode>(() =>
    getSystemMode()
  );

  const [useSystemMode, setUseSystemMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USE_SYSTEM);
    return stored ? JSON.parse(stored) : true;
  });

  // Persist color scheme changes
  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
    saveColorScheme(newScheme);
    setTheme(newScheme, useSystemMode ? systemMode : mode);
  };

  // Persist mode changes
  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    saveMode(newMode);
    setTheme(colorScheme, useSystemMode ? systemMode : newMode);
  };

  // Toggle mode handler
  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  // Handle system mode preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newMode = e.matches ? 'dark' : 'light';
      setSystemMode(newMode);
      if (useSystemMode) {
        setTheme(colorScheme, newMode);
      }
    };

    // Initial setup
    setSystemMode(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorScheme, useSystemMode]);

  // Handle system mode usage changes
  useEffect(() => {
    localStorage.setItem('use-system-mode', JSON.stringify(useSystemMode));
    const activeMode = useSystemMode ? systemMode : mode;
    setTheme(colorScheme, activeMode);
  }, [useSystemMode, systemMode, mode, colorScheme]);

  // Memoize color scheme classes
  const colorSchemeClasses = useMemo(
    () => getColorSchemeClasses(colorScheme, useSystemMode ? systemMode : mode),
    [colorScheme, mode, systemMode, useSystemMode]
  );

  // Memoize context value
  const value = useMemo<ThemeContextType>(() => ({
    colorScheme,
    mode: useSystemMode ? systemMode : mode,
    systemMode,
    useSystemMode,
    colorSchemeClasses,
    setColorScheme,
    setMode,
    toggleMode,
    setUseSystemMode,
  }), [
    colorScheme,
    mode,
    systemMode,
    useSystemMode,
    colorSchemeClasses
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
