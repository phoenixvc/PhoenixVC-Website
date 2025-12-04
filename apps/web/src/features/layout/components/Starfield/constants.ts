// components/Layout/Starfield/constants.ts
// Re-exports from centralized portfolioData.ts for backward compatibility
import { BlackHoleData, PortfolioProject } from "./types";
import { PORTFOLIO_PROJECTS } from "@/constants/portfolioData";

// Default black hole positions
export const DEFAULT_BLACK_HOLES = [
  { x: 0.2, y: 0.3, radius: 25, color: "#8A2BE2" },
  { x: 0.8, y: 0.7, radius: 30, color: "#8A2BE2" },
];

// Re-export portfolio projects from centralized source
// This maintains backward compatibility with existing imports
export const DEFAULT_PORTFOLIO_PROJECTS: PortfolioProject[] = PORTFOLIO_PROJECTS;



// Alternative black hole configurations for multiple black holes
export const MULTIPLE_BLACK_HOLES: BlackHoleData[] = [
  {
    id: "main",
    x: 0,
    y: 0,
    mass: 100,
    particles: 30
  },
  {
    id: "secondary",
    x: 200,
    y: -150,
    mass: 50,
    particles: 15
  }
];

// CSS module styles (to be imported from a separate file)
export const STYLES = {
  starfieldCanvas: "absolute top-0 left-0 w-full h-full z-0"
};


export const getColorPalette = (
    colorScheme: string = "purple",
    isDarkMode: boolean = true,
    accentColor?: string
  ): string[] => {
    // If custom accent color is provided, create a palette based on it
    if (accentColor) {
      return [
        accentColor,
        `${accentColor}99`, // 60% opacity
        `${accentColor}66`, // 40% opacity
        isDarkMode ? "#ffffff" : "#000000"
      ];
    }

    // Default color palettes
    switch (colorScheme.toLowerCase()) {
      case "blue":
        return isDarkMode
          ? ["#3b82f6", "#60a5fa", "#93c5fd", "#ffffff"] // Dark mode blue
          : ["#1d4ed8", "#3b82f6", "#60a5fa", "#000000"]; // Light mode blue
      case "green":
        return isDarkMode
          ? ["#10b981", "#34d399", "#6ee7b7", "#ffffff"] // Dark mode green
          : ["#059669", "#10b981", "#34d399", "#000000"]; // Light mode green
      case "amber":
        return isDarkMode
          ? ["#f59e0b", "#fbbf24", "#fcd34d", "#ffffff"] // Dark mode amber
          : ["#d97706", "#f59e0b", "#fbbf24", "#000000"]; // Light mode amber
      case "red":
        return isDarkMode
          ? ["#ef4444", "#f87171", "#fca5a5", "#ffffff"] // Dark mode red
          : ["#dc2626", "#ef4444", "#f87171", "#000000"]; // Light mode red
      case "purple":
      default:
        return isDarkMode
          ? ["#9333ea", "#a855f7", "#c084fc", "#ffffff"] // Dark mode purple
          : ["#7e22ce", "#9333ea", "#a855f7", "#000000"]; // Light mode purple
    }
  };
