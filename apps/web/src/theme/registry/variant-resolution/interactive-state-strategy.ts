// theme/registry/variant-resolution/interactive-state-strategy.ts

import { ComponentVariantType, isInteractiveVariant } from "../../types/mappings/component-variants";
import { PatternResolutionStrategy } from "./variant-resolution-strategy";
import { InteractiveState } from "../../types";

/**
 * Strategy for resolving interactive state patterns like hover, active, focus, disabled
 */
export class InteractiveStateStrategy extends PatternResolutionStrategy {
  constructor() {
    super(["-hover", "-active", "-focus", "-disabled"]);
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

    // Handle interactive states
    if (isInteractiveVariant(baseStyles)) {
      // Extract state name without the dash
      const stateName = dynamicPattern.substring(1) as keyof InteractiveState;
      return this.applyInteractiveState(baseStyles, stateName);
    }

    return baseStyles;
  }

  /**
   * Applies an interactive state to a component variant
   */
  private applyInteractiveState(
    baseStyles: ComponentVariantType & { interactive?: InteractiveState },
    state: keyof InteractiveState
  ): ComponentVariantType {
    if (!baseStyles.interactive || !baseStyles.interactive[state]) {
      return baseStyles;
    }

    // Create a shallow copy to avoid modifying the original
    const newVariant = { ...baseStyles };
    const stateStyles = baseStyles.interactive[state];

    // Use a more type-safe approach
    type StyleKeys = "background" | "foreground" | "border" | "shadow" | "opacity";

    // Define a function to update a specific property if it exists on both objects
    function updateProperty<K extends StyleKeys>(
      obj: ComponentVariantType,
      key: K,
      value: unknown
    ): ComponentVariantType {
      // Check if the key exists in the base object
      if (key in obj) {
        // Use a type assertion with unknown as intermediate step
        return {
          ...obj,
          [key]: value
        } as unknown as ComponentVariantType;
      }
      return obj;
    }

    // Apply each property one by one, maintaining the type at each step
    let result: ComponentVariantType = newVariant;

    if ("background" in stateStyles && stateStyles.background) {
      result = updateProperty(result, "background", stateStyles.background);
    }

    if ("foreground" in stateStyles && stateStyles.foreground) {
      result = updateProperty(result, "foreground", stateStyles.foreground);
    }

    if ("border" in stateStyles && stateStyles.border) {
      result = updateProperty(result, "border", stateStyles.border);
    }

    if ("shadow" in stateStyles && stateStyles.shadow) {
      result = updateProperty(result, "shadow", stateStyles.shadow);
    }

    if ("opacity" in stateStyles && stateStyles.opacity !== undefined) {
      result = updateProperty(result, "opacity", stateStyles.opacity);
    }

    // Keep the interactive property
    result = {
      ...result,
      interactive: baseStyles.interactive
    } as unknown as ComponentVariantType;

    return result;
  }
}
