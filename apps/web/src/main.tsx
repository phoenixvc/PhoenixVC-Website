import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/theme"; // or use your barrel file import
import "./theme/theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      config={{
        defaultScheme: "classic",  // Use classic color scheme by default
        defaultMode: "dark",        // Set initial mode to light (will be overridden if system mode is enabled)
        useSystem: true,             // Enable system mode so OS settings are applied
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
        console.log(`Theme changed:`, theme);
      }}
    >
      <App />
    </ThemeProvider>
  </StrictMode>
);
