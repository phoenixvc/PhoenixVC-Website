import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base blue color
const BASE_BLUE = "#2563EB";

// Generate the blue palette using perceptual adjustments
const generateBluePalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_BLUE, 10);

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

// Create the blue color shades
export const bluePalette: ColorShades = {
  ...generateBluePalette(),
  base: BASE_BLUE,
  contrast: [
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
  ],
};

// Export a function to get a specific blue shade
export const getBlueShade = (shade: ShadeLevel): ColorDefinition => {
  return bluePalette[shade];
};

// Export a function to create a blue with custom adjustments
export const createBlueVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_BLUE);
  return ColorUtils.adjustColor(baseColor, adjustments);
};
