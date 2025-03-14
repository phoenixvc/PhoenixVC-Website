import { ColorAdjustments, ColorDefinition, ColorShades, ShadeLevel } from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";


// Base red color
const BASE_RED = "#EF4444";

// Generate the red palette using perceptual adjustments
const generateRedPalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_RED, 10);

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

// Create the red color shades
export const redPalette: ColorShades = {
  ...generateRedPalette(),
  base: BASE_RED,
  contrast: ["#000000", "#000000", "#000000", "#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
};

// Export a function to get a specific red shade
export const getRedShade = (shade: ShadeLevel): ColorDefinition => {
  return redPalette[shade];
};

// Export a function to create a red with custom adjustments
export const createRedVariant = (adjustments: ColorAdjustments): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_RED);
  return ColorUtils.adjustColor(baseColor, adjustments);
};
