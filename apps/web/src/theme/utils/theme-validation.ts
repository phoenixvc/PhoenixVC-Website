// theme/utils/theme-validation.ts

import { ValidationError, ValidationResult } from "../types";

export const ValidationUtils = {
    createInvalidResult(
        path: string,
        value: unknown,
        error: ValidationError
    ): ValidationResult {
        return {
            isValid: false,
            path,
            value,
            errors: [error]
        };
    }
};
