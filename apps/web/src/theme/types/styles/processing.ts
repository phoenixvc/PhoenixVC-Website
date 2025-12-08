// /theme/types/styles/processing.ts

import { CSSVariableMappings } from "../core/variables";

/**
 * Utility Types
 */
export interface RawStyles {
  [key: string]: string | RawStyles;
}

/**
 * Options for generating styles.
 */
export interface StyleGenerationOptions {
  prefix?: string;
  scope?: string;
  important?: boolean;
  format?: "css" | "json" | "object" | "module";
  minify?: boolean;
  sourceMap?: boolean;
  includeDependencies?: boolean;
  target?: "modern" | "legacy";
  customProperties?: boolean;
}

/**
 * Result of style processing operations.
 */
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
 * Style Manager Configuration and API.
 */
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

export interface StyleManager {
  add: (styles: RawStyles, options?: StyleGenerationOptions) => string[];
  remove: (classNames: string[]) => void;
  getStyles: () => StyleProcessingResult;
  clear: () => void;
  configure: (config: Partial<StyleManagerConfig>) => void;
}

/**
 * Options and results for style compilation.
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
 * Utility functions for style handling.
 */
export interface StyleUtils {
  merge: (...styles: RawStyles[]) => RawStyles;
  toCss: (styles: RawStyles, options?: StyleGenerationOptions) => string;
  generateClassNames: (styles: RawStyles, prefix?: string) => string[];
  process: (
    styles: RawStyles,
    options?: StyleGenerationOptions,
  ) => StyleProcessingResult;
}
