/**
 * Core Color Types and Structures
 */
export interface ColorDefinition {
  hex: string;
  rgb: string;
  hsl: string;
  alpha?: number;
  cssVariable?: string;  // Added to track CSS variables
  isPlaceholder?: boolean; // Added to track problematic conversions
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}


export interface ColorAdjustments {
  hue?: number;
  saturation?: number;
  lightness?: number;
  alpha?: number;
}

export type ColorSet = ColorDefinition;

/**
 * Color Shade Structures
 */
export type ShadeLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type ColorShades = Record<ShadeLevel, ColorDefinition>;

export interface TransformedColorObject extends ColorShades {
  base?: string; // Optional base color
  contrast?: string[]; // Contrast colors
  shades?: string[];
}

/**
 * Base Color Structures - Initial (for constants)
 */
export interface InitialBaseColors {
  primary: ColorDefinition;
  secondary: ColorDefinition;
  accent: ColorDefinition;
}

/**
 * Base Color Structures - Processed (after shade generation)
 */
export type ProcessedBaseColors = {
  primary: ColorShades;
  secondary: ColorShades;
  accent: ColorShades;
  tertiary?: ColorShades;
  neutral?: ColorShades;
  gray?: ColorShades;
  surface?: ColorShades;
};

/**
 * Mode-specific Color Structures
 */
export interface RequiredModeColors {
  background: ColorDefinition;
  text: ColorDefinition;
  muted: ColorDefinition;
  border: ColorDefinition;
}

export interface OptionalModeColors {
  surface?: ColorDefinition;
  overlay?: ColorDefinition;
  hover?: ColorDefinition;
  active?: ColorDefinition;
  focus?: ColorDefinition;
  disabled?: ColorDefinition;
}

export interface ModeColors extends RequiredModeColors, OptionalModeColors {}

/**
 * Semantic Color Structures
 */
export interface RequiredSemanticColors {
  success: ColorDefinition;
  warning: ColorDefinition;
  error: ColorDefinition;
  info: ColorDefinition;
}

export interface OptionalSemanticColors {
  neutral?: ColorDefinition;
  hint?: ColorDefinition;
}

export interface SemanticColors extends RequiredSemanticColors, OptionalSemanticColors {}

/**
 * Theme Configuration and Structures
 */
export interface ThemeSchemeInitial {
  base: InitialBaseColors;
  light: ModeColors;
  dark: ModeColors;
}

export interface ThemeScheme {
  base: ProcessedBaseColors;
  light: ModeColors;
  dark: ModeColors;
}

export interface ThemeColors {
  schemes: Record<string, ThemeScheme>;
  semantic?: SemanticColors;
}

export interface ColorConfig {
  mode: "light" | "dark";
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
  mode?: "rgb" | "hsl" | "lab";
  distribution?: "linear" | "exponential";
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
 * Shadow Definitions
 */
export interface ShadowProperties {
  color: ColorDefinition;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  inset?: boolean;
}

export interface ComplexShadow {
  primary: ShadowProperties;
  secondary?: ShadowProperties;
  tertiary?: ShadowProperties;
}

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

/**
 * Utility Types
 */
export type GradientType = "linear" | "radial" | "conic";
export type ColorExportFormat = "css" | "scss" | "less" | "json" | "ts";

/**
 * Validation Types and Constants
 */
export type InitialBaseColorKeys = keyof InitialBaseColors;
export type RequiredModeColorKeys = keyof RequiredModeColors;
export type RequiredSemanticColorKeys = keyof RequiredSemanticColors;

export const REQUIRED_INITIAL_COLORS: ReadonlyArray<InitialBaseColorKeys> = [
  "primary",
  "secondary",
  "accent"
] as const;

export const REQUIRED_MODE_COLORS: ReadonlyArray<RequiredModeColorKeys> = [
  "background",
  "text",
  "muted",
  "border"
] as const;

export const REQUIRED_SEMANTIC_COLORS: ReadonlyArray<RequiredSemanticColorKeys> = [
  "success",
  "warning",
  "error",
  "info"
] as const;
