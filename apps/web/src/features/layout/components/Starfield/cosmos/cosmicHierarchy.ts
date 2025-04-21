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
  // Focus Areas Galaxy - Suns
  {
    id: "fintech-sun",
    name: "Fintech",
    description: "Financial technology innovations",
    position: { x: 0.25, y: 0.35 },
    size: 0.06,
    level: "sun",
    parentId: "focus-areas-galaxy",
    color: "#2ecc71"
  },
  {
    id: "blockchain-sun",
    name: "Blockchain",
    description: "Distributed ledger technologies",
    position: { x: 0.35, y: 0.45 },
    size: 0.05,
    level: "sun",
    parentId: "focus-areas-galaxy",
    color: "#1abc9c"
  },
  {
    id: "ai-ml-sun",
    name: "AI & ML",
    description: "Artificial intelligence and machine learning",
    position: { x: 0.28, y: 0.5 },
    size: 0.055,
    level: "sun",
    parentId: "focus-areas-galaxy",
    color: "#3498db"
  },
  {
    id: "other-tech-sun",
    name: "Other Tech",
    description: "Other emerging technologies",
    position: { x: 0.2, y: 0.42 },
    size: 0.045,
    level: "sun",
    parentId: "focus-areas-galaxy",
    color: "#16a085"
  },

  // Portfolio Galaxy - Suns
  {
    id: "early-stage-sun",
    name: "Early Stage",
    description: "Early-stage portfolio companies",
    position: { x: 0.65, y: 0.25 },
    size: 0.055,
    level: "sun",
    parentId: "portfolio-galaxy",
    color: "#e67e22"
  },
  {
    id: "growth-stage-sun",
    name: "Growth Stage",
    description: "Growth-stage portfolio companies",
    position: { x: 0.75, y: 0.28 },
    size: 0.06,
    level: "sun",
    parentId: "portfolio-galaxy",
    color: "#d35400"
  },
  {
    id: "crypto-investments-sun",
    name: "Crypto Investments",
    description: "Blockchain and cryptocurrency investments",
    position: { x: 0.68, y: 0.35 },
    size: 0.05,
    level: "sun",
    parentId: "portfolio-galaxy",
    color: "#f39c12"
  },
  {
    id: "strategic-partners-sun",
    name: "Strategic Partners",
    description: "Key strategic partnerships",
    position: { x: 0.72, y: 0.38 },
    size: 0.055,
    level: "sun",
    parentId: "portfolio-galaxy",
    color: "#e74c3c"
  },

  // Information Galaxy - Suns
  {
    id: "blog-categories-sun",
    name: "Blog Categories",
    description: "Our insights and thought leadership",
    position: { x: 0.45, y: 0.65 },
    size: 0.05,
    level: "sun",
    parentId: "information-galaxy",
    color: "#9b59b6"
  },
  {
    id: "company-information-sun",
    name: "Company Information",
    description: "About Phoenix VC",
    position: { x: 0.55, y: 0.75 },
    size: 0.055,
    level: "sun",
    parentId: "information-galaxy",
    color: "#8e44ad"
  },
  {
    id: "resources-sun",
    name: "Resources",
    description: "Research and investment guides",
    position: { x: 0.5, y: 0.6 },
    size: 0.045,
    level: "sun",
    parentId: "information-galaxy",
    color: "#9b59b6"
  },
  {
    id: "community-sun",
    name: "Community",
    description: "Events and newsletters",
    position: { x: 0.6, y: 0.65 },
    size: 0.05,
    level: "sun",
    parentId: "information-galaxy",
    color: "#8e44ad"
  },
  {
    id: "careers-sun",
    name: "Careers",
    description: "Join our team",
    position: { x: 0.42, y: 0.72 },
    size: 0.045,
    level: "sun",
    parentId: "information-galaxy",
    color: "#8e44ad"
  }
];

// Planets representing individual content pages
export const PLANETS: CosmicObject[] = [
  // Fintech Sun - Planets
  {
    id: "digital-banking",
    name: "Digital Banking",
    description: "Next-generation banking solutions",
    position: { x: 0.23, y: 0.33 },
    size: 0.02,
    level: "planet",
    parentId: "fintech-sun",
    color: "#2ecc71"
  },
  {
    id: "payment-solutions",
    name: "Payment Solutions",
    description: "Innovative payment technologies",
    position: { x: 0.27, y: 0.32 },
    size: 0.018,
    level: "planet",
    parentId: "fintech-sun",
    color: "#27ae60"
  },
  {
    id: "wealth-management",
    name: "Wealth Management",
    description: "Digital wealth management platforms",
    position: { x: 0.26, y: 0.38 },
    size: 0.019,
    level: "planet",
    parentId: "fintech-sun",
    color: "#2ecc71"
  },
  {
    id: "insurtech",
    name: "InsurTech",
    description: "Insurance technology innovations",
    position: { x: 0.24, y: 0.36 },
    size: 0.019,
    level: "planet",
    parentId: "fintech-sun",
    color: "#27ae60"
  },
  {
    id: "regtech",
    name: "RegTech",
    description: "Regulatory technology solutions",
    position: { x: 0.22, y: 0.34 },
    size: 0.017,
    level: "planet",
    parentId: "fintech-sun",
    color: "#2ecc71"
  },

  // Blockchain Sun - Planets
  {
    id: "cryptocurrency",
    name: "Cryptocurrency",
    description: "Digital currency innovations",
    position: { x: 0.33, y: 0.43 },
    size: 0.019,
    level: "planet",
    parentId: "blockchain-sun",
    color: "#1abc9c"
  },
  {
    id: "smart-contracts",
    name: "Smart Contracts",
    description: "Self-executing contract solutions",
    position: { x: 0.37, y: 0.42 },
    size: 0.018,
    level: "planet",
    parentId: "blockchain-sun",
    color: "#16a085"
  },
  {
    id: "defi-solutions",
    name: "DeFi Solutions",
    description: "Decentralized finance platforms",
    position: { x: 0.36, y: 0.47 },
    size: 0.02,
    level: "planet",
    parentId: "blockchain-sun",
    color: "#1abc9c"
  },
  {
    id: "nft-platforms",
    name: "NFT Platforms",
    description: "Non-fungible token marketplaces",
    position: { x: 0.34, y: 0.46 },
    size: 0.018,
    level: "planet",
    parentId: "blockchain-sun",
    color: "#16a085"
  },
  {
    id: "dao-governance",
    name: "DAO Governance",
    description: "Decentralized autonomous organizations",
    position: { x: 0.32, y: 0.44 },
    size: 0.017,
    level: "planet",
    parentId: "blockchain-sun",
    color: "#1abc9c"
  },

  // AI & ML Sun - Planets
  {
    id: "data-analytics",
    name: "Data Analytics",
    description: "Advanced data analysis solutions",
    position: { x: 0.26, y: 0.48 },
    size: 0.019,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#3498db"
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    description: "ML algorithms and applications",
    position: { x: 0.3, y: 0.52 },
    size: 0.02,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#2980b9"
  },
  {
    id: "neural-networks",
    name: "Neural Networks",
    description: "Deep learning and neural network solutions",
    position: { x: 0.27, y: 0.53 },
    size: 0.018,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#3498db"
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    description: "Image and video analysis technologies",
    position: { x: 0.29, y: 0.49 },
    size: 0.019,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#2980b9"
  },
  {
    id: "nlp",
    name: "NLP",
    description: "Natural language processing",
    position: { x: 0.31, y: 0.51 },
    size: 0.018,
    level: "planet",
    parentId: "ai-ml-sun",
    color: "#3498db"
  },

  // Other Tech Sun - Planets
  {
    id: "iot",
    name: "IoT",
    description: "Internet of Things technologies",
    position: { x: 0.18, y: 0.4 },
    size: 0.018,
    level: "planet",
    parentId: "other-tech-sun",
    color: "#16a085"
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing",
    description: "Cloud infrastructure and services",
    position: { x: 0.22, y: 0.4 },
    size: 0.019,
    level: "planet",
    parentId: "other-tech-sun",
    color: "#1abc9c"
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Security solutions and technologies",
    position: { x: 0.19, y: 0.44 },
    size: 0.02,
    level: "planet",
    parentId: "other-tech-sun",
    color: "#16a085"
  },
  {
    id: "ar-vr",
    name: "AR/VR",
    description: "Augmented and virtual reality",
    position: { x: 0.21, y: 0.43 },
    size: 0.018,
    level: "planet",
    parentId: "other-tech-sun",
    color: "#1abc9c"
  },
  {
    id: "quantum-computing",
    name: "Quantum Computing",
    description: "Next-generation quantum technologies",
    position: { x: 0.17, y: 0.41 },
    size: 0.017,
    level: "planet",
    parentId: "other-tech-sun",
    color: "#16a085"
  },

  // Early Stage Sun - Planets
  {
    id: "airkey-ltd-planet",
    name: "Airkey Ltd",
    description: "Digital access management solutions",
    position: { x: 0.63, y: 0.23 },
    size: 0.019,
    level: "planet",
    parentId: "early-stage-sun",
    color: "#e67e22"
  },
  {
    id: "hop-pty-ltd-planet",
    name: "Hop Pty Ltd",
    description: "Innovative transportation technology",
    position: { x: 0.67, y: 0.24 },
    size: 0.02,
    level: "planet",
    parentId: "early-stage-sun",
    color: "#d35400"
  },
  {
    id: "fintech-startup-planet",
    name: "FinTech Startup",
    description: "Emerging financial technology company",
    position: { x: 0.64, y: 0.27 },
    size: 0.018,
    level: "planet",
    parentId: "early-stage-sun",
    color: "#e67e22"
  },
  {
    id: "ai-startup-planet",
    name: "AI Startup",
    description: "Early-stage artificial intelligence company",
    position: { x: 0.66, y: 0.26 },
    size: 0.019,
    level: "planet",
    parentId: "early-stage-sun",
    color: "#d35400"
  },

  // Growth Stage Sun - Planets
  {
    id: "chaufher-pty-ltd-planet",
    name: "Chaufher Pty Ltd",
    description: "Women-focused transportation service",
    position: { x: 0.73, y: 0.26 },
    size: 0.02,
    level: "planet",
    parentId: "growth-stage-sun",
    color: "#e74c3c"
  },
  {
    id: "tech-scale-up-planet",
    name: "Tech Scale-up",
    description: "Growing technology company",
    position: { x: 0.77, y: 0.27 },
    size: 0.019,
    level: "planet",
    parentId: "growth-stage-sun",
    color: "#d35400"
  },
  {
    id: "saas-platform-planet",
    name: "SaaS Platform",
    description: "Enterprise software-as-a-service platform",
    position: { x: 0.76, y: 0.3 },
    size: 0.018,
    level: "planet",
    parentId: "growth-stage-sun",
    color: "#e74c3c"
  },
  {
    id: "health-tech-planet",
    name: "Health Tech",
    description: "Healthcare technology company",
    position: { x: 0.74, y: 0.29 },
    size: 0.019,
    level: "planet",
    parentId: "growth-stage-sun",
    color: "#d35400"
  },

  // Crypto Investments Sun - Planets
  {
    id: "crypto-fund-planet",
    name: "Crypto Fund",
    description: "Cryptocurrency investment fund",
    position: { x: 0.66, y: 0.33 },
    size: 0.019,
    level: "planet",
    parentId: "crypto-investments-sun",
    color: "#f39c12"
  },
  {
    id: "defi-platform-planet",
    name: "DeFi Platform",
    description: "Decentralized finance platform investment",
    position: { x: 0.7, y: 0.34 },
    size: 0.02,
    level: "planet",
    parentId: "crypto-investments-sun",
    color: "#e67e22"
  },
  {
    id: "blockchain-venture-planet",
    name: "Blockchain Venture",
    description: "Enterprise blockchain solution",
    position: { x: 0.69, y: 0.37 },
    size: 0.018,
    level: "planet",
    parentId: "crypto-investments-sun",
    color: "#f39c12"
  },
  {
    id: "nft-marketplace-planet",
    name: "NFT Marketplace",
    description: "Digital collectibles platform",
    position: { x: 0.67, y: 0.36 },
    size: 0.019,
    level: "planet",
    parentId: "crypto-investments-sun",
    color: "#e67e22"
  },

  // Strategic Partners Sun - Planets (New)
  {
    id: "banking-partner-planet",
    name: "Banking Partner",
    description: "Strategic banking relationship",
    position: { x: 0.70, y: 0.39 },
    size: 0.019,
    level: "planet",
    parentId: "strategic-partners-sun",
    color: "#e74c3c"
  },
  {
    id: "tech-alliance-planet",
    name: "Tech Alliance",
    description: "Technology partnership network",
    position: { x: 0.74, y: 0.37 },
    size: 0.02,
    level: "planet",
    parentId: "strategic-partners-sun",
    color: "#c0392b"
  },
  {
    id: "university-partner-planet",
    name: "University Partner",
    description: "Academic research partnership",
    position: { x: 0.73, y: 0.40 },
    size: 0.018,
    level: "planet",
    parentId: "strategic-partners-sun",
    color: "#e74c3c"
  },
  {
    id: "corporate-venture-planet",
    name: "Corporate Venture",
    description: "Corporate co-investment partner",
    position: { x: 0.71, y: 0.36 },
    size: 0.019,
    level: "planet",
    parentId: "strategic-partners-sun",
    color: "#c0392b"
  },

  // Blog Categories Sun - Planets
  {
    id: "market-insights",
    name: "Market Insights",
    description: "Analysis of market trends",
    position: { x: 0.43, y: 0.63 },
    size: 0.018,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#9b59b6"
  },
  {
    id: "technology-trends",
    name: "Technology Trends",
    description: "Emerging technology insights",
    position: { x: 0.47, y: 0.62 },
    size: 0.019,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#8e44ad"
  },
  {
    id: "investment-strategy",
    name: "Investment Strategy",
    description: "Strategic investment approaches",
    position: { x: 0.46, y: 0.67 },
    size: 0.02,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#9b59b6"
  },
  {
    id: "founder-stories",
    name: "Founder Stories",
    description: "Interviews with startup founders",
    position: { x: 0.44, y: 0.66 },
    size: 0.018,
    level: "planet",
    parentId: "blog-categories-sun",
    color: "#8e44ad"
  },
  {
    id: "industry-analysis",
    name: "Industry Analysis",
    description: "Deep dives into specific industries",
    position: { x: 0.45, y: 0.64 },
    size: 0.017,
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
    size: 0.02,
    level: "planet",
    parentId: "company-information-sun",
    color: "#8e44ad"
  },
  {
    id: "vision-mission",
    name: "Vision & Mission",
    description: "Our goals and principles",
    position: { x: 0.57, y: 0.72 },
    size: 0.019,
    level: "planet",
    parentId: "company-information-sun",
    color: "#9b59b6"
  },
  {
    id: "contact",
    name: "Contact",
    description: "Get in touch with us",
    position: { x: 0.56, y: 0.77 },
    size: 0.018,
    level: "planet",
    parentId: "company-information-sun",
    color: "#8e44ad"
  },
  {
    id: "team",
    name: "Team",
    description: "Meet our team",
    position: { x: 0.54, y: 0.76 },
    size: 0.019,
    level: "planet",
    parentId: "company-information-sun",
    color: "#9b59b6"
  },
  {
    id: "history",
    name: "History",
    description: "Our journey through the years",
    position: { x: 0.52, y: 0.74 },
    size: 0.017,
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
    size: 0.018,
    level: "planet",
    parentId: "resources-sun",
    color: "#9b59b6"
  },
  {
    id: "market-research",
    name: "Market Research",
    description: "In-depth industry research",
    position: { x: 0.52, y: 0.59 },
    size: 0.019,
    level: "planet",
    parentId: "resources-sun",
    color: "#8e44ad"
  },
  {
    id: "startup-toolkit",
    name: "Startup Toolkit",
    description: "Resources for entrepreneurs",
    position: { x: 0.51, y: 0.62 },
    size: 0.02,
    level: "planet",
    parentId: "resources-sun",
    color: "#9b59b6"
  },
  {
    id: "investor-education",
    name: "Investor Education",
    description: "Educational resources for investors",
    position: { x: 0.49, y: 0.61 },
    size: 0.017,
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
    size: 0.019,
    level: "planet",
    parentId: "community-sun",
    color: "#8e44ad"
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Subscribe to our newsletter",
    position: { x: 0.62, y: 0.64 },
    size: 0.018,
    level: "planet",
    parentId: "community-sun",
    color: "#9b59b6"
  },
  {
    id: "partnerships",
    name: "Partnerships",
    description: "Partner with Phoenix VC",
    position: { x: 0.61, y: 0.67 },
    size: 0.02,
    level: "planet",
    parentId: "community-sun",
    color: "#8e44ad"
  },
  {
    id: "community-forum",
    name: "Community Forum",
    description: "Join our online community",
    position: { x: 0.59, y: 0.66 },
    size: 0.017,
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
    size: 0.018,
    level: "planet",
    parentId: "careers-sun",
    color: "#8e44ad"
  },
  {
    id: "internships",
    name: "Internships",
    description: "Student and graduate opportunities",
    position: { x: 0.44, y: 0.71 },
    size: 0.017,
    level: "planet",
    parentId: "careers-sun",
    color: "#9b59b6"
  },
  {
    id: "company-culture",
    name: "Company Culture",
    description: "Life at Phoenix VC",
    position: { x: 0.43, y: 0.74 },
    size: 0.019,
    level: "planet",
    parentId: "careers-sun",
    color: "#8e44ad"
  },
  {
    id: "benefits",
    name: "Benefits",
    description: "Employee benefits and perks",
    position: { x: 0.41, y: 0.73 },
    size: 0.016,
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
