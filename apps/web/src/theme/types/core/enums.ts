// /theme/types/core/enums.ts

/**
 * Theme error types
 * @description Possible theme-related errors
 */
export type ThemeError =
    | "INVALID_SCHEME"
    | "INVALID_MODE"
    | "INVALID_THEME_CONFIG"
    | "STORAGE_ERROR"
    | "INITIALIZATION_ERROR"
    | "INVALID_COLOR_DEFINITION"
    | "COLOR_INVALID_TYPE"
    | "COLOR_INVALID_HEX"
    | "COLOR_HEX_FORMAT"
    | "COLOR_INVALID_RGB"
    | "COLOR_RGB_FORMAT"
    | "COLOR_RGB_RANGE"
    | "COLOR_INVALID_HSL"
    | "COLOR_HSL_FORMAT"
    | "COLOR_HSL_HUE_RANGE"
    | "COLOR_HSL_SATURATION_RANGE"
    | "COLOR_HSL_LIGHTNESS_RANGE"
    | "COLOR_INCONSISTENT"
    | "COLOR_CONVERSION_ERROR"
    | "COLOR_MISSING_PROPERTIES"
    | "UNEXPECTED_ERROR";

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
