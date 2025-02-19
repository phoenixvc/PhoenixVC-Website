import { ColorScheme, Mode, ThemeColors } from "../types";

export const DEFAULT_COLOR_SCHEME: ColorScheme = "classic";
export const DEFAULT_MODE: Mode = "light";

// Define theme colors (approximate hex values converted from the CSS HSL tokens)
export const COLOR_SCHEMES: Record<ColorScheme, ThemeColors> = {
  phoenix: {
    primary: "#ff6b00",      // approximates HSL(32, 100%, 50%)
    secondary: "#705c55",     // approximates HSL(15, 23%, 42%)
    accent: "#ff8a00",        // approximates HSL(24, 96%, 60%)
    background: "#ffffff",     // white
    text: "#705c55",          // same as secondary
    muted: "#6b7280",         // unchanged
    border: "#e5e7eb",        // unchanged
  },
  cloud: {
    primary: "#f0f0f0",       // Light Gray-100
    secondary: "#e0e0e0",      // Gray-200
    accent: "#d6d6d6",        // Gray-300
    background: "#ffffff",     // white
    text: "#262626",          // Gray-900
    muted: "#9ca3af",         // Gray-400
    border: "#cbd5e1",        // Gray-300
  },
  forest: {
    primary: "#3d633e",       // approximates HSL(120, 40%, 35%)
    secondary: "#315a31",      // approximates HSL(120, 50%, 30%)
    accent: "#2d4d2d",         // approximates HSL(120, 60%, 25%)
    background: "#ffffff",     // white
    text: "#6a5044",           // approximates HSL(15, 23%, 42%) for a muted dark tone
    muted: "#c8d3b0",          // light, muted green
    border: "#e5e7eb",         // unchanged
  },
  ocean: {
    primary: "#0077b6",       // Deep Blue (unchanged)
    secondary: "#0096c7",     // Light Blue
    accent: "#023e8a",        // Navy Blue
    background: "#ffffff",     // white
    text: "#1f2937",          // Gray-800
    muted: "#6b7280",         // unchanged
    border: "#e5e7eb",        // unchanged
  },
  lavender: {
    primary: "#8b5cf6",       // Purple-500 (unchanged)
    secondary: "#a78bfa",     // Purple-400
    accent: "#6d28d9",        // Purple-700
    background: "#ffffff",     // white
    text: "#1f2937",          // Gray-800
    muted: "#6b7280",         // unchanged
    border: "#e5e7eb",        // unchanged
  },
  classic: {
    primary: "#222222",       // Dark Gray (unchanged)
    secondary: "#444444",     // Medium Gray
    accent: "#666666",        // Light Gray
    background: "#f8f9fa",     // Near white
    text: "#212529",          // Dark text
    muted: "#6c757d",         // Muted text
    border: "#dee2e6",        // Light gray border
  },
};

// Dark mode overrides
export const DARK_MODE_COLORS: Partial<ThemeColors> = {
  background: "#1f2937", // Gray-800
  text: "#f9fafb",       // Gray-50
  muted: "#9ca3af",      // Gray-400
  border: "#374151",     // Gray-700
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
