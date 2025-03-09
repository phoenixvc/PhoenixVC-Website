// theme/core/theme-transformation-manager.ts

import {
  ThemeScheme,
  ThemeSchemeInitial,
  ThemeColors,
  ColorDefinition,
  ColorShades,
  ThemeName,
  ThemeMode,
  ProcessedBaseColors,
  InitialBaseColors,
  TransformedColorObject,
  ShadeLevel
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
  transform(input: ThemeSchemeInitial | ThemeScheme | ThemeColors, name?: ThemeName): ThemeColors {
    console.group("[ThemeTransformationManager] Transforming theme");

    try {
      // If it"s a single scheme (either initial or processed)
      if (this.isThemeSchemeInitial(input)) {
        const schemeName = name || "default";
        console.log(`[ThemeTransformationManager] Processing initial scheme as "${schemeName}"`);

        return {
          schemes: {
            [schemeName]: this.transformScheme(input)
          },
          semantic: undefined
        };
      } else if (this.isThemeScheme(input)) {
        const schemeName = name || "default";
        console.log(`[ThemeTransformationManager] Processing processed scheme as "${schemeName}"`);

        return {
          schemes: {
            [schemeName]: this.ensureFullyProcessed(input)
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
   * Check if an object is a ThemeScheme
   */
  private isThemeScheme(obj: unknown): obj is ThemeScheme {
    if (!obj || typeof obj !== "object") return false;

    const candidate = obj as Record<string, unknown>;

    // Check base structure
    if (!candidate.base || typeof candidate.base !== "object") return false;
    if (!candidate.light || typeof candidate.light !== "object") return false;
    if (!candidate.dark || typeof candidate.dark !== "object") return false;

    // Check base.primary
    const base = candidate.base as Record<string, unknown>;
    if (!base.primary || typeof base.primary !== "object") return false;

    // Check base.primary.shades exists and hex doesn"t
    const primary = base.primary as Record<string, unknown>;
    return !!primary.shades && !("hex" in primary);
  }

  /**
   * Transform a single theme scheme from initial to processed
   *
   * @param initial The initial theme scheme
   * @returns Fully processed theme scheme
   */
  transformScheme(initial: ThemeSchemeInitial): ThemeScheme {
    console.log("[ThemeTransformationManager] Transforming scheme");

    // Process base colors - explicitly cast to ProcessedBaseColors
    const processedBase = this.processBaseColors(initial.base) as unknown as ProcessedBaseColors;

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
  private processBaseColors(baseColors: InitialBaseColors): Record<string, ColorShades> {
    const processed: Record<string, ColorShades> = {};

    // Process each color in the base colors
    Object.keys(baseColors).forEach((key) => {
      const definition = baseColors[key as keyof InitialBaseColors];
      if (definition) {
        processed[key] = this.generateShades(definition);
      }
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
    // Type guard for ColorShades-like object
    if (typeof definition !== "string" &&
        "50" in definition && "100" in definition && "200" in definition &&
        "300" in definition && "400" in definition && "500" in definition &&
        "600" in definition && "700" in definition && "800" in definition &&
        "900" in definition) {
      // If it has all required properties, cast it to ColorShades
      return definition as unknown as ColorShades;
    }

    // Get the base color hex value
    const baseHex = typeof definition === "string"
      ? definition
      : "hex" in definition ? definition.hex : "";

    if (!baseHex) {
      throw new Error("Invalid color definition: No hex value found");
    }

    // Use ColorUtils.createPalette to generate the color shades
    const palette = ColorUtils.createPalette(baseHex, 10); // 10 shades from 50 to 900

    // Define the shape of our ColorShades object with proper typing
    type ShadeKeys = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "base" | "contrast";

    // Create the ColorShades object with the required properties
    const result: Record<ShadeKeys, string | string[]> = {
      base: baseHex,
      // Map the palette to the required shade levels
      "50": palette[0].hex,
      "100": palette[1].hex,
      "200": palette[2].hex,
      "300": palette[3].hex,
      "400": palette[4].hex,
      "500": palette[5].hex,
      "600": palette[6].hex,
      "700": palette[7].hex,
      "800": palette[8].hex,
      "900": palette[9].hex,
      // Initialize contrast as an empty array, will be filled later
      contrast: []
    };

    // Generate contrast colors
    result.contrast = this.generateContrastColors(result);

    return result as unknown as ColorShades;
  }

  /**
   * Generate contrast colors for accessibility
   *
   * @param shades The color shades
   * @returns Array of contrast colors
   */
  private generateContrastColors(shades: Record<string | number, string | string[]>): string[] {
    // This is a simplified implementation
    const contrastColors: string[] = [];

    // For each shade, determine if it should have white or black text
    const shadeKeys = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

    for (const shade of shadeKeys) {
      const hexColor = shades[shade] as string;
      if (typeof hexColor === "string") {
        // Use a method to determine if the color is dark or light
        const isDark = this.isColorDark(hexColor);
        contrastColors.push(isDark ? "#FFFFFF" : "#000000");
      }
    }

    return contrastColors;
  }

  /**
   * Determine if a color is dark (needs white text) or light (needs black text)
   *
   * @param hexColor The hex color to check
   * @returns True if the color is dark
   */
  private isColorDark(hexColor: string): boolean {
    // Simple implementation based on relative luminance
    // Extract RGB components
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return true if the color is dark (luminance below threshold)
    return luminance < this.config.contrastThreshold;
  }

  /**
   * Check if a color object has contrast colors
   *
   * @param color The color object to check
   * @returns True if the color has contrast colors
   */
  private hasContrastColors(color: ColorShades): boolean {
    // Use type assertion only for the specific property we"re checking
    const maybeWithContrast = color as ColorShades & { contrast?: unknown };
    return !!maybeWithContrast.contrast &&
          Array.isArray(maybeWithContrast.contrast) &&
          maybeWithContrast.contrast.length > 0;
  }

  /**
   * Ensure a theme scheme is fully processed
   *
   * @param scheme The theme scheme to check and process if needed
   * @returns Fully processed theme scheme
   */
  public ensureFullyProcessed(scheme: ThemeScheme): ThemeScheme {
    // Check if any base colors need processing
    let needsProcessing = false;

    // Use type-safe approach to check base colors
    const baseColors = scheme.base;
    const baseColorKeys = Object.keys(baseColors) as Array<keyof typeof baseColors>;

    for (const key of baseColorKeys) {
      const color = baseColors[key];
      // Check if color exists, has all required shade levels, and has contrast colors
      if (!color || !this.hasAllShades(color) || !this.hasContrastColors(color)) {
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
   * Check if a color object has all required shade levels
   *
   * @param color The color object to check
   * @returns True if the color has all required shades
   */
  private hasAllShades(color: TransformedColorObject): boolean {
    const requiredShades: ShadeLevel[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

    // Check all required shades exist
    return requiredShades.every(shade => !!color[shade]);
  }

  /**
   * Convert processed base colors back to initial format for re-processing
   *
   * @param baseColors The base colors to convert
   * @returns Initial format base colors
   */
  private convertToInitialBaseColors(baseColors: ProcessedBaseColors): InitialBaseColors {
    // Create the result object with required properties
    const result: Partial<InitialBaseColors> = {};

    // Handle primary (required)
    if (baseColors.primary) {
      result.primary = baseColors.primary["500"];
    } else {
      throw new Error("Primary color is required");
    }

    // Handle secondary (required)
    if (baseColors.secondary) {
      result.secondary = baseColors.secondary["500"];
    } else {
      throw new Error("Secondary color is required");
    }

    // Handle accent (optional)
    if (baseColors.accent) {
      result.accent = baseColors.accent["500"];
    }

    // Handle any custom properties that exist in both types
    // This assumes InitialBaseColors has an index signature or similar structure
    const knownKeys = ["primary", "secondary", "accent"];
    const customKeys = Object.keys(baseColors).filter(key => !knownKeys.includes(key));

    for (const key of customKeys) {
      const color = baseColors[key as keyof ProcessedBaseColors];
      if (color) {
        // Extract the string representation from ColorDefinition
        const colorValue = color["500"].hex; // or color["500"].hex or whatever property holds the string value
        (result as Record<string, string>)[key] = colorValue;
      }
    }

    return result as InitialBaseColors;
  }

  /**
   * Type guard to check if input is a ThemeSchemeInitial
   *
   * @param input The input to check
   * @returns True if the input is a ThemeSchemeInitial
   */
  private isThemeSchemeInitial(input: unknown): input is ThemeSchemeInitial {
    return input !== null &&
          typeof input === "object" &&
          "base" in (input as Record<string, unknown>) &&
          !("schemes" in (input as Record<string, unknown>));
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
      const baseColors = scheme.base;
      const baseColorKeys = Object.keys(baseColors) as Array<keyof typeof baseColors>;

      for (const colorName of baseColorKeys) {
        const color = baseColors[colorName];

        // First check if color exists
        if (!color) {
          throw new Error(`Base color "${String(colorName)}" in scheme "${name}" is undefined`);
        }

        // Check for required shade levels
        const requiredShades: ShadeLevel[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        for (const shade of requiredShades) {
          if (!color[shade]) {
            throw new Error(`Base color "${String(colorName)}" in scheme "${name}" must have shade ${shade}`);
          }
        }

        // Check for contrast colors
        if (!this.hasContrastColors(color)) {
          throw new Error(`Base color "${String(colorName)}" in scheme "${name}" must have contrast colors`);
        }
      }
    });

    return true;
  }
}
