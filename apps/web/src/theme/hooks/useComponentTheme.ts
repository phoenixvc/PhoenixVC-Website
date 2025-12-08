// theme/hooks/useComponentTheme.ts
import { useContext } from "react";
import { useTheme } from "./useTheme";
import { ComponentState } from "../types/mappings/state-mappings";
import { ColorDefinition } from "../types";
import ComponentManagerContext from "../context/ComponentManagerContext";

export function useComponentTheme(): {
  getComponentVariables: (
    component: string,
    variant?: string,
  ) => Record<string, string | ColorDefinition>;
  getComponentClasses: (component: string, variant?: string) => string;
  getComponentState: (
    component: string,
    variant?: string,
    state?: "default" | "hover" | "active" | "focus" | "disabled",
  ) => ComponentState | undefined;
  getComponentStyles: (
    component: string,
    variant?: string,
    state?: "default" | "hover" | "active" | "focus" | "disabled",
  ) => React.CSSProperties;
} {
  const theme = useTheme();
  // Get the component manager from context
  const componentManager = useContext(ComponentManagerContext);

  if (!componentManager) {
    throw new Error(
      "useComponentTheme must be used within a ComponentManagerProvider",
    );
  }

  return {
    // Get component variables
    getComponentVariables: (
      component: string,
      variant?: string,
    ): Record<string, string | ColorDefinition> => {
      return componentManager.generateComponentVariables(
        component,
        variant,
        // Note: The method signature doesn't include mode and colorScheme parameters
        // so we need to adjust this call
      );
    },

    // Get component classes
    getComponentClasses: (component: string, variant?: string): string => {
      const classes = componentManager.generateComponentClasses(
        component,
        variant,
        theme.themeName, // Pass only colorScheme, as mode is not used in the implementation
      );

      return Object.keys(classes).join(" ");
    },

    // Get component state
    getComponentState: (
      component: string,
      variant?: string,
      state?: "default" | "hover" | "active" | "focus" | "disabled",
    ): ComponentState | undefined => {
      if (state && state !== "default") {
        return componentManager.getInteractiveState(
          component,
          variant,
          state,
          // Note: The method signature doesn't include mode parameter
        );
      }

      return componentManager.getComponentState(
        component,
        variant,
        // Note: The method signature doesn't include mode parameter
      );
    },

    // Get component style object
    getComponentStyles: (
      component: string,
      variant?: string,
      state?: "default" | "hover" | "active" | "focus" | "disabled",
    ): React.CSSProperties => {
      // Use getComponentStyle method which is designed for this purpose
      return componentManager.getComponentStyle(
        component,
        variant,
        state || "default",
      );
    },
  };
}
