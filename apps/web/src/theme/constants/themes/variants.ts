// constants/themes/variants.ts
import { BaseColors, ColorScheme } from "../../types/theme.types";

export const COLOR_SCHEMES: Record<ColorScheme, BaseColors> = {
  phoenix: {
    primary: "#ff6b00",
    secondary: "#705c55",
    accent: "#ff8a00",
    background: "#ffffff",
    text: "#705c55",
    muted: "#6b7280",
    border: "#e5e7eb",
  },
  cloud: {
    primary: "#f3f4f6",    // Aligned with Tailwind gray-100
    secondary: "#e5e7eb",   // Aligned with Tailwind gray-200
    accent: "#d1d5db",     // Aligned with Tailwind gray-300
    background: "#ffffff",
    text: "#111827",       // Aligned with Tailwind gray-900
    muted: "#9ca3af",      // Aligned with Tailwind gray-400
    border: "#d1d5db",     // Aligned with Tailwind gray-300
  },
  forest: {
    primary: "#3d633e",
    secondary: "#315a31",
    accent: "#2d4d2d",
    background: "#ffffff",
    text: "#6a5044",
    muted: "#c8d3b0",
    border: "#e5e7eb",
  },
  ocean: {
    primary: "#0077b6",
    secondary: "#0096c7",
    accent: "#023e8a",
    background: "#ffffff",
    text: "#1f2937",      // Aligned with Tailwind gray-800
    muted: "#6b7280",     // Aligned with Tailwind gray-500
    border: "#e5e7eb",    // Aligned with Tailwind gray-200
  },
  lavender: {
    primary: "#8b5cf6",   // Aligned with Tailwind purple-500
    secondary: "#a78bfa", // Aligned with Tailwind purple-400
    accent: "#6d28d9",    // Aligned with Tailwind purple-700
    background: "#ffffff",
    text: "#1f2937",      // Aligned with Tailwind gray-800
    muted: "#6b7280",     // Aligned with Tailwind gray-500
    border: "#e5e7eb",    // Aligned with Tailwind gray-200
  },
  classic: {
    primary: "#222222",
    secondary: "#444444",
    accent: "#666666",
    background: "#f8f9fa",
    text: "#212529",
    muted: "#6c757d",
    border: "#dee2e6",
  },
};

export const DARK_MODE_COLORS: Partial<BaseColors> = {
  background: "#1f2937", // Aligned with Tailwind gray-800
  text: "#f9fafb",      // Aligned with Tailwind gray-50
  muted: "#9ca3af",     // Aligned with Tailwind gray-400
  border: "#374151",    // Aligned with Tailwind gray-700
};
