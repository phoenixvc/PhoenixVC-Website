// src/types/theme/events.ts

import { ColorScheme, Mode } from '../core/base';
import { ThemeState, ThemeConfig } from '../core/config';

/**
 * Theme event types
 */
export type ThemeEventType =
    | 'theme:init'              // Theme initialization
    | 'theme:change'           // General theme change
    | 'theme:mode-change'      // Mode change
    | 'theme:scheme-change'    // Color scheme change
    | 'theme:system-change'    // System preference change
    | 'theme:storage-change'   // Storage change
    | 'theme:error'           // Error event
    | 'theme:reset'           // Theme reset
    | 'theme:ready';          // Theme ready

/**
 * Base theme event payload
 */
export interface BaseThemeEventPayload {
    type: ThemeEventType;
    timestamp: number;
    source?: 'user' | 'system' | 'storage' | 'api';
}

/**
 * Theme change event payload
 */
export interface ThemeChangeEventPayload extends BaseThemeEventPayload {
    previous: Partial<ThemeState>;
    current: ThemeState;
    changes: Partial<ThemeConfig>;
}

/**
 * Theme mode change event payload
 */
export interface ThemeModeChangeEventPayload extends BaseThemeEventPayload {
    previousMode: Mode;
    currentMode: Mode;
    isSystemMode: boolean;
}

/**
 * Theme scheme change event payload
 */
export interface ThemeSchemeChangeEventPayload extends BaseThemeEventPayload {
    previousScheme: ColorScheme;
    currentScheme: ColorScheme;
    isSystemScheme: boolean;
}

/**
 * Theme system change event payload
 */
export interface ThemeSystemChangeEventPayload extends BaseThemeEventPayload {
    systemMode: Mode;
    systemColorScheme: ColorScheme;
    appliedChanges: boolean;
}

/**
 * Theme error codes
 */
export type ThemeErrorCode =
    | 'INVALID_SCHEME'           // Invalid color scheme
    | 'INVALID_MODE'            // Invalid mode
    | 'STORAGE_ERROR'           // Storage-related error
    | 'INITIALIZATION_ERROR'    // Initialization error
    | 'SYSTEM_DETECTION_ERROR'  // System preference detection error
    | 'TRANSITION_ERROR'        // Transition-related error
    | 'INVALID_CONFIG'          // Invalid configuration
    | 'EVENT_ERROR'            // Event handling error
    | 'CONTEXT_ERROR';         // Context-related error

/**
 * Theme error levels
 */
export type ThemeErrorLevel = 'error' | 'warning' | 'info';

/**
 * Theme error interface
 */
export interface ThemeError {
    code: ThemeErrorCode;
    message: string;
    level: ThemeErrorLevel;
    timestamp: number;
    context?: any;
    originalError?: Error;
}

/**
 * Theme error event payload
 */
export interface ThemeErrorEventPayload extends BaseThemeEventPayload {
    error: ThemeError;
    handled: boolean;
}

/**
 * Theme event payload union type
 */
export type ThemeEventPayload =
    | ThemeChangeEventPayload
    | ThemeModeChangeEventPayload
    | ThemeSchemeChangeEventPayload
    | ThemeSystemChangeEventPayload
    | ThemeErrorEventPayload;

/**
 * Theme event handler type
 */
export type ThemeEventHandler = (payload: ThemeEventPayload) => void;

/**
 * Theme event subscription options
 */
export interface ThemeEventSubscriptionOptions {
    /**
     * Event types to subscribe to
     */
    types?: ThemeEventType[];

    /**
     * Whether to receive events from all sources
     */
    allSources?: boolean;

    /**
     * Specific sources to listen to
     */
    sources?: Array<'user' | 'system' | 'storage' | 'api'>;

    /**
     * Whether to receive past events
     */
    includePastEvents?: boolean;
}

/**
 * Theme event emitter interface
 */
export interface ThemeEventEmitter {
    /**
     * Subscribe to theme events
     */
    subscribe: (
        handler: ThemeEventHandler,
        options?: ThemeEventSubscriptionOptions
    ) => () => void;

    /**
     * Emit theme event
     */
    emit: (payload: ThemeEventPayload) => void;

    /**
     * Get event history
     */
    getHistory: () => ThemeEventPayload[];

    /**
     * Clear event history
     */
    clearHistory: () => void;
}

/**
 * Theme event manager interface
 */
export interface ThemeEventManager extends ThemeEventEmitter {
    /**
     * Initialize event manager
     */
    init: () => void;

    /**
     * Handle theme error
     */
    handleError: (error: ThemeError) => void;

    /**
     * Get last event of specific type
     */
    getLastEvent: (type: ThemeEventType) => ThemeEventPayload | null;

    /**
     * Check if event type is supported
     */
    isEventTypeSupported: (type: string) => boolean;
}

/**
 * Create theme event manager options
 */
export interface CreateThemeEventManagerOptions {
    /**
     * Maximum history size
     */
    maxHistorySize?: number;

    /**
     * Debug mode
     */
    debug?: boolean;

    /**
     * Error handler
     */
    onError?: (error: ThemeError) => void;
}

/**
 * Create theme event manager
 */
export const createThemeEventManager = (
    options?: CreateThemeEventManagerOptions
): ThemeEventManager => {
    // Implementation would go here
    return {} as ThemeEventManager;
};
