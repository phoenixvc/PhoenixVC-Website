// theme/registry/variant-resolution/tab-strategy.ts

import {
  ComponentVariantType,
  isTabVariant,
} from "../../types/mappings/component-variants";
import { PatternResolutionStrategy } from "./variant-resolution-strategy";

/**
 * Strategy for resolving tab-specific patterns
 */
export class TabStrategy extends PatternResolutionStrategy {
  constructor() {
    super(["-selected"]);
  }

  resolveVariant(
    componentVariants: Record<string, ComponentVariantType>,
    baseVariant: string,
    dynamicPattern: string,
  ): ComponentVariantType | undefined {
    const baseStyles = componentVariants[baseVariant] as ComponentVariantType;
    if (!baseStyles) return componentVariants.default as ComponentVariantType;

    // Check for specific variant with this pattern
    const specificVariant = `${baseVariant}${dynamicPattern}`;
    if (componentVariants[specificVariant]) {
      return componentVariants[specificVariant] as ComponentVariantType;
    }

    // Handle tab variants
    if (isTabVariant(baseStyles)) {
      return {
        ...baseStyles,
        ...baseStyles.selected,
      } as ComponentVariantType;
    }

    return baseStyles;
  }
}
