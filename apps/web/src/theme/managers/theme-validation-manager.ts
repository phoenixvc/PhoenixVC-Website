// theme/core/theme-validation-manager.ts

import {
  ThemeColors,
  ThemeInitOptions,
  ThemeName,
  ThemeMode,
  ThemeScheme,
  ThemeSchemeInitial,
  ColorDefinition,
  ColorShades,
  SemanticColors
} from "../types";

import { BaseColorValidation } from "../validation/base-color-validation";
import { ColorDefinitionValidation } from "../validation/color-definition-validation";
import { ColorShadesValidation } from "../validation/color-shades-validation";
import { ModeColorValidation } from "../validation/mode-color-validation";
import { SemanticColorValidation } from "../validation/semantic-color-validation";
import { ThemeConfigValidation } from "../validation/theme-config-validation";
import { ThemeInitialValidation } from "../validation/theme-initial-validation";
import { ThemeProcessedValidation } from "../validation/theme-processed-validation";
import { ThemeValidationError } from "../validation/theme-validation-error";
import { VALID_COLOR_SCHEMES, VALID_MODES } from "../validation/constants";

/**
 * ThemeValidationManager
 *
 * Centralized manager for theme validation that coordinates all validation operations
 * across different aspects of the theme system.
 */
export class ThemeValidationManager {
  private static instance: ThemeValidationManager;

  /**
   * Get the singleton instance of ThemeValidationManager
   */
  static getInstance(): ThemeValidationManager {
    if (!ThemeValidationManager.instance) {
      ThemeValidationManager.instance = new ThemeValidationManager();
    }
    return ThemeValidationManager.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Validate a theme configuration
   */
  validateThemeConfig(config: ThemeInitOptions & {
    disableTransitions?: boolean;
    disableStorage?: boolean;
    storageKey?: string;
  }): void {
    try {
      ThemeConfigValidation.validateThemeConfig(config);
    } catch (error) {
      throw new ThemeValidationError('Config validation failed', { cause: error });
    }
  }

  /**
   * Validate a processed theme
   */
  validateProcessedTheme(theme: ThemeColors): void {
    try {
      // Validate the schemes
      ThemeProcessedValidation.validateProcessedTheme(theme.schemes);

      // Validate semantic colors if present
      if (theme.semantic) {
        SemanticColorValidation.validateSemanticColors(theme.semantic);
      }
    } catch (error) {
      throw new ThemeValidationError('Processed theme validation failed', { cause: error });
    }
  }

  /**
   * Validate an initial theme scheme
   */
  validateInitialTheme(theme: ThemeSchemeInitial): void {
    try {
      ThemeInitialValidation.validateInitialTheme(theme);
    } catch (error) {
      throw new ThemeValidationError('Initial theme validation failed', { cause: error });
    }
  }

  /**
   * Validate base colors
   */
  validateBaseColors(baseColors: Record<string, ColorDefinition>): void {
    try {
      BaseColorValidation.validateBaseColors(baseColors);
    } catch (error) {
      throw new ThemeValidationError('Base colors validation failed', { cause: error });
    }
  }

  /**
   * Validate color shades
   */
  validateColorShades(shades: ColorShades): void {
    try {
      ColorShadesValidation.validateColorShades(shades);
    } catch (error) {
      throw new ThemeValidationError('Color shades validation failed', { cause: error });
    }
  }

  /**
   * Validate mode colors
   */
  validateModeColors(mode: 'light' | 'dark', colors: any): void {
    try {
      ModeColorValidation.validateModeColors(mode, colors);
    } catch (error) {
      throw new ThemeValidationError(`${mode} mode colors validation failed`, { cause: error });
    }
  }

  /**
   * Validate semantic colors
   */
  validateSemanticColors(semanticColors: SemanticColors): void {
    try {
      SemanticColorValidation.validateSemanticColors(semanticColors);
    } catch (error) {
      throw new ThemeValidationError('Semantic colors validation failed', { cause: error });
    }
  }

  /**
   * Check if a theme is fully transformed with all required components
   */
  isFullyTransformed(theme: ThemeColors): boolean {
    try {
      // Check if at least one scheme exists
      const schemeNames = Object.keys(theme.schemes);
      if (schemeNames.length === 0) return false;

      // Get the first scheme
      const scheme = theme.schemes[schemeNames[0]];
      if (!scheme?.base) return false;

      // Check if primary and secondary have shade levels
      const baseColors = scheme.base;

      // Check primary
      if (!baseColors.primary ||
          typeof baseColors.primary !== "object" ||
          !this.hasRequiredShades(baseColors.primary)) {
        return false;
      }

      // Check secondary
      if (!baseColors.secondary ||
          typeof baseColors.secondary !== "object" ||
          !this.hasRequiredShades(baseColors.secondary)) {
        return false;
      }

      // Check accent if it exists
      if (baseColors.accent &&
          (typeof baseColors.accent !== "object" ||
          !this.hasRequiredShades(baseColors.accent))) {
        return false;
      }

      // Check for both light and dark mode colors
      if (!scheme.light || !scheme.dark) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("[ThemeValidationManager] Error checking if theme is fully transformed:", error);
      return false;
    }
  }

  /**
   * Check if a color object has all required shade levels
   */
  private hasRequiredShades(colorObj: any): boolean {
    // Check for key shade levels
    return colorObj.base !== undefined &&
           colorObj.shades !== undefined &&
           Array.isArray(colorObj.shades) &&
           colorObj.contrast !== undefined &&
           Array.isArray(colorObj.contrast);
  }

  /**
   * Type guard to check if an object is a ThemeColors
   */
  isThemeColorsType(theme: any): theme is ThemeColors {
    return theme &&
           typeof theme === "object" &&
           theme.schemes !== undefined &&
           typeof theme.schemes === "object";
  }

  /**
   * Type guard to check if an object is a ThemeSchemeInitial
   */
  isThemeSchemeInitialType(theme: any): theme is ThemeSchemeInitial {
    return theme &&
           typeof theme === "object" &&
           theme.base !== undefined &&
           typeof theme.base === "object";
  }

  /**
   * Utility to check if a color scheme is valid
   */
  isValidThemeName(themeName: ThemeName): themeName is ThemeName {
    return VALID_COLOR_SCHEMES.includes(themeName);
  }

  /**
   * Utility to check if a theme mode is valid
   */
  isValidThemeMode(mode: ThemeMode): mode is ThemeMode {
    return VALID_MODES.includes(mode);
  }
}

// Export singleton instance
export const themeValidationManager = ThemeValidationManager.getInstance();
