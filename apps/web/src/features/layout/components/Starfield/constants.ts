// components/Layout/Starfield/constants.ts
import { BlackHoleData, EmployeeData } from "./types";

// Default employees data with more detailed information
export const DEFAULT_EMPLOYEES: EmployeeData[] = [
    {
      id: "js",
      name: "Jurie Smit",
      initials: "JS",
      position: "Software Architect",
      mass: 300,
      color: "#60a5fa", // Blue
      image: "apps/web/public/themes/Jor.png",
      fullName: "Jurie Smit",
      speed: 0.0003
    },
    {
      id: "em",
      name: "Eben Mare",
      initials: "EM",
      position: "CEO",
      mass: 300,
      color: "#f87171", // Red
      image: "apps/web/public/themes/Noster.png",
      fullName: "Eben Mare",
      speed: 0.0001,
    },
    {
      id: "ym",
      name: "Yolandi Mare",
      initials: "YM",
      position: "CTO",
      mass: 150,
      color: "#4ade80", // Green
      image: "apps/web/public/themes/YolandE.png",
      fullName: "Yolandi Mare",
      speed: 0.00005
    }
  ];

// Default black holes configuration
export const DEFAULT_BLACK_HOLES: BlackHoleData[] = [
  {
    id: "main",
    x: 0.5, // Center horizontally
    y: 0.5, // Center vertically
    mass: 300,
    particles: 50
  }
];

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
