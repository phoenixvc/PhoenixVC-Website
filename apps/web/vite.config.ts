import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCase", // Ensures CSS Modules are properly read
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  server: {
    fs: {
      allow: [".."], // Allows access to parent directories (needed for workspaces)
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("/react/")) {
              return "vendor-react";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
  },
});
