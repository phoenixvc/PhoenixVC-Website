// /src/theme/types/mappings/base-mappings.ts

import { ColorDefinition } from "../core/colors";

/**
 * Scale values type for consistent scaling across the theme
 */
export type ScaleValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Elevation levels type
 */
export type ElevationLevel = 'none' | 'low' | 'medium' | 'high' | 'highest';

/**
 * Theme color context
 */
export type ColorContext = 'light' | 'dark' | 'system';

/**
 * Surface configuration
 */
export interface SurfaceConfig {
    background: string;
    foreground: string;
    border: string;
    elevation: string;
    overlay: string;
}

/**
 * Interactive states type
 */
export interface InteractiveStates {
    default: string;
    hover: string;
    active: string;
    focus: string;
    disabled: string;
}

/**
 * Component state configuration
 */
export interface ComponentStateConfig {
    background: string;
    foreground: string;
    border: string;
    shadow?: string;
    opacity?: number;
}

/**
 * Base mapping configuration
 */
export interface BaseMappingConfig {
    prefix: string;
    scope: string;
    format: 'rgb' | 'hsl' | 'hex';
    separator: string;
}

/**
 * Base mapping operations
 */
export interface BaseMappingOperations {
    get: <T>(path: string, defaultValue?: T) => T;
    set: <T>(path: string, value: T) => void;
    resolve: (path: string) => string;
    transform: (value: string, path: string) => string;
}

/**
 * Base variable mapping structure
 */
export interface BaseVariableMapping {
    name: string;
    value: ColorDefinition;
    scope?: string;
    format?: 'rgb' | 'hsl' | 'hex';
}

/**
 * Base mapping registry
 */
export interface BaseMappingRegistry {
    colors: Map<string, ColorDefinition>;  // Changed from string to ColorDefinition
    scales: Map<string, string>;
    variables: Map<string, BaseVariableMapping>;  // Changed key from ColorDefinition to string
}

/**
 * Base mapping context
 */
export interface BaseMappingContext {
    config: BaseMappingConfig;
    registry: BaseMappingRegistry;
    operations: BaseMappingOperations;
}

/**
 * Base mapping generator options
 */
export interface BaseMappingGeneratorOptions {
    prefix?: string;
    scope?: string;
    format?: 'rgb' | 'hsl' | 'hex';
    separator?: string;
    transforms?: Record<string, (value: string) => string>;
}

/**
 * Base mapping validator
 */
export interface BaseMappingValidator {
    validatePath: (path: string) => boolean;
    validateValue: (value: string, format?: string) => boolean;
    validateMapping: (mapping: BaseVariableMapping) => boolean;
}
