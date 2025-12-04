/// <reference types="vitest/config" />
/* eslint-disable no-undef -- __dirname compatibility for ES modules */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.stories.{ts,tsx}",
        "src/**/*.test.{ts,tsx}",
        "src/App.tsx",
        "src/decision-form-pillars.tsx",
        "src/decision-form-style.tsx",
      ],
    }),
  ],
  css: {
    modules: {
      localsConvention: "camelCase", // Ensures CSS Modules are properly read
    },
  },
  build: {
    lib: {
      entry: path.resolve(dirname, "src/index.ts"),
      name: "PhoenixDesignSystem",
      fileName: (format) => `phoenix-design-system.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css")
            return "phoenix-design-system.css";
          return assetInfo.name;
        },
      },
    },
    sourcemap: true,
    minify: "terser",
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      "@components": path.resolve(dirname, "./src/components"),
      "@styles": path.resolve(dirname, "./src/styles"),
      "@utils": path.resolve(dirname, "./src/utils"),
    },
  },
});
