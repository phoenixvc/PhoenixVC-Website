// src/theme/constants/themes/variants.ts

import { ProcessedBaseColors, ColorDefinition, ThemeName, RequiredModeColors } from "@/theme/types";

/**
 * A helper function to create a simple palette where every shade is identical.
 * In a real-world scenario, you'd likely generate a proper palette with varying shades.
 */
const createShades = (baseHex: string): ProcessedBaseColors["primary"] => {
  const color: ColorDefinition = {
    hex: baseHex,
    rgb: "", // TODO: Convert baseHex to an RGB string.
    hsl: "", // TODO: Convert baseHex to an HSL string.
    alpha: 1,
  };

  // For simplicity, assign the same color to all shade levels.
  return {
    50: color,
    100: color,
    200: color,
    300: color,
    400: color,
    500: color,
    600: color,
    700: color,
    800: color,
    900: color,
  };
};

/**
 * Static theme variants.
 * Each scheme defines processed base colors for primary, secondary, and accent.
 */
export const COLOR_SCHEMES: Record<ThemeName, ProcessedBaseColors> = {
  phoenix: {
    primary: createShades("#ff6b00"),
    secondary: createShades("#705c55"),
    accent: createShades("#ff8a00"),
  },
  cloud: {
    primary: createShades("#f3f4f6"),
    secondary: createShades("#e5e7eb"),
    accent: createShades("#d1d5db"),
  },
  forest: {
    primary: createShades("#3d633e"),
    secondary: createShades("#315a31"),
    accent: createShades("#2d4d2d"),
  },
  ocean: {
    primary: createShades("#0077b6"),
    secondary: createShades("#0096c7"),
    accent: createShades("#023e8a"),
  },
  lavender: {
    primary: createShades("#8b5cf6"),
    secondary: createShades("#a78bfa"),
    accent: createShades("#6d28d9"),
  },
  classic: {
    primary: createShades("#222222"),
    secondary: createShades("#444444"),
    accent: createShades("#666666"),
  },
};

/**
 * Dark mode overrides for mode-specific colors.
 */
export const DARK_MODE_COLORS: Partial<RequiredModeColors> = {
  background: createShades("#1f2937")[500],
  text: createShades("#f9fafb")[500],
  muted: createShades("#9ca3af")[500],
  border: createShades("#374151")[500],
};
