import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useSystemMode } from "./useSystemMode";
import { useCssVariables } from "./useCssVariables";
import { ThemeErrorBoundary } from "@/theme/components/theme-error-boundary";
import {
  ThemeName,
  ThemeMode,
  ThemeState,
  ThemeContextType,
  ThemeProviderProps,
  ThemeClassSuffix,
  CssVariableConfig
} from "@/theme/types";
import { ThemeConfigValidation } from "./validation";
import {
  generateSchemeSemantics,
  generateThemeVariables,
  loadTheme,
  isThemeCached,
  preloadTheme as preloadThemeUtil,
  clearThemeCache as clearThemeCacheUtil,
  getCacheStatus as getCacheStatusUtil,
  ThemeLoaderConfig
} from ".";
import { ExtendedThemeState } from "../types/context/state";
import { Theme } from "../core/theme";
import { TypographyScale } from "../mappings";
import { themeCore } from "../core/theme-core";

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
  const [loadingTheme, setLoadingTheme] = useState<boolean>(false);

  // Fix type mismatch by creating a wrapper function that handles the type conversion
  const updateState = (update: React.SetStateAction<{ systemMode: ThemeMode; mode: ThemeMode }>) => {
    setState(prevState => {
      if (typeof update === "function") {
        const updatedValues = update({ systemMode: prevState.systemMode, mode: prevState.mode });
        return { ...prevState, ...updatedValues };
      }
      return { ...prevState, ...update };
    });
  };

  const { systemMode } = useSystemMode(state.useSystem, updateState);
  const { applyCssVariables, getCssVariable } = useCssVariables();

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

        setThemeClasses(state.themeName);

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
  const getThemeState = (): ExtendedThemeState => {
    return {
      ...state,
      systemMode,
      previous: state.previous || {
        themeName: state.themeName,
        mode: state.mode
      }
    };
  };

  const getThemeClassNames = (scheme: ThemeName): Record<string,string> => {
    return themeCore.getThemeClasses(scheme);
  };

  const getSpecificClass = (suffix: ThemeClassSuffix): string | unknown=> {
    const classes = getThemeClassNames(state.themeName);
    return classes[suffix] || classes.base;
  };

  const isThemeClass = (className: string): boolean => {
    // TODO: Implement more robust check using themeCore
    const allThemes = Object.keys(themeCore.getAllComponentVariants()) as ThemeName[];
    return allThemes.some(themeName => {
      const classes = themeCore.getThemeClasses(themeName);
      return Object.values(classes).includes(className);
    });
  };

  //TODO: move to core
  const replaceThemeClasses = (currentClasses: string, newScheme: ThemeName): string => {
    const classArray = currentClasses.split(" ");
    const filteredClasses = classArray.filter(cls => !isThemeClass(cls));
    const newClasses = getThemeClassNames(newScheme);
    return [...filteredClasses, newClasses.base, newClasses[state.mode as keyof Theme]].join(" ");
  };

  const getAllThemeClasses = (): Record<ThemeName, Record<string, string>> => {
    // TODO: Implement using themeCore
    const allThemes = Object.keys(themeCore.getAllComponentVariants()) as ThemeName[];
    return allThemes.reduce((acc, themeName) => {
      acc[themeName] = themeCore.getThemeClasses(themeName);
      return acc;
    }, {} as Record<ThemeName, Record<string, string>>);
  };

  const setThemeClasses = (themeName: ThemeName): void => {
    // Set loading state if theme is not cached
    if (!themeCore.isThemeCached(themeName)) {
      setLoadingTheme(true);
    }

    // Use themeCore to set the color scheme
    themeCore.setColorScheme(themeName)
      .then(() => {
        setState(prev => ({
          ...prev,
          themeName: themeName,
          previous: {
            themeName: prev.themeName,
            mode: prev.mode
          },
          timestamp: Date.now(),
          initialized: false // Force re-initialization with new theme
        }));

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
  };

  const setMode = (mode: ThemeMode): void => {
    // Use themeCore to set the mode
    themeCore.setMode(mode)
      .then(() => {
        setState(prev => ({
          ...prev,
          mode,
          previous: {
            themeName: prev.themeName,
            mode: prev.mode
          },
          timestamp: Date.now()
        }));

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
  };

  const toggleMode = (): void => {
    const newMode = state.mode === "light" ? "dark" : "light";
    setMode(newMode);
  };

  const setUseSystemMode = (useSystem: boolean): void => {
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
        }
      })
      .catch(err => {
        console.error(`Failed to set use system mode "${useSystem}":`, err);
      });
  };

  const toggleUseSystem = (): void => {
    setUseSystemMode(!state.useSystem);
  };

  const getComputedThemeStyles = (): CSSStyleDeclaration => {
    return getComputedStyle(document.documentElement);
  };

  const isThemeSupported = (themeName: ThemeName): boolean => {
    // TODO: Implement logic to check if the scheme is supported using themeCore
    const registry = themeCore.getComponentRegistry();
    return Object.keys(registry).includes(themeName);
  };

  // Theme loading status
  const isThemeLoading = (): boolean => {
    return loadingTheme;
  };

  // Theme cache utilities
  const preloadThemeHandler = async (themeName: ThemeName, config?: Partial<ThemeLoaderConfig>): Promise<void> => {
    try {
      await preloadThemeUtil(themeName, config);
    } catch (err) {
      console.error(`[ThemeProvider] Failed to preload theme "${themeName}":`, err);
      throw err;
    }
  };

  const clearThemeCache = (): void => {
    themeCore.clearThemeCache();
  };

  const getCacheStatus = (): { size: number; schemes: ThemeName[] } => {
    return themeCore.getCacheStatus();
  };

  const typography = {
    getScale: (element: string): TypographyScale | undefined => {
      return themeCore.getTypographyScale(element);
    },
    getComponentTypography: (component: string, variant?: string, mode?: string): TypographyScale | undefined => {
      return themeCore.getComponentTypography(component, variant || "default");
    }
  };

  const getComponentStyle = (component: string, variant?: string, state?: string, mode?: string): React.CSSProperties => {
    return themeCore.getComponentStyle(component, variant, state);
  };

  const resetTheme = async (): Promise<void> => {
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
  };

  const contextValue = useMemo((): ThemeContextType => ({
    // Required properties
    themeName: state.themeName,
    themeMode: state.mode,
    systemMode,
    useSystemMode: state.useSystem,
    getThemeClassNames,
    getSpecificClass,
    replaceThemeClasses: replaceThemeClasses,
    setThemeClasses,
    setMode,
    toggleMode,
    setUseSystemMode,
    getCssVariable: (name: string, config?: Partial<CssVariableConfig>) => getCssVariable(name),
    getAllThemeClasses,
    isThemeClass: isThemeClass,

    // Theme loading status
    isThemeLoading,

    // Theme cache utilities
    isThemeCached,
    preloadTheme: preloadThemeHandler,
    clearThemeCache,
    getCacheStatus,

    // Optional methods
    getComputedThemeStyles,
    isThemeSupported: isThemeSupported,
    getThemeState,
    resetTheme: void resetTheme,
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
  }), [state, systemMode, getCssVariable, loadingTheme]);

  if (error) {
    return (
      <ThemeErrorBoundary>
        <div className={className} data-theme={state.themeName} data-mode={state.mode}>
          <p>Error loading theme: {error.message}</p>
        </div>
      </ThemeErrorBoundary>
    );
  }

  return (
    <ThemeErrorBoundary>
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
    </ThemeErrorBoundary>
  );
};
