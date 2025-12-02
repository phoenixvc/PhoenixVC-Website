// components/Layout/Starfield/constants.ts
import { BlackHoleData, EmployeeData } from "./types";

  // Default black hole positions
  export const DEFAULT_BLACK_HOLES = [
    { x: 0.2, y: 0.3, radius: 25, color: "#8A2BE2" },
    { x: 0.8, y: 0.7, radius: 30, color: "#8A2BE2" },
  ];

// Default projects data displayed as orbital elements (using EmployeeData interface for compatibility)
// Main projects - larger, more prominent stars with weight based on status
export const DEFAULT_EMPLOYEES: EmployeeData[] = [
  // Main flagship project - Alpha status, heaviest
  {
    id: "mystira",
    name: "Mystira",
    initials: "MY",
    position: "Interactive Storytelling",
    mass: 500, // Heaviest - flagship Alpha project
    color: "#9c27b0", // Purple - for alpha status
    image: "/themes/mystira-icon.png",
    fullName: "Mystira",
    speed: 0.00025,
    title: "Interactive Storytelling Platform (Alpha)",
    bio: "Mystira brings the wonder of storytelling to life for children, parents, and group leaders alike. Each story is grounded in child development research, fostering emotional growth and meaningful connections.",
    department: "Education",
    experience: 0,
    expertise: "Storytelling, Child Development, Education",
    projects: ["Interactive Adventures", "Family Playtime", "Group Sessions"],
    skills: ["Storytelling", "Children", "Interactive", "Education"],
    relatedEmployees: ["phoenixrooivalk", "cognitivemesh"],
    product: "https://mystira.app"
  },
  // Pre-alpha/Seeding projects - smaller
  {
    id: "phoenixrooivalk",
    name: "Phoenix Rooivalk",
    initials: "PR",
    position: "Counter-Drone Platform",
    mass: 200, // Smaller - pre-alpha/seeding
    color: "#795548", // Brown - for pre-alpha/seeding
    image: "/themes/rooivalk-icon.png",
    fullName: "Phoenix Rooivalk",
    speed: 0.0002,
    title: "AI-Powered Counter-Drone Platform (Pre-Alpha)",
    bio: "Phoenix Rooivalk is a sophisticated counter-drone platform leveraging advanced AI for real-time drone detection, classification, and neutralization. Named after the South African Rooivalk attack helicopter.",
    department: "Defense",
    experience: 0,
    expertise: "AI, Machine Learning, Defense Systems",
    projects: ["Drone Detection", "Threat Assessment", "Airspace Protection"],
    skills: ["Counter-Drone", "AI", "Defense", "Security"],
    relatedEmployees: ["mystira", "cognitivemesh"],
    product: "https://phoenixrooivalk.com"
  },
  {
    id: "cognitivemesh",
    name: "Cognitive Mesh",
    initials: "CM",
    position: "AI Framework",
    mass: 200, // Smaller - pre-alpha/seeding
    color: "#795548", // Brown - for pre-alpha/seeding
    image: "/themes/cognitivemesh-icon.png",
    fullName: "Cognitive Mesh",
    speed: 0.00022,
    title: "Enterprise AI Transformation Framework (Pre-Alpha)",
    bio: "Cognitive Mesh is an enterprise-grade AI transformation framework designed to orchestrate multi-agent cognitive systems with institutional-grade security and NIST compliance controls.",
    department: "Enterprise",
    experience: 0,
    expertise: "Multi-Agent AI, Enterprise Security, Governance",
    projects: ["AI Orchestration", "Security Compliance", "Zero-Trust Architecture"],
    skills: ["Multi-Agent", "Enterprise", "Security", "Governance"],
    relatedEmployees: ["mystira", "phoenixrooivalk"],
    product: "https://github.com/justaghost/cognitive-mesh"
  },
  // Smaller secondary/supporting projects
  {
    id: "phoenixvc-website",
    name: "PhoenixVC Website",
    initials: "PW",
    position: "Corporate Website",
    mass: 100, // Small - supporting infrastructure
    color: "#6b7280", // Gray - supporting project
    fullName: "PhoenixVC Website",
    speed: 0.00015,
    title: "Corporate Website",
    bio: "The official Phoenix VC corporate website built with modern web technologies.",
    department: "Infrastructure",
    experience: 0,
    expertise: "React, TypeScript, Azure",
    projects: ["Web Development"],
    skills: ["React", "TypeScript", "Azure"],
    relatedEmployees: ["mystira"],
    product: "https://phoenixvc.tech"
  },
  {
    id: "design-system",
    name: "Design System",
    initials: "DS",
    position: "Component Library",
    mass: 80, // Smallest - internal tooling
    color: "#6b7280", // Gray - supporting project
    fullName: "Phoenix Design System",
    speed: 0.00018,
    title: "Component Library",
    bio: "Shared design system and component library for Phoenix projects.",
    department: "Infrastructure",
    experience: 0,
    expertise: "React Components, Design Tokens",
    projects: ["UI Components"],
    skills: ["Design", "Components", "Tokens"],
    relatedEmployees: ["phoenixvc-website"],
    product: ""
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
