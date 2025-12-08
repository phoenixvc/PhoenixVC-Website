import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base yellow color
const BASE_YELLOW = "#EAB308";

// Generate the yellow palette using perceptual adjustments
const generateYellowPalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_YELLOW, 10);

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

// Create the yellow color shades
export const yellowPalette: ColorShades = {
  ...generateYellowPalette(),
  base: BASE_YELLOW,
  contrast: [
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
  ],
};

// Export a function to get a specific yellow shade
export const getYellowShade = (shade: ShadeLevel): ColorDefinition => {
  return yellowPalette[shade];
};

// Export a function to create a yellow with custom adjustments
export const createYellowVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_YELLOW);
  return ColorUtils.adjustColor(baseColor, adjustments);
};

export default yellowPalette;
