// apps/web/src/features/layout/components/Starfield/cosmos/cosmicHierarchy.ts
import { CosmicObject } from "./types";

// Main galaxies representing the primary navigation categories
export const GALAXIES: CosmicObject[] = [
  {
    id: "focus-areas-galaxy",
    name: "Focus Areas Galaxy",
    description: "Investment sectors and technologies we focus on",
    position: { x: 0.3, y: 0.4 },
    size: 0.15,
    level: "galaxy",
    color: "#3498db" // Blue-green for Focus Areas
  },
  {
    id: "portfolio-galaxy",
    name: "Portfolio Galaxy",
    description: "Our investment portfolio and companies",
    position: { x: 0.7, y: 0.3 },
    size: 0.14,
    level: "galaxy",
    color: "#f39c12" // Golden/amber for Portfolio
  },
  {
    id: "information-galaxy",
    name: "Information Galaxy",
    description: "Knowledge and company information",
    position: { x: 0.5, y: 0.7 },
    size: 0.13,
    level: "galaxy",
    color: "#9b59b6" // Purple-pink for Information
  }
];

// Suns representing subcategories
export const SUNS: CosmicObject[] = [
  // Focus Areas Galaxy - Main Focus Area Suns (for the Focus Areas section)
  {
    id: "fintech-blockchain-sun",
    name: "Fintech & Blockchain",
    description: "Financial technology and blockchain innovations",
    position: { x: 0.25, y: 0.35 },
    size: 0.065,
    level: "sun",
    parentId: "focus-areas-galaxy",
    color: "#f39c12" // Golden - for fintech/blockchain
  },
  {
    id: "ai-ml-sun",
    name: "AI & ML",
    description: "Artificial intelligence and machine learning",
    position: { x: 0.35, y: 0.45 },
    size: 0.06,
    level: "sun",
    parentId: "focus-areas-galaxy",
    color: "#3498db" // Blue - for AI/ML
  },
  {
    id: "defense-security-sun",
    name: "Defense & Security",
    description: "Defense technology and security solutions",
    position: { x: 0.28, y: 0.5 },
    size: 0.058,
    level: "sun",
    parentId: "focus-areas-galaxy",
    color: "#e74c3c" // Red - for defense/security
  },
  {
    id: "mobility-transportation-sun",
    name: "Mobility & Transportation",
    description: "Transportation and mobility innovations",
    position: { x: 0.2, y: 0.42 },
    size: 0.055,
    level: "sun",
    parentId: "focus-areas-galaxy",
    color: "#2ecc71" // Green - for mobility
  },

  // Portfolio Galaxy - Focus Area Suns with Portfolio Companies as Planets
  {
    id: "portfolio-ai-ml-sun",
    name: "AI & Machine Learning",
    description: "AI and machine learning portfolio companies",
    position: { x: 0.65, y: 0.25 },
    size: 0.065,
    level: "sun",
    parentId: "portfolio-galaxy",
    color: "#3498db" // Blue - AI/ML
  },
  {
    id: "portfolio-fintech-blockchain-sun",
    name: "Fintech & Blockchain",
    description: "Fintech and blockchain portfolio companies",
    position: { x: 0.75, y: 0.28 },
    size: 0.06,
    level: "sun",
    parentId: "portfolio-galaxy",
    color: "#f39c12" // Golden - fintech/blockchain
  },
  {
    id: "portfolio-defense-security-sun",
    name: "Defense & Security",
    description: "Defense and security portfolio companies",
    position: { x: 0.68, y: 0.35 },
    size: 0.058,
    level: "sun",
    parentId: "portfolio-galaxy",
    color: "#e74c3c" // Red - defense/security
  },
  {
    id: "portfolio-mobility-sun",
    name: "Mobility & Transportation",
    description: "Mobility and transportation portfolio companies",
    position: { x: 0.72, y: 0.40 },
    size: 0.058,
    level: "sun",
    parentId: "portfolio-galaxy",
    color: "#2ecc71" // Green - mobility
  },

  // Information Galaxy - Suns
  {
    id: "blog-categories-sun",
    name: "Blog Categories",
    description: "Our insights and thought leadership",
    position: { x: 0.45, y: 0.65 },
    size: 0.054,
    level: "sun",
    parentId: "information-galaxy",
    color: "#9b59b6"
  },
  {
    id: "company-information-sun",
    name: "Company Information",
    description: "About Phoenix VC",
    position: { x: 0.55, y: 0.75 },
    size: 0.058,
    level: "sun",
    parentId: "information-galaxy",
    color: "#8e44ad"
  },
  {
    id: "resources-sun",
    name: "Resources",
    description: "Research and investment guides",
    position: { x: 0.5, y: 0.6 },
    size: 0.048,
    level: "sun",
    parentId: "information-galaxy",
    color: "#9b59b6"
  },
  {
    id: "community-sun",
    name: "Community",
    description: "Events and newsletters",
    position: { x: 0.6, y: 0.65 },
    size: 0.054,
    level: "sun",
    parentId: "information-galaxy",
    color: "#8e44ad"
  },
  {
    id: "careers-sun",
    name: "Careers",
    description: "Join our team",
    position: { x: 0.42, y: 0.72 },
    size: 0.048,
    level: "sun",
    parentId: "information-galaxy",
    color: "#8e44ad"
  }
];

// Planets representing individual content pages
export const PLANETS: CosmicObject[] = [
  // Fintech & Blockchain Sun - Planets (Focus Area concepts)
  {
    id: "digital-banking",
    name: "Digital Banking",
    description: "Next-generation banking solutions",
    position: { x: 0.23, y: 0.33 },
    size: 0.022,
    level: "planet",
    parentId: "fintech-blockchain-sun",
    color: "#f39c12"
  },
  {
    id: "payment-solutions",
    name: "Payment Solutions",
    description: "Innovative payment technologies",
    position: { x: 0.27, y: 0.32 },
    size: 0.02,
    level: "planet",
    parentId: "fintech-blockchain-sun",
    color: "#e67e22"
  },
  {
    id: "defi-solutions",
    name: "DeFi Solutions",
    description: "Decentralized finance platforms",
    position: { x: 0.26, y: 0.38 },
    size: 0.022,
    level: "planet",
    parentId: "fintech-blockchain-sun",
    color: "#f39c12"
  },
  {
    id: "smart-contracts",
    name: "Smart Contracts",
    description: "Self-executing contract solutions",
    position: { x: 0.24, y: 0.36 },
    size: 0.02,
    level: "planet",
    parentId: "fintech-blockchain-sun",
    color: "#e67e22"
  },
  {
    id: "web3-infrastructure",
    name: "Web3 Infrastructure",
    description: "Web3 and blockchain infrastructure",
    position: { x: 0.22, y: 0.34 },
    size: 0.019,
    level: "planet",
    parentId: "fintech-blockchain-sun",
    color: "#f39c12"
  },

  // AI & ML Sun - Planets (Focus Area concepts)
  {
    id: "data-analytics",
    name: "Data Analytics",
    description: "Advanced data analysis solutions",
    position: { x: 0.33, y: 0.43 },
    size: 0.021,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#3498db"
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    description: "ML algorithms and applications",
    position: { x: 0.37, y: 0.42 },
    size: 0.022,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#2980b9"
  },
  {
    id: "neural-networks",
    name: "Neural Networks",
    description: "Deep learning and neural network solutions",
    position: { x: 0.36, y: 0.47 },
    size: 0.02,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#3498db"
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    description: "Image and video analysis technologies",
    position: { x: 0.34, y: 0.46 },
    size: 0.021,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#2980b9"
  },
  {
    id: "nlp",
    name: "NLP",
    description: "Natural language processing",
    position: { x: 0.32, y: 0.44 },
    size: 0.02,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#3498db"
  },

  // Defense & Security Sun - Planets (Focus Area concepts)
  {
    id: "counter-drone",
    name: "Counter-Drone",
    description: "Counter-drone defense systems",
    position: { x: 0.26, y: 0.48 },
    size: 0.021,
    level: "planet",
    parentId: "defense-security-sun",
    color: "#e74c3c"
  },
  {
    id: "access-control",
    name: "Access Control",
    description: "Digital access management solutions",
    position: { x: 0.3, y: 0.52 },
    size: 0.022,
    level: "planet",
    parentId: "defense-security-sun",
    color: "#c0392b"
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Security solutions and technologies",
    position: { x: 0.27, y: 0.53 },
    size: 0.02,
    level: "planet",
    parentId: "defense-security-sun",
    color: "#e74c3c"
  },
  {
    id: "threat-detection",
    name: "Threat Detection",
    description: "AI-powered threat detection",
    position: { x: 0.29, y: 0.49 },
    size: 0.021,
    level: "planet",
    parentId: "defense-security-sun",
    color: "#c0392b"
  },

  // Mobility & Transportation Sun - Planets (Focus Area concepts)
  {
    id: "ride-sharing",
    name: "Ride Sharing",
    description: "Ride-sharing platforms",
    position: { x: 0.18, y: 0.4 },
    size: 0.02,
    level: "planet",
    parentId: "mobility-transportation-sun",
    color: "#2ecc71"
  },
  {
    id: "urban-mobility",
    name: "Urban Mobility",
    description: "Urban transportation solutions",
    position: { x: 0.22, y: 0.4 },
    size: 0.021,
    level: "planet",
    parentId: "mobility-transportation-sun",
    color: "#27ae60"
  },
  {
    id: "route-optimization",
    name: "Route Optimization",
    description: "Intelligent route planning",
    position: { x: 0.19, y: 0.44 },
    size: 0.022,
    level: "planet",
    parentId: "mobility-transportation-sun",
    color: "#2ecc71"
  },
  {
    id: "smart-transportation",
    name: "Smart Transportation",
    description: "Smart city transportation infrastructure",
    position: { x: 0.21, y: 0.43 },
    size: 0.02,
    level: "planet",
    parentId: "mobility-transportation-sun",
    color: "#27ae60"
  },

  // Portfolio Galaxy - AI & ML Sun - Portfolio Companies as Planets
  {
    id: "mystira-planet",
    name: "Mystira",
    description: "Interactive storytelling adventures for children",
    position: { x: 0.63, y: 0.23 },
    size: 0.024,
    level: "planet",
    parentId: "portfolio-ai-ml-sun",
    color: "#9c27b0" // Purple - Alpha status
  },
  {
    id: "cognitive-mesh-planet",
    name: "Cognitive Mesh",
    description: "Enterprise-grade AI transformation framework",
    position: { x: 0.67, y: 0.24 },
    size: 0.02,
    level: "planet",
    parentId: "portfolio-ai-ml-sun",
    color: "#795548" // Brown - Pre-alpha
  },

  // Portfolio Galaxy - Fintech & Blockchain Sun - Portfolio Companies as Planets
  {
    id: "veritasvault-planet",
    name: "VeritasVault",
    description: "DeFi staking and treasury-backed rewards platform",
    position: { x: 0.73, y: 0.26 },
    size: 0.02,
    level: "planet",
    parentId: "portfolio-fintech-blockchain-sun",
    color: "#795548" // Brown - Pre-alpha
  },

  // Portfolio Galaxy - Defense & Security Sun - Portfolio Companies as Planets
  {
    id: "phoenix-rooivalk-planet",
    name: "Phoenix Rooivalk",
    description: "AI-powered counter-drone defense platform",
    position: { x: 0.66, y: 0.33 },
    size: 0.022,
    level: "planet",
    parentId: "portfolio-defense-security-sun",
    color: "#795548" // Brown - Pre-alpha
  },
  {
    id: "airkey-planet",
    name: "Airkey",
    description: "Digital access management solutions",
    position: { x: 0.7, y: 0.34 },
    size: 0.02,
    level: "planet",
    parentId: "portfolio-defense-security-sun",
    color: "#e67e22" // Orange - Early stage
  },

  // Portfolio Galaxy - Mobility & Transportation Sun - Portfolio Companies as Planets
  {
    id: "hop-planet",
    name: "Hop",
    description: "Innovative transportation technology",
    position: { x: 0.70, y: 0.38 },
    size: 0.02,
    level: "planet",
    parentId: "portfolio-mobility-sun",
    color: "#e67e22" // Orange - Early stage
  },
  {
    id: "chaufher-planet",
    name: "Chaufher",
    description: "Women-focused transportation service",
    position: { x: 0.74, y: 0.39 },
    size: 0.022,
    level: "planet",
    parentId: "portfolio-mobility-sun",
    color: "#e74c3c" // Red - Growth stage
  },

  // Blog Categories Sun - Planets
  {
    id: "market-insights",
    name: "Market Insights",
    description: "Analysis of market trends",
    position: { x: 0.43, y: 0.63 },
    size: 0.02,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#9b59b6"
  },
  {
    id: "technology-trends",
    name: "Technology Trends",
    description: "Emerging technology insights",
    position: { x: 0.47, y: 0.62 },
    size: 0.021,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#8e44ad"
  },
  {
    id: "investment-strategy",
    name: "Investment Strategy",
    description: "Strategic investment approaches",
    position: { x: 0.46, y: 0.67 },
    size: 0.022,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#9b59b6"
  },
  {
    id: "founder-stories",
    name: "Founder Stories",
    description: "Interviews with startup founders",
    position: { x: 0.44, y: 0.66 },
    size: 0.02,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#8e44ad"
  },
  {
    id: "industry-analysis",
    name: "Industry Analysis",
    description: "Deep dives into specific industries",
    position: { x: 0.45, y: 0.64 },
    size: 0.019,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#9b59b6"
  },

  // Company Information Sun - Planets
  {
    id: "about-us",
    name: "About Us",
    description: "Our story and mission",
    position: { x: 0.53, y: 0.73 },
    size: 0.022,
    level: "planet",
    parentId: "company-information-sun",
    color: "#8e44ad"
  },
  {
    id: "vision-mission",
    name: "Vision & Mission",
    description: "Our goals and principles",
    position: { x: 0.57, y: 0.72 },
    size: 0.021,
    level: "planet",
    parentId: "company-information-sun",
    color: "#9b59b6"
  },
  {
    id: "contact",
    name: "Contact",
    description: "Get in touch with us",
    position: { x: 0.56, y: 0.77 },
    size: 0.02,
    level: "planet",
    parentId: "company-information-sun",
    color: "#8e44ad"
  },
  {
    id: "team",
    name: "Team",
    description: "Meet our team",
    position: { x: 0.54, y: 0.76 },
    size: 0.021,
    level: "planet",
    parentId: "company-information-sun",
    color: "#9b59b6"
  },
  {
    id: "history",
    name: "History",
    description: "Our journey through the years",
    position: { x: 0.52, y: 0.74 },
    size: 0.019,
    level: "planet",
    parentId: "company-information-sun",
    color: "#8e44ad"
  },

  // Resources Sun - Planets
  {
    id: "investment-guides",
    name: "Investment Guides",
    description: "Guides for potential investors",
    position: { x: 0.48, y: 0.58 },
    size: 0.02,
    level: "planet",
    parentId: "resources-sun",
    color: "#9b59b6"
  },
  {
    id: "market-research",
    name: "Market Research",
    description: "In-depth industry research",
    position: { x: 0.52, y: 0.59 },
    size: 0.021,
    level: "planet",
    parentId: "resources-sun",
    color: "#8e44ad"
  },
  {
    id: "startup-toolkit",
    name: "Startup Toolkit",
    description: "Resources for entrepreneurs",
    position: { x: 0.51, y: 0.62 },
    size: 0.022,
    level: "planet",
    parentId: "resources-sun",
    color: "#9b59b6"
  },
  {
    id: "investor-education",
    name: "Investor Education",
    description: "Educational resources for investors",
    position: { x: 0.49, y: 0.61 },
    size: 0.019,
    level: "planet",
    parentId: "resources-sun",
    color: "#8e44ad"
  },

  // Community Sun - Planets
  {
    id: "events",
    name: "Events",
    description: "Upcoming events and conferences",
    position: { x: 0.58, y: 0.63 },
    size: 0.021,
    level: "planet",
    parentId: "community-sun",
    color: "#8e44ad"
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Subscribe to our newsletter",
    position: { x: 0.62, y: 0.64 },
    size: 0.02,
    level: "planet",
    parentId: "community-sun",
    color: "#9b59b6"
  },
  {
    id: "partnerships",
    name: "Partnerships",
    description: "Partner with Phoenix VC",
    position: { x: 0.61, y: 0.67 },
    size: 0.022,
    level: "planet",
    parentId: "community-sun",
    color: "#8e44ad"
  },
  {
    id: "community-forum",
    name: "Community Forum",
    description: "Join our online community",
    position: { x: 0.59, y: 0.66 },
    size: 0.019,
    level: "planet",
    parentId: "community-sun",
    color: "#9b59b6"
  },

  // Careers Sun - Planets (New)
  {
    id: "open-positions",
    name: "Open Positions",
    description: "Current job openings",
    position: { x: 0.40, y: 0.70 },
    size: 0.02,
    level: "planet",
    parentId: "careers-sun",
    color: "#8e44ad"
  },
  {
    id: "internships",
    name: "Internships",
    description: "Student and graduate opportunities",
    position: { x: 0.44, y: 0.71 },
    size: 0.019,
    level: "planet",
    parentId: "careers-sun",
    color: "#9b59b6"
  },
  {
    id: "company-culture",
    name: "Company Culture",
    description: "Life at Phoenix VC",
    position: { x: 0.43, y: 0.74 },
    size: 0.021,
    level: "planet",
    parentId: "careers-sun",
    color: "#8e44ad"
  },
  {
    id: "benefits",
    name: "Benefits",
    description: "Employee benefits and perks",
    position: { x: 0.41, y: 0.73 },
    size: 0.018,
    level: "planet",
    parentId: "careers-sun",
    color: "#9b59b6"
  }
];

// Special cosmic objects including team members and the black hole
export const SPECIAL_COSMIC_OBJECTS: CosmicObject[] = [
  // Team members as a special binary sun system
  {
    id: "team-sun-system",
    name: "Team Binary System",
    description: "Our leadership team",
    position: { x: 0.4, y: 0.3 },
    size: 0.06,
    level: "special",
    color: "#f1c40f",
    type: "binary" // Binary star system for team
  },

  // Team members - only EM (founder) and JS (CTO)
  {
    id: "em-founder",
    name: "EM",
    description: "Founder of Phoenix VC",
    position: { x: 0.38, y: 0.28 },
    size: 0.04,
    level: "special",
    parentId: "team-sun-system",
    color: "#f1c40f",
    type: "star"
  },
  {
    id: "js-cto",
    name: "JS",
    description: "Chief Technology Officer",
    position: { x: 0.42, y: 0.32 },
    size: 0.035,
    level: "special",
    parentId: "team-sun-system",
    color: "#e67e22",
    type: "star"
  },

  // Black hole at the center of the universe
  {
    id: "central-black-hole",
    name: "Central Black Hole",
    description: "The gravitational center of our cosmic navigation",
    position: { x: 0.5, y: 0.5 },
    size: 0.04,
    level: "special",
    color: "#000000",
    type: "black-hole"
  }
];

// Helper functions
export function getAllCosmicObjects(): CosmicObject[] {
  return [...GALAXIES, ...SUNS, ...PLANETS, ...SPECIAL_COSMIC_OBJECTS];
}

export function getObjectsByLevel(level: string): CosmicObject[] {
  return getAllCosmicObjects().filter(obj => obj.level === level);
}

export function getObjectById(id: string): CosmicObject | undefined {
  return getAllCosmicObjects().find(obj => obj.id === id);
}

export function getChildrenOf(parentId: string): CosmicObject[] {
  return getAllCosmicObjects().filter(obj => obj.parentId === parentId);
}

export function getSunsForGalaxy(galaxyId: string): CosmicObject[] {
  return SUNS.filter(sun => sun.parentId === galaxyId);
}

export function getParentGalaxy(sunId: string): CosmicObject | undefined {
  const sun = SUNS.find(sun => sun.id === sunId);
  if (!sun) return undefined;
  return GALAXIES.find(galaxy => galaxy.id === sun.parentId);
}
