// theme/constants/theme-constants.ts

import { ThemeConstantsType } from "../types";
import {
  ColorDefinition,
  ThemeSchemeInitial,
  InitialBaseColors,
  SemanticColors
} from "../types/core/colors";

const createColorDefinition = (hex: string): ColorDefinition => ({
  hex,
  rgb: '', // These would be computed by a utility function
  hsl: '', // These would be computed by a utility function
});

const createInitialBaseColors = (): InitialBaseColors => ({
  primary: createColorDefinition('#1C3F8D'),
  secondary: createColorDefinition('#2A5777'),
  accent: createColorDefinition('#D41F4B')
});

const createBaseScheme = (): ThemeSchemeInitial => ({
  base: createInitialBaseColors(),
  light: {
    background: createColorDefinition('#FFFFFF'),
    text: createColorDefinition('#1C2333'),
    muted: createColorDefinition('#A7B3C2'),
    border: createColorDefinition('#D4D9E0'),
  },
  dark: {
    background: createColorDefinition('#1C2333'),
    text: createColorDefinition('#FFFFFF'),
    muted: createColorDefinition('#3C4858'),
    border: createColorDefinition('#252B3A'),
  }
});

// Using ColorDefinition for semantic colors as well
const createSemanticColors = (): SemanticColors => ({
  success: createColorDefinition('#2F855A'),
  warning: createColorDefinition('#E2B027'),
  error: createColorDefinition('#E53E3E'),
  info: createColorDefinition('#3182CE'),
});

export const THEME_CONSTANTS: ThemeConstantsType = {
  PREFIX: "--theme-",
  DEFAULTS: {
    COLOR_SCHEME: "classic",
    MODE: "light",
    TRANSITION: {
      DURATION: 200,
      TIMING: "ease-in-out",
      PROPERTIES: [
        "background-color",
        "color",
        "border-color",
        "fill",
        "stroke",
        "opacity",
        "box-shadow",
      ],
    },
  },
  COLOR_SCHEMES: ["classic"] as const,
  COLORS: {
    schemes: {
      classic: createBaseScheme(),
      forest: createBaseScheme(),   // fallback; later, you can replace with a forest-specific scheme
      ocean: createBaseScheme(),
      phoenix: createBaseScheme(),
      lavender: createBaseScheme(),
      cloud: createBaseScheme(),
    },
    semantic: createSemanticColors(),
  },
  MODES: ["light", "dark"] as const,
  EVENTS: {
    CHANGE: "theme:change",
    INIT: "theme:init",
    MODE_CHANGE: "theme:mode-change",
    SCHEME_CHANGE: "theme:scheme-change",
    SYSTEM_CHANGE: "theme:system-change",
  } as const,
  STORAGE: {
    PREFIX: "theme:",
    KEYS: {
      COLOR_SCHEME: "theme:color-scheme",
      MODE: "theme:mode",
      USE_SYSTEM: "theme:use-system-mode",
    },
  } as const,
  CLASSES: {
    ROOT: "theme-root",
    TRANSITION: "theme-transition",
    COLOR_SCHEME_PREFIX: "theme-",
    MODE_PREFIX: "theme-mode-",
  } as const,
  MEDIA_QUERIES: {
    DARK_MODE: "(prefers-color-scheme: dark)",
    LIGHT_MODE: "(prefers-color-scheme: light)",
    REDUCED_MOTION: "(prefers-reduced-motion: reduce)",
  } as const,
};


// Convenience exports
export const {
  PREFIX,
  DEFAULTS,
  COLOR_SCHEMES,
  MODES,
  EVENTS,
  STORAGE,
  CLASSES,
  MEDIA_QUERIES,
} = THEME_CONSTANTS;

export default THEME_CONSTANTS;
