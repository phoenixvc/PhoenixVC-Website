// src/types/theme/utils.ts
import type { ThemeMode } from "../core/base";
import type { ThemeConfig } from "../core/config";

/**
 * Makes all properties in T optional recursively
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Represents a value that can be either static or dynamic based on theme mode
 * @template T The type of the value
 */
export type ThemeValue<T> = T | ((mode: ThemeMode) => T);

/**
 * Color manipulation functions interface
 * Each function takes a color string and returns a modified color
 */
export interface ColorTransforms {
  /**
   * Lightens a color by a specified amount
   * @param color - The color to lighten (hex, rgb, hsl)
   * @param amount - Amount to lighten by (0-1)
   */
  lighten: (color: string, amount: number) => string;

  /**
   * Darkens a color by a specified amount
   * @param color - The color to darken (hex, rgb, hsl)
   * @param amount - Amount to darken by (0-1)
   */
  darken: (color: string, amount: number) => string;

  /**
   * Adjusts the alpha channel of a color
   * @param color - The color to adjust (hex, rgb, hsl)
   * @param amount - Alpha value (0-1)
   */
  alpha: (color: string, amount: number) => string;

  /**
   * Mixes two colors together
   * @param color1 - First color
   * @param color2 - Second color
   * @param weight - Mix weight (0-1), defaults to 0.5
   */
  mix: (color1: string, color2: string, weight?: number) => string;

  /**
   * Increases color saturation
   * @param color - The color to saturate
   * @param amount - Amount to increase saturation by (0-1)
   */
  saturate: (color: string, amount: number) => string;

  /**
   * Decreases color saturation
   * @param color - The color to desaturate
   * @param amount - Amount to decrease saturation by (0-1)
   */
  desaturate: (color: string, amount: number) => string;

  /**
   * Mixes color with white
   * @param color - The color to tint
   * @param amount - Amount of white to mix (0-1)
   */
  tint: (color: string, amount: number) => string;

  /**
   * Mixes color with black
   * @param color - The color to shade
   * @param amount - Amount of black to mix (0-1)
   */
  shade: (color: string, amount: number) => string;

  /**
   * Inverts a color
   * @param color - The color to invert
   */
  invert: (color: string) => string;

  /**
   * Gets the complementary color
   * @param color - The color to get complement of
   */
  complement: (color: string) => string;
}

/**
 * Type guard for ThemeValue
 */
export const isThemeValue = <T>(value: unknown): value is ThemeValue<T> => {
  return typeof value === "function" || value !== undefined;
};

/**
 * Helper to resolve a ThemeValue
 */
export const resolveThemeValue = <T>(
  value: ThemeValue<T>,
  mode: ThemeMode,
): T => {
  return typeof value === "function"
    ? (value as (mode: ThemeMode) => T)(mode)
    : value;
};

/**
 * Type for theme value resolution context
 */
export interface ThemeValueContext {
  mode: ThemeMode;
  config: ThemeConfig;
}

/**
 * Helper to create a theme value
 */
export const createThemeValue = <T>(
  value: T | ((ctx: ThemeValueContext) => T),
): ThemeValue<T> => {
  if (typeof value === "function") {
    return (mode: ThemeMode) => (value as Function)({ mode });
  }
  return value;
};
