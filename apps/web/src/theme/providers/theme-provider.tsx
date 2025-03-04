import React from "react";
import { ThemeProviderProps } from "@/theme/types";
import { ThemeErrorBoundary } from "@/theme/components/theme-error-boundary";
import { SystemModeProvider } from "@/SystemModeContext";
import ThemeProviderInner from "./theme-provider-inner";

// Main ThemeProvider that wraps SystemModeProvider
export const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  return (
    <ThemeErrorBoundary>
      <SystemModeProvider>
        <ThemeProviderInner {...props} />
      </SystemModeProvider>
    </ThemeErrorBoundary>
  );
};

export { useTheme } from "./theme-context";
