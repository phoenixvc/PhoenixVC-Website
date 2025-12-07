// theme/registry/component-registry.ts
import { ComponentVariants, ComponentVariantType } from "../types";

/**
 * Registry of component variants for the theme system
 * This interface extends ComponentVariants to ensure type safety
 */
export interface ComponentThemeRegistry extends ComponentVariants {
  // The button property must match the ComponentVariants definition exactly
  // button: {
  //   [key: string]: ButtonVariant;
  //   primary: ButtonVariant;
  //   secondary: ButtonVariant;
  //   tertiary: ButtonVariant;
  //   danger: ButtonVariant;
  // };

  // Other properties from ComponentVariants...

  // Allow additional dynamic components
  [key: string]: Record<string, ComponentVariantType> | undefined;
}

export function createComponentRegistry(
  initialComponents?: Partial<ComponentThemeRegistry>
): ComponentThemeRegistry {
  // Create an empty base registry
  const baseRegistry: ComponentThemeRegistry = {} as ComponentThemeRegistry;

  // If initialComponents is provided, use it directly
  if (initialComponents) {
    // Simply return the initialComponents cast as ComponentThemeRegistry
    return { ...baseRegistry, ...initialComponents };
  }

  return baseRegistry;
}
