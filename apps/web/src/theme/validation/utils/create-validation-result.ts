import { ValidationResult } from "@/theme/types";
import { ThemeErrorKey } from "@/theme/types";

/**
 * Creates a ValidationResult object based on the presence of errors.
 *
 * @param path - The path of the validated object (e.g., "base").
 * @param value - The value being validated.
 * @param errors - An array of validation errors, if any.
 * @returns ValidationResult - The result of the validation.
 */
export function createValidationResult<T>(
  path: string,
  value: T,
  errors: Array<{
    code: ThemeErrorKey;
    message: string;
    path: string;
    details?: Record<string, unknown>;
  }> = [],
): ValidationResult {
  if (errors.length === 0) {
    return {
      isValid: true,
      path,
      value,
    };
  }

  return {
    isValid: false,
    path,
    value,
    errors: errors.map((error) => ({
      code: error.code,
      message: error.message,
      path: error.path,
      details: error.details,
    })),
  };
}
