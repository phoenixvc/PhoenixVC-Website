// theme/hooks/useComponentVariant.ts
import { useCallback } from "react";
import { useComponentTheme } from "./useComponentTheme";

type ComponentState = "default" | "hover" | "active" | "focus" | "disabled";

export function useComponentVariant(
  componentName: string,
  variantName: string = "default",
  stateName: ComponentState = "default"
) {
  const componentTheme = useComponentTheme();

  // Get styles with error handling
  const getStyles = useCallback(() => {
    try {
      return componentTheme.getComponentStyles(componentName, variantName, stateName);
    } catch (error) {
      console.warn(`Failed to get styles for ${componentName}.${variantName}.${stateName}:`, error);
      return {};
    }
  }, [componentTheme, componentName, variantName, stateName]);

  // Get classes with error handling
  const getClasses = useCallback(() => {
    try {
      return componentTheme.getComponentClasses(componentName, variantName);
    } catch (error) {
      console.warn(`Failed to get classes for ${componentName}.${variantName}:`, error);
      return "";
    }
  }, [componentTheme, componentName, variantName]);

  return {
    styles: getStyles(),
    classes: getClasses(),

    // Helper for interactive states
    getStateStyles: (state: ComponentState) => {
      try {
        return componentTheme.getComponentStyles(componentName, variantName, state);
      } catch (error) {
        console.warn(`Failed to get state styles for ${componentName}.${variantName}.${state}:`, error);
        return {};
      }
    }
  };
}
