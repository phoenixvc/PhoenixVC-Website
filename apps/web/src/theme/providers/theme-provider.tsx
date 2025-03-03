import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useSystemMode } from "./useSystemMode"; // Custom hook for system mode handling
import { useCssVariables } from "./useCssVariables"; // Custom hook for managing CSS variables
import { ThemeErrorBoundary } from "@/theme/components/theme-error-boundary";
import {
  ThemeColorScheme,
  ThemeState,
  ThemeContextType,
  ThemeProviderProps
} from "@/theme/types";
import { ThemeConfigValidation } from "./validation";
import { generateSchemeSemantics, generateThemeVariables, loadTheme } from ".";


const defaultState: ThemeState = {
  colorScheme: "classic",
  mode: "light",
  useSystem: true,
  systemMode: "light",
  initialized: false,
  timestamp: Date.now(),
  direction: "ltr",
  version: "1.0.0",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, config = {}, className, onThemeChange }) => {
  const [state, setState] = useState<ThemeState>({ ...defaultState, ...config });
  const [error, setError] = useState<Error | null>(null);

  const { systemMode } = useSystemMode(state.useSystem, setState);
  const { applyCssVariables } = useCssVariables();

  useEffect(() => {
    const validationResult = ThemeConfigValidation.validateThemeConfig(config);
    if (!validationResult.isValid) {
      const firstError = validationResult.errors?.[0];
      setError(new Error(`${firstError.code}: ${firstError.message}`));
    }
  }, [config]);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        console.log("[ThemeProvider] Starting theme initialization...");
        console.log("[ThemeProvider] Current state:", state);

        const theme = await loadTheme(state.colorScheme);
        console.log("[ThemeProvider] Loaded theme:", theme);

        const semantics = generateSchemeSemantics(theme, state.mode);
        console.log("[ThemeProvider] Generated semantics:", semantics);

        const variables = generateThemeVariables(theme, state.mode);
        console.log("[ThemeProvider] Generated variables:", variables);

        applyCssVariables(variables.computed);
        setState((prev) => ({ ...prev, initialized: true }));
      } catch (err) {
        console.error("[ThemeProvider] Theme initialization failed:", err);
        setError(err instanceof Error ? err : new Error("Theme initialization failed"));
      }
    };

    if (!state.initialized && !error) {
      initializeTheme();
    }
  }, [state.colorScheme, state.mode, state.initialized, error, applyCssVariables]);

  const contextValue = useMemo((): ThemeContextType => ({
    colorScheme: state.colorScheme,
    mode: state.mode,
    systemMode,
    useSystemMode: state.useSystem,
    resetTheme: () => setState({ ...defaultState, timestamp: Date.now() }),
    subscribeToThemeChanges: (callback) => {
      const observer = new MutationObserver(() => {
        callback(contextValue.getThemeState());
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });
      return () => observer.disconnect();
    },
    getThemeState: () => ({ ...state, systemMode }),
  }), [state, systemMode]);

  if (error) {
    return (
      <ThemeErrorBoundary>
        <div className={className} data-theme={state.colorScheme} data-mode={state.mode}>
          <p>Error loading theme: {error.message}</p>
        </div>
      </ThemeErrorBoundary>
    );
  }

  return (
    <ThemeErrorBoundary>
      <ThemeContext.Provider value={contextValue}>
        <div className={className} data-theme={state.colorScheme} data-mode={state.mode}>
          {children}
        </div>
      </ThemeContext.Provider>
    </ThemeErrorBoundary>
  );
};
