// src/types/theme/guards.ts
import type { ColorScheme, Mode } from '../core/base';
import type { ThemeConfig, ThemeState } from '../core/config';

/**
 * Type guard to check if a value is a valid Theme Mode
 */
export const isThemeMode = (value: unknown): value is Mode => {
    if (typeof value !== 'string') return false;
    return ['light', 'dark'].includes(value);
};

/**
 * Type guard to check if a value is a valid Color Scheme
 */
export const isColorScheme = (value: unknown): value is ColorScheme => {
    if (typeof value !== 'string') return false;
    return ['classic', 'forest', 'ocean', 'phoenix', 'lavender', 'cloud'].includes(value);
};

/**
 * Type guard to check if a value is a valid Theme Config
 */
export const isThemeConfig = (value: unknown): value is ThemeConfig => {
    if (!value || typeof value !== 'object') return false;

    const config = value as Partial<ThemeConfig>;
    return (
        'mode' in config &&
        isThemeMode(config.mode) &&
        'colorScheme' in config &&
        isColorScheme(config.colorScheme) &&
        'useSystem' in config &&
        typeof config.useSystem === 'boolean'
    );
};

/**
 * Type guard to check if a value is a valid Theme State
 */
export const isThemeState = (value: unknown): value is ThemeState => {
    if (!isThemeConfig(value)) return false;

    const state = value as Partial<ThemeState>;
    return (
        'systemMode' in state &&
        isThemeMode(state.systemMode) &&
        'initialized' in state &&
        typeof state.initialized === 'boolean' &&
        'timestamp' in state &&
        typeof state.timestamp === 'number' &&
        (!state.previous || (
            isThemeMode(state.previous.mode) &&
            isColorScheme(state.previous.colorScheme)
        ))
    );
};

/**
 * Assertion functions
 */
export const assertThemeMode = (value: unknown): asserts value is Mode => {
    if (!isThemeMode(value)) {
        throw new Error(`Invalid theme mode: ${String(value)}`);
    }
};

export const assertColorScheme = (value: unknown): asserts value is ColorScheme => {
    if (!isColorScheme(value)) {
        throw new Error(`Invalid color scheme: ${String(value)}`);
    }
};

export const assertThemeConfig = (value: unknown): asserts value is ThemeConfig => {
    if (!isThemeConfig(value)) {
        throw new Error(`Invalid theme configuration: ${JSON.stringify(value)}`);
    }
};

export const assertThemeState = (value: unknown): asserts value is ThemeState => {
    if (!isThemeState(value)) {
        throw new Error(`Invalid theme state: ${JSON.stringify(value)}`);
    }
};

export const isValidColorScheme = (scheme: unknown): scheme is ColorScheme => {
    return typeof scheme === 'string' && ['classic', 'forest', 'ocean', 'phoenix', 'lavender', 'cloud'].includes(scheme);
};

export const isValidMode = (mode: unknown): mode is Mode => {
    return typeof mode === 'string' && ['light', 'dark'].includes(mode);
};

