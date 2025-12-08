// /theme/types//styles/computed.ts

import {
  BaseStyles,
  HoverStyles,
  FocusStyles,
  ActiveStyles,
  DisabledStyles,
} from "./base";

/**
 * Semantic Style Interfaces
 * Defines semantic color mappings and interactive state styles.
 */
export interface SemanticStyles {
  success: string;
  warning: string;
  error: string;
  info: string;
  [key: string]: string | undefined;
}

export interface InteractiveStyles {
  hover: string;
  active: string;
  focus: string;
  disabled: string;
  [key: string]: string | undefined;
}

/**
 * Semantic style set for a given semantic meaning.
 */
export interface SemanticStyleSet {
  background: string;
  color: string;
  border?: string;
  icon?: string;
  hover?: HoverStyles;
  active?: ActiveStyles;
}

/**
 * A mapping from semantic style keys to their style sets.
 */
export type SemanticStyleMap = Record<keyof SemanticStyles, SemanticStyleSet>;

/**
 * Computed Styles Interface
 * Combines base, interactive, and semantic style definitions.
 */
export interface ComputedStyles {
  base: BaseStyles;
  hover: HoverStyles;
  focus: FocusStyles;
  active: ActiveStyles;
  disabled: DisabledStyles;
  semantic: SemanticStyleMap;
  interactive: InteractiveStyles;
}
