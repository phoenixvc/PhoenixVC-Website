// src/types/theme/storage.ts

import type { ColorScheme, Mode } from '../core/base';

/**
 * Storage keys configuration
 */
export interface StorageKeys {
    colorScheme: string;
    mode: string;
    useSystem: string;
    preferences: string;
    customizations: string;
    overrides: string;
}

/**
 * Theme storage configuration
 */
export interface ThemeStorage {
    /** Storage keys with default prefixes */
    keys: StorageKeys;

    /** Storage prefix for all keys */
    prefix: string;

    /** Storage type to use */
    type: 'localStorage' | 'sessionStorage' | 'memory';

    /** Version for storage schema */
    version: string;

    /** Expiration time in milliseconds */
    expiration?: number;

    /** Fallback values */
    defaults: ThemeDefaults;
}
/**
 * Theme default values
 */
export interface ThemeDefaults {
    colorScheme: 'light' | 'dark';
    mode: 'system' | 'manual';
    useSystem: boolean;
    preferences: ThemePreferences;
}

/**
 * Theme preferences
 */
export interface ThemePreferences {
    contrast: 'normal' | 'high' | 'low';
    reducedMotion: boolean;
    fontSize: number;
    fontFamily?: string;
    spacing?: 'compact' | 'normal' | 'comfortable';
    roundedCorners?: boolean;
    animations?: boolean;
}

/**
 * Theme transition configuration
 */
export interface ThemeTransition {
    /** Duration in milliseconds */
    duration: number;

    /** Timing function */
    timing: string;

    /** Properties to transition */
    properties: string[];

    /** Delay in milliseconds */
    delay?: number;

    /** Whether to disable transitions temporarily */
    disabled?: boolean;
}

/**
 * Storage event types
 */
export type StorageEventType =
    | 'update'
    | 'clear'
    | 'error'
    | 'expired'
    | 'quota_exceeded';

/**
 * Storage event payload
 */
export interface StorageEvent<T = unknown> {
    type: StorageEventType;
    key: string;
    value?: T;
    oldValue?: T;
    timestamp: number;
    error?: Error;
}

/**
 * Storage manager interface
 */
export interface StorageManager {
    /**
     * Get value from storage
     */
    get<T>(key: keyof StorageKeys): T | null;

    /**
     * Set value in storage
     */
    set<T>(key: keyof StorageKeys, value: T): void;

    /**
     * Remove value from storage
     */
    remove(key: keyof StorageKeys): void;

    /**
     * Clear all storage
     */
    clear(): void;

    /**
     * Check if key exists
     */
    has(key: keyof StorageKeys): boolean;

    /**
     * Subscribe to storage events
     */
    subscribe(callback: (event: StorageEvent) => void): () => void;

    /**
     * Get all stored values
     */
    getAll(): Partial<Record<keyof StorageKeys, unknown>>;
}

/**
 * Storage encryption configuration
 */
export interface StorageEncryption {
    enabled: boolean;
    key?: string;
    algorithm?: string;
}

/**
 * Storage migration configuration
 */
export interface StorageMigration {
    version: string;
    up: (data: unknown) => unknown;
    down: (data: unknown) => unknown;
}

/**
 * Storage configuration options
 */
export interface StorageConfig {
    prefix?: string;
    type?: ThemeStorage['type'];
    defaults?: Partial<ThemeDefaults>;
    encryption?: StorageEncryption;
    migrations?: StorageMigration[];
    expiration?: number;
    version?: string;
}

/**
 * Create storage manager
 */
export const createStorageManager = (
    config?: StorageConfig
): StorageManager => {
    // Implementation would go here
    return {} as StorageManager;
};

/**
 * Storage utilities
 */
export interface StorageUtils {
    /**
     * Create storage key with prefix
     */
    createKey: (key: string) => string;

    /**
     * Parse stored value
     */
    parseValue: <T>(value: string) => T;

    /**
     * Stringify value for storage
     */
    stringifyValue: <T>(value: T) => string;

    /**
     * Check storage availability
     */
    isAvailable: (type: ThemeStorage['type']) => boolean;

    /**
     * Get storage quota information
     */
    getQuota: () => Promise<{
        usage: number;
        quota: number;
        remaining: number;
    }>;
}

/**
 * Storage synchronization options
 */
export interface StorageSyncOptions {
    /** Sync interval in milliseconds */
    interval?: number;

    /** Whether to sync on window focus */
    syncOnFocus?: boolean;

    /** Whether to sync on storage events */
    syncOnStorage?: boolean;

    /** Custom sync strategy */
    strategy?: 'merge' | 'overwrite' | 'keep';
}

/**
 * Storage state
 */
export interface StorageState {
    initialized: boolean;
    error: Error | null;
    syncing: boolean;
    lastSync: number | null;
    quota: {
        usage: number;
        limit: number;
    };
}


/**
 * Theme storage key configuration
 */
export interface ThemeStorageKeys {
    /**
     * Color scheme storage key
     * @default 'theme-color-scheme'
     */
    colorScheme: string;

    /**
     * Mode storage key
     * @default 'theme-mode'
     */
    mode: string;

    /**
     * System preference storage key
     * @default 'theme-use-system'
     */
    useSystem: string;
}
