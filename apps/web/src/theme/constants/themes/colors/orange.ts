import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base orange color
const BASE_ORANGE = "#F97316";

// Generate the orange palette using perceptual adjustments
const generateOrangePalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_ORANGE, 10);

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

// Create the orange color shades
export const orangePalette: ColorShades = {
  ...generateOrangePalette(),
  base: BASE_ORANGE,
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

// Export a function to get a specific orange shade
export const getOrangeShade = (shade: ShadeLevel): ColorDefinition => {
  return orangePalette[shade];
};

// Export a function to create an orange with custom adjustments
export const createOrangeVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_ORANGE);
  return ColorUtils.adjustColor(baseColor, adjustments);
};

export default orangePalette;
