import { ColorDefinition, ValidationResult, ValidationErrorDetails } from "@/theme/types";
import { printValidationResults } from "./utils/print-validation-results";
import ColorUtils from "@/theme/utils/color-utils";

export const validateColorDef = (color: ColorDefinition, path: string): ValidationResult => {
  try {
    const result = ColorUtils.validateColorDefinition(color, path);

    // Print validation results with context
    printValidationResults(result, `Color Definition - ${path}`);

    return result;
  } catch (error) {
    const errorResult: ValidationResult = {
      isValid: false,
      errors: [
        {
          code: "UNEXPECTED_ERROR",
          message: error instanceof Error ? error.message : "Unknown error occurred",
          path,
          details: {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          } as ValidationErrorDetails,
        },
      ],
      path,
      value: color,
    };

    // Print error result with context
    printValidationResults(errorResult, `Error in Color Definition - ${path}`);

    return errorResult;
  }
};
