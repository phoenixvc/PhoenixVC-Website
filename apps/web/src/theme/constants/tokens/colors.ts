// constants/tokens/colors.ts

// Base color palette
export const baseColors = {
  white: "#ffffff",
  black: "#000000",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  orange: {
    500: "#ff6b00",
    600: "#ff8a00",
  },
  green: {
    500: "#3d633e",
    600: "#315a31",
    700: "#2d4d2d",
  },
  blue: {
    500: "#0077b6",
    600: "#0096c7",
    700: "#023e8a",
  },
  purple: {
    400: "#a78bfa",
    500: "#8b5cf6",
    700: "#6d28d9",
  },
} as const;

// Brand colors - centralized heading and accent colors
export const brandColors = {
  // Primary heading gradient colors (used for section titles)
  heading: {
    primary: "#9333ea",   // Purple - main heading color
    secondary: "#7c3aed", // Violet - secondary heading color
    gradient: "linear-gradient(90deg, #9333ea 0%, #7c3aed 100%)",
  },
  // Status colors for portfolio items
  status: {
    alpha: "#9c27b0",
    preAlpha: "#795548",
    earlyStage: "#e67e22",
    growth: "#e74c3c",
    live: "#4caf50",
    beta: "#ff9800",
    development: "#2196f3",
  },
} as const;

// Semantic colors
export const semanticColors = {
  success: "#2E7D32",
  warning: "#F57C00",
  error: "#C62828",
  info: "#1976D2",
};

// Theme-specific tokens
export const themeTokens = {
  classic: {
    light: {
      primary: "#222222",
      secondary: "#444444",
      accent: "#666666",
      background: "#f8f9fa",
      text: "#212529",
      muted: "#6c757d",
      border: "#dee2e6",
    },
    dark: {
      primary: "#f8f9fa",
      secondary: "#e9ecef",
      accent: "#dee2e6",
      background: "#212529",
      text: "#f8f9fa",
      muted: "#adb5bd",
      border: "#495057",
    }
  },
  ocean: {
    light: {
      primary: baseColors.blue[500],
      secondary: baseColors.blue[600],
      accent: baseColors.blue[700],
      background: baseColors.white,
      text: baseColors.gray[800],
      muted: baseColors.gray[500],
      border: baseColors.gray[200],
    },
    dark: {
      primary: baseColors.blue[500],
      secondary: baseColors.blue[600],
      accent: baseColors.blue[700],
      background: baseColors.gray[800],
      text: baseColors.gray[50],
      muted: baseColors.gray[400],
      border: baseColors.gray[700],
    }
  },
  lavender: {
    light: {
      primary: baseColors.purple[500],
      secondary: baseColors.purple[400],
      accent: baseColors.purple[700],
      background: baseColors.white,
      text: baseColors.gray[800],
      muted: baseColors.gray[500],
      border: baseColors.gray[200],
    },
    dark: {
      primary: baseColors.purple[500],
      secondary: baseColors.purple[400],
      accent: baseColors.purple[700],
      background: baseColors.gray[800],
      text: baseColors.gray[50],
      muted: baseColors.gray[400],
      border: baseColors.gray[700],
    }
  },
  phoenix: {
    light: {
      primary: baseColors.orange[500],
      secondary: "#705c55",
      accent: baseColors.orange[600],
      background: baseColors.white,
      text: "#705c55",
      muted: baseColors.gray[500],
      border: baseColors.gray[200],
    },
    dark: {
      primary: baseColors.orange[500],
      secondary: "#705c55",
      accent: baseColors.orange[600],
      background: baseColors.gray[800],
      text: baseColors.gray[50],
      muted: baseColors.gray[400],
      border: baseColors.gray[700],
    }
  },
  forest: {
    light: {
      primary: baseColors.green[500],
      secondary: baseColors.green[600],
      accent: baseColors.green[700],
      background: baseColors.white,
      text: "#6a5044",
      muted: "#c8d3b0",
      border: baseColors.gray[200],
    },
    dark: {
      primary: baseColors.green[500],
      secondary: baseColors.green[600],
      accent: baseColors.green[700],
      background: baseColors.gray[800],
      text: baseColors.gray[50],
      muted: baseColors.gray[400],
      border: baseColors.gray[700],
    }
  },
  cloud: {
    light: {
      primary: baseColors.gray[100],
      secondary: baseColors.gray[200],
      accent: baseColors.gray[300],
      background: baseColors.white,
      text: baseColors.gray[900],
      muted: baseColors.gray[400],
      border: baseColors.gray[300],
    },
    dark: {
      primary: baseColors.gray[700],
      secondary: baseColors.gray[600],
      accent: baseColors.gray[500],
      background: baseColors.gray[800],
      text: baseColors.gray[50],
      muted: baseColors.gray[400],
      border: baseColors.gray[700],
    }
  }
} as const;
