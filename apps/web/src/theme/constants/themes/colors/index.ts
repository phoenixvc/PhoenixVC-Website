import { ColorDefinition, ColorShades, ShadeLevel } from "@/theme/types/index.ts";
import ColorUtils from "@/theme/utils/color-utils.ts";

// Helper function to create a color definition
export const createColor = (hex: string): ColorDefinition => {
  return ColorUtils.createColorDefinition(hex);
};

// Base semantic colors
export const semanticColors = {
  success: "#10B981", // Green
  warning: "#F59E0B", // Amber
  error: "#EF4444",   // Red
  info: "#3B82F6",    // Blue
};

// Helper function to create a color palette with 10 shades
export const createColorPalette = (baseHex: string): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(baseHex, 10);

  return {
    50: palette[0],
    100: palette[1],
    200: palette[2],
    300: palette[3],
    400: palette[4],
    500: palette[5],
    600: palette[6],
    700: palette[7],
    800: palette[8],
    900: palette[9],
  };
};

// Helper function to create a complete ColorShades object
export const createColorShades = (
  baseHex: string,
  contrastColors: string[] = Array(10).fill("#FFFFFF")
): ColorShades => {
  return {
    ...createColorPalette(baseHex),
    base: baseHex,
    contrast: contrastColors,
  };
};

// Export individual color palettes
export { bluePalette, getBlueShade, createBlueVariant } from "./blue.ts";
export { grayPalette, getGrayShade, createGrayVariant } from "./gray.ts";
export { redPalette, getRedShade, createRedVariant } from "./red.ts";
export { greenPalette, getGreenShade, createGreenVariant } from "./green.ts";
export { purplePalette, getPurpleShade, createPurpleVariant } from "./purple.ts";
