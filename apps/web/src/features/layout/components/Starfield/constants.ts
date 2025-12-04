// components/Layout/Starfield/constants.ts
// Re-exports from centralized portfolioData.ts for backward compatibility
import { BlackHoleData, PortfolioProject } from "./types";
import { PORTFOLIO_PROJECTS } from "@/constants/portfolioData";

// Randomized black hole positions - generated fresh on each page load
// Constraints: away from edges and from each other
const BH_EDGE_PADDING = 0.15; // Minimum distance from edges
const BH_MIN_DISTANCE = 0.35; // Minimum distance between black holes

/**
 * Generate randomized black hole positions with proper spacing
 */
function generateRandomBlackHolePositions(): Array<{ x: number; y: number; radius: number; color: string }> {
  const positions: Array<{ x: number; y: number; radius: number; color: string }> = [];
  const maxAttempts = 50;

  for (let i = 0; i < 2; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0, y = 0;

    while (!validPosition && attempts < maxAttempts) {
      // Generate random position within bounds
      x = BH_EDGE_PADDING + Math.random() * (1 - 2 * BH_EDGE_PADDING);
      y = BH_EDGE_PADDING + Math.random() * (1 - 2 * BH_EDGE_PADDING);

      // Check distance from existing black holes
      validPosition = true;
      for (const pos of positions) {
        const dx = x - pos.x;
        const dy = y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < BH_MIN_DISTANCE) {
          validPosition = false;
          break;
        }
      }
      attempts++;
    }

    // Fallback if no valid position found
    if (!validPosition) {
      x = i === 0 ? 0.25 : 0.75;
      y = i === 0 ? 0.35 : 0.65;
    }

    // Random radius variation (25-35)
    const radius = 25 + Math.random() * 10;

    positions.push({ x, y, radius, color: "#8A2BE2" });
  }

  return positions;
}

// Generate positions once when module loads (fresh on each page refresh)
export const DEFAULT_BLACK_HOLES = generateRandomBlackHolePositions();

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
