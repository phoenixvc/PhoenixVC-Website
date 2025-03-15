// constants.ts
import { EmployeeData, BlackHoleData } from "./types";

export const DEFAULT_EMPLOYEES: EmployeeData[] = [
  {
    id: "js",
    name: "JS",
    position: "Software Architect",
    mass: 100,
    color: "#60a5fa", // Blue
    image: "https://via.placeholder.com/150/60a5fa/ffffff?text=JS",
    fullName: "Jurie Smit"
  },
  {
    id: "em",
    name: "EM",
    position: "CEO",
    mass: 200,
    color: "#f87171", // Red
    image: "https://via.placeholder.com/150/f87171/ffffff?text=EM",
    fullName: "Eben Mare",
  },
  {
    id: "ym",
    name: "YM",
    position: "CTO",
    mass: 100,
    color: "#4ade80", // Green
    image: "https://via.placeholder.com/150/4ade80/ffffff?text=YM",
    fullName: "Yolandi Mare"
  }
];

export const DEFAULT_BLACK_HOLES: BlackHoleData[] = [
  {
    id: "main",
    x: 0.5, // Center horizontally
    y: 0.5, // Center vertically
    mass: 300,
    particles: 50
  }
];

// Color palettes based on selected scheme
export const getColorPalette = (colorScheme: string) => {
  switch (colorScheme) {
    case "purple":
      return [
        "rgba(147, 51, 234, 0.9)",  // Purple
        "rgba(168, 85, 247, 0.9)",  // Light purple
        "rgba(139, 92, 246, 0.9)",  // Violet
        "rgba(196, 181, 253, 0.9)", // Lavender
        "rgba(255, 255, 255, 0.8)"  // White (for contrast)
      ];
    case "blue":
      return [
        "rgba(59, 130, 246, 0.9)",  // Blue
        "rgba(96, 165, 250, 0.9)",  // Light blue
        "rgba(37, 99, 235, 0.9)",   // Royal blue
        "rgba(191, 219, 254, 0.9)", // Sky blue
        "rgba(255, 255, 255, 0.8)"  // White (for contrast)
      ];
    case "multicolor":
      return [
        "rgba(239, 68, 68, 0.9)",   // Red
        "rgba(249, 115, 22, 0.9)",  // Orange
        "rgba(59, 130, 246, 0.9)",  // Blue
        "rgba(16, 185, 129, 0.9)",  // Green
        "rgba(147, 51, 234, 0.9)",  // Purple
        "rgba(255, 255, 255, 0.8)"  // White (for contrast)
      ];
    case "white":
      return [
        "rgba(255, 255, 255, 0.9)",
        "rgba(255, 255, 255, 0.8)",
        "rgba(255, 255, 255, 0.7)",
        "rgba(255, 255, 255, 0.6)",
        "rgba(255, 255, 255, 1.0)"
      ];
    default:
      return [
        "rgba(255, 255, 255, 0.9)",
        "rgba(255, 255, 255, 0.7)",
        "rgba(255, 255, 255, 0.5)"
      ];
  }
};
