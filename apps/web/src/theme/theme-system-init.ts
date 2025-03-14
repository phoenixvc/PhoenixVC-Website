// theme-system-init.ts

import { themeStateManager } from "./core";
import { themeCore } from "./core/theme-core";


export function initializeThemeSystem(): void {
  // Connect the components
  themeCore.connectStateManager(themeStateManager);

  console.log("[ThemeSystem] Initialization complete");
}

// Auto-initialize after a short delay to ensure both modules are loaded
setTimeout(() => {
  initializeThemeSystem();
}, 100);
