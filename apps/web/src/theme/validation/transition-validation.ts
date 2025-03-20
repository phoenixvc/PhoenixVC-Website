import { ThemeInitOptions, ValidationResult } from "@/theme/types";
import { ThemeValidationError } from "./theme-validation-error";

export class TransitionValidation {
  static validateTransitionConfig(
    transition: Partial<ThemeInitOptions["transition"]>
  ): ValidationResult {
    const errors: ThemeValidationError[] = [];

    if (typeof transition !== "object") {
      errors.push(
        new ThemeValidationError(
          "Transition configuration must be an object",
          "INVALID_TYPE",
          "transition"
        )
      );
    } else {
      if (transition.duration && typeof transition.duration !== "number") {
        errors.push(
          new ThemeValidationError(
            "Transition duration must be a number",
            "INVALID_TYPE",
            "transition.duration",
            { received: typeof transition.duration, expected: "number" }
          )
        );
      }
      if (transition.timing && typeof transition.timing !== "string") {
        errors.push(
          new ThemeValidationError(
            "Transition timing function must be a string",
            "INVALID_TYPE",
            "transition.timing",
            { received: typeof transition.timing, expected: "string" }
          )
        );
      }
      if (transition.properties && !Array.isArray(transition.properties)) {
        errors.push(
          new ThemeValidationError(
            "Transition properties must be an array",
            "INVALID_TYPE",
            "transition.properties",
            { received: typeof transition.properties, expected: "array" }
          )
        );
      }
    }

    // Return the validation result
    if (errors.length > 0) {
      return {
        isValid: false,
        path: "transition",
        value: transition,
        errors: errors.map((error) => ({
          code: error.code,
          message: error.message,
          path: error.path,
          details: error.details,
        })),
      };
    }

    return {
      isValid: true,
      path: "transition",
      value: transition,
    };
  }
}
