import { ColorDefinition, ShadeLevel, ValidationResult } from "@/theme/types";
import { validateColorDef } from "./color-definition-validation";
import { ThemeError } from "@/theme/types/core/enums";
import { createValidationResult } from "./utils/create-validation-result";

export const validateColorShades = (
  shades: Record<ShadeLevel, ColorDefinition>,
  path: string
): ValidationResult => {
  const requiredShades: ShadeLevel[] = [
    50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
  ];

  const errors: ValidationResult["errors"] = [];

  requiredShades.forEach((shade) => {
    if (!shades[shade]) {
      errors.push({
        code: ThemeError.COLOR_MISSING_PROPERTIES,
        message: `Missing shade ${shade} at ${path}`,
        path: `${path}.${shade}`,
        details: { missingShade: shade },
      });
    } else {
      try {
        validateColorDef(shades[shade], `${path}.${shade}`);
      } catch (error) {
        errors.push({
          code: ThemeError.COLOR_INVALID_DEFINITION,
          message: `Invalid color definition for shade ${shade} at ${path}`,
          path: `${path}.${shade}`,
          details: error instanceof Error ? { message: error.message } : {},
        });
      }
    }
  });

  return createValidationResult(path, shades, errors);
};
