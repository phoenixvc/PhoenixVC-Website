// theme/types/context/errors.ts

import { ThemeValidationError } from "@/theme/validation";

/**
 * Theme error codes indicating the type of error that occurred.
 */
export type ThemeErrorCode =
  | "INVALID_SCHEME" // Invalid color scheme
  | "INVALID_MODE" // Invalid mode
  | "STORAGE_ERROR" // Storage-related error
  | "INITIALIZATION_ERROR" // Initialization error
  | "SYSTEM_DETECTION_ERROR" // System preference detection error
  | "TRANSITION_ERROR" // Transition-related error
  | "INVALID_CONFIG" // Invalid configuration
  | "EVENT_ERROR" // Event handling error
  | "CONTEXT_ERROR"; // Context-related error

/**
 * Levels indicating the severity of an error.
 */
export type ThemeErrorLevel = "error" | "warning" | "info";

/**
 * Theme context error interface extending the standard Error object.
 * This is used within the context layer to provide additional error metadata.
 */
export interface ThemeContextError extends Error {
  code: string;
  context?: unknown;
}

/**
 * Base payload for all theme-related events.
 */
export interface BaseThemeEventPayload {
  type: string;
  timestamp: number;
  source?: "user" | "system" | "storage" | "api";
}

/**
 * Error event payload for theme-related errors.
 */
export interface ThemeErrorEventPayload extends BaseThemeEventPayload {
  error: ThemeValidationError;
  handled: boolean;
}
