// /theme/types/core/transition.ts

/**
 * Base transition configuration
 */
export interface TransitionConfig {
  /** Duration in milliseconds */
  duration: number;

  /** Timing function */
  timing: string;

  /** Properties to transition */
  properties: string[];
}

/**
 * Extended transition configuration with additional options
 */
export interface ThemeTransition extends TransitionConfig {
  /** Delay in milliseconds */
  delay?: number;

  /** Whether to disable transitions temporarily */
  disabled?: boolean;
}

/**
 * Transition options for runtime configuration
 */
export interface TransitionOptions {
  /** Duration in milliseconds */
  duration?: number;

  /** Timing function (renamed from "timing" for API consistency) */
  easing?: string;

  /** Properties to transition */
  properties?: string[];

  /** Whether transitions are enabled */
  enabled?: boolean;
}

/**
 * Convert TransitionOptions to ThemeTransition
 */
export function normalizeTransitionOptions(
  options: TransitionOptions,
): ThemeTransition {
  return {
    duration: options.duration ?? 200,
    timing: options.easing ?? "ease",
    properties: options.properties ?? [
      "color",
      "background-color",
      "border-color",
    ],
    disabled: options.enabled === false,
  };
}
