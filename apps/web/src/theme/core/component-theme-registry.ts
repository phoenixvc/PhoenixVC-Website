// theme/registry/component-registry.ts
import { ComponentVariants, ButtonVariant, ComponentVariantType } from "../types";

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
  // Since we don't want to define defaults here, we'll cast the initialComponents
  // This assumes that the logic that generates components will ensure all required variants exist
  const registry = initialComponents as ComponentThemeRegistry;

  // If initialComponents is undefined, we need to provide an empty structure
  // that satisfies the TypeScript requirements
  if (!initialComponents) {
    return {
      button: {
        primary: {} as ButtonVariant,
        secondary: {} as ButtonVariant,
        tertiary: {} as ButtonVariant,
        danger: {} as ButtonVariant
      }
    } as ComponentThemeRegistry;
  }

  return registry;
}
