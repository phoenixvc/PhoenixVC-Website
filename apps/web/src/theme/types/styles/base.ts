// /theme/types/styles/base.ts

/**
 * Base Style Interfaces
 * Defines the foundational style types.
 */
export interface BaseStyles {
  [key: string]: string | undefined;
}

export interface HoverStyles extends BaseStyles {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  transform?: string;
  boxShadow?: string;
  opacity?: string;
}

export interface FocusStyles extends BaseStyles {
  outline?: string;
  boxShadow?: string;
  borderColor?: string;
  backgroundColor?: string;
}

export interface ActiveStyles extends BaseStyles {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  transform?: string;
}

export interface DisabledStyles extends BaseStyles {
  opacity?: string;
  cursor?: string;
  backgroundColor?: string;
  color?: string;
  pointerEvents?: string;
}
