import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base indigo color
const BASE_INDIGO = "#6366F1";

// Generate the indigo palette using perceptual adjustments
const generateIndigoPalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_INDIGO, 10);

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

// Create the indigo color shades
export const indigoPalette: ColorShades = {
  ...generateIndigoPalette(),
  base: BASE_INDIGO,
  contrast: [
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
  ],
};

// Export a function to get a specific indigo shade
export const getIndigoShade = (shade: ShadeLevel): ColorDefinition => {
  return indigoPalette[shade];
};

// Export a function to create an indigo with custom adjustments
export const createIndigoVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_INDIGO);
  return ColorUtils.adjustColor(baseColor, adjustments);
};

export default indigoPalette;
