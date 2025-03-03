// /theme/types/core/enums.ts

/**
 * Theme error types
 * @description Possible theme-related errors
 */
export const ThemeError = {
    INVALID_SCHEME: "INVALID_SCHEME",
    INVALID_MODE: "INVALID_MODE",
    INVALID_TYPE: "INVALID_TYPE",
    INVALID_THEME_CONFIG: "INVALID_THEME_CONFIG",
    STORAGE_ERROR: "STORAGE_ERROR",
    INITIALIZATION_ERROR: "INITIALIZATION_ERROR",
    INVALID_COLOR_DEFINITION: "INVALID_COLOR_DEFINITION",
    COLOR_INVALID_TYPE: "COLOR_INVALID_TYPE",
    COLOR_INVALID_HEX: "COLOR_INVALID_HEX",
    COLOR_HEX_FORMAT: "COLOR_HEX_FORMAT",
    COLOR_INVALID_RGB: "COLOR_INVALID_RGB",
    COLOR_RGB_FORMAT: "COLOR_RGB_FORMAT",
    COLOR_RGB_RANGE: "COLOR_RGB_RANGE",
    COLOR_INVALID_HSL: "COLOR_INVALID_HSL",
    COLOR_HSL_FORMAT: "COLOR_HSL_FORMAT",
    COLOR_HSL_HUE_RANGE: "COLOR_HSL_HUE_RANGE",
    COLOR_HSL_SATURATION_RANGE: "COLOR_HSL_SATURATION_RANGE",
    COLOR_HSL_LIGHTNESS_RANGE: "COLOR_HSL_LIGHTNESS_RANGE",
    COLOR_INCONSISTENT: "COLOR_INCONSISTENT",
    COLOR_CONVERSION_ERROR: "COLOR_CONVERSION_ERROR",
    COLOR_MISSING_PROPERTIES: "COLOR_MISSING_PROPERTIES",
    UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
    MISSING_BASE_COLOR: "MISSING_BASE_COLOR",
    MISSING_BASE_COLORS: "MISSING_BASE_COLORS",
    MISSING_MODE_COLORS: "MISSING_MODE_COLORS",
    MISSING_SEMANTIC_COLORS: "MISSING_SEMANTIC_COLORS",
    COLOR_INVALID_DEFINITION: "COLOR_INVALID_DEFINITION",
    COLOR_MISSING_MODE: "COLOR_MISSING_MODE",
    MISSING_OR_INVALID_SHADE: "MISSING_OR_INVALID_SHADE",
    MISSING_SCHEMES: "MISSING_SCHEMES",
    INVALID_STORAGE_TYPE: "INVALID_STORAGE_TYPE",
    INVALID_STORAGE_VERSION: "INVALID_STORAGE_VERSION",
    INVALID_STORAGE_PREFIX: "INVALID_STORAGE_PREFIX",
    INVALID_STORAGE_DEFAULTS: "INVALID_STORAGE_DEFAULTS",
    INVALID_STORAGE_KEYS: "INVALID_STORAGE_KEYS",
    INVALID_STORAGE_EXPIRATION: "INVALID_STORAGE_EXPIRATION",
    INVALID_DEFAULT_SCHEME: "INVALID_DEFAULT_SCHEME",
    INVALID_DEFAULT_MODE: "INVALID_DEFAULT_MODE"
  } as const;

  export type ThemeErrorKey = keyof typeof ThemeError;

/**
 * Theme event types
 * @description Custom events for theme changes
 */
export type ThemeEventType =
    | "theme:init"              // Theme initialization
    | "theme:change"           // General theme change
    | "theme:mode-change"      // Mode change
    | "theme:scheme-change"    // Color scheme change
    | "theme:system-change"    // System preference change
    | "theme:storage-change"   // Storage change
    | "theme:error"           // Error event
    | "theme:reset"           // Theme reset
    | "theme:ready";          // Theme ready

/**
 * Theme class suffixes
 * @description Available suffixes for theme-based class names
 */
export type ThemeClassSuffix =
    | "primary"
    | "secondary"
    | "text"
    | "active-text"
    | "hover-bg"
    | "active-bg"
    | "mobile-menu"
    | "bg-mobile-menu"
    | "background"
    | "border";
