// theme/utils/register-default-components.ts
import { themeCore } from "../core/theme-core";
import { ComponentVariantType } from "../types/mappings/component-variants";

/**
 * Register default components that might be missing from the registry
 */
export function registerDefaultComponents() {
  const missingComponents = [
    "logo",
    "header",
    "footer",
    "navigation",
    "sidebar",
    "card",
    "modal",
    "dropdown",
    // Add any other components that are showing errors
  ];

  // Get the style manager from themeCore
  const styleManager = themeCore.getStyleManager();

  if (styleManager) {
    // Register each missing component with a default configuration
    missingComponents.forEach(component => {
      try {
        // This will trigger the generation of a default variant if one doesn't exist
        // and automatically register it in the component registry
        styleManager.getComponentStyle(component, "default", "default");
      } catch (error) {
        console.error(`Failed to register default component: ${component}`, error);
      }
    });
  }
}
