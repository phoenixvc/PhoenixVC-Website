import { ColorScheme, Mode, ThemeColors } from "../types";

export const DEFAULT_COLOR_SCHEME: ColorScheme = "classic";
export const DEFAULT_MODE: Mode = "light";

// Define theme colors
export const COLOR_SCHEMES: Record<ColorScheme, ThemeColors> = {
  phoenix: {
    primary: "#ff6b00", // Orange-500
    secondary: "#ff8c42", // Orange-400
    accent: "#cc4c00", // Orange-700
    background: "#ffffff", // White
    text: "#1f2937", // Gray-800
    muted: "#6b7280", // Gray-500
    border: "#e5e7eb", // Gray-200
  },
  cloud: {
    primary: "#f0f0f0", // Light Gray-100
    secondary: "#e0e0e0", // Gray-200
    accent: "#d6d6d6", // Gray-300
    background: "#ffffff", // White
    text: "#262626", // Gray-900
    muted: "#9ca3af", // Gray-400
    border: "#cbd5e1", // Gray-300
  },
  forest: {
    primary: "#228b22", // Forest Green
    secondary: "#32cd32", // Lime Green
    accent: "#006400", // Dark Green
    background: "#ffffff", // White
    text: "#1f2937", // Gray-800
    muted: "#6b7280", // Gray-500
    border: "#e5e7eb", // Gray-200
  },
  ocean: {
    primary: "#0077b6", // Deep Blue
    secondary: "#0096c7", // Light Blue
    accent: "#023e8a", // Navy Blue
    background: "#ffffff", // White
    text: "#1f2937", // Gray-800
    muted: "#6b7280", // Gray-500
    border: "#e5e7eb", // Gray-200
  },
  lavender: {
    primary: "#8b5cf6", // Purple-500
    secondary: "#a78bfa", // Purple-400
    accent: "#6d28d9", // Purple-700
    background: "#ffffff", // White
    text: "#1f2937", // Gray-800
    muted: "#6b7280", // Gray-500
    border: "#e5e7eb", // Gray-200
  },
  classic: {
    primary: "#222222", // Dark Gray
    secondary: "#444444", // Medium Gray
    accent: "#666666", // Light Gray
    background: "#f8f9fa", // Near white
    text: "#212529", // Dark text
    muted: "#6c757d", // Muted text
    border: "#dee2e6", // Light gray border
  },
};

// Dark mode overrides
export const DARK_MODE_COLORS: Partial<ThemeColors> = {
  background: "#1f2937", // Gray-800
  text: "#f9fafb", // Gray-50
  muted: "#9ca3af", // Gray-400
  border: "#374151", // Gray-700
};

// Theme transition configurations
export const THEME_TRANSITION_DURATION = "200ms";
export const THEME_TRANSITION_TIMING = "ease-in-out";

// Local storage keys
export const STORAGE_KEYS = {
  COLOR_SCHEME: "theme-color-scheme",
  MODE: "theme-mode",
  USE_SYSTEM: "theme-use-system",
} as const;
