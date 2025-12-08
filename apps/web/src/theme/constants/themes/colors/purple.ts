import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base purple color
const BASE_PURPLE = "#8B5CF6";

// Generate the purple palette using perceptual adjustments
const generatePurplePalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_PURPLE, 10);

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

// Create the purple color shades
export const purplePalette: ColorShades = {
  ...generatePurplePalette(),
  base: BASE_PURPLE,
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

// Export a function to get a specific purple shade
export const getPurpleShade = (shade: ShadeLevel): ColorDefinition => {
  return purplePalette[shade];
};

// Export a function to create a purple with custom adjustments
export const createPurpleVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_PURPLE);
  return ColorUtils.adjustColor(baseColor, adjustments);
};
