// src/types/theme/context/events.ts

import { ThemeError, ThemeEventType } from "../core";
import { ThemeName, ThemeMode } from "../core/base";
import { ThemeState, ThemeConfig } from "../core/config";
import { BaseThemeEventPayload, ThemeErrorEventPayload } from "./error";

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
  previousMode: ThemeMode;
  currentMode: ThemeMode;
  isSystemMode: boolean;
}

/**
 * Theme scheme change event payload
 */
export interface ThemeSchemeChangeEventPayload extends BaseThemeEventPayload {
  previousScheme: ThemeName;
  currentScheme: ThemeName;
  isSystemScheme: boolean;
}

/**
 * Theme system change event payload
 */
export interface ThemeSystemChangeEventPayload extends BaseThemeEventPayload {
  systemMode: ThemeMode;
  systemColorScheme: ThemeName;
  appliedChanges: boolean;
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
  sources?: Array<"user" | "system" | "storage" | "api">;

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
    options?: ThemeEventSubscriptionOptions,
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
  handleError: (error: typeof ThemeError) => void;

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
  onError?: (error: typeof ThemeError) => void;
}

/**
 * Create theme event manager
 */
export const createThemeEventManager =
  () // options_?: CreateThemeEventManagerOptions
  : ThemeEventManager => {
    // Implementation would go here
    return {} as ThemeEventManager;
  };
