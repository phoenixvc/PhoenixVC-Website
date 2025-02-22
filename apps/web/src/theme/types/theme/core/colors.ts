// src/types/theme/colors.ts

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
 * Base Color Sets
 */
export interface ColorSet {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border: ColorDefinition;
    outline: ColorDefinition;
}

export interface BaseColors {
    primary: ColorShades;
    secondary: ColorShades;
    tertiary: ColorShades;
    neutral: ColorShades;
    gray: ColorShades;
}

export interface SemanticColors {
    success: ColorShades;
    warning: ColorShades;
    error: ColorShades;
    info: ColorShades;
}

/**
 * Extended Color Sets
 */
export interface SemanticColorSet extends ColorSet {
    light: ColorDefinition;
    dark: ColorDefinition;
    muted: ColorDefinition;
    emphasis: ColorDefinition;
}

export interface ComponentColorSet extends ColorSet {
    hover: ColorDefinition;
    active: ColorDefinition;
    disabled: ColorDefinition;
    focus: ColorDefinition;
}

/**
 * Component-Specific Color Sets
 */
export interface InputBaseColorSet extends ComponentColorSet {
    placeholder: string;
    readonly: string;
    error: ComponentColorSet;
    success: ComponentColorSet;
}

export interface ButtonBaseColorSet extends ComponentColorSet {
    loading: string;
    text: string;
    textHover: string;
    textActive: string;
    textDisabled: string;
}

export interface NavigationBaseColorSet extends ComponentColorSet {
    selected: string;
    selectedText: string;
    divider: string;
}

/**
 * Element-Specific Color Sets
 */
export interface TextColorSet {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: {
        default: string;
        hover: string;
        visited: string;
    };
}

export interface BorderSet {
    default: string;
    strong: string;
    weak: string;
    focus: string;
    disabled: string;
}

export interface ShadowSet {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
}

/**
 * Complex Component Color Sets
 */
export interface TableBaseColorSet extends ComponentColorSet {
    header: {
        background: string;
        text: string;
    };
    row: {
        even: string;
        odd: string;
        hover: string;
        selected: string;
    };
    cell: {
        border: string;
    };
}

export interface ChartBaseColorSet {
    background: string;
    grid: {
        main: string;
    };
    axis: {
        main: string;
    };
    text: string;
    series: string[];
    tooltip: {
        background: string;
        text: string;
        border: string;
    };
}

/**
 * Theme Context and Configuration
 */
export interface ThemeColorContext {
    mode: 'light' | 'dark';
    scheme: string;
    setMode: (mode: 'light' | 'dark') => void;
    setScheme: (scheme: string) => void;
    toggleMode: () => void;
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

export interface ColorAccessibility {
    minimumContrast: number;
    enhancedContrast: number;
    largeTextMinimum: number;
    graphicalMinimum: number;
}

export type GradientType = 'linear' | 'radial' | 'conic';
export type ColorExportFormat = 'css' | 'scss' | 'less' | 'json' | 'ts';
