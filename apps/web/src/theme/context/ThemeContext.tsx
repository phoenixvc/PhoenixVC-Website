import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ColorScheme, Mode, ThemeContextType, ThemeProviderProps } from "../types";
import { DEFAULT_MODE, STORAGE_KEYS } from "../constants";
import {
  getDefaultColorScheme,
  getSystemMode,
  getColorSchemeClasses,
  setTheme,
  saveColorScheme,
  saveMode,
} from "../utils";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialConfig = {} }) => {
  /** 1. Load color scheme from storage or use default */
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() =>
    initialConfig.colorScheme || getDefaultColorScheme()
  );

  /** 2. Load theme mode from storage or use default */
  const [mode, setModeState] = useState<Mode>(() =>
    initialConfig.mode || DEFAULT_MODE
  );

  /** 3. Track system preference changes (light/dark) */
  const [systemMode, setSystemMode] = useState<Mode>(() => getSystemMode());

  /** 4. Load 'use system mode' from localStorage or default to true */
  const [useSystemModeState, setUseSystemModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USE_SYSTEM);
        return stored ? JSON.parse(stored) : true;
      } catch (err) {
        console.warn("[ThemeProvider] Failed to parse system mode from localStorage:", err);
        return true; // fallback
      }
    }
    return true; // fallback if SSR
  });

  /**
   * 5. Helper to set useSystemMode and persist to localStorage
   */
  const handleSetUseSystemMode = (val: boolean) => {
    setUseSystemModeState(val);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.USE_SYSTEM, JSON.stringify(val));
      } catch (err) {
        console.warn("[ThemeProvider] Failed to save system mode:", err);
      }
    }
  };

  /**
   * 6. Effective mode = systemMode if useSystemMode is true, else user-chosen mode
   */
  const effectiveMode = useSystemModeState ? systemMode : mode;

  /**
   * 7. Watch for system preference changes
   *    If user has 'useSystemMode' turned on, we update theme automatically
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newMode = e.matches ? "dark" : "light";
      setSystemMode(newMode);
      if (useSystemModeState) {
        setTheme(colorScheme, newMode);
        console.log(`[ThemeProvider] System changed -> ${newMode}`);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [colorScheme, useSystemModeState]);

  /**
   * 8. Whenever colorScheme or effectiveMode changes, apply them via setTheme
   */
  useEffect(() => {
    setTheme(colorScheme, effectiveMode);
    console.log(`[ThemeProvider] Applied theme: theme-${colorScheme}-${effectiveMode}`);
  }, [colorScheme, effectiveMode]);

  /**
   * 9. Set color scheme (and persist it)
   */
  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
    saveColorScheme(newScheme);
    console.log(`[ThemeProvider] colorScheme changed -> ${newScheme}`);
  };

  /**
   * 10. Set mode (and persist it), disabling system mode
   */
  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    saveMode(newMode);
    // Turn off system mode whenever user explicitly sets a mode
    handleSetUseSystemMode(false);
    console.log(`[ThemeProvider] Mode set -> ${newMode}, system mode disabled`);
  };

  /**
   * 11. Toggle between light and dark
   */
  const toggleMode = () => {
    const toggled = mode === "light" ? "dark" : "light";
    setMode(toggled);
  };

  /**
   * 12. Memoized context value
   */
  const value: ThemeContextType = useMemo(() => ({
    colorScheme,
    // Expose the effective mode as "mode" so the UI can see what's truly active
    mode: effectiveMode,
    systemMode,
    useSystemMode: useSystemModeState,
    colorSchemeClasses: getColorSchemeClasses(colorScheme, effectiveMode),
    setColorScheme,
    setMode,
    toggleMode,
    setUseSystemMode: handleSetUseSystemMode,
  }), [
    colorScheme,
    effectiveMode,
    systemMode,
    useSystemModeState,
  ]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Custom hook to use the theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
