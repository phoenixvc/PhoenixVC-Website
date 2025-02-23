// theme/types/context/context.ts

import React from 'react';
import { ThemeConfig } from '../core/config';
import { ColorScheme, Mode } from '../core/base';
import { ColorSchemeClasses, CssVariableConfig, ThemeClassSuffix } from '../core';
import { ExtendedThemeState, ThemeContextState } from './state';

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
  children: React.ReactNode;
  initialConfig?: Partial<ThemeProviderConfig>;
  onThemeChange?: (theme: ExtendedThemeState) => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  errorFallback?: React.ReactNode;
  className?: string;
  forceColorScheme?: ColorScheme;
  disableSystemScheme?: boolean;
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
  colorScheme: ColorScheme;
  mode: Mode;
  systemMode: Mode;
  useSystemMode: boolean;
  colorSchemeClasses: ColorSchemeClasses;
  getColorSchemeClasses: (scheme: ColorScheme) => ColorSchemeClasses;
  getSpecificClass: (suffix: ThemeClassSuffix) => string;
  replaceColorSchemeClasses: (currentClasses: string, newScheme: ColorScheme) => string;
  setColorScheme: (scheme: ColorScheme) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  setUseSystemMode: (useSystem: boolean) => void;
  getCssVariable: (name: string, config?: Partial<CssVariableConfig>) => string;
  getAllThemeClasses: () => Record<ColorScheme, ColorSchemeClasses>;
  isColorSchemeClass: (className: string) => boolean;

  // Optional methods:
  getComputedThemeStyles?: () => CSSStyleDeclaration;
  isColorSchemeSupported?: (scheme: ColorScheme) => boolean;
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
  setColorScheme: (scheme: ColorScheme) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  toggleUseSystem: () => void;
  reset: () => void;
}
