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
    },
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
    // Increase chunk size warning limit since we have a large app
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Use manual chunks to split vendor code
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react/jsx-runtime"],
          "vendor-router": ["react-router", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
  },
});
