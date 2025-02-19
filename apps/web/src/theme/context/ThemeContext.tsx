// src/theme/utils/index.ts (for reference)
// Make sure your utils functions (getDefaultColorScheme, getSystemMode, getColorSchemeClasses, setTheme, saveColorScheme, saveMode)
// are defined appropriately. The ThemeProvider below relies on these functions.

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ColorScheme, Mode, ThemeContextType, ThemeProviderProps } from "../types";
import { STORAGE_KEYS } from "../constants";
import {
  getDefaultColorScheme,
  getSystemMode,
  getColorSchemeClasses,
  setTheme,
  saveColorScheme,
  saveMode,
} from "../utils";

// Create the context (exported for use in custom hooks)
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialConfig = {} }) => {
  // 1. Load the color scheme from initialConfig, localStorage, or use the default.
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() =>
    initialConfig.colorScheme || getDefaultColorScheme()
  );

  // 2. Load the theme mode from initialConfig; if not provided, default to the system mode.
  const [mode, setModeState] = useState<Mode>(() =>
    initialConfig.mode || getSystemMode()
  );

  // 3. Track the system-preferred mode (updates via matchMedia)
  const [systemMode, setSystemMode] = useState<Mode>(() => getSystemMode());

  // 4. Load the "use system mode" flag from localStorage; default to true.
  const [useSystemModeState, setUseSystemModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USE_SYSTEM);
        return stored ? JSON.parse(stored) : true;
      } catch (err) {
        console.warn("[ThemeProvider] Failed to parse system mode from localStorage:", err);
        return true;
      }
    }
    return true;
  });

  // 5. Helper to update and persist the "use system mode" flag.
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

  // 6. Determine the effective mode: if "use system" is enabled, use the systemMode; otherwise, the user-selected mode.
  const effectiveMode = useSystemModeState ? systemMode : mode;

  // 7. Listen for system-preference changes (e.g. if user changes OS theme)
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

  // 8. Whenever the color scheme or effective mode changes, apply the theme.
  useEffect(() => {
    setTheme(colorScheme, effectiveMode);
    console.log(`[ThemeProvider] Applied theme: theme-${colorScheme}-${effectiveMode}`);
  }, [colorScheme, effectiveMode]);

  // 9. Update color scheme and persist.
  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
    saveColorScheme(newScheme);
    console.log(`[ThemeProvider] Color scheme changed -> ${newScheme}`);
  };

  // 10. Update the mode (and disable system mode on explicit action).
  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    saveMode(newMode);
    handleSetUseSystemMode(false);
    console.log(`[ThemeProvider] Mode set -> ${newMode}, system mode disabled`);
  };

  // 11. Toggle between light and dark modes.
  const toggleMode = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  // 12. Memoize the context value to prevent unnecessary re-renders.
  const value: ThemeContextType = useMemo(() => ({
    colorScheme,
    mode: effectiveMode,
    systemMode,
    useSystemMode: useSystemModeState,
    colorSchemeClasses: getColorSchemeClasses(colorScheme, effectiveMode),
    setColorScheme,
    setMode,
    toggleMode,
    setUseSystemMode: handleSetUseSystemMode,
  }), [colorScheme, effectiveMode, systemMode, useSystemModeState]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook for consuming the theme context.
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
