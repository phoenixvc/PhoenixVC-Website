// theme/registry/typography-registry.ts

import { TypographyPreset, TypographyScale } from "../mappings";

export interface TypographyRegistry {
  // Presets
  presets: Map<string, TypographyPreset>;

  // Individual scales
  scales: Map<string, TypographyScale>;

  // Component-specific typography
  components: Map<string, Record<string, TypographyScale>>;
}

export const createTypographyRegistry = (): TypographyRegistry => {
  return {
    presets: new Map(),
    scales: new Map(),
    components: new Map(),
  };
};
