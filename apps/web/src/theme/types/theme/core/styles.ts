// src/types/theme/styles.ts

import { CSSVariableMappings } from "./variables";

/**
 * Base Style Interfaces
 * @description Foundation style interfaces for different states
 */
export interface BaseStyles {
    [key: string]: string | undefined;
}

export interface HoverStyles extends BaseStyles {
    backgroundColor?: string;
    color?: string;
    borderColor?: string;
    transform?: string;
    boxShadow?: string;
    opacity?: string;
}

export interface FocusStyles extends BaseStyles {
    outline?: string;
    boxShadow?: string;
    borderColor?: string;
    backgroundColor?: string;
}

export interface ActiveStyles extends BaseStyles {
    backgroundColor?: string;
    color?: string;
    borderColor?: string;
    transform?: string;
}

export interface DisabledStyles extends BaseStyles {
    opacity?: string;
    cursor?: string;
    backgroundColor?: string;
    color?: string;
    pointerEvents?: string;
}

/**
 * Semantic Style Types
 * @description Types for semantic color and style handling
 */
export interface SemanticStyles {
    success: string;
    warning: string;
    error: string;
    info: string;
    neutral?: string;
    brand?: string;
    [key: string]: string | undefined;
}

export interface SemanticStyleSet {
    background: string;
    color: string;
    border?: string;
    icon?: string;
    hover?: HoverStyles;
    active?: ActiveStyles;
}

export type SemanticStyleMap = Record<keyof SemanticStyles, SemanticStyleSet>;

/**
 * Interactive State Types
 * @description Types for handling interactive states
 */
export interface InteractiveStyles {
    hover: string;
    active: string;
    focus: string;
    disabled: string;
    loading?: string;
    pressed?: string;
    [key: string]: string | undefined;
}

/**
 * Color Scheme Types
 * @description Types for color scheme handling
 */
export interface ColorSchemeClasses {
    primary: string;
    secondary: string;
    text: string;
    activeText: string;
    hoverBg: string;
    activeBg: string;
    mobileMenu: string;
    bgMobileMenu: string;
    border: string;
}

/**
 * Style Processing Types
 * @description Types for style generation and processing
 */
export interface StyleGenerationOptions {
    prefix?: string;
    scope?: string;
    important?: boolean;
    format?: 'css' | 'json' | 'object' | 'module';
    minify?: boolean;
    sourceMap?: boolean;
    includeDependencies?: boolean;
    target?: 'modern' | 'legacy';
    customProperties?: boolean;
}

export interface StyleProcessingResult {
    css: string;
    variables: CSSVariableMappings;
    classNames: string[];
    dependencies: Set<string>;
    sourceMap?: string;
    stats?: {
        selectors: number;
        declarations: number;
        size: number;
        duration: number;
    };
}

/**
 * Style Management Types
 * @description Types for style management and utilities
 */
export interface StyleManager {
    add: (styles: RawStyles, options?: StyleGenerationOptions) => string[];
    remove: (classNames: string[]) => void;
    getStyles: () => StyleProcessingResult;
    clear: () => void;
    configure: (config: Partial<StyleManagerConfig>) => void;
}

export interface StyleManagerConfig {
    prefix?: string;
    scope?: string;
    transforms?: StyleTransform[];
    generateSourceMaps?: boolean;
    development?: boolean;
}

export interface StyleTransform {
    property?: (name: string) => string;
    value?: (value: string, property: string) => string;
    selector?: (selector: string) => string;
}

/**
 * Style Compilation Types
 * @description Types for style compilation and optimization
 */
export interface StyleCompilationOptions extends StyleGenerationOptions {
    optimize?: boolean;
    autoprefixer?: boolean;
    modules?: boolean;
    extract?: boolean;
    extractFilename?: string;
}

export interface StyleCompilationResult extends StyleProcessingResult {
    warnings?: string[];
    errors?: string[];
    assets?: {
        [filename: string]: {
            source: string;
            size: number;
        };
    };
}

/**
 * Utility Types
 * @description Helper types and interfaces
 */
export interface RawStyles {
    [key: string]: string | RawStyles;
}

export interface StyleUtils {
    merge: (...styles: RawStyles[]) => RawStyles;
    toCss: (styles: RawStyles, options?: StyleGenerationOptions) => string;
    generateClassNames: (styles: RawStyles, prefix?: string) => string[];
    process: (styles: RawStyles, options?: StyleGenerationOptions) => StyleProcessingResult;
}

/**
 * Computed Styles Interface
 * @description Combined interface for all style states
 */
export interface ComputedStyles {
    base: BaseStyles;
    hover: HoverStyles;
    focus: FocusStyles;
    active: ActiveStyles;
    disabled: DisabledStyles;
    semantic: SemanticStyleMap;
    interactive: InteractiveStyles;
}

/**
 * Style Manager Factory
 * @description Creates a new style manager instance
 */
export const createStyleManager = (
    config?: StyleManagerConfig
): StyleManager => {
    // Implementation would go here
    return {} as StyleManager;
};
