import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/theme";
import "./theme/theme.css";
import { logger, initWebVitals, performanceMonitor, featureFlags } from "@/utils";

logger.debug("Application starting");

// Initialize Core Web Vitals monitoring
initWebVitals();

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  performanceMonitor.setEnabled(true);
  logger.info("Performance monitoring enabled");
  logger.info(`Feature flags: ${featureFlags.getSummary()}`);
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      config={{
        defaultThemeName: "classic",
        defaultMode: "dark",
        useSystem: false,
        storage: {
          type: "localStorage",
          prefix: "my-app-theme",
        },
        transition: {
          duration: 300,
          timing: "ease",
        },
      }}
      className="theme-wrapper"
      onThemeChange={(theme) => {
        logger.debug("Theme changed", theme);
      }}
    >
      <App />
    </ThemeProvider>
  </StrictMode>,
);
