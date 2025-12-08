// colorUtils.ts - Consolidated color manipulation utilities
// Eliminates duplicate hexToRgb, lightenColor, getSecondaryColor across 7+ files

import { RENDERING_COLORS } from "./renderingConfig";

/**
 * RGB color object
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * RGBA color object
 */
export interface RGBA extends RGB {
  a: number;
}

/**
 * HSL color object
 */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Pre-computed color cache to avoid repeated parsing
 */
const colorCache = new Map<string, RGB>();

/**
 * Parse a hex color string to RGB values
 * Cached for performance in animation loops
 *
 * @param hex - Hex color string (with or without #)
 * @returns RGB object or null if invalid
 */
export function hexToRgb(hex: string): RGB | null {
  if (!hex || typeof hex !== "string") {
    return null;
  }

  // Check cache first
  const cached = colorCache.get(hex);
  if (cached) {
    return cached;
  }

  // Clean the hex string
  let cleanHex = hex.replace(/^#/, "").trim();

  // Handle 3-digit shorthand hex (e.g., "fff" -> "ffffff")
  if (/^[a-fA-F0-9]{3}$/.test(cleanHex)) {
    cleanHex =
      cleanHex[0] +
      cleanHex[0] +
      cleanHex[1] +
      cleanHex[1] +
      cleanHex[2] +
      cleanHex[2];
  }

  // Validate 6-digit hex
  if (!/^[a-fA-F0-9]{6}$/.test(cleanHex)) {
    return null;
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  if (!result) {
    return null;
  }

  const rgb: RGB = {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };

  // Cache for future use
  colorCache.set(hex, rgb);

  return rgb;
}

/**
 * Parse hex to RGB with fallback default
 * Safe version that always returns a valid RGB
 *
 * @param hex - Hex color string
 * @param fallback - Default RGB if parsing fails
 */
export function hexToRgbSafe(
  hex: string,
  fallback: RGB = RENDERING_COLORS.defaults.sunColor,
): RGB {
  return hexToRgb(hex) ?? fallback;
}

/**
 * Convert RGB to a CSS-ready string "r, g, b"
 */
export function rgbToString(rgb: RGB): string {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string =>
    Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Create a lighter version of a color
 *
 * @param hex - Hex color string
 * @param amount - Amount to lighten (0-1, where 1 is white)
 * @returns Lightened color as "rgb(r, g, b)" string
 */
export function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(255, rgb.r + (255 - rgb.r) * amount);
  const g = Math.min(255, rgb.g + (255 - rgb.g) * amount);
  const b = Math.min(255, rgb.b + (255 - rgb.b) * amount);

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Create a darker version of a color
 *
 * @param hex - Hex color string
 * @param amount - Amount to darken (0-1, where 1 is black)
 * @returns Darkened color as "rgb(r, g, b)" string
 */
export function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, rgb.r * (1 - amount));
  const g = Math.max(0, rgb.g * (1 - amount));
  const b = Math.max(0, rgb.b * (1 - amount));

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Lighten an RGB object directly (faster - no parsing)
 */
export function lightenRgb(rgb: RGB, amount: number): RGB {
  return {
    r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
    g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
    b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount)),
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Create a complementary/secondary color by shifting hue
 * Used for sun rendering color variations
 *
 * @param hex - Hex color string
 * @param hueShift - Amount to shift hue (0-1, default 0.11 for analogous)
 * @returns Secondary color as "rgb(r, g, b)" string
 */
export function getSecondaryColor(
  hex: string,
  hueShift: number = 0.11,
): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + hueShift) % 1;

  const newRgb = hslToRgb(hsl);
  return `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`;
}

/**
 * Create a secondary color from RGB by shifting hue
 * Used for star trails and satellite rendering
 *
 * @param rgb - RGB color object
 * @param hueShift - Amount to shift hue (0-1, default 0.11 for analogous)
 * @returns Secondary color as RGB object
 */
export function getSecondaryColorRgb(rgb: RGB, hueShift: number = 0.11): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + hueShift) % 1;
  return hslToRgb(hsl);
}

/**
 * Fast secondary color calculation (cheaper than HSL conversion)
 * Used in hot paths where full HSL conversion is too expensive
 *
 * @param rgb - RGB color object
 * @returns RGB string for gradient stops
 */
export function getSecondaryColorFast(rgb: RGB): string {
  // Shift towards warmer tones by boosting red/green slightly
  return `${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 20)}, ${rgb.b}`;
}

/**
 * Create RGBA string from RGB and alpha
 */
export function rgba(rgb: RGB | string, alpha: number): string {
  if (typeof rgb === "string") {
    return `rgba(${rgb}, ${alpha})`;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Parse an RGBA color string
 */
export function parseRgba(color: string): RGBA | null {
  const rgbaMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  return null;
}

/**
 * Interpolate between two colors
 *
 * @param color1 - Start color (RGB)
 * @param color2 - End color (RGB)
 * @param t - Interpolation factor (0-1)
 */
export function interpolateColor(color1: RGB, color2: RGB, t: number): RGB {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * t),
    g: Math.round(color1.g + (color2.g - color1.g) * t),
    b: Math.round(color1.b + (color2.b - color1.b) * t),
  };
}

/**
 * Create a softened/pastel version of a color
 * Used for gentler star rendering, reducing harsh contrast
 *
 * @param baseRgb - Base RGB color to soften
 * @param factor - Softening factor (0-1, default 0.85)
 * @param brightness - Base brightness to add (0-255, default 38)
 * @returns Softened RGB color
 */
export function createSoftenedColor(
  baseRgb: RGB,
  factor: number = 0.85,
  brightness: number = 38,
): RGB {
  return {
    r: Math.round(baseRgb.r * factor + brightness),
    g: Math.round(baseRgb.g * factor + brightness),
    b: Math.round(baseRgb.b * factor + brightness),
  };
}

/**
 * Clear the color cache (call on component unmount to free memory)
 */
export function clearColorCache(): void {
  colorCache.clear();
}

/**
 * Get cache size for debugging
 */
export function getColorCacheSize(): number {
  return colorCache.size;
}
