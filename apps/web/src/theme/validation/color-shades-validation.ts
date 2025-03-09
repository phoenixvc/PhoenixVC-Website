import { ColorDefinition, ShadeLevel, ValidationResult, ValidationError } from "@/theme/types";
import { validateColorDef } from "./color-definition-validation";
import { ThemeError } from "@/theme/types/core/enums";
import { createValidationResult } from "./utils/create-validation-result";
import { ThemeValidationError } from "./theme-validation-error";

/**
 * Validation class for color shade collections
 */
export class ColorShadesValidation {
  /**
   * Required shade levels that must be present in a complete color shade set
   */
  private static readonly requiredShades: ShadeLevel[] = [
    50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
  ];

  /**
   * Validates a collection of color shades
   * @param shades The color shades to validate
   * @param path The path to the shades in the theme object
   * @returns ValidationResult indicating if the shades are valid
   */
  static validateColorShades(
    shades: Record<ShadeLevel, ColorDefinition>,
    path: string
  ): ValidationResult {
    const errors: ValidationError[] = [];

    this.requiredShades.forEach((shade) => {
      if (!shades[shade]) {
        errors.push(new ThemeValidationError(
          `Missing shade ${shade} at ${path}`,
          ThemeError.COLOR_MISSING_PROPERTIES,
          `${path}.${shade}`,
          { missingShade: shade }
        ));
      } else {
        try {
          validateColorDef(shades[shade], `${path}.${shade}`);
        } catch (error) {
          errors.push(new ThemeValidationError(
            `Invalid color definition for shade ${shade} at ${path}`,
            ThemeError.COLOR_INVALID_DEFINITION,
            `${path}.${shade}`,
            error instanceof Error ? { message: error.message } : { message: String(error) }
          ));
        }
      }
    });

    return createValidationResult(path, shades, errors);
  }

  /**
   * Checks if all required shades are present in a shade collection
   * @param shades The color shades to check
   * @returns Boolean indicating if all required shades are present
   */
  static hasAllRequiredShades(shades: Partial<Record<ShadeLevel, ColorDefinition>>): boolean {
    return this.requiredShades.every(shade => !!shades[shade]);
  }

  /**
   * Type guard to check if an object is a valid color shade collection
   * @param obj Object to check
   * @returns Boolean indicating if the object is a valid color shade collection
   */
  static isColorShadesType(obj: unknown): obj is Record<ShadeLevel, ColorDefinition> {
    if (!obj || typeof obj !== "object") return false;

    const shades = obj as Partial<Record<ShadeLevel, ColorDefinition>>;

    // Check if all required shades are present
    if (!this.hasAllRequiredShades(shades)) {
      return false;
    }

    // Check if all shades are valid color definitions
    for (const shade of this.requiredShades) {
      try {
        validateColorDef(shades[shade]!, `shade.${shade}`);
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the missing shades from a shade collection
   * @param shades The color shades to check
   * @returns Array of missing shade levels
   */
  static getMissingShades(shades: Partial<Record<ShadeLevel, ColorDefinition>>): ShadeLevel[] {
    return this.requiredShades.filter(shade => !shades[shade]);
  }
}
