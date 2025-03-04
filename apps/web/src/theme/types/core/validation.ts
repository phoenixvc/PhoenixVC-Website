// /theme/types/core/validation.ts

import { ThemeError, ThemeErrorKey } from "./enums";

export interface ValidationRule<T> {
    validate: (value: T) => boolean;
    message: string;
}

export type ValidationResult = {
    isValid: boolean;
    path: string;
    value: unknown;
  } & (
    | { isValid: true; errors?: never }
    | { isValid: false; errors: ValidationError[] }
  );

export interface ValidationError {
    code: ThemeErrorKey;
    message: string;
    path: string;
    details?: Record<string, unknown>;
  }

export type ValidationErrorDetails = {
    received?: unknown;
    expected?: unknown;
    missingProperties?: string[];
    h?: number;
    s?: number;
    l?: number;
    r?: number;
    g?: number;
    b?: number;
    hex?: string;
    rgb?: string;
    expectedRgb?: string;
    [key: string]: unknown;
};

export interface SchemaValidator<T> {
    rules: ValidationRule<T>[];
    validate: (value: T) => ValidationResult;
}
