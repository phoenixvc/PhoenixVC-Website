// components/Layout/Starfield/constants.ts
import { BlackHoleData, PortfolioProject } from "./types";

  // Default black hole positions
  export const DEFAULT_BLACK_HOLES = [
    { x: 0.2, y: 0.3, radius: 25, color: "#8A2BE2" },
    { x: 0.8, y: 0.7, radius: 30, color: "#8A2BE2" },
  ];

// Default portfolio projects data displayed as orbital elements
// Main projects - larger, more prominent stars with weight based on status
// Each project has a focusArea that determines which sun it orbits around
export const DEFAULT_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  // AI & Machine Learning Focus Area
  {
    id: "mystira",
    name: "Mystira",
    initials: "MY",
    position: "Interactive Storytelling",
    mass: 500, // Heaviest - flagship Alpha project
    color: "#9c27b0", // Purple - for alpha status
    image: "/themes/mystira-icon.png",
    fullName: "Mystira",
    speed: 0.000025, // Slowed down by factor of 10
    title: "Interactive Storytelling Platform (Alpha)",
    bio: "Mystira brings the wonder of storytelling to life for children, parents, and group leaders alike. Each story is grounded in child development research, fostering emotional growth and meaningful connections.",
    department: "Education",
    experience: 0,
    expertise: "Storytelling, Child Development, Education",
    projects: ["Interactive Adventures", "Family Playtime", "Group Sessions"],
    skills: ["Storytelling", "Children", "Interactive", "Education"],
    relatedProjects: ["phoenixrooivalk", "cognitivemesh"],
    product: "https://mystira.app",
    focusArea: "ai-ml"
  },
  {
    id: "cognitivemesh",
    name: "Cognitive Mesh",
    initials: "CM",
    position: "AI Framework",
    mass: 150, // Medium - pre-alpha/seeding
    color: "#795548", // Brown - for pre-alpha/seeding
    image: "/themes/cognitivemesh-icon.png",
    fullName: "Cognitive Mesh",
    speed: 0.000022, // Slowed down by factor of 10
    title: "Enterprise AI Transformation Framework (Pre-Alpha)",
    bio: "Cognitive Mesh is an enterprise-grade AI transformation framework designed to orchestrate multi-agent cognitive systems with institutional-grade security and NIST compliance controls.",
    department: "Enterprise",
    experience: 0,
    expertise: "Multi-Agent AI, Enterprise Security, Governance",
    projects: ["AI Orchestration", "Security Compliance", "Zero-Trust Architecture"],
    skills: ["Multi-Agent", "Enterprise", "Security", "Governance"],
    relatedProjects: ["mystira", "phoenixrooivalk"],
    product: "https://github.com/justaghost/cognitive-mesh",
    focusArea: "ai-ml"
  },

  // Defense & Security Focus Area
  {
    id: "phoenixrooivalk",
    name: "Phoenix Rooivalk",
    initials: "PR",
    position: "Counter-Drone Platform",
    mass: 200, // Smaller - pre-alpha/seeding
    color: "#795548", // Brown - for pre-alpha/seeding
    image: "/themes/rooivalk-icon.png",
    fullName: "Phoenix Rooivalk",
    speed: 0.00002, // Slowed down by factor of 10
    title: "AI-Powered Counter-Drone Platform (Pre-Alpha)",
    bio: "Phoenix Rooivalk is a sophisticated counter-drone platform leveraging advanced AI for real-time drone detection, classification, and neutralization. Named after the South African Rooivalk attack helicopter.",
    department: "Defense",
    experience: 0,
    expertise: "AI, Machine Learning, Defense Systems",
    projects: ["Drone Detection", "Threat Assessment", "Airspace Protection"],
    skills: ["Counter-Drone", "AI", "Defense", "Security"],
    relatedProjects: ["mystira", "cognitivemesh"],
    product: "https://phoenixrooivalk.com",
    focusArea: "defense-security"
  },
  {
    id: "airkey",
    name: "Airkey",
    initials: "AK",
    position: "Access Management",
    mass: 150, // Medium - early stage investment
    color: "#e67e22", // Orange - early stage
    fullName: "Airkey Ltd",
    speed: 0.000019, // Slowed down by factor of 10
    title: "Digital Access Management (Early Stage)",
    bio: "Airkey Ltd provides innovative digital access management solutions that enable secure, keyless entry systems for commercial and residential properties.",
    department: "Security",
    experience: 0,
    expertise: "Access Control, IoT, Mobile Security",
    projects: ["Keyless Entry", "Smart Access"],
    skills: ["Access Control", "Security", "IoT", "Mobile"],
    relatedProjects: ["phoenixrooivalk", "hop", "chaufher"],
    product: "",
    focusArea: "defense-security"
  },

  // Fintech & Blockchain Focus Area
  {
    id: "veritasvault",
    name: "VeritasVault",
    initials: "VV",
    position: "DeFi Platform",
    mass: 80, // Smallest - pre-alpha/concept stage
    color: "#795548", // Brown - for pre-alpha
    fullName: "VeritasVault",
    speed: 0.000020, // Slowed down by factor of 10
    title: "DeFi Staking Platform (Pre-Alpha)",
    bio: "VeritasVault is a decentralized finance platform offering transparent, treasury-backed staking rewards with auto-compounding yields.",
    department: "Blockchain",
    experience: 0,
    expertise: "DeFi, Staking, Smart Contracts",
    projects: ["Staking Rewards", "Treasury Management"],
    skills: ["DeFi", "Blockchain", "Staking", "Crypto", "Web3"],
    relatedProjects: ["cognitivemesh", "airkey"],
    product: "https://veritasvault.net",
    focusArea: "fintech-blockchain"
  },

  // Mobility & Transportation Focus Area
  {
    id: "hop",
    name: "Hop",
    initials: "HP",
    position: "Transportation Tech",
    mass: 150, // Medium - early stage investment
    color: "#e67e22", // Orange - early stage
    fullName: "Hop Pty Ltd",
    speed: 0.000017, // Slowed down by factor of 10
    title: "Innovative Transportation Technology (Early Stage)",
    bio: "Hop Pty Ltd is revolutionizing urban mobility with innovative transportation technology solutions that connect commuters with efficient, sustainable transport options.",
    department: "Mobility",
    experience: 0,
    expertise: "Transportation, Urban Mobility, Route Optimization",
    projects: ["Smart Mobility", "Route Planning"],
    skills: ["Transportation", "Mobility", "Smart City", "Sustainability"],
    relatedProjects: ["airkey", "chaufher"],
    product: "",
    focusArea: "mobility-transportation"
  },
  {
    id: "chaufher",
    name: "Chaufher",
    initials: "CH",
    position: "Women's Transportation",
    mass: 180, // Larger - growth stage investment
    color: "#e74c3c", // Red - growth stage
    fullName: "Chaufher Pty Ltd",
    speed: 0.000016, // Slowed down by factor of 10
    title: "Women-Focused Transportation (Growth Stage)",
    bio: "Chaufher Pty Ltd is a women-focused transportation service designed to provide safe, reliable rides for women, by women.",
    department: "Mobility",
    experience: 0,
    expertise: "Transportation, Safety, Ride-Sharing",
    projects: ["Safe Rides", "Women's Transport"],
    skills: ["Transportation", "Safety", "Women-Focused", "Ride-Sharing"],
    relatedProjects: ["airkey", "hop"],
    product: "",
    focusArea: "mobility-transportation"
  },

  // Supporting Infrastructure (no specific focus area - orbits the central black hole)
  {
    id: "phoenixvc-website",
    name: "PhoenixVC Website",
    initials: "PW",
    position: "Corporate Website",
    mass: 100, // Small - supporting infrastructure
    color: "#6b7280", // Gray - supporting project
    fullName: "PhoenixVC Website",
    speed: 0.000015, // Slowed down by factor of 10
    title: "Corporate Website",
    bio: "The official Phoenix VC corporate website built with modern web technologies.",
    department: "Infrastructure",
    experience: 0,
    expertise: "React, TypeScript, Azure",
    projects: ["Web Development"],
    skills: ["React", "TypeScript", "Azure"],
    relatedProjects: ["mystira"],
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
    speed: 0.000018, // Slowed down by factor of 10
    title: "Component Library",
    bio: "Shared design system and component library for Phoenix projects.",
    department: "Infrastructure",
    experience: 0,
    expertise: "React Components, Design Tokens",
    projects: ["UI Components"],
    skills: ["Design", "Components", "Tokens"],
    relatedProjects: ["phoenixvc-website"],
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
