import { ColorDefinition, ValidationResult } from "@/theme/types";
import { ThemeValidationError } from "./theme-validation-error";
import { validateHexOnly } from "./utils/color-hex-validation";
import { ThemeError } from "@/theme/types/core/enums";
import { createValidationResult } from "./utils/create-validation-result";

export class BaseColorValidation {
  static REQUIRED_BASE_COLORS = ["primary", "secondary", "accent"] as const;

  static validateBaseColors(
    base: Record<string, ColorDefinition>,
  ): ValidationResult {
    const errors: ThemeValidationError[] = [];

    if (!base || typeof base !== "object") {
      errors.push(
        new ThemeValidationError(
          "Theme must include base colors as an object",
          ThemeError.COLOR_MISSING_PROPERTIES,
          "base",
          { received: typeof base, expected: "object" },
        ),
      );
    } else {
      this.REQUIRED_BASE_COLORS.forEach((color) => {
        if (!base[color]) {
          errors.push(
            new ThemeValidationError(
              `Missing base color: ${color}`,
              ThemeError.COLOR_MISSING_PROPERTIES,
              `base.${color}`,
              { missingColor: color },
            ),
          );
        } else {
          try {
            validateHexOnly(base[color], `base.${color}`);
          } catch (error) {
            if (error instanceof ThemeValidationError) {
              errors.push(
                new ThemeValidationError(
                  `Invalid color definition for ${color}: ${error.message}`,
                  ThemeError.COLOR_MISSING_PROPERTIES,
                  `base.${color}`,
                  error.details,
                ),
              );
            } else {
              throw error; // Re-throw unexpected errors
            }
          }
        }
      });
    }

    return createValidationResult("base", base, errors);
  }
}
