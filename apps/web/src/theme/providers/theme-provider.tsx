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
  ValidationResult
} from "@/theme/types";
import { transformTheme } from "./theme-transformer";
import { generateThemeVariables } from "./theme-variables";
import { validateTheme, validateThemeConfig } from "./validation";
import { ThemeErrorBoundary } from "@/theme/components/theme-error-boundary";
import { ExtendedThemeState } from "@/theme/types/context/state";
import ColorUtils from "../utils/color-utils";

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
    return { isValid: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Invalid theme configuration";
    console.error("[ThemeProvider] Configuration validation error:", errorMessage);
    return { isValid: false, errors: [errorMessage] };
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
    if (!validationResult.isValid && validationResult.errors?.length) {
      setError(new Error(validationResult.errors[0]));
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
        const theme = await loadTheme(state.colorScheme);
        validateTheme(theme);

        const transformedTheme = transformTheme(theme, state.mode);
        const variables = generateThemeVariables(transformedTheme, state.mode);

        // Example: using ColorUtils to adjust the primary color before applying
        const adjustedPrimary = ColorUtils.darken(
          transformedTheme.schemes[state.colorScheme].light.background,
          10
        );
        console.log("Adjusted primary (for demonstration):", adjustedPrimary);

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
        setError(err instanceof Error ? err : new Error("Theme initialization failed"));
        console.error("[ThemeProvider] Initialization error:", err);
      }
    };

    if (!state.initialized && !error) {
      initTheme();
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

  if (error) {
    console.error("[ThemeProvider] Error:", error);
    return <div>Theme Error: {error.message}</div>;
  }

  return (
    <ThemeErrorBoundary>
      <ThemeContext.Provider value={contextValue}>
        <div className={className} data-theme={state.colorScheme} data-mode={state.mode} data-direction={state.direction}>
          {children}
        </div>
      </ThemeContext.Provider>
    </ThemeErrorBoundary>
  );
};

export default ThemeProvider;
