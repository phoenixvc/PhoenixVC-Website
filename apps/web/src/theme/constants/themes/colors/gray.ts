import {
  ColorAdjustments,
  ColorDefinition,
  ColorShades,
  ShadeLevel,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

// Base gray color
const BASE_GRAY = "#6B7280";

// Generate the gray palette using perceptual adjustments
const generateGrayPalette = (): Record<ShadeLevel, ColorDefinition> => {
  // For gray, we"ll use a slightly different approach to ensure true neutrality
  // Start with a neutral gray and adjust saturation slightly
  const palette = ColorUtils.createPerceptualPalette(BASE_GRAY, 10);

  // Optionally desaturate the grays slightly to ensure neutrality
  return {
    50: ColorUtils.adjustColor(palette[0], { saturation: -5 }),
    100: ColorUtils.adjustColor(palette[1], { saturation: -5 }),
    200: ColorUtils.adjustColor(palette[2], { saturation: -5 }),
    300: ColorUtils.adjustColor(palette[3], { saturation: -5 }),
    400: ColorUtils.adjustColor(palette[4], { saturation: -5 }),
    500: ColorUtils.adjustColor(palette[5], { saturation: -5 }),
    600: ColorUtils.adjustColor(palette[6], { saturation: -5 }),
    700: ColorUtils.adjustColor(palette[7], { saturation: -5 }),
    800: ColorUtils.adjustColor(palette[8], { saturation: -5 }),
    900: ColorUtils.adjustColor(palette[9], { saturation: -5 }),
  };
};

// Create the gray color shades
export const grayPalette: ColorShades = {
  ...generateGrayPalette(),
  base: BASE_GRAY,
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

// Export a function to get a specific gray shade
export const getGrayShade = (shade: ShadeLevel): ColorDefinition => {
  return grayPalette[shade];
};

// Export a function to create a gray with custom adjustments
export const createGrayVariant = (
  adjustments: ColorAdjustments,
): ColorDefinition => {
  const baseColor = ColorUtils.createColorDefinition(BASE_GRAY);
  return ColorUtils.adjustColor(baseColor, adjustments);
};
