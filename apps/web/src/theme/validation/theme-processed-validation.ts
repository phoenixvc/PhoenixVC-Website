import {
  ColorShades,
  ModeColors,
  ShadeLevel,
  ThemeScheme,
  ValidationResult,
  ValidationError,
} from "@/theme/types";
import { validateHexOnly } from "./utils/color-hex-validation";
import { createValidationResult } from "./utils/create-validation-result";

export class ThemeProcessedValidation {
  static REQUIRED_BASE_COLORS = ["primary", "secondary", "accent"] as const;
  static ALL_SHADE_LEVELS: ShadeLevel[] = [
    50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
  ];

  /**
   * Validates the entire processed theme and returns a ValidationResult.
   * @param schemes - The schemes of the processed theme.
   */
  static validateProcessedTheme(
    schemes: Record<string, ThemeScheme>,
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Check if schemes are missing or empty
    if (!schemes || Object.keys(schemes).length === 0) {
      errors.push({
        code: "MISSING_SCHEMES",
        message: "Processed theme must include at least one scheme.",
        path: "schemes",
      });

      return createValidationResult("schemes", schemes, errors);
    }

    // Iterate through schemes and validate each
    Object.entries(schemes).forEach(([schemeName, scheme]) => {
      // Validate the base colors of the scheme
      errors.push(...this.validateBaseColors(scheme.base, schemeName));

      // Validate light and dark mode colors
      errors.push(
        ...this.validateModeColors(scheme.light, "light", schemeName),
      );
      errors.push(...this.validateModeColors(scheme.dark, "dark", schemeName));
    });

    return createValidationResult("schemes", schemes, errors);
  }

  /**
   * Validates the base colors of a theme scheme and returns a list of ValidationErrors.
   * @param base - The base colors of the scheme.
   * @param schemeName - The name of the scheme (for error context).
   */
  static validateBaseColors(
    base: Record<string, ColorShades>,
    schemeName: string,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!base) {
      errors.push({
        code: "MISSING_BASE_COLORS",
        message: `Scheme "${schemeName}" must include base colors.`,
        path: `schemes.${schemeName}.base`,
      });
      return errors;
    }

    this.REQUIRED_BASE_COLORS.forEach((color) => {
      if (!base[color]) {
        errors.push({
          code: "MISSING_BASE_COLOR",
          message: `Scheme "${schemeName}" is missing base color "${color}".`,
          path: `schemes.${schemeName}.base.${color}`,
        });
      } else {
        // Validate all shades for the current base color
        this.ALL_SHADE_LEVELS.forEach((shadeLevel) => {
          const shade = base[color][shadeLevel];
          if (!shade || !shade.hex) {
            errors.push({
              code: "MISSING_OR_INVALID_SHADE",
              message: `Scheme "${schemeName}" has missing or invalid shade ${shadeLevel} for base color "${color}".`,
              path: `schemes.${schemeName}.base.${color}.${shadeLevel}`,
            });
          } else {
            const result = validateHexOnly(
              shade,
              `schemes.${schemeName}.base.${color}.${shadeLevel}`,
            );
            if (!result.isValid) {
              errors.push(...result.errors!);
            }
          }
        });
      }
    });

    return errors;
  }

  /**
   * Validates the mode colors (light or dark) of a theme scheme and returns a list of ValidationErrors.
   * @param modeColors - The mode colors (light or dark).
   * @param modeName - The name of the mode ("light" or "dark").
   * @param schemeName - The name of the scheme (for error context).
   */
  static validateModeColors(
    modeColors: ModeColors,
    modeName: string,
    schemeName: string,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!modeColors) {
      errors.push({
        code: "MISSING_MODE_COLORS",
        message: `Scheme "${schemeName}" is missing ${modeName} mode colors.`,
        path: `schemes.${schemeName}.${modeName}`,
      });
      return errors;
    }

    // Add specific validation for mode colors if needed
    // Example: Validate specific properties in mode colors
    // For now, no specific validations are added.

    return errors;
  }
}
