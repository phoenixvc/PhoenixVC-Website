// /theme/types/core/validation.ts

export interface ValidationRule<T> {
    validate: (value: T) => boolean;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}

export interface SchemaValidator<T> {
    rules: ValidationRule<T>[];
    validate: (value: T) => ValidationResult;
}
