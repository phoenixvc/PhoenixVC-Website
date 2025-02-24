import {
  ColorDefinition,
  ColorAdjustments,
  HSLColor,
  ColorPaletteConfig,
  ColorShades,
  ShadeLevel
} from "../types";

/**
 * Custom error for color operations.
 */
export class ColorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ColorError";
  }
}

/**
 * Consolidated color utilities.
 */
export const ColorUtils = {
  /**
   * Parse an HSL(A) string into an HSLColor object.
   */
  parseHSL: (color: string): HSLColor => {
    const match = color.match(/hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)/);
    if (!match) {
      throw new ColorError(`Invalid HSL(A) color format: ${color}`);
    }
    return {
      h: Math.min(360, Math.max(0, parseInt(match[1], 10))),
      s: Math.min(100, Math.max(0, parseFloat(match[2]))),
      l: Math.min(100, Math.max(0, parseFloat(match[3]))),
    };
  },

  /**
   * Convert an HSLColor object to an HSL/HSLA string.
   */
  toHSL: (color: HSLColor, alpha?: number): string => {
    const { h, s, l } = color;
    return alpha !== undefined
      ? `hsla(${h}, ${s}%, ${l}%, ${alpha})`
      : `hsl(${h}, ${s}%, ${l}%)`;
  },

  /**
   * Convert a hex color to an RGB string.
   */
  hexToRgb: (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new ColorError(`Invalid hex color format: ${hex}`);
    }
    const [, r, g, b] = result;
    return `${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)}`;
  },

  /**
   * Convert a hex color to an HSL string.
   * (Placeholder: Replace with a proper conversion as needed)
   */
  hexToHsl: (_hex: string): string => {
    // TODO: Implement a proper hex to HSL conversion.
    return "0,0%,0%";
  },

  /**
   * Create a ColorDefinition from a hex value.
   */
  createColorDefinition: (hex: string): ColorDefinition => {
    return {
      hex,
      rgb: ColorUtils.hexToRgb(hex),
      hsl: ColorUtils.hexToHsl(hex),
    };
  },

  /**
   * Adjust a color by modifying its HSL values.
   */
  adjustColor: (color: ColorDefinition, adjustments: ColorAdjustments): ColorDefinition => {
    try {
      const parsed = ColorUtils.parseHSL(color.hsl);
      const newHSL: HSLColor = {
        h: (parsed.h + (adjustments.hue ?? 0)) % 360,
        s: Math.max(0, Math.min(100, parsed.s + (adjustments.saturation ?? 0))),
        l: Math.max(0, Math.min(100, parsed.l + (adjustments.lightness ?? 0))),
      };
      const newHSLString = ColorUtils.toHSL(newHSL, adjustments.alpha);
      return {
        hex: ColorUtils.hslToHex(newHSLString),
        rgb: ColorUtils.hslToRGB(newHSLString),
        hsl: newHSLString,
        alpha: adjustments.alpha ?? color.alpha,
      };
    } catch (error) {
      throw new ColorError(`Failed to adjust color: ${error instanceof Error ? error.message : error}`);
    }
  },

  /**
   * Mix two colors given in HSL string format.
   */
  mix: (color1: string, color2: string, weight: number = 0.5): string => {
    try {
      const c1 = ColorUtils.parseHSL(color1);
      const c2 = ColorUtils.parseHSL(color2);
      const mixed: HSLColor = {
        h: Math.round(c1.h * (1 - weight) + c2.h * weight),
        s: Math.round(c1.s * (1 - weight) + c2.s * weight),
        l: Math.round(c1.l * (1 - weight) + c2.l * weight),
      };
      return ColorUtils.toHSL(mixed);
    } catch (error) {
      throw new ColorError(`Failed to mix colors: ${error instanceof Error ? error.message : error}`);
    }
  },

  /**
   * Generate a simple color palette from a base HSL color string.
   */
  createPalette: (baseColor: string, steps: number = 9): string[] => {
    try {
      const base = ColorUtils.parseHSL(baseColor);
      return Array.from({ length: steps }, (_, i) => {
        const lightness = (100 / (steps - 1)) * i;
        return ColorUtils.toHSL({ ...base, l: lightness });
      });
    } catch (error) {
      throw new ColorError(`Failed to create palette: ${error instanceof Error ? error.message : error}`);
    }
  },

  // Additional utility functions as defined in ColorUtilities.
  darken: (color: ColorDefinition, amount: number): ColorDefinition => {
    return ColorUtils.adjustColor(color, { lightness: -amount });
  },

  lighten: (color: ColorDefinition, amount: number): ColorDefinition => {
    return ColorUtils.adjustColor(color, { lightness: amount });
  },

  getContrastRatio: (_background: ColorDefinition, _foreground: ColorDefinition): number => {
    // TODO: Implement a proper contrast ratio calculation.
    return 1;
  },

  // Functions from ColorSchemeGenerator
  fromBase: (baseColor: ColorDefinition): ColorShades => {
    // Generate a palette of 10 steps and assign them to standard shade levels.
    const palette = ColorUtils.createPalette(baseColor.hsl, 10);
    const levels: ShadeLevel[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const shades: Partial<ColorShades> = {};
    levels.forEach((level, i) => {
      shades[level] = {
        hex: baseColor.hex, // Placeholder – in a real implementation, convert the HSL to a hex value.
        rgb: baseColor.rgb,
        hsl: palette[i] || baseColor.hsl,
      };
    });
    return shades as ColorShades;
  },

  generatePalette: (config: ColorPaletteConfig): any => {
    return ColorUtils.createPalette(config.baseColor, config.shades || 9);
  },

  // Conversion utilities (placeholders)
  hslToHex: (_hsl: string): string => {
    // TODO: Implement HSL to hex conversion.
    return "#000000";
  },

  hslToRGB: (_hsl: string): string => {
    // TODO: Implement HSL to RGB conversion.
    return "0,0,0";
  }
};

export default ColorUtils;
