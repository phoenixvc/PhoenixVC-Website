// theme/core/theme-transformation-manager.ts

import {
    ThemeScheme,
    ThemeSchemeInitial,
    ThemeColors,
    ColorDefinition,
    ColorShades,
    ThemeName,
    ThemeMode,
  } from "../types";
  import { ColorUtils } from "../utils/color-utils";

  /**
   * Configuration for the theme transformation process
   */
  export interface TransformationConfig {
    defaultMode: ThemeMode;
    shadeCount: number;
    shadeIntensity: number;
    contrastThreshold: number;
  }

  /**
   * ThemeTransformationManager
   *
   * Responsible for transforming theme data from initial definitions to fully processed themes.
   * Handles the conversion of color definitions to color shades and ensures theme data is
   * properly structured for use in the theme system.
   */
  export class ThemeTransformationManager {
    private config: TransformationConfig;

    constructor(config?: Partial<TransformationConfig>) {
      // Default configuration with sensible defaults
      this.config = {
        defaultMode: config?.defaultMode || "light",
        shadeCount: config?.shadeCount || 9,
        shadeIntensity: config?.shadeIntensity || 0.1,
        contrastThreshold: config?.contrastThreshold || 0.5
      };
    }

    /**
     * Transform a complete theme from initial to processed format
     *
     * @param input The initial theme data or single scheme
     * @param name Optional name for the theme if input is a single scheme
     * @returns Fully processed theme colors
     */
    transform(input: ThemeSchemeInitial | ThemeColors, name?: ThemeName): ThemeColors {
      console.group("[ThemeTransformationManager] Transforming theme");

      try {
        // If it"s a single scheme, wrap it in a theme colors structure
        if (this.isThemeSchemeInitial(input)) {
          const schemeName = name || "default";
          console.log(`[ThemeTransformationManager] Processing single scheme as "${schemeName}"`);

          return {
            schemes: {
              [schemeName]: this.transformScheme(input)
            },
            semantic: undefined
          };
        }

        // Otherwise, transform each scheme in the theme colors
        console.log(`[ThemeTransformationManager] Processing theme with ${Object.keys(input.schemes).length} schemes`);

        const processedSchemes: Record<string, ThemeScheme> = {};

        Object.entries(input.schemes).forEach(([schemeName, scheme]) => {
          // Handle both ThemeScheme and ThemeSchemeInitial in the input
          if (this.isThemeSchemeInitial(scheme)) {
            processedSchemes[schemeName] = this.transformScheme(scheme);
          } else {
            // If it"s already a ThemeScheme, ensure it"s fully processed
            processedSchemes[schemeName] = this.ensureFullyProcessed(scheme);
          }
        });

        return {
          schemes: processedSchemes,
          semantic: input.semantic
        };
      } catch (error) {
        console.error("[ThemeTransformationManager] Error transforming theme:", error);
        throw new Error(`Theme transformation failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        console.groupEnd();
      }
    }

    /**
     * Transform a single theme scheme from initial to processed
     *
     * @param initial The initial theme scheme
     * @returns Fully processed theme scheme
     */
    transformScheme(initial: ThemeSchemeInitial): ThemeScheme {
      console.log("[ThemeTransformationManager] Transforming scheme");

      // Process base colors
      const processedBase = this.processBaseColors(initial.base);

      // Create the processed scheme
      return {
        base: processedBase,
        light: initial.light,
        dark: initial.dark
      };
    }

    /**
     * Process base colors from definitions to shades
     *
     * @param baseColors The initial base colors
     * @returns Processed base colors with shades
     */
    private processBaseColors(baseColors: Record<string, ColorDefinition>): Record<string, ColorShades> {
      const processed: Record<string, ColorShades> = {};

      Object.entries(baseColors).forEach(([key, definition]) => {
        processed[key] = this.generateShades(definition);
      });

      return processed;
    }

    /**
     * Generate color shades from a color definition
     *
     * @param definition The color definition
     * @returns Color shades generated from the definition
     */
    private generateShades(definition: ColorDefinition): ColorShades {
      // If it"s already a ColorShades object, return it
      if (typeof definition !== "string" && "base" in definition) {
        return definition;
      }

      const baseColor = typeof definition === "string" ? definition : definition.value;

      // Generate shades using ColorUtils
      const shades = ColorUtils.generateShades(
        baseColor,
        this.config.shadeCount,
        this.config.shadeIntensity
      );

      // Generate contrast colors for accessibility
      const contrastColors = ColorUtils.generateContrastColors(
        shades,
        this.config.contrastThreshold
      );

      return {
        base: baseColor,
        shades,
        contrast: contrastColors
      };
    }

    /**
     * Ensure a theme scheme is fully processed
     *
     * @param scheme The theme scheme to check and process if needed
     * @returns Fully processed theme scheme
     */
    private ensureFullyProcessed(scheme: ThemeScheme): ThemeScheme {
      // Check if any base colors need processing
      const baseKeys = Object.keys(scheme.base);
      let needsProcessing = false;

      for (const key of baseKeys) {
        const color = scheme.base[key];
        // If any color is not fully processed (missing shades or contrast)
        if (!color.shades || !color.contrast) {
          needsProcessing = true;
          break;
        }
      }

      // If already fully processed, return as is
      if (!needsProcessing) {
        return scheme;
      }

      // Convert to initial format and then transform
      const initial: ThemeSchemeInitial = {
        base: this.convertToInitialBaseColors(scheme.base),
        light: scheme.light,
        dark: scheme.dark
      };

      return this.transformScheme(initial);
    }

    /**
     * Convert processed base colors back to initial format for re-processing
     *
     * @param baseColors The base colors to convert
     * @returns Initial format base colors
     */
    private convertToInitialBaseColors(baseColors: Record<string, ColorShades>): Record<string, ColorDefinition> {
      const initial: Record<string, ColorDefinition> = {};

      Object.entries(baseColors).forEach(([key, color]) => {
        initial[key] = color.base;
      });

      return initial;
    }

    /**
     * Type guard to check if input is a ThemeSchemeInitial
     *
     * @param input The input to check
     * @returns True if the input is a ThemeSchemeInitial
     */
    private isThemeSchemeInitial(input: any): input is ThemeSchemeInitial {
      return input &&
             typeof input === "object" &&
             "base" in input &&
             (!("schemes" in input));
    }

    /**
     * Validate a processed theme
     *
     * @param theme The theme to validate
     * @returns True if the theme is valid
     * @throws Error if the theme is invalid
     */
    validateProcessedTheme(theme: ThemeColors): boolean {
      // Check that the theme has at least one scheme
      if (!theme.schemes || Object.keys(theme.schemes).length === 0) {
        throw new Error("Theme must have at least one color scheme");
      }

      // Check each scheme for required properties
      Object.entries(theme.schemes).forEach(([name, scheme]) => {
        // Check base colors
        if (!scheme.base || Object.keys(scheme.base).length === 0) {
          throw new Error(`Scheme "${name}" must have base colors`);
        }

        // Check that each base color has required properties
        Object.entries(scheme.base).forEach(([colorName, color]) => {
          if (!color.base) {
            throw new Error(`Base color "${colorName}" in scheme "${name}" must have a base value`);
          }

          if (!color.shades || color.shades.length === 0) {
            throw new Error(`Base color "${colorName}" in scheme "${name}" must have shades`);
          }

          if (!color.contrast || color.contrast.length === 0) {
            throw new Error(`Base color "${colorName}" in scheme "${name}" must have contrast colors`);
          }
        });
      });

      return true;
    }
  }
