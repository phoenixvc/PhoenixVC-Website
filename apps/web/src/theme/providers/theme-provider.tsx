import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { loadTheme } from "./theme-loader";
import {
  ThemeColorScheme,
  ThemeMode,
  ThemeState,
  ThemeContextType,
  ThemeProviderProps,
  ThemeChangeEvent,
  ColorSchemeClasses,
  ThemeClassSuffix,
  CssVariableConfig,
  ThemeConfig,
  ValidationResult,
  ValidationError
} from "@/theme/types";
import { generateSchemeSemantics, generateThemeVariables } from "./theme-variables";
import { validateProcessedTheme, validateThemeConfig } from "./validation";
import { ThemeErrorBoundary } from "@/theme/components/theme-error-boundary";
import { ExtendedThemeState } from "@/theme/types/context/state";

const SUPPORTED_COLOR_SCHEMES: ThemeColorScheme[] = ["classic"];

const defaultState: ThemeState = {
  colorScheme: "classic",
  mode: "light",
  useSystem: true,
  systemMode: "light",
  initialized: false,
  timestamp: Date.now(),
  direction: "ltr",
  version: "1.0.0"
};

const validateConfig = (config: Partial<ThemeConfig>): ValidationResult => {
  try {
    validateThemeConfig(config);
    return {
      isValid: true,
      path: "theme",
      value: config
    };
  } catch (err) {
    const error: ValidationError = {
      code: "INVALID_THEME_CONFIG",
      message: err instanceof Error ? err.message : "Invalid theme configuration",
      path: "theme",
      details: {
        error: err instanceof Error ? err.message : String(err),
        config: config
      }
    };

    console.error("[ThemeProvider] Configuration validation error:", error);

    return {
      isValid: false,
      errors: [error],
      path: "theme",
      value: config
    };
  }
};

const generateColorSchemeClasses = (scheme: ThemeColorScheme): ColorSchemeClasses => ({
  primary: `theme-${scheme}-primary`,
  secondary: `theme-${scheme}-secondary`,
  text: `theme-${scheme}-text`,
  activeText: `theme-${scheme}-active-text`,
  background: `theme-${scheme}-background`,
  hoverBg: `theme-${scheme}-hover-bg`,
  activeBg: `theme-${scheme}-active-bg`,
  mobileMenu: `theme-${scheme}-mobile-menu`,
  bgMobileMenu: `theme-${scheme}-bg-mobile-menu`,
  border: `theme-${scheme}-border`
});

const formatThemeForLogging = (theme: unknown): string => {
  try {
    if (typeof theme === "string") {
      return theme.substring(0, 200);
    } else if (theme === null) {
      return "null";
    } else if (typeof theme === "object") {
      return JSON.stringify(theme).substring(0, 200);
    } else {
      return String(theme).substring(0, 200);
    }
  } catch (e) {
    return `[Unable to stringify theme: ${typeof theme}, error: ${e}]`;
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  config = {},
  className,
  onThemeChange
}) => {
  const [state, setState] = useState<ThemeState>(() => ({
    ...defaultState,
    ...config,
    initialized: false
  }));
  const [error, setError] = useState<Error | null>(null);

  const validationResult = useMemo(() => validateConfig(config), [
    config.defaultScheme,
    config.defaultMode,
    config.useSystem,
    config.storage?.type,
    config.storage?.prefix,
    config.storage?.version,
    config.transition?.duration,
    config.transition?.timing,
    config.debug,
    config.disableTransitionsOnLoad,
    config.forceColorScheme
  ]);

  useEffect(() => {
    if (!validationResult.isValid && validationResult.errors?.[0]) {
      const firstError = validationResult.errors[0];
      const error = new Error(`${firstError.code}: ${firstError.message}`) as Error & { details: ValidationError };
      error.details = firstError; // Attach the full validation error for reference
      setError(error);
    } else {
      setError(null);
    }
  }, [validationResult]);

  useEffect(() => {
    try {
      validateThemeConfig(config);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Invalid theme configuration"));
    }
  }, [config]);

    useEffect(() => {
      const initTheme = async () => {
        try {
          console.log("[ThemeProvider] Starting theme initialization...");
          console.log("[ThemeProvider] Current state:", {
            colorScheme: state.colorScheme,
            mode: state.mode,
            initialized: state.initialized
          });

          const theme = await loadTheme(state.colorScheme);
          console.groupCollapsed("[ThemeProvider] Loaded theme data");
          console.log("Theme type:", typeof theme);
          console.log("Raw object:", theme);
          console.log("Stringified object:", JSON.stringify(theme, null, 2).substring(0, 500) + "...");
          console.groupEnd();

          console.log("[ThemeProvider] Generating semantics...");
          const semantics = generateSchemeSemantics(theme, state.mode);
          console.log("[ThemeProvider] semantics generated:", {
            semanticsGenerated: Object.keys(semantics)
          });

          console.log("[ThemeProvider] Generating variables...");
          const variables = generateThemeVariables(theme, state.mode);
          console.log("[ThemeProvider] Variables generated:", {
            categoriesGenerated: Object.keys(variables.computed)
          });

          try {
            console.log("[ThemeProvider] Validating theme...");
            validateProcessedTheme(theme);
            console.log("[ThemeProvider] Theme validation successful");
          } catch (validationError) {
            console.error("[ThemeProvider] Theme validation failed:", {
              error: validationError,
              theme: formatThemeForLogging(theme)
            });
            throw validationError;
          }
        // // Example: using ColorUtils to adjust the primary color before applying
        // const adjustedPrimary = ColorUtils.darken(
        //   theme.schemes[state.colorScheme].light.background,
        //   10
        // );
        // console.log("Adjusted primary (for demonstration):", adjustedPrimary);

        // Apply computed theme variables as CSS variables
        Object.entries(variables.computed).forEach(([category, values]) => {
          if (values && typeof values === "object") {
            Object.entries(values as Record<string, string | number>).forEach(([key, value]) => {
              document.documentElement.style.setProperty(`--theme-${category}-${key}`, String(value));
            });
          }
        });

        document.documentElement.setAttribute("data-theme", state.colorScheme);
        document.documentElement.setAttribute("data-mode", state.mode);
        document.documentElement.setAttribute("data-direction", state.direction);

        setState(prev => ({ ...prev, initialized: true }));
         } catch (err) {
        const errorDetails = {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          type: err instanceof Error ? err.constructor.name : typeof err,
          state: {
            colorScheme: state.colorScheme,
            mode: state.mode,
            initialized: state.initialized
          }
        };

        console.error("[ThemeProvider] Detailed initialization error:", errorDetails);

        // If the error is related to HTML content being returned instead of JSON
        if (err instanceof Error && err.message.includes("<!DOCTYPE")) {
          console.error("[ThemeProvider] Received HTML instead of JSON. This might indicate a server error or incorrect endpoint.");
          console.error("[ThemeProvider] First 500 characters of response:",
            err.message.substring(0, 500)
          );
        }

        setError(err instanceof Error ? err : new Error(`Theme initialization failed: ${String(err)}`));
      }
    };

    if (!state.initialized && !error) {
      void initTheme();
    }
  }, [state.colorScheme, state.mode, state.initialized, error]);

  useEffect(() => {
    if (!state.useSystem) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newMode = e.matches ? "dark" : "light";
      setState(prev => {
        const changes: ThemeChangeEvent = {
          previousMode: prev.mode,
          currentMode: newMode,
          previousColorScheme: prev.colorScheme,
          currentColorScheme: prev.colorScheme,
          source: "system"
        };
        onThemeChange?.(changes);
        return { ...prev, systemMode: newMode, mode: newMode };
      });
    };
    const darkModeOn = mediaQuery.matches;
    setState(prev => ({
      ...prev,
      systemMode: darkModeOn ? "dark" : "light",
      mode: darkModeOn ? "dark" : "light"
    }));
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [state.useSystem, onThemeChange]);

  const contextValue = useMemo((): ThemeContextType => ({
    colorScheme: state.colorScheme,
    mode: state.mode,
    systemMode: state.systemMode,
    useSystemMode: state.useSystem,
    colorSchemeClasses: generateColorSchemeClasses(state.colorScheme),
    getColorSchemeClasses: (scheme: ThemeColorScheme): ColorSchemeClasses => generateColorSchemeClasses(scheme),
    getSpecificClass: (suffix: ThemeClassSuffix): string => `theme-${state.colorScheme}-${suffix}`,
    replaceColorSchemeClasses: (currentClasses: string, newScheme: ThemeColorScheme): string => {
      const classRegex = /theme-[\w-]+-(?:base|primary|secondary|accent)/g;
      return currentClasses.replace(classRegex, (match) => {
        const suffix = match.split("-").pop() as ThemeClassSuffix;
        return `theme-${newScheme}-${suffix}`;
      });
    },
    setColorScheme: (colorScheme: ThemeColorScheme) => {
      setState(prev => {
        const changes: ThemeChangeEvent = {
          previousMode: prev.mode,
          currentMode: prev.mode,
          previousColorScheme: prev.colorScheme,
          currentColorScheme: colorScheme,
          source: "user"
        };
        onThemeChange?.(changes);
        return { ...prev, colorScheme, timestamp: Date.now() };
      });
    },
    setMode: (mode: ThemeMode) => {
      setState(prev => {
        const changes: ThemeChangeEvent = {
          previousMode: prev.mode,
          currentMode: mode,
          previousColorScheme: prev.colorScheme,
          currentColorScheme: prev.colorScheme,
          source: "user"
        };
        onThemeChange?.(changes);
        return { ...prev, mode, timestamp: Date.now() };
      });
    },
    toggleMode: () => {
      setState(prev => {
        const newMode = prev.mode === "light" ? "dark" : "light";
        const changes: ThemeChangeEvent = {
          previousMode: prev.mode,
          currentMode: newMode,
          previousColorScheme: prev.colorScheme,
          currentColorScheme: prev.colorScheme,
          source: "user"
        };
        onThemeChange?.(changes);
        return { ...prev, mode: newMode, timestamp: Date.now() };
      });
    },
    setUseSystemMode: (useSystem: boolean) => {
      setState(prev => ({
        ...prev,
        useSystem,
        mode: useSystem ? prev.systemMode : prev.mode,
        timestamp: Date.now()
      }));
    },
    getCssVariable: (name: string, config?: Partial<CssVariableConfig>): string => {
      const prefix = config?.prefix || `--theme-${state.colorScheme}-`;
      const suffix = config?.suffix || "";
      return getComputedStyle(document.documentElement)
        .getPropertyValue(`${prefix}${name}${suffix}`)
        .trim();
    },
    getAllThemeClasses: (): Record<ThemeColorScheme, ColorSchemeClasses> => {
      return SUPPORTED_COLOR_SCHEMES.reduce((acc, scheme) => ({
        ...acc,
        [scheme]: generateColorSchemeClasses(scheme)
      }), {} as Record<ThemeColorScheme, ColorSchemeClasses>);
    },
    isColorSchemeClass: (className: string): boolean => /^theme-[\w-]+-(?:base|primary|secondary|accent)/.test(className),
    getComputedThemeStyles: () => getComputedStyle(document.documentElement),
    isColorSchemeSupported: (scheme: ThemeColorScheme) => SUPPORTED_COLOR_SCHEMES.includes(scheme),
    getThemeState: (): ExtendedThemeState => ({
      colorScheme: state.colorScheme,
      mode: state.mode,
      useSystem: state.useSystem,
      direction: state.direction,
      version: state.version,
      systemMode: state.systemMode,
      initialized: state.initialized,
      previous: state.previous || {
        colorScheme: state.colorScheme,
        mode: state.mode
      },
      timestamp: state.timestamp,
      isLoading: false,
      error: null
    }),
    resetTheme: () => {
      setState({ ...defaultState, timestamp: Date.now() });
    },
    subscribeToThemeChanges: (callback: (state: ExtendedThemeState) => void) => {
      const observer = new MutationObserver(() => {
        callback(contextValue.getThemeState!());
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "data-mode"]
      });
      return () => observer.disconnect();
    }
  }), [state, onThemeChange]);

 // Modified error handling in render
 if (error) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    type: error.constructor.name,
    state: {
      colorScheme: state.colorScheme,
      mode: state.mode,
      initialized: state.initialized
    }
  };

  console.error("[ThemeProvider] Render error details:", errorDetails);

  return (
    <ThemeErrorBoundary>
      <ThemeContext.Provider value={contextValue}>
        <div
          className={className}
          data-theme={state.colorScheme}
          data-mode={state.mode}
          data-direction={state.direction}
        >
          {children}
        </div>
      </ThemeContext.Provider>
    </ThemeErrorBoundary>
  );
} else {
  console.log("ThemeProvider returning children now...");
  return (
    <ThemeErrorBoundary>
      <ThemeContext.Provider value={contextValue}>
        <div className={className} data-theme={state.colorScheme} data-mode={state.mode} data-direction={state.direction}>
          {children}
        </div>
      </ThemeContext.Provider>
    </ThemeErrorBoundary>
  );
}
};

export default ThemeProvider;
