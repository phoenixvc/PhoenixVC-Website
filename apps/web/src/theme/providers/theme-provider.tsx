// ThemeProvider.tsx
import { createContext, useEffect, useMemo, useContext, useState } from 'react';
import {
  ColorScheme,
  Mode,
  ThemeProviderProps,
  ThemeConfig
} from '../types/theme';
import { ThemeState } from '../core/theme-state';
import { ThemeClassesManager } from '../utils/theme-classes-manager';
import { ThemeErrorBoundary } from '../components/theme-error-boundary';
import { ThemeContextType } from '../types/theme/state/context';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  config = {},
  className,
  onThemeChange
}) => {
  // Local React state for UI updates
  const [colorScheme, setLocalColorScheme] = useState<ColorScheme>(config.colorScheme || 'classic');
  const [mode, setLocalMode] = useState<Mode>(config.mode || 'light');
  const [useSystemMode, setLocalUseSystemMode] = useState(config.useSystemColorScheme || false);

  // Singleton state instance
  const [themeInstance] = useState(() => ThemeState.getInstance());
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme state
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // TODO Initialize singleton state
        // await themeInstance.initialize({
        //   colorScheme: config.colorScheme,
        //   mode: config.mode,
        //   useSystemMode: config.useSystemMode,
        //   storage: config.storage ? {
        //     type: config.storage.type || 'localStorage',
        //     prefix: config.storage.prefix || 'theme',
        //     disabled: config.storage.disabled || false
        //   } : undefined,
        //   transition: config.transition
        // });

        // Sync React state with singleton state
        const state = themeInstance.getState();
        setLocalColorScheme(state.colorScheme);
        setLocalMode(state.mode);
        setLocalUseSystemMode(state.useSystemMode);
        setIsInitialized(true);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Theme initialization failed');
        setError(error);
        console.error('[ThemeProvider] Initialization error:', error);
      }
    };

    initializeTheme();
  }, []);

  // Subscribe to theme state changes
  useEffect(() => {
    if (!isInitialized) return;

    const handleThemeChange = () => {
      const state = themeInstance.getState();

      // Update local React state
      setLocalColorScheme(state.colorScheme);
      setLocalMode(state.mode);
      setLocalUseSystemMode(state.useSystemMode);

      // Notify parent component
      onThemeChange?.({
        mode: state.mode,
        colorScheme: state.colorScheme,
        // useSystemMode: state.useSystemMode //TODO
      });
    };

    const unsubscribe = themeInstance.subscribe(handleThemeChange);
    return () => unsubscribe();
  }, [isInitialized, onThemeChange]);

  // Theme context value
  const value = useMemo((): ThemeContextType => ({
    // Current theme state (from React state for UI updates)
    colorScheme,
    mode,
    useSystemMode,
    systemMode: themeInstance.getState().systemMode,

    // Theme classes
    colorSchemeClasses: ThemeClassesManager.getColorSchemeClasses(colorScheme),
    getColorSchemeClasses: ThemeClassesManager.getColorSchemeClasses,

    getSpecificClass: (suffix: string): string =>
      ThemeClassesManager.getSpecificClass(colorScheme, suffix),

    replaceColorSchemeClasses: (currentClasses: string, newScheme: ColorScheme): string =>
      ThemeClassesManager.replaceColorSchemeClasses(currentClasses, colorScheme, newScheme),

    // Theme actions (update both React state and singleton)
    setColorScheme: async (newScheme: ColorScheme) => {
      try {
        await themeInstance.setColorScheme(newScheme);
        setLocalColorScheme(newScheme);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to set color scheme');
        setError(error);
        throw error;
      }
    },

    setMode: async (newMode: Mode) => {
      try {
        await themeInstance.setMode(newMode);
        setLocalMode(newMode);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to set mode');
        setError(error);
        throw error;
      }
    },

    toggleMode: async () => {
      try {
        const newMode = mode === 'light' ? 'dark' : 'light';
        await themeInstance.setMode(newMode);
        setLocalMode(newMode);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to toggle mode');
        setError(error);
        throw error;
      }
    },

    setUseSystemMode: async (useSystem: boolean) => {
      try {
        await themeInstance.setUseSystemMode(useSystem);
        setLocalUseSystemMode(useSystem);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to set system mode');
        setError(error);
        throw error;
      }
    },

    // Theme utilities
    getCssVariable: (name: string): string => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(`--theme-${colorScheme}-${name}`).trim();
    },

    getAllThemeClasses: (): Record<ColorScheme, any> =>
      ThemeClassesManager.getAllThemeClasses(),

    isColorSchemeClass: (className: string): boolean =>
      ThemeClassesManager.isColorSchemeClass(className, colorScheme),
  }), [colorScheme, mode, useSystemMode]);

  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeErrorBoundary
      // hasError={!!error}
      // onError={() => {
      //TODO
      //   // Handle error here
      //   console.error('[ThemeProvider] Error:', error);
      // }}
      // fallback={<div>Theme Error: {error?.message}</div>}
    >
      <ThemeContext.Provider value={value}>
        <div className={className}>
          {children}
        </div>
      </ThemeContext.Provider>
    </ThemeErrorBoundary>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
