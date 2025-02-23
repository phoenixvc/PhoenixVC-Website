// /theme/types/core/variables.ts

import { ColorMappings } from '../mappings';
import { ColorScheme, Mode } from './base';

/**
 * Core CSS Variable Types
 * @description Basic types for CSS variable definition and mapping
 */
export interface CSSVariableMappings {
    [key: string]: string;
}

export interface CSSVariableOptions {
    prefix: string;
    scope: string;
    format: 'rgb' | 'hsl' | 'hex';
    important?: boolean;
}

/**
 * CSS Variable Configuration
 * @description Configuration interfaces for CSS variable generation and management
 */
export interface CssVariableConfig {
    prefix: string;
    scheme: ColorScheme;
    scope?: string;
    mode?: Mode;
}

export interface CssVariableFormatOptions {
    format?: 'kebab' | 'camel';
    separator?: string;
    fallback?: string;
}

/**
 * CSS Variable Structure
 * @description Core interfaces for CSS variable representation
 */
export interface CssVariable {
    name: string;
    value: string;
    scope?: string;
    scheme?: ColorScheme;
    mode?: Mode;
}

export interface CssVariableSet {
    [key: string]: string | CssVariableSet;
}

/**
 * CSS Variable Utilities
 * @description Utility interfaces for CSS variable manipulation
 */
export interface CssVariableUtils {
    create: (name: string, value: string, config?: CssVariableConfig) => CssVariable;
    format: (variable: CssVariable, options?: CssVariableFormatOptions) => string;
    parse: (cssVariable: string) => Partial<CssVariable>;
}

/**
* Theme variables
* @description Complete set of theme variables including computed values
*/
export interface ThemeVariables {
    prefix: string;
    mappings: ColorMappings;
    computed: {
        color: ColorMappings;
        spacing: Record<string, string>;
        typography: Record<string, {
            fontSize: string;
            lineHeight: string;
            fontWeight: number;
            letterSpacing?: string;
        }>;
        breakpoints: Record<string, string>;
        animation: Record<string, {
            duration: string;
            easing: string;
        }>;
        zIndex: Record<string, number>;
    };
}
