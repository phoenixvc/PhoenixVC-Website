// theme/types/context/context.ts
import { ReactNode, createContext } from "react";
import { ThemeChangeEvent, ThemeConfig, ThemeErrorFallback, ThemeErrorHandler, ThemeInitOptions } from "../core/config";
import { ThemeName, ThemeMode, ThemeAcquisitionConfig, Theme } from "../core/base";
import { CssVariableConfig, ThemeClassSuffix } from "../core";
import { ExtendedThemeState, ThemeContextState } from "./state";
import { TypographyScale } from "@/theme/mappings";
import { ComponentThemeRegistry } from "@/theme/registry/component-theme-registry";
import { ThemeRegistry } from "@/theme/registry/theme-registry";

/**
 * Additional provider configuration options specific to the context.
 */
export interface ThemeProviderExtraConfig {
  /**
   * Storage key prefix (default: 'theme').
   */
  storagePrefix?: string;
  /**
   * Disable transitions on initial load (default: true).
   */
  disableInitialTransitions?: boolean;
  /**
   * Enable debug mode (default: false).
   */
  debug?: boolean;
}

/**
 * Theme provider configuration options.
 * Combines core configuration with context-specific options.
 */
export interface ThemeProviderConfig extends Partial<ThemeConfig>, ThemeProviderExtraConfig { }

/**
 * Theme provider props interface.
 * Uses the consolidated configuration and extends core types where applicable.
 */
export interface ThemeProviderProps {
  children: ReactNode;
  /** Configuration to initialize theme state */
  config?: ThemeInitOptions;
  defaultMode?: ThemeMode;
  defaultTheme?: ThemeName;
  onThemeChange?: (event: ThemeChangeEvent) => void;
  onError?: ThemeErrorHandler;
  errorFallback?: ThemeErrorFallback;
  disableTransitions?: boolean;
  disableStorage?: boolean;
  storageKey?: string;
  /** Optional class name for the provider wrapper */
  className?: string;

  /** Component-specific theme registry */
  componentRegistry?: Partial<ComponentThemeRegistry>;

  /** Global theme registry */
  themeRegistry?: Partial<ThemeRegistry>;
}

/**
 * Theme context actions.
 * Separates methods that update state from selectors, if needed.
 */
export interface ThemeContextActions {
  reset: () => void;
  updateConfig: (config: Partial<ThemeConfig>) => void;
  refresh: () => void;
}

/**
 * Core theme context type.
 * Defines functions for manipulating the theme.
 */
export interface ThemeContextType {
  themeName: ThemeName;
  themeMode: ThemeMode;
  systemMode: ThemeMode;
  useSystemMode: boolean;
  getThemeClassNames: (scheme: ThemeName) => Record<string, string>;
  getSpecificClass: (suffix: ThemeClassSuffix) => string | unknown;
  replaceThemeClasses: (currentClasses: string, newScheme: ThemeName) => string;
  setTheme: (name: string) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setUseSystemMode: (useSystem: boolean) => void;
  getCssVariable: (name: string, config?: Partial<CssVariableConfig>) => string;
  getAllThemeClasses: () => Record<ThemeName, Record<string,string>>;
  isThemeClass: (className: string) => boolean;

  // Theme loading status
  isThemeLoading: () => boolean;

  // Theme cache utilities
  isThemeCached: (scheme: ThemeName) => boolean;
  preloadTheme: (scheme: ThemeName, config?: Partial<ThemeAcquisitionConfig>) => Promise<void>;
  clearThemeCache: () => void;
  getCacheStatus: () => { size: number; schemes: ThemeName[] };

  // Optional methods:
  getComputedThemeStyles?: () => CSSStyleDeclaration;
  isThemeSupported?: (scheme: ThemeName) => boolean;
  getThemeState?: () => ExtendedThemeState;
  resetTheme?: () => Promise<void>;
  subscribeToThemeChanges?: (callback: (state: ExtendedThemeState) => void) => () => void;
  toggleUseSystem?: () => void; // Added from ThemeContext

  // Add typography support
  typography?: {
    getScale: (element: string) => TypographyScale | undefined;
    getComponentTypography: (component: string, variant?: string, mode?: string) => TypographyScale | undefined;
  };

  // Add component style support
  getComponentStyle?: (component: string, variant?: string, state?: string, mode?: string) => React.CSSProperties;
  getThemeRegistry?: (component: string, variant?: string, state?: string, mode?: string) => ThemeRegistry;
  getComponentRegistry?: (component: string, variant?: string, state?: string, mode?: string) => ComponentThemeRegistry;
}

/**
 * Theme context value interface.
 * Combines the core actions and selectors with additional action methods.
 */
export interface ThemeContextValue extends ThemeContextType, ThemeContextActions {
  state: ThemeContextState;
}

// Create the context with the comprehensive type
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
