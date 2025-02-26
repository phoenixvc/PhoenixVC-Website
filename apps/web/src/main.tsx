import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/theme"; // or use your barrel file import
import "./theme/theme.css";
console.log("Index file is running");
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      config={{
        defaultScheme: "classic",
        defaultMode: "dark",
        useSystem: true,
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
      }}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
