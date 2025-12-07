// theme-system-init.ts

import { themeStateManager } from "./core";
import { themeCore } from "./core/theme-core";


export function initializeThemeSystem(): void {
  // Connect the components
  themeCore.connectStateManager(themeStateManager);

  console.log("[ThemeSystem] Initialization complete");
}

// NOTE: Auto-initialization has been removed to prevent circular dependency issues.
// The ThemeProvider component now handles initialization properly.
