// /theme/types/core/colors.ts

/**
 * Core Color Types
 */
export interface ColorDefinition {
    hex: string;
    rgb: string;
    hsl: string;
    alpha?: number;
}

export interface ColorShades {
    50: ColorDefinition;
    100: ColorDefinition;
    200: ColorDefinition;
    300: ColorDefinition;
    400: ColorDefinition;
    500: ColorDefinition;  // Base color
    600: ColorDefinition;
    700: ColorDefinition;
    800: ColorDefinition;
    900: ColorDefinition;
}

/**
 * Base Colors
 */
export interface BaseColors {
    primary: ColorShades;
    secondary: ColorShades;
    tertiary: ColorShades;
    neutral: ColorShades;
    gray: ColorShades;
    accent?: ColorShades;
    surface?: ColorShades;
}

/**
 * Semantic Colors
 */
export interface SemanticColors {
    success: ColorShades;
    warning: ColorShades;
    error: ColorShades;
    info: ColorShades;
}

/**
 * Theme Configuration
 */
export interface ColorConfig {
    mode: 'light' | 'dark';
    scheme: string;
    accessibility: ColorAccessibility;
    scale?: ColorScaleConfig;
    palette?: ColorPaletteConfig;
}

export interface ColorAccessibility {
    minimumContrast: number;
    enhancedContrast: number;
    largeTextMinimum: number;
    graphicalMinimum: number;
}

export interface ColorScaleConfig {
    start: string;
    end: string;
    steps: number;
    mode?: 'rgb' | 'hsl' | 'lab';
    distribution?: 'linear' | 'exponential';
}

export interface ColorPaletteConfig {
    baseColor: string;
    complementary?: boolean;
    analogous?: boolean;
    triadic?: boolean;
    tetradic?: boolean;
    shades?: number;
    tints?: number;
}

/**
 * Shadow Properties
 */
export interface ShadowProperties {
    color: ColorDefinition;
    offsetX: string;
    offsetY: string;
    blur: string;
    spread: string;
    inset?: boolean;
}

/**
 * Complex Shadow Definition
 */
export interface ComplexShadow {
    primary: ShadowProperties;
    secondary?: ShadowProperties;
    tertiary?: ShadowProperties;
}

/**
 * Shadow Set
 * @description Comprehensive shadow variations for elevation and interaction
 */
export interface ShadowSet {
    small: ShadowProperties;
    medium: ShadowProperties;
    large: ShadowProperties;
    focus: ShadowProperties;
    hover: ShadowProperties;
    inner: ShadowProperties;
    outline: ShadowProperties;
    ambient: ShadowProperties;
    layered: {
        top: ComplexShadow;
        middle: ComplexShadow;
        bottom: ComplexShadow;
    };
}

export type GradientType = 'linear' | 'radial' | 'conic';
export type ColorExportFormat = 'css' | 'scss' | 'less' | 'json' | 'ts';

/**
 * ColorSet
 * A simple alias for a single color definition.
 * This type is used as the base type for component color tokens.
 */
export type ColorSet = ColorDefinition;
