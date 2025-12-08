import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
} from "../tokens/typography";
import { spacing } from "../tokens/spacing";
import { breakpoints } from "../tokens/breakpoints";
import { shadows } from "../tokens/shadows";
import { borderWidths, borderStyles } from "../tokens/borders";
import { animations } from "../tokens/animations";
import { Theme } from "@/theme";
import {
  radii,
  transitionDurations,
  transitionEasings,
  zIndices,
} from "../tokens";

/**
 * Default theme values that will be merged with theme-specific color values
 */
export const defaultTheme: Omit<Theme, "colors"> = {
  typography: {
    fontFamily: {
      base: fontFamilies.sans,
      heading: fontFamilies.sans,
      monospace: fontFamilies.mono,
    },
    fontSize: {
      xs: fontSizes.xs,
      sm: fontSizes.sm,
      md: fontSizes.base, // Note: "base" in tokens maps to "md" in the interface
      lg: fontSizes.lg,
      xl: fontSizes.xl,
      xxl: fontSizes["2xl"], // Map 2xl to xxl
    },
    fontWeight: {
      light: fontWeights.light,
      regular: fontWeights.normal, // "normal" in tokens maps to "regular" in interface
      medium: fontWeights.medium,
      semibold: fontWeights.semibold,
      bold: fontWeights.bold,
    },
    lineHeight: {
      tight: lineHeights.tight,
      normal: lineHeights.normal,
      relaxed: lineHeights.relaxed,
    },
    letterSpacing: {
      tight: letterSpacings.tight,
      normal: letterSpacings.normal,
      wide: letterSpacings.wide,
    },
  },
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    xxl: spacing.xxl,
  },
  breakpoints: {
    xs: breakpoints.xs,
    sm: breakpoints.sm,
    md: breakpoints.md,
    lg: breakpoints.lg,
    xl: breakpoints.xl,
  },
  shadows: {
    none: shadows.none,
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
    xl: shadows.xl,
  },
  borders: {
    radius: {
      none: radii.none,
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      full: radii.full,
    },
    width: {
      none: borderWidths.none,
      thin: borderWidths.thin,
      normal: borderWidths.thin, // Using thin as normal since normal doesn"t exist
      thick: borderWidths.thick,
    },
    style: {
      solid: borderStyles.solid,
      dashed: borderStyles.dashed,
      dotted: borderStyles.dotted,
    },
  },
  zIndex: {
    dropdown: zIndices.dropdown,
    modal: zIndices.modal,
    overlay: zIndices.overlay,
    popover: zIndices.popover,
    tooltip: zIndices.tooltip,
  },
  transitions: {
    duration: {
      fast: transitionDurations.fast,
      normal: transitionDurations.normal,
      slow: transitionDurations.slow,
    },
    easing: {
      easeIn: transitionEasings.easeIn,
      easeOut: transitionEasings.easeOut,
      easeInOut: transitionEasings.easeInOut,
    },
  },
  animations: {
    fadeIn: `${animations.fadeIn.duration} ${animations.fadeIn.easing} ${animations.fadeIn.keyframes}`,
    fadeOut: `${animations.fadeOut.duration} ${animations.fadeOut.easing} ${animations.fadeOut.keyframes}`,
    slideInUp: `${animations.slideInUp.duration} ${animations.slideInUp.easing} ${animations.slideInUp.keyframes}`,
    slideInDown: `${animations.slideInDown.duration} ${animations.slideInDown.easing} ${animations.slideInDown.keyframes}`,
    zoomIn: `${animations.zoomIn.duration} ${animations.zoomIn.easing} ${animations.zoomIn.keyframes}`,
    zoomOut: `${animations.zoomOut.duration} ${animations.zoomOut.easing} ${animations.zoomOut.keyframes}`,
    pulse: `${animations.pulse.duration} ${animations.pulse.easing} ${animations.pulse.keyframes}`,
    spin: `${animations.spin.duration} ${animations.spin.easing} ${animations.spin.keyframes}`,
  },
};
