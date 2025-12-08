import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base teal color
const BASE_TEAL = "#14B8A6";

// Generate the teal palette using perceptual adjustments
const generateTealPalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_TEAL, 10);

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

// Create the teal color shades
export const tealPalette: ColorShades = {
  ...generateTealPalette(),
  base: BASE_TEAL,
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

// Export a function to get a specific teal shade
export const getTealShade = (shade: ShadeLevel): ColorDefinition => {
  return tealPalette[shade];
};

// Export a function to create a teal with custom adjustments
export const createTealVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_TEAL);
  return ColorUtils.adjustColor(baseColor, adjustments);
};

export default tealPalette;
