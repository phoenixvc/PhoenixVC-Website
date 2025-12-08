// /theme/types/core/classes.ts

import { ThemeName, ThemeMode } from "./base";
import { ThemeClassSuffix } from "./enums";

export interface ThemeClassParts {
  prefix: string;
  scheme?: ThemeName;
  mode?: ThemeMode;
  suffix: ThemeClassSuffix;
}

/**
 * Configuration Options
 */
export interface ThemeClassGenerationOptions {
  prefix?: string;
  separator?: string;
  includeColorScheme?: boolean;
  includeMode?: boolean;
}

/**
 * Class Utilities
 */
export interface ThemeClassUtils {
  generateThemeClass: (
    suffix: ThemeClassSuffix,
    options?: ThemeClassGenerationOptions,
  ) => string;

  parseThemeClass: (className: string) => {
    scheme?: ThemeName;
    mode?: ThemeMode;
    suffix?: ThemeClassSuffix;
  };

  combineThemeClasses: (...classes: string[]) => string;
}

/**
 * Theme class generation options
 */
export interface ThemeClassOptions {
  /**
   * Color scheme
   */
  colorScheme?: ThemeName;

  /**
   * Theme mode
   */
  mode?: ThemeMode;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Disable transitions
   */
  disableTransitions?: boolean;
}
