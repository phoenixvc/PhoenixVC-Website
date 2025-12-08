import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base green color
const BASE_GREEN = "#10B981";

// Generate the green palette using perceptual adjustments
const generateGreenPalette = (): Record<ShadeLevel, ColorDefinition> => {
  const palette = ColorUtils.createPerceptualPalette(BASE_GREEN, 10);

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

// Create the green color shades
export const greenPalette: ColorShades = {
  ...generateGreenPalette(),
  base: BASE_GREEN,
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

// Export a function to get a specific green shade
export const getGreenShade = (shade: ShadeLevel): ColorDefinition => {
  return greenPalette[shade];
};

// Export a function to create a green with custom adjustments
export const createGreenVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_GREEN);
  return ColorUtils.adjustColor(baseColor, adjustments);
};
