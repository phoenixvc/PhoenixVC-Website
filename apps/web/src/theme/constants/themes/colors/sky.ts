import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base sky blue color
const BASE_SKY = "#0EA5E9";

// Generate the sky palette using perceptual adjustments
const generateSkyPalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_SKY, 10);

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

// Create the sky color shades
export const skyPalette: ColorShades = {
  ...generateSkyPalette(),
  base: BASE_SKY,
  contrast: [
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
  ],
};

// Export a function to get a specific sky shade
export const getSkyShade = (shade: ShadeLevel): ColorDefinition => {
  return skyPalette[shade];
};

// Export a function to create a sky blue with custom adjustments
export const createSkyVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_SKY);
  return ColorUtils.adjustColor(baseColor, adjustments);
};

export default skyPalette;
