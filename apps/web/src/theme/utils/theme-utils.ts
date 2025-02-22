// theme-utils.ts
import { THEME_CONSTANTS } from '../constants/theme-constants';
import type { ColorScheme, Mode, ThemeVariables } from '../types/theme.types';

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface ColorAdjustments {
  lightness?: number;
  saturation?: number;
  hue?: number;
  alpha?: number;
}

class ColorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ColorError';
  }
}

/**
 * Color manipulation utilities
 */
export const ColorUtils = {
  /**
   * Parse HSL color string into components
   * @throws {ColorError} If color string is invalid
   */
  parseHSL: (color: string): HSLColor => {
    const match = color.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?(?:,\s*([\d.]+))?\)/);
    
    if (!match) {
      throw new ColorError(`Invalid HSL(A) color format: ${color}`);
    }

    return {
      h: Math.min(360, Math.max(0, parseInt(match[1], 10))),
      s: Math.min(100, Math.max(0, parseInt(match[2], 10))),
      l: Math.min(100, Math.max(0, parseInt(match[3], 10)))
    };
  },

  /**
   * Convert HSL components to color string
   */
  toHSL: (color: HSLColor, alpha?: number): string => {
    const { h, s, l } = color;
    return alpha !== undefined
      ? `hsla(${h}, ${s}%, ${l}%, ${alpha})`
      : `hsl(${h}, ${s}%, ${l}%)`;
  },

  /**
   * Adjust color properties
   * @throws {ColorError} If color manipulation fails
   */
  adjustColor: (color: string, adjustments: ColorAdjustments): string => {
    try {
      const parsed = ColorUtils.parseHSL(color);
      
      const newColor: HSLColor = {
        h: (parsed.h + (adjustments.hue || 0)) % 360,
        s: Math.max(0, Math.min(100, parsed.s + (adjustments.saturation || 0))),
        l: Math.max(0, Math.min(100, parsed.l + (adjustments.lightness || 0)))
      };

      return ColorUtils.toHSL(newColor, adjustments.alpha);
    } catch (error) {
      if (error instanceof ColorError) {
        throw error;
      }
      throw new ColorError(`Failed to adjust color: ${color}`);
    }
  },

  /**
   * Mix two colors with a specified weight
   */
  mix: (color1: string, color2: string, weight: number = 0.5): string => {
    try {
      const c1 = ColorUtils.parseHSL(color1);
      const c2 = ColorUtils.parseHSL(color2);

      return ColorUtils.toHSL({
        h: Math.round(c1.h * (1 - weight) + c2.h * weight),
        s: Math.round(c1.s * (1 - weight) + c2.s * weight),
        l: Math.round(c1.l * (1 - weight) + c2.l * weight)
      });
    } catch (error) {
      throw new ColorError(`Failed to mix colors: ${color1} and ${color2}`);
    }
  },

  /**
   * Create a color palette from a base color
   */
  createPalette: (baseColor: string, steps: number = 9): string[] => {
    try {
      const base = ColorUtils.parseHSL(baseColor);
      const palette: string[] = [];

      for (let i = 0; i < steps; i++) {
        const lightness = (100 / (steps - 1)) * i;
        palette.push(ColorUtils.toHSL({ ...base, l: lightness }));
      }

      return palette;
    } catch (error) {
      throw new ColorError(`Failed to create palette from: ${baseColor}`);
    }
  }
};

/**
 * Generate theme variables based on color scheme and mode
 * @throws {Error} If color scheme or mode is invalid
 */
export const getThemeVariables = (
  colorScheme: ColorScheme,
  mode: Mode
): ThemeVariables => {
  try {
    const { COLORS } = THEME_CONSTANTS;
    
    // Type assertion to help TypeScript understand the structure
    const colors = COLORS as ThemeColors;
    
    if (!colors[colorScheme]) {
      throw new Error(`Invalid color scheme: ${colorScheme}`);
    }

    const baseColors = colors[colorScheme];
    const modeColors = baseColors[mode];

    if (!modeColors) {
      throw new Error(`Invalid mode: ${mode}`);
    }

    const mappings: ColorMappings = {
      // Base Colors
      'primary': baseColors.primary,
      'primary-hover': ColorUtils.adjustColor(baseColors.primary, {
        lightness: mode === 'dark' ? 5 : -5,
        saturation: mode === 'dark' ? 10 : -10
      }),
      'primary-active': ColorUtils.adjustColor(baseColors.primary, {
        lightness: mode === 'dark' ? -5 : 5,
        saturation: mode === 'dark' ? -10 : 10
      }),
      'primary-focus': ColorUtils.adjustColor(baseColors.primary, { alpha: 0.25 }),
    
      // Secondary Colors
      'secondary': baseColors.secondary,
      'secondary-hover': ColorUtils.adjustColor(baseColors.secondary, {
        lightness: mode === 'dark' ? 5 : -5,
        saturation: mode === 'dark' ? 10 : -10
      }),
      'secondary-active': ColorUtils.adjustColor(baseColors.secondary, {
        lightness: mode === 'dark' ? -5 : 5,
        saturation: mode === 'dark' ? -10 : 10
      }),
      'secondary-focus': ColorUtils.adjustColor(baseColors.secondary, { alpha: 0.25 }),
    
      // Accent Colors
      'accent': baseColors.accent,
      'accent-hover': ColorUtils.adjustColor(baseColors.accent, {
        lightness: mode === 'dark' ? 5 : -5,
        saturation: mode === 'dark' ? 10 : -10
      }),
      'accent-active': ColorUtils.adjustColor(baseColors.accent, {
        lightness: mode === 'dark' ? -5 : 5,
        saturation: mode === 'dark' ? -10 : 10
      }),
      'accent-focus': ColorUtils.adjustColor(baseColors.accent, { alpha: 0.25 }),
    
      // Background Colors
      'background': modeColors.background,
      'background-hover': ColorUtils.adjustColor(modeColors.background, {
        lightness: mode === 'dark' ? 5 : -5
      }),
      'background-active': ColorUtils.adjustColor(modeColors.background, {
        lightness: mode === 'dark' ? -5 : 5
      }),
    
      // Surface Colors
      'surface': ColorUtils.adjustColor(modeColors.background, {
        lightness: mode === 'dark' ? 5 : -5
      }),
      'surface-hover': ColorUtils.adjustColor(modeColors.background, {
        lightness: mode === 'dark' ? 10 : -10
      }),
      'surface-active': ColorUtils.adjustColor(modeColors.background, {
        lightness: mode === 'dark' ? 15 : -15
      }),
    
      // Text Colors
      'text': modeColors.text,
      'text-muted': modeColors.muted,
      'text-disabled': ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
      'text-inverse': mode === 'dark' ? colors[colorScheme].light.text : colors[colorScheme].dark.text,
    
      // Border Colors
      'border': modeColors.border,
      'border-hover': ColorUtils.adjustColor(modeColors.border, {
        lightness: mode === 'dark' ? 10 : -10
      }),
      'border-focus': ColorUtils.adjustColor(baseColors.accent, { alpha: 0.5 }),
    
      // Semantic Colors
      'success': colors.semantic.success,
      'success-light': ColorUtils.adjustColor(colors.semantic.success, {
        lightness: 90,
        saturation: mode === 'dark' ? -30 : -20
      }),
      'success-dark': ColorUtils.adjustColor(colors.semantic.success, {
        lightness: -20,
        saturation: mode === 'dark' ? -10 : 10
      }),
    
      'warning': colors.semantic.warning,
      'warning-light': ColorUtils.adjustColor(colors.semantic.warning, {
        lightness: 90,
        saturation: mode === 'dark' ? -30 : -20
      }),
      'warning-dark': ColorUtils.adjustColor(colors.semantic.warning, {
        lightness: -20,
        saturation: mode === 'dark' ? -10 : 10
      }),
    
      'error': colors.semantic.error,
      'error-light': ColorUtils.adjustColor(colors.semantic.error, {
        lightness: 90,
        saturation: mode === 'dark' ? -30 : -20
      }),
      'error-dark': ColorUtils.adjustColor(colors.semantic.error, {
        lightness: -20,
        saturation: mode === 'dark' ? -10 : 10
      }),
    
      'info': colors.semantic.info,
      'info-light': ColorUtils.adjustColor(colors.semantic.info, {
        lightness: 90,
        saturation: mode === 'dark' ? -30 : -20
      }),
      'info-dark': ColorUtils.adjustColor(colors.semantic.info, {
        lightness: -20,
        saturation: mode === 'dark' ? -10 : 10
      }),
    
      // Interactive States
      'focus-ring': ColorUtils.adjustColor(baseColors.accent, { alpha: 0.25 }),
      'overlay': ColorUtils.adjustColor(modeColors.background, { alpha: 0.8 }),
      'shadow': ColorUtils.adjustColor(modeColors.text, { alpha: 0.1 }),
      'shadow-hover': ColorUtils.adjustColor(modeColors.text, { alpha: 0.15 }),
    
      // Disabled States
      'disabled-background': ColorUtils.adjustColor(modeColors.muted, {
        alpha: 0.1,
        saturation: -20
      }),
      'disabled-text': ColorUtils.adjustColor(modeColors.muted, {
        alpha: 0.5,
        saturation: -20
      }),
      'disabled-border': ColorUtils.adjustColor(modeColors.border, {
        alpha: 0.5,
        saturation: -20
      }),
    
      // Special States
      'selection-background': ColorUtils.adjustColor(baseColors.primary, { alpha: 0.2 }),
      'highlight-background': ColorUtils.adjustColor(colors.semantic.warning, { alpha: 0.2 })
    };

    return mappings;
  } catch (error) {
    console.error('[ThemeProvider] Failed to generate theme variables:', error);
    throw error;
  }
};

export type { HSLColor, ColorAdjustments };
