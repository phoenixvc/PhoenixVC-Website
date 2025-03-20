import { ThemeErrorKey } from "@/theme/types";
import { ValidationError } from "@/theme/types/core/validation";

export class ThemeValidationError extends Error implements ValidationError {
  code: ThemeErrorKey;
  message: string;
  path: string;
  details?: Record<string, unknown>; // Ensure this matches the expected type

  constructor(
    message: string,
    code: ThemeErrorKey,
    path: string,
    details?: Record<string, unknown> // Explicitly type `details` correctly
  ) {
    super(message);
    this.message = message;
    this.code = code;
    this.path = path;
    this.details = details;
  }
}
