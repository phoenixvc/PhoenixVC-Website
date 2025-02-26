// theme/types/context/context.ts

import { ReactNode } from "react";
import { ThemeChangeEvent, ThemeConfig, ThemeErrorFallback, ThemeErrorHandler, ThemeInitOptions } from "../core/config";
import { ThemeColorScheme, ThemeMode } from "../core/base";
import { ColorSchemeClasses, CssVariableConfig, ThemeClassSuffix } from "../core";
import { ExtendedThemeState, ThemeContextState } from "./state";

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
export interface ThemeProviderConfig extends Partial<ThemeConfig>, ThemeProviderExtraConfig {}

/**
 * Theme provider props interface.
 * Uses the consolidated configuration and extends core types where applicable.
 */

export interface ThemeProviderProps {
  children: ReactNode;
  /** Configuration to initialize theme state */
  config?: ThemeInitOptions;
  defaultMode?: ThemeMode;
  defaultColorScheme?: ThemeColorScheme;
  onThemeChange?: (event: ThemeChangeEvent) => void;
  onError?: ThemeErrorHandler;
  errorFallback?: ThemeErrorFallback;
  disableTransitions?: boolean;
  disableStorage?: boolean;
  storageKey?: string;
  /** Optional class name for the provider wrapper */
  className?: string;
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
 * Consider moving pure helper functions to a utilities module if they do not directly update context state.
 */
export interface ThemeContextType {
  colorScheme: ThemeColorScheme;
  mode: ThemeMode;
  systemMode: ThemeMode;
  useSystemMode: boolean;
  colorSchemeClasses: ColorSchemeClasses;
  getColorSchemeClasses: (scheme: ThemeColorScheme) => ColorSchemeClasses;
  getSpecificClass: (suffix: ThemeClassSuffix) => string;
  replaceColorSchemeClasses: (currentClasses: string, newScheme: ThemeColorScheme) => string;
  setColorScheme: (scheme: ThemeColorScheme) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setUseSystemMode: (useSystem: boolean) => void;
  getCssVariable: (name: string, config?: Partial<CssVariableConfig>) => string;
  getAllThemeClasses: () => Record<ThemeColorScheme, ColorSchemeClasses>;
  isColorSchemeClass: (className: string) => boolean;

  // Optional methods:
  getComputedThemeStyles?: () => CSSStyleDeclaration;
  isColorSchemeSupported?: (scheme: ThemeColorScheme) => boolean;
  getThemeState?: () => ExtendedThemeState;
  resetTheme?: () => void;
  subscribeToThemeChanges?: (callback: (state: ExtendedThemeState) => void) => () => void;
}

/**
 * Theme context value interface.
 * Combines the core actions and selectors with additional action methods.
 */
export interface ThemeContextValue extends ThemeContextType, ThemeContextActions {
  state: ThemeContextState;
}

/**
 * Theme context interface provided to components.
 */
export interface ThemeContext {
  state: ExtendedThemeState;
  setColorScheme: (scheme: ThemeColorScheme) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  toggleUseSystem: () => void;
  reset: () => void;
}
