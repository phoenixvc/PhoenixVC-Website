// utils/theme-validation.ts

import { ColorScheme, Mode } from '../types/theme.types';
import { THEME_CONSTANTS } from '../constants/theme-constants';

/**
 * Valid color schemes for the application
 */
export function isValidColorScheme(value: unknown): value is ColorScheme {
    if (typeof value !== 'string') {
        return false;
    }
    return THEME_CONSTANTS.COLOR_SCHEMES.includes(value as ColorScheme);
}


/**
 * Type guard to check if a value is a valid Mode
 * @param value - The value to check
 * @returns boolean indicating if the value is a valid Mode
 */
export function isValidMode(value: unknown): value is Mode {
    if (typeof value !== 'string') {
        return false;
    }
    return THEME_CONSTANTS.MODES.includes(value as Mode);
}

/**
 * Validates a color scheme and throws an error if invalid
 * @param colorScheme - The color scheme to validate
 * @throws Error if the color scheme is invalid
 */
export function validateColorScheme(colorScheme: unknown): void {
    if (!isValidColorScheme(colorScheme)) {
        throw new Error(
            `Invalid color scheme: "${colorScheme}". Must be one of: ${THEME_CONSTANTS.COLOR_SCHEMES.join(', ')}`
        );
    }
}

/**
 * Validates a mode and throws an error if invalid
 * @param mode - The mode to validate
 * @throws Error if the mode is invalid
 */
export function validateMode(mode: unknown): void {
    if (!isValidMode(mode)) {
        throw new Error(
            `Invalid mode: "${mode}". Must be one of: ${THEME_CONSTANTS.MODES.join(', ')}`
        );
    }
}

/**
 * Validates theme configuration object
 * @param config - The configuration object to validate
 * @throws Error if any configuration values are invalid
 */
export function validateThemeConfig(config: {
    colorScheme?: unknown;
    mode?: unknown;
    useSystemMode?: unknown;
}): void {
    if (config.colorScheme !== undefined) {
        validateColorScheme(config.colorScheme);
    }
    
    if (config.mode !== undefined) {
        validateMode(config.mode);
    }
    
    if (config.useSystemMode !== undefined && typeof config.useSystemMode !== 'boolean') {
        throw new Error('useSystemMode must be a boolean value');
    }
}

/**
 * Checks if a CSS variable name is valid
 * @param name - The CSS variable name to validate
 * @returns boolean indicating if the name is valid
 */
export function isValidCssVariableName(name: string): boolean {
    // CSS custom property names can contain letters, numbers, hyphens, and underscores
    const cssVarNamePattern = /^[a-zA-Z0-9-_]+$/;
    return cssVarNamePattern.test(name);
}

/**
 * Validates a CSS variable name and throws if invalid
 * @param name - The CSS variable name to validate
 * @throws Error if the name is invalid
 */
export function validateCssVariableName(name: string): void {
    if (!isValidCssVariableName(name)) {
        throw new Error(
            'Invalid CSS variable name. Must contain only letters, numbers, hyphens, and underscores.'
        );
    }
}

/**
 * Utility function to ensure a value exists in an enum-like object
 * @param value - The value to check
 * @param enumObject - The enum-like object to check against
 * @returns boolean indicating if the value exists in the enum
 */
export function isValidEnumValue<T extends { [key: string]: string }>(
    value: unknown,
    enumObject: T
): value is T[keyof T] {
    if (typeof value !== 'string') {
        return false;
    }
    return Object.values(enumObject).includes(value);
}

/**
 * Checks if an object has all required theme properties
 * @param obj - The object to validate
 * @returns boolean indicating if the object has all required properties
 */
export function hasRequiredThemeProperties(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    const requiredProps = ['colorScheme', 'mode', 'systemMode', 'useSystemMode', 'initialized'];
    return requiredProps.every(prop => prop in obj);
}

/**
 * Validates a complete theme state object
 * @param state - The theme state object to validate
 * @throws Error if the state is invalid
 */
export function validateThemeState(state: unknown): void {
    if (!hasRequiredThemeProperties(state)) {
        throw new Error('Invalid theme state: missing required properties');
    }

    const typedState = state as {
        colorScheme: unknown;
        mode: unknown;
        systemMode: unknown;
        useSystemMode: unknown;
        initialized: unknown;
    };

    validateColorScheme(typedState.colorScheme);
    validateMode(typedState.mode);
    validateMode(typedState.systemMode);

    if (typeof typedState.useSystemMode !== 'boolean') {
        throw new Error('useSystemMode must be a boolean value');
    }

    if (typeof typedState.initialized !== 'boolean') {
        throw new Error('initialized must be a boolean value');
    }
}