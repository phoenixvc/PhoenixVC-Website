import { SemanticColors, ValidationResult, ValidationError, ThemeError } from "@/theme/types";
import { validateHexOnly } from "./utils/color-hex-validation";
import { createValidationResult } from "./utils/create-validation-result";

export class SemanticColorValidation {
  static REQUIRED_SEMANTIC_COLORS = ["success", "error", "warning", "info"] as const;

  static validateSemanticColors(semantic: SemanticColors): ValidationResult {
    const errors: ValidationError[] = [];

    // Check if semantic colors are provided
    if (!semantic) {
      errors.push({
        code: ThemeError.MISSING_SEMANTIC_COLORS,
        message: "Theme must include semantic colors",
        path: "semantic",
        details: { missingColors: this.REQUIRED_SEMANTIC_COLORS },
      });

      return createValidationResult("semantic", semantic, errors);
    }

    // Validate each required semantic color
    this.REQUIRED_SEMANTIC_COLORS.forEach((color) => {
      const colorDefinition = semantic[color as keyof SemanticColors];

      if (!colorDefinition) {
        errors.push({
          code: ThemeError.MISSING_SEMANTIC_COLORS,
          message: `Missing semantic color ${color}`,
          path: `semantic.${color}`,
          details: { missingColor: color },
        });
      } else {
        // Ensure that colorDefinition is not undefined before calling validateHexOnly
        const result = validateHexOnly(colorDefinition, `semantic.${color}`);
        if (result.errors && result.errors.length > 0) {
          errors.push(...result.errors);
        }
      }
    });

    return createValidationResult("semantic", semantic, errors);
  }
}
