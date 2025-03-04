// theme/registry/variant-resolution/navigation-strategy.ts

import { ComponentVariantType, isNavigationVariant } from "../../types/mappings/component-variants";
import { PatternResolutionStrategy } from "./variant-resolution-strategy";

/**
 * Strategy for resolving navigation-specific patterns
 */
export class NavigationStrategy extends PatternResolutionStrategy {
  constructor() {
    super(["-active", "-selected"]);
  }

  resolveVariant(
    componentVariants: Record<string, ComponentVariantType>,
    baseVariant: string,
    dynamicPattern: string
  ): ComponentVariantType | undefined {
    const baseStyles = componentVariants[baseVariant] as ComponentVariantType;
    if (!baseStyles) return componentVariants.default as ComponentVariantType;

    // Check for specific variant with this pattern
    const specificVariant = `${baseVariant}${dynamicPattern}`;
    if (componentVariants[specificVariant]) {
      return componentVariants[specificVariant] as ComponentVariantType;
    }

    // Handle navigation variants
    if (isNavigationVariant(baseStyles)) {
      return this.applyNavigationActiveState(baseStyles);
    }

    return baseStyles;
  }

  /**
   * Applies navigation active state to a navigation variant
   */
  private applyNavigationActiveState(
    baseStyles: ComponentVariantType
  ): ComponentVariantType {
    if (!isNavigationVariant(baseStyles)) {
      return baseStyles;
    }

    if (!baseStyles.item || !baseStyles.item.active) {
      return baseStyles;
    }

    return {
      ...baseStyles,
      item: {
        ...baseStyles.item,
        ...baseStyles.item.active
      }
    } as ComponentVariantType;
  }
}
