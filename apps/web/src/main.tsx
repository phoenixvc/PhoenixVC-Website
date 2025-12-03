import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/theme";
import "./theme/theme.css";
import { logger } from "@/utils/logger";
import { initWebVitals } from "@/utils/performance";

logger.debug("Index file is running");

// Initialize Core Web Vitals monitoring
initWebVitals();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      config={{
        defaultThemeName: "classic",
        defaultMode: "dark",
        useSystem: false,
        storage: {
          type: "localStorage",
          prefix: "my-app-theme"
        },
        transition: {
          duration: 300,
          timing: "ease"
        }
      }}
      className="theme-wrapper"
      onThemeChange={(theme) => {
        logger.debug("Theme changed:", theme);
      }}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
