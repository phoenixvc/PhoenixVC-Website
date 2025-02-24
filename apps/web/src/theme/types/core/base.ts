// src/theme/types/core/base.ts

import { SemanticColors, ThemeSchemeInitial } from "./colors";

/**
 * Core Theme Identity
 */
export type ThemeColorScheme = "classic" | "forest" | "ocean" | "phoenix" | "lavender" | "cloud";
export type ThemeMode = 'light' | 'dark';

/**
 * Theme Scale System
 */
export namespace ThemeScale {
  export type Spacing = 'spacing';
  export type FontSize = 'fontSize';
  export type LineHeight = 'lineHeight';
  export type BorderRadius = 'borderRadius';
  export type BorderWidth = 'borderWidth';
  export type Opacity = 'opacity';
  export type ZIndex = 'zIndex';

  export type All =
    | Spacing
    | FontSize
    | LineHeight
    | BorderRadius
    | BorderWidth
    | Opacity
    | ZIndex;
}

/**
 * Layout System
 */
export namespace Layout {
  export type CSSUnit = 'px' | 'rem' | 'em' | 'vh' | 'vw' | '%';
  export type Direction = 'ltr' | 'rtl';
}

/**
 * Theme Namespace
 * Groups core theme types for convenience.
 */
export namespace Theme {
  export type ColorScheme = ThemeColorScheme;
  export type Mode = ThemeMode;
  export type LayoutDirection = Layout.Direction;
  export type LayoutCSSUnit = Layout.CSSUnit;
}

/**
 * Theme Constants Type
 * Defines the structure for the theme constants.
 */
export interface ThemeConstantsType {
  PREFIX: string;
  DEFAULTS: {
    COLOR_SCHEME: ThemeColorScheme;
    MODE: ThemeMode;
    TRANSITION: {
      DURATION: number;
      TIMING: string;
      PROPERTIES: string[];
    };
  };
  COLOR_SCHEMES: readonly ThemeColorScheme[];
  COLORS: {
    schemes: Partial<Record<ThemeColorScheme, ThemeSchemeInitial>>;
    semantic: SemanticColors;
  };
  MODES: readonly ThemeMode[];
  EVENTS: {
    CHANGE: string;
    INIT: string;
    MODE_CHANGE: string;
    SCHEME_CHANGE: string;
    SYSTEM_CHANGE: string;
  };
  STORAGE: {
    PREFIX: string;
    KEYS: {
      COLOR_SCHEME: string;
      MODE: string;
      USE_SYSTEM: string;
    };
  };
  CLASSES: {
    ROOT: string;
    TRANSITION: string;
    COLOR_SCHEME_PREFIX: string;
    MODE_PREFIX: string;
  };
  MEDIA_QUERIES: {
    DARK_MODE: string;
    LIGHT_MODE: string;
    REDUCED_MOTION: string;
  };
}
