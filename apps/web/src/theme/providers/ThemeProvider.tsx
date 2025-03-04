// theme/providers/ThemeProvider.tsx
import React from "react";
import { ThemeProviderProps } from "@/theme/types";
import { ThemeErrorBoundary } from "@/theme/components/theme-error-boundary";
import { SystemModeProvider } from "@/SystemModeContext";
import ThemeProviderInner from "./ThemeProviderInner";

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
