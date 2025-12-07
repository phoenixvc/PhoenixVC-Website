// theme-system-init.ts

import { ThemeStateManager } from "./core";
import { ThemeCore } from "./core/theme-core";


export function initializeThemeSystem(): void {
  // Get the singleton instances
  const themeCore = ThemeCore.getInstance();
  const themeStateManager = ThemeStateManager.getInstance();
  
  // Connect the components
  themeCore.connectStateManager(themeStateManager);

  console.log("[ThemeSystem] Initialization complete");
}

// NOTE: Auto-initialization has been removed to prevent circular dependency issues.
// The ThemeProvider component now handles initialization properly.
