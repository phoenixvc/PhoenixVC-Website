
/**
 * Base mapping configuration
 */
export interface BaseMappingConfig {
  prefix: string;
  scope: string;
  format: "rgb" | "hsl" | "hex";
  separator: string;
}

/**
 * Configuration options for the Color Mapping system.
 */
export interface ColorMappingConfig {
  /**
   * A prefix to use when generating CSS variable names.
   * @default "color"
   */
  prefix: string;

  /**
   * The CSS scope (selector) where the variables will be applied.
   * @default ":root"
   */
  scope: string;

  /**
   * The format in which colors will be output.
   * Supported values: "rgb", "hsl", "hex".
   * @default "rgb"
   */
  format: "rgb" | "hsl" | "hex";

  /**
   * The separator to use between the prefix and the variable name.
   * @default "-"
   */
  separator: string;

  /**
   * Whether to enforce a minimum contrast ratio for color adjustments.
   * @default true
   */
  enforceContrast: boolean;

  /**
   * The minimum contrast ratio required if enforceContrast is true.
   * @default 4.5
   */
  minimumContrast: number;
}

/**
 * Base mapping generator options.
 */
export interface BaseMappingGeneratorOptions {
  prefix?: string;
  scope?: string;
  format?: "rgb" | "hsl" | "hex";
  separator?: string;
  transforms?: Record<string, (value: string) => string>;
}
