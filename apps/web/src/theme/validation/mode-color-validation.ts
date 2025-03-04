import { ColorDefinition, ThemeMode, ValidationResult } from "@/theme/types";
import { ThemeError } from "@/theme/types/core/enums";
import { validateHexOnly } from "./utils/color-hex-validation";
import { createValidationResult } from "./utils/create-validation-result";

export class ModeColorValidation {
  static REQUIRED_MODE_COLORS = ["background", "text", "border"] as const;

  /**
   * Validates the mode colors and returns a ValidationResult.
   *
   * @param modeColors - A record of mode-specific colors.
   * @param mode - The theme mode being validated (e.g., "light" or "dark").
   * @returns ValidationResult - The result of the validation.
   */
  static validateModeColors(
    modeColors: Record<string, ColorDefinition> | null | undefined,
    mode: ThemeMode
  ): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    // Check if modeColors is missing
    if (!modeColors) {
      errors.push({
        code: ThemeError.COLOR_MISSING_MODE,
        message: `Missing ${mode} mode colors`,
        path: `${mode}`,
        details: { mode },
      });

      return createValidationResult(mode, modeColors, errors);
    }

    // Validate required mode colors
    this.REQUIRED_MODE_COLORS.forEach((color) => {
      if (!modeColors[color]) {
        errors.push({
          code: ThemeError.COLOR_MISSING_PROPERTIES,
          message: `Missing ${mode} mode color: ${color}`,
          path: `${mode}.${color}`,
          details: { missingColor: color },
        });
      } else {
        try {
          validateHexOnly(modeColors[color], `${mode}.${color}`);
        } catch (error) {
          errors.push({
            code: ThemeError.COLOR_INVALID_DEFINITION,
            message: `Invalid color definition for ${mode} mode color: ${color}`,
            path: `${mode}.${color}`,
            details: error instanceof Error ? { message: error.message } : {},
          });
        }
      }
    });

    return createValidationResult(mode, modeColors, errors);
  }
}
