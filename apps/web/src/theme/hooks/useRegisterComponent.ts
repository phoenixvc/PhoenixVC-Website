// theme/hooks/useRegisterComponent.ts
import { useEffect } from "react";
import { themeCore } from "../core/theme-core";
import { ComponentVariantType } from "../types/mappings/component-variants";

export function useRegisterComponent(
  componentName: string,
  variants: Record<string, ComponentVariantType>
): void {
  useEffect((): (() => void) => {
    // Get the registry
    const registry = themeCore.getComponentRegistry();

    // Register the component if it doesn't exist
    if (!registry[componentName]) {
      registry[componentName] = variants;
    } else {
      // Merge with existing variants
      registry[componentName] = {
        ...registry[componentName],
        ...variants
      };
    }

    // Cleanup function to optionally unregister on unmount
    return (): void => {
      // Optional: Uncomment if you want to remove the component on unmount
      // delete registry[componentName];
    };
  }, [componentName, variants]);
}
