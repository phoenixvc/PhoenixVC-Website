import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCssVariables } from "./useCssVariables";
import {
  ThemeName,
  ThemeMode,
  ThemeState,
  ThemeContextType,
  ThemeProviderProps,
  CssVariableConfig,
  ThemeContext
} from "@/theme/types";
import { ThemeConfigValidation } from "./validation";
import {
  generateSchemeSemantics,
  generateThemeVariables,
  loadTheme,
  isThemeCached,
  preloadTheme as preloadThemeUtil,
  ThemeLoaderConfig
} from ".";
import { ExtendedThemeState } from "../types/context/state";
import { TypographyScale } from "../mappings";
import { themeCore } from "../core/theme-core";
import { useSystemModeContext } from "@/SystemModeContext";
import {
  getThemeClassNames,
  getSpecificClass,
  isThemeClass,
  replaceThemeClasses,
  getAllThemeClasses
} from "./theme-provider-utils";

const defaultState: ThemeState = {
  name: "Default Theme",
  themeName: "classic",
  mode: "light",
  useSystem: true,
  systemMode: "light",
  initialized: false,
  timestamp: Date.now(),
  direction: "ltr",
  version: "1.0.0",
  previous: {
    themeName: "classic",
    mode: "light"
  }
};

const ThemeProviderInner: React.FC<ThemeProviderProps> = ({ children, config = {}, className, onThemeChange }) => {
  const [state, setState] = useState<ThemeState>({ ...defaultState, ...config });
  const [error, setError] = useState<Error | null>(null);
  const [loadingTheme, setLoadingTheme] = useState<boolean>(false);

  // Get systemMode from context instead of using useSystemMode hook
  const { systemMode, useSystemMode, setUseSystemMode: setUseSystemModeContext } = useSystemModeContext();
  const { applyCssVariables, getCssVariable } = useCssVariables();

  // Effect to sync system mode with theme state
  useEffect(() => {
    if (state.useSystem && systemMode !== state.mode) {
      setMode(systemMode);
    }
  }, [systemMode, state.useSystem]);

  // Effect to sync useSystem preference with context
  useEffect(() => {
    if (useSystemMode !== state.useSystem) {
      setUseSystemModeContext(state.useSystem);
    }
  }, [state.useSystem, setUseSystemModeContext, useSystemMode]);

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

        setLoadingTheme(true);
        const theme = await loadTheme(state.themeName);
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
      } finally {
        setLoadingTheme(false);
      }
    };

    if (!state.initialized && !error) {
      void initializeTheme();
    }
  }, [state.themeName, state.mode, state.initialized, error, applyCssVariables]);

  // Ensure getThemeState returns the correct type
  const getThemeState = useCallback((): ExtendedThemeState => {
    return {
      ...state,
      systemMode,
      previous: state.previous || {
        themeName: state.themeName,
        mode: state.mode
      }
    };
  }, [state, systemMode]);

  // Modified setThemeClasses function
  const setThemeClasses = useCallback((themeName: ThemeName): void => {
    if (themeName === state.themeName) {
      return;
    }

    if (!themeCore.isThemeCached(themeName)) {
      setLoadingTheme(true);
    }

    themeCore.setColorScheme(themeName)
      .then(() => {
        setState(prev => {
          if (prev.themeName === themeName) {
            return prev;
          }

          return {
            ...prev,
            themeName: themeName,
            previous: {
              themeName: prev.themeName,
              mode: prev.mode
            },
            timestamp: Date.now(),
            // Don't force re-initialization if not necessary
            initialized: themeCore.isThemeCached(themeName)
          };
        });

        if (onThemeChange) {
          onThemeChange({
            currentThemeName: themeName,
            currentMode: state.mode,
            previousThemeName: state.themeName,
            previousMode: state.mode,
            source: "user"
          });
        }
      })
      .catch(err => {
        console.error(`Failed to load theme "${themeName}":`, err);
        setError(err instanceof Error ? err : new Error(`Failed to load theme "${themeName}"`));
      })
      .finally(() => {
        // Only clear loading state if we set it earlier
        if (!themeCore.isThemeCached(themeName)) {
          setLoadingTheme(false);
        }
      });
  }, [state.themeName, state.mode, onThemeChange]);

  const setMode = useCallback((mode: ThemeMode): void => {
    // Don't update if the mode hasn't changed
    if (mode === state.mode) {
      return;
    }

    themeCore.setMode(mode)
      .then(() => {
        setState(prev => {
          // Prevent unnecessary updates if the mode hasn't changed
          if (prev.mode === mode) {
            return prev;
          }

          return {
            ...prev,
            mode,
            previous: {
              themeName: prev.themeName,
              mode: prev.mode
            },
            timestamp: Date.now()
          };
        });

        if (onThemeChange) {
          onThemeChange({
            currentThemeName: state.themeName,
            currentMode: mode,
            previousThemeName: state.themeName,
            previousMode: state.mode,
            source: "user"
          });
        }
      })
      .catch(err => {
        console.error(`Failed to set mode "${mode}":`, err);
      });
  }, [state.themeName, state.mode, onThemeChange]);

  const toggleMode = useCallback((): void => {
    const newMode = state.mode === "light" ? "dark" : "light";
    setMode(newMode);
  }, [state.mode, setMode]);

  const setUseSystemMode = useCallback((useSystem: boolean): void => {
    // Update both local state and context
    setUseSystemModeContext(useSystem);

    // Use themeCore to set system mode usage
    themeCore.setUseSystem(useSystem)
      .then(() => {
        setState(prev => ({
          ...prev,
          useSystem,
          timestamp: Date.now()
        }));

        if (useSystem && systemMode !== state.mode) {
          if (onThemeChange) {
            onThemeChange({
              currentThemeName: state.themeName,
              currentMode: systemMode,
              previousThemeName: state.themeName,
              previousMode: state.mode,
              source: "system"
            });
          }

          // If using system mode, update the theme mode to match system
          setMode(systemMode);
        }
      })
      .catch(err => {
        console.error(`Failed to set use system mode "${useSystem}":`, err);
      });
  }, [setUseSystemModeContext, systemMode, state.themeName, state.mode, onThemeChange, setMode]);

  const toggleUseSystem = useCallback((): void => {
    setUseSystemMode(!state.useSystem);
  }, [state.useSystem, setUseSystemMode]);

  // Include the rest of the utility functions
  const getComputedThemeStyles = useCallback((): CSSStyleDeclaration => {
    return getComputedStyle(document.documentElement);
  }, []);

  const isThemeSupported = useCallback((themeName: ThemeName): boolean => {
    const registry = themeCore.getComponentRegistry();
    return Object.keys(registry).includes(themeName);
  }, []);

  // Theme loading status
  const isThemeLoading = useCallback((): boolean => {
    return loadingTheme;
  }, [loadingTheme]);

  // Theme cache utilities
  const preloadThemeHandler = useCallback(async (themeName: ThemeName, config?: Partial<ThemeLoaderConfig>): Promise<void> => {
    try {
      await preloadThemeUtil(themeName, config);
    } catch (err) {
      console.error(`[ThemeProvider] Failed to preload theme "${themeName}":`, err);
      throw err;
    }
  }, []);

  const clearThemeCache = useCallback((): void => {
    themeCore.clearThemeCache();
  }, []);

  const getCacheStatus = useCallback((): { size: number; schemes: ThemeName[] } => {
    return themeCore.getCacheStatus();
  }, []);

  const typography = useMemo(() => ({
    getScale: (element: string): TypographyScale | undefined => {
      return themeCore.getTypographyScale(element);
    },
    getComponentTypography: (component: string, variant?: string, mode?: string): TypographyScale | undefined => {
      return themeCore.getComponentTypography(component, variant || "default");
    }
  }), []);

  const getComponentStyle = useCallback((component: string, variant?: string, state?: string, mode?: string): React.CSSProperties => {
    return themeCore.getComponentStyle(component, variant, state);
  }, []);

  const resetTheme = useCallback(async (): Promise<void> => {
    try {
      await themeCore.setColorScheme(defaultState.themeName);
      await themeCore.setMode(defaultState.mode);

      setState({
        ...defaultState,
        timestamp: Date.now(),
        previous: {
          themeName: state.themeName,
          mode: state.mode
        }
      });

      if (onThemeChange) {
        onThemeChange({
          currentThemeName: defaultState.themeName,
          currentMode: defaultState.mode,
          previousThemeName: state.themeName,
          previousMode: state.mode,
          source: "default"
        });
      }
    } catch (err) {
      console.error("Failed to reset theme:", err);
    }
  }, [state.themeName, state.mode, onThemeChange]);

  const contextValue = useMemo((): ThemeContextType => ({
    // Required properties
    themeName: state.themeName,
    themeMode: state.mode,
    systemMode,
    useSystemMode: state.useSystem,
    getThemeClassNames,
    getSpecificClass: (suffix) => getSpecificClass(state.themeName, suffix),
    replaceThemeClasses: (currentClasses, newScheme) => replaceThemeClasses(currentClasses, newScheme, state.mode),
    setThemeClasses,
    setMode,
    toggleMode,
    setUseSystemMode,
    getCssVariable: (name: string, config?: Partial<CssVariableConfig>) => getCssVariable(name),
    getAllThemeClasses,
    isThemeClass,

    // Theme loading status
    isThemeLoading,

    // Theme cache utilities
    isThemeCached,
    preloadTheme: preloadThemeHandler,
    clearThemeCache,
    getCacheStatus,

    // Optional methods
    getComputedThemeStyles,
    isThemeSupported,
    getThemeState,
    resetTheme,
    subscribeToThemeChanges: (callback) => {
      const observer = new MutationObserver(() => {
        callback(getThemeState());
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });
      return () => observer.disconnect();
    },
    toggleUseSystem,

    // Typography support
    typography,

    // Component style support
    getComponentStyle,
  }), [state, systemMode, getCssVariable, loadingTheme, setThemeClasses, setMode, toggleMode, setUseSystemMode, isThemeLoading, preloadThemeHandler, clearThemeCache, getCacheStatus, getComputedThemeStyles, isThemeSupported, getThemeState, resetTheme, getComponentStyle]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={`${className || ""} ${getThemeClassNames(state.themeName).base} ${getThemeClassNames(state.themeName)[state.mode]}`}
        data-theme={state.themeName}
        data-mode={state.mode}
        data-loading={loadingTheme ? "true" : "false"}
      >
        {loadingTheme && (
          <div className="theme-loading-indicator" style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(to right, transparent, var(--color-primary-500), transparent)", zIndex: 9999 }} />
        )}
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProviderInner;
