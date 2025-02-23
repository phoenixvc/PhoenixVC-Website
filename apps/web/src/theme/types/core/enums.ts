// /theme/types/core/enums.ts

/**
 * Theme error types
 * @description Possible theme-related errors
 */
export type ThemeError =
    | 'INVALID_SCHEME'
    | 'INVALID_MODE'
    | 'STORAGE_ERROR'
    | 'INITIALIZATION_ERROR';

/**
 * Theme event types
 * @description Custom events for theme changes
 */
export type ThemeEventType =
    | 'theme:init'
    | 'theme:change'
    | 'theme:mode-change'
    | 'theme:scheme-change'
    | 'theme:system-change';

/**
 * Theme class suffixes
 * @description Available suffixes for theme-based class names
 */
export type ThemeClassSuffix =
    | 'primary'
    | 'secondary'
    | 'text'
    | 'active-text'
    | 'hover-bg'
    | 'active-bg'
    | 'mobile-menu'
    | 'bg-mobile-menu'
    | 'border';
