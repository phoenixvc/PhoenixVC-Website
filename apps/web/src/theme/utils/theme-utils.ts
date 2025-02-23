// theme-utils.ts
import { THEME_CONSTANTS } from '../constants/theme-constants';
import { BorderSet, ButtonColorSet, ChartColorSet, ColorMappings, ColorScheme, InputColorSet, Mode, NavigationColorSet, TableColorSet, TextColorSet } from '../types/theme.types';

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface ColorAdjustments {
  lightness?: number;
  saturation?: number;
  hue?: number;
  alpha?: number;
}

class ColorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ColorError';
  }
}

/**
 * Color manipulation utilities
 */
export const ColorUtils = {
  /**
   * Parse HSL color string into components
   * @throws {ColorError} If color string is invalid
   */
  parseHSL: (color: string): HSLColor => {
    const match = color.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?(?:,\s*([\d.]+))?\)/);

    if (!match) {
      throw new ColorError(`Invalid HSL(A) color format: ${color}`);
    }

    return {
      h: Math.min(360, Math.max(0, parseInt(match[1], 10))),
      s: Math.min(100, Math.max(0, parseInt(match[2], 10))),
      l: Math.min(100, Math.max(0, parseInt(match[3], 10)))
    };
  },

  /**
   * Convert HSL components to color string
   */
  toHSL: (color: HSLColor, alpha?: number): string => {
    const { h, s, l } = color;
    return alpha !== undefined
      ? `hsla(${h}, ${s}%, ${l}%, ${alpha})`
      : `hsl(${h}, ${s}%, ${l}%)`;
  },

  /**
   * Adjust color properties
   * @throws {ColorError} If color manipulation fails
   */
  adjustColor: (color: string, adjustments: ColorAdjustments): string => {
    try {
      const parsed = ColorUtils.parseHSL(color);

      const newColor: HSLColor = {
        h: (parsed.h + (adjustments.hue || 0)) % 360,
        s: Math.max(0, Math.min(100, parsed.s + (adjustments.saturation || 0))),
        l: Math.max(0, Math.min(100, parsed.l + (adjustments.lightness || 0)))
      };

      return ColorUtils.toHSL(newColor, adjustments.alpha);
    } catch (error) {
      if (error instanceof ColorError) {
        throw error;
      }
      throw new ColorError(`Failed to adjust color: ${color}`);
    }
  },

  /**
   * Mix two colors with a specified weight
   */
  mix: (color1: string, color2: string, weight: number = 0.5): string => {
    try {
      const c1 = ColorUtils.parseHSL(color1);
      const c2 = ColorUtils.parseHSL(color2);

      return ColorUtils.toHSL({
        h: Math.round(c1.h * (1 - weight) + c2.h * weight),
        s: Math.round(c1.s * (1 - weight) + c2.s * weight),
        l: Math.round(c1.l * (1 - weight) + c2.l * weight)
      });
    } catch (error) {
      throw new ColorError(`Failed to mix colors: ${color1} and ${color2}`);
    }
  },

  /**
   * Create a color palette from a base color
   */
  createPalette: (baseColor: string, steps: number = 9): string[] => {
    try {
      const base = ColorUtils.parseHSL(baseColor);
      const palette: string[] = [];

      for (let i = 0; i < steps; i++) {
        const lightness = (100 / (steps - 1)) * i;
        palette.push(ColorUtils.toHSL({ ...base, l: lightness }));
      }

      return palette;
    } catch (error) {
      throw new ColorError(`Failed to create palette from: ${baseColor}`);
    }
  }
};

export interface BaseThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  light: {
    background: string;
    text: string;
    muted: string;
    border: string;
  };
  dark: {
    background: string;
    text: string;
    muted: string;
    border: string;
  };
}

export interface ThemeColors {
  // One or more color schemes follow the BaseThemeColors pattern.
  classic: BaseThemeColors;
  forest?: BaseThemeColors;
  ocean?: BaseThemeColors;
  phoenix?: BaseThemeColors;
  lavender?: BaseThemeColors;
  cloud?: BaseThemeColors;
  // And then a semantic grouping:
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

/**
 * Generate theme variables based on color scheme and mode
 * @throws {Error} If color scheme or mode is invalid
 */
export const getThemeVariables = (
  colorScheme: ColorScheme,
  mode: Mode
): ThemeVariables => {
  try {

    const { COLORS } = THEME_CONSTANTS;
    // Assert that COLORS conforms to ThemeColors
    const colors = COLORS as ThemeColors;

    // Ensure the provided color scheme exists
    if (!colors[colorScheme]) {
      throw new Error(`Invalid color scheme: ${colorScheme}`);
    }

    const baseColors = colors[colorScheme];

    // Ensure that the mode ("light" or "dark") exists in the chosen scheme
    const modeColors = baseColors[mode as 'light' | 'dark'];
    if (!modeColors) {
      throw new Error(`Invalid mode: ${mode}`);
    }

    const input: InputColorSet = {
      // Base state (renamed from "default" to "background" for consistency with ComponentColorSet)
      background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
      text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      // Interactive states from InteractiveComponentSet
      hover: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.95 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      active: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.9 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      // Additional properties from InputColorSet
      placeholder: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
      error: {
        background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.5 }),
      },
      success: {
        background: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.5 }),
      },
    };

    const select: InputColorSet = {
      background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
      text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      hover: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.95 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      active: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.9 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      placeholder: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
      error: {
        background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.5 }),
      },
      success: {
        background: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.5 }),
      },
    };

    const checkbox: InputColorSet = {
      background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
      text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      hover: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.95 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      active: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.9 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      placeholder: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
      error: {
        background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.5 }),
      },
      success: {
        background: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.5 }),
      },
    };

    const radio: InputColorSet = {
      // Base (default) state
      background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
      text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      // Interactive states
      hover: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.95 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      active: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.9 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      focus: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.85 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      // Additional properties for inputs
      placeholder: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
      error: {
        background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.5 }),
      },
      success: {
        background: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.5 }),
      },
    };

    const button: Record<'primary' | 'secondary' | 'ghost' | 'link' | 'danger', ButtonColorSet> = {
      primary: {
        background: baseColors.primary,
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        hover: {
          background: ColorUtils.adjustColor(baseColors.primary, {
            lightness: mode === 'dark' ? 5 : -5,
            saturation: mode === 'dark' ? 10 : -10,
          }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        active: {
          background: ColorUtils.adjustColor(baseColors.primary, {
            lightness: mode === 'dark' ? -5 : 5,
            saturation: mode === 'dark' ? -10 : 10,
          }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        focus: {
          background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.25 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        loading: {
          background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.1 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 0.2 }),
        },
      },
      secondary: {
        background: baseColors.secondary,
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        hover: {
          background: ColorUtils.adjustColor(baseColors.secondary, {
            lightness: mode === 'dark' ? 5 : -5,
            saturation: mode === 'dark' ? 10 : -10,
          }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        active: {
          background: ColorUtils.adjustColor(baseColors.secondary, {
            lightness: mode === 'dark' ? -5 : 5,
            saturation: mode === 'dark' ? -10 : 10,
          }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        focus: {
          background: ColorUtils.adjustColor(baseColors.secondary, { alpha: 0.25 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        loading: {
          background: ColorUtils.adjustColor(baseColors.secondary, { alpha: 0.1 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 0.2 }),
        },
      },
      ghost: {
        background: "transparent",
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: "transparent",
        hover: {
          background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.05 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: "transparent",
        },
        active: {
          background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.1 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: "transparent",
        },
        focus: {
          background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.25 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: "transparent",
        },
        loading: {
          background: "transparent",
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 0.8 }),
          border: "transparent",
        },
      },
      link: {
        background: "transparent",
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: "transparent",
        hover: {
          background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.05 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: "transparent",
        },
        active: {
          background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.1 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: "transparent",
        },
        focus: {
          background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.25 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: "transparent",
        },
        loading: {
          background: "transparent",
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 0.8 }),
          border: "transparent",
        },
      },
      danger: {
        background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        hover: {
          background: ColorUtils.adjustColor(colors.semantic.error, {
            lightness: mode === 'dark' ? 5 : -5,
            saturation: mode === 'dark' ? 10 : -10,
          }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        active: {
          background: ColorUtils.adjustColor(colors.semantic.error, {
            lightness: mode === 'dark' ? -5 : 5,
            saturation: mode === 'dark' ? -10 : 10,
          }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        focus: {
          background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.25 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        loading: {
          background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.1 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 0.2 }),
        },
      },
    };

    const switchColors: InputColorSet = {
      background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
      text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      hover: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.95 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      active: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.9 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      focus: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.85 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      placeholder: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
      error: {
        background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.5 }),
      },
      success: {
        background: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.5 }),
      },
    };

    const chart: ChartColorSet = {
      primary: [
        ColorUtils.adjustColor(baseColors.primary, { alpha: 1 }),
        ColorUtils.adjustColor(baseColors.primary, { alpha: 0.8 }),
        ColorUtils.adjustColor(baseColors.primary, { alpha: 0.6 }),
      ],
      secondary: [
        ColorUtils.adjustColor(baseColors.secondary, { alpha: 1 }),
        ColorUtils.adjustColor(baseColors.secondary, { alpha: 0.8 }),
        ColorUtils.adjustColor(baseColors.secondary, { alpha: 0.6 }),
      ],
      accent: [
        ColorUtils.adjustColor(baseColors.accent, { alpha: 1 }),
        ColorUtils.adjustColor(baseColors.accent, { alpha: 0.8 }),
        ColorUtils.adjustColor(baseColors.accent, { alpha: 0.6 }),
      ],
      grid: ColorUtils.adjustColor(modeColors.border, { alpha: 0.3 }),
      axis: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      labels: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      tooltip: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      legend: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
    };

    const navigation: NavigationColorSet = {
      background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
      text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      active: {
        background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.5 }),
      },
      hover: {
        background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.05 }),
        text: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.3 }),
      },
      inactive: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      indicator: {
        active: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.8 }),
        hover: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.6 }),
      },
      icon: {
        default: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        active: ColorUtils.adjustColor(baseColors.primary, { alpha: 1 }),
        hover: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.8 }),
        disabled: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
      },
      badge: {
        background: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.8 }),
      },
      dropdown: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        itemHover: ColorUtils.adjustColor(modeColors.background, { alpha: 0.95 }),
        itemActive: ColorUtils.adjustColor(modeColors.background, { alpha: 0.9 }),
        divider: ColorUtils.adjustColor(modeColors.border, { alpha: 0.5 }),
        shadow: ColorUtils.adjustColor(modeColors.text, { alpha: 0.15 }),
      },
      mobile: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        overlay: ColorUtils.adjustColor(modeColors.background, { alpha: 0.8 }),
        hamburger: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
      },
    };

    // Containers grouping (combining card, modal, drawer, popover, tooltip)
    const containers = {
      card: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      modal: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        overlay: ColorUtils.adjustColor(modeColors.background, { alpha: 0.8 }),
      },
      drawer: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      popover: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      tooltip: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
    };

    // Feedback grouping (combining alert and toast into one group)
    const feedback = {
      alert: {
        success: {
          background: ColorUtils.adjustColor(colors.semantic.success, { alpha: 1 }),
          text: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.5 }),
        },
        warning: {
          background: ColorUtils.adjustColor(colors.semantic.warning, { alpha: 1 }),
          text: ColorUtils.adjustColor(colors.semantic.warning, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(colors.semantic.warning, { alpha: 0.5 }),
        },
        error: {
          background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 1 }),
          text: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.5 }),
        },
        info: {
          background: ColorUtils.adjustColor(colors.semantic.info, { alpha: 1 }),
          text: ColorUtils.adjustColor(colors.semantic.info, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(colors.semantic.info, { alpha: 0.5 }),
        },
      },
      toast: {
        success: {
          background: ColorUtils.adjustColor(colors.semantic.success, { alpha: 1 }),
          text: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.5 }),
        },
        warning: {
          background: ColorUtils.adjustColor(colors.semantic.warning, { alpha: 1 }),
          text: ColorUtils.adjustColor(colors.semantic.warning, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(colors.semantic.warning, { alpha: 0.5 }),
        },
        error: {
          background: ColorUtils.adjustColor(colors.semantic.error, { alpha: 1 }),
          text: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.5 }),
        },
        info: {
          background: ColorUtils.adjustColor(colors.semantic.info, { alpha: 1 }),
          text: ColorUtils.adjustColor(colors.semantic.info, { alpha: 0.8 }),
          border: ColorUtils.adjustColor(colors.semantic.info, { alpha: 0.5 }),
        },
      },
    };

    const table: TableColorSet = {
      header: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      row: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      rowAlternate: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.95 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      hover: {
        background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.9 }),
        text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
        border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
      },
      selected: {
        background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.1 }),
        text: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.8 }),
        border: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.5 }),
      },
    };

    const text: TextColorSet = {
      primary: modeColors.text, // using modeColors.text as primary
      secondary: modeColors.muted, // assume muted is a suitable secondary text color
      muted: modeColors.muted,
      disabled: ColorUtils.adjustColor(modeColors.text, { alpha: 0.5 }),
      inverse: modeColors.text, // adjust as needed for contrast
      link: {
        default: modeColors.text,
        hover: ColorUtils.adjustColor(modeColors.text, { alpha: 0.8 }),
        visited: modeColors.text, // or adjust if needed
        active: modeColors.text,
      },
      emphasis: {
        strong: modeColors.text,
        weak: modeColors.muted,
      },
    };

    const border: BorderSet = {
      default: modeColors.border,
      hover: ColorUtils.adjustColor(modeColors.border, { alpha: 0.8 }),
      focus: ColorUtils.adjustColor(modeColors.border, { alpha: 0.6 }),
      active: ColorUtils.adjustColor(modeColors.border, { alpha: 0.8 }),
      disabled: ColorUtils.adjustColor(modeColors.border, { alpha: 0.5 }),
      error: ColorUtils.adjustColor(colors.semantic.error, { alpha: 0.5 }),
      success: ColorUtils.adjustColor(colors.semantic.success, { alpha: 0.5 }),
      warning: ColorUtils.adjustColor(colors.semantic.warning, { alpha: 0.5 }),
      divider: ColorUtils.adjustColor(modeColors.border, { alpha: 0.5 }),
      subtle: ColorUtils.adjustColor(modeColors.border, { alpha: 0.3 }),
    };

    const mappings: ColorMappings = {
      base: {
        primary: {
          default: baseColors.primary,
          hover: ColorUtils.adjustColor(baseColors.primary, {
            lightness: mode === 'dark' ? 5 : -5,
            saturation: mode === 'dark' ? 10 : -10,
          }),
          active: ColorUtils.adjustColor(baseColors.primary, {
            lightness: mode === 'dark' ? -5 : 5,
            saturation: mode === 'dark' ? -10 : 10,
          }),
          focus: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.25 }),
        },
        secondary: {
          default: baseColors.secondary,
          hover: ColorUtils.adjustColor(baseColors.secondary, {
            lightness: mode === 'dark' ? 5 : -5,
            saturation: mode === 'dark' ? 10 : -10,
          }),
          active: ColorUtils.adjustColor(baseColors.secondary, {
            lightness: mode === 'dark' ? -5 : 5,
            saturation: mode === 'dark' ? -10 : 10,
          }),
          focus: ColorUtils.adjustColor(baseColors.secondary, { alpha: 0.25 }),
        },
        accent: {
          default: baseColors.accent,
          hover: ColorUtils.adjustColor(baseColors.accent, {
            lightness: mode === 'dark' ? 5 : -5,
            saturation: mode === 'dark' ? 10 : -10,
          }),
          active: ColorUtils.adjustColor(baseColors.accent, {
            lightness: mode === 'dark' ? -5 : 5,
            saturation: mode === 'dark' ? -10 : 10,
          }),
          focus: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.25 }),
        },
        background: {
          default: modeColors.background,
          hover: ColorUtils.adjustColor(modeColors.background, {
            lightness: mode === 'dark' ? 5 : -5,
          }),
          active: ColorUtils.adjustColor(modeColors.background, {
            lightness: mode === 'dark' ? -5 : 5,
          }),
        },
        surface: {
          default: ColorUtils.adjustColor(modeColors.background, {
            lightness: mode === 'dark' ? 5 : -5,
          }),
          hover: ColorUtils.adjustColor(modeColors.background, {
            lightness: mode === 'dark' ? 10 : -10,
          }),
          active: ColorUtils.adjustColor(modeColors.background, {
            lightness: mode === 'dark' ? 15 : -15,
          }),
        },
      },
      semantic: {
        success: {
          default: "#28a745",
          light: ColorUtils.adjustColor("#28a745", { lightness: 90, saturation: -20 }),
          dark: ColorUtils.adjustColor("#28a745", { lightness: -20, saturation: 10 }),
          text: "#ffffff",
          border: ColorUtils.adjustColor("#28a745", { alpha: 0.5 }),
        },
        warning: {
          default: "#ffc107",
          light: ColorUtils.adjustColor("#ffc107", { lightness: 90, saturation: -20 }),
          dark: ColorUtils.adjustColor("#ffc107", { lightness: -20, saturation: 10 }),
          text: "#212529",
          border: ColorUtils.adjustColor("#ffc107", { alpha: 0.5 }),
        },
        error: {
          default: "#dc3545",
          light: ColorUtils.adjustColor("#dc3545", { lightness: 90, saturation: -20 }),
          dark: ColorUtils.adjustColor("#dc3545", { lightness: -20, saturation: 10 }),
          text: "#ffffff",
          border: ColorUtils.adjustColor("#dc3545", { alpha: 0.5 }),
        },
        info: {
          default: "#17a2b8",
          light: ColorUtils.adjustColor("#17a2b8", { lightness: 90, saturation: -20 }),
          dark: ColorUtils.adjustColor("#17a2b8", { lightness: -20, saturation: 10 }),
          text: "#ffffff",
          border: ColorUtils.adjustColor("#17a2b8", { alpha: 0.5 }),
        },
      },
      text: text,
      border: border,
      shadow: {
        small: ColorUtils.adjustColor(modeColors.text, { alpha: 0.05 }),
        medium: ColorUtils.adjustColor(modeColors.text, { alpha: 0.1 }),
        large: ColorUtils.adjustColor(modeColors.text, { alpha: 0.15 }),
        focus: ColorUtils.adjustColor(modeColors.text, { alpha: 0.2 }),
        hover: ColorUtils.adjustColor(modeColors.text, { alpha: 0.25 }),
        inner: ColorUtils.adjustColor(modeColors.text, { alpha: 0.05 }),
        outline: ColorUtils.adjustColor(modeColors.text, { alpha: 0.3 }),
        ambient: ColorUtils.adjustColor(modeColors.text, { alpha: 0.08 }),
        layered: {
          top: ColorUtils.adjustColor(modeColors.text, { alpha: 0.1 }),
          middle: ColorUtils.adjustColor(modeColors.text, { alpha: 0.15 }),
          bottom: ColorUtils.adjustColor(modeColors.text, { alpha: 0.2 }),
        },
      },
      interactive: {
        focusRing: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.25 }),
        overlay: ColorUtils.adjustColor(modeColors.background, { alpha: 0.8 }),
        selection: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.2 }),
        highlight: ColorUtils.adjustColor(colors.semantic.warning, { alpha: 0.2 }),
      },
      components: {
        input: input,
        select: select,
        checkbox: checkbox,
        radio: radio,
        switch: switchColors,
        button: button,
        navigation: {
          navbar : navigation,
          sidebar: navigation,
          tab: navigation,
          breadcrumb: navigation
        },
        containers: containers,
        feedback: feedback,
        dataDisplay: {
          table: table,
          badge: {
            background: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.1 }),
            text: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.8 }),
            border: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.5 }),
          },
          tag: {
            background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
            text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
            border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
          },
          avatar: {
            background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
            text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
            border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
          },
          progress: {
            background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
            text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
            border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
          },
          spinner: {
            background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
            text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
            border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
          },
        },
        code: {
          background: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
          text: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
          border: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
          syntax: {
            comment: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
            string: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.8 }),
            keyword: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.8 }),
            variable: ColorUtils.adjustColor(baseColors.secondary, { alpha: 0.8 }),
            function: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.8 }),
            operator: ColorUtils.adjustColor(modeColors.text, { alpha: 1 }),
            class: ColorUtils.adjustColor(baseColors.accent, { alpha: 0.8 }),
          },
        },
        chart: chart,
        skeleton: {
          base: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
          highlight: ColorUtils.adjustColor(modeColors.background, { alpha: 0.9 }),
          animation: "pulse 1.5s ease-in-out infinite",
        },
        scrollbar: {
          track: ColorUtils.adjustColor(modeColors.background, { alpha: 1 }),
          thumb: ColorUtils.adjustColor(modeColors.border, { alpha: 0.8 }),
          thumbHover: ColorUtils.adjustColor(modeColors.border, { alpha: 1 }),
        },
        },
        states:
          {
            disabled: {
              background: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.2 }),
              text: ColorUtils.adjustColor(modeColors.muted, { alpha: 0.5 }),
              border: ColorUtils.adjustColor(modeColors.border, { alpha: 0.5 }),
            },
            loading: {
              background: ColorUtils.adjustColor(baseColors.primary, { alpha: 0.1 }),
              text: ColorUtils.adjustColor(modeColors.text, { alpha: 0.8 }),
              border: ColorUtils.adjustColor(modeColors.border, { alpha: 0.2 }),
            },
            readonly: {
              background: ColorUtils.adjustColor(modeColors.background, { alpha: 0.95 }),
              text: ColorUtils.adjustColor(modeColors.text, { alpha: 0.75 }),
              border: ColorUtils.adjustColor(modeColors.border, { alpha: 0.3 }),
            }
      },
    };

    const themeVariables: ThemeVariables = {
      ...mappings, // include all keys from your ColorMappings object
      prefix: "--theme",
      mappings: mappings,
      computed: {
        color: mappings, // For now, using the same color mappings for computed color
        spacing: {
          small: "4px",
          medium: "8px",
          large: "16px",
          // add more spacing values as needed
        },
        typography: {
          body: {
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
            letterSpacing: "normal",
          },
          heading: {
            fontSize: "32px",
            lineHeight: "40px",
            fontWeight: 700,
            letterSpacing: "normal",
          },
          // add additional typography variants as required
        },
        breakpoints: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
        animation: {
          fadeIn: {
            duration: "300ms",
            easing: "ease-in",
          },
          fadeOut: {
            duration: "300ms",
            easing: "ease-out",
          },
          // add more animations as needed
        },
        zIndex: {
          dropdown: 1000,
          modal: 1100,
          tooltip: 1200,
          // add additional z-index values as required
        },
      },
    };

    return themeVariables;
  } catch (error) {
    console.error('[ThemeProvider] Failed to generate theme variables:', error);
    throw error;
  }
};

export interface ThemeVariables extends ColorMappings {
  prefix: string;
  mappings: ColorMappings;
  computed: {
    [key: string]: any; // Replace with a more specific type as needed
  };
}

export type { HSLColor, ColorAdjustments };
