// /theme/types/core/accessibility.ts

export interface AccessibilityConfig {
  contrast: {
    minimum: number;
    enhanced: number;
  };
  motion: {
    reduced: boolean;
    prefersReduced: boolean;
  };
}
