// src/constants/portfolioData.ts
// Single source of truth for all portfolio-related data

import React from "react";

// ==================== Types ====================

export type ProjectStatus = "alpha" | "pre-alpha" | "early-stage" | "growth" | "active";
export type FocusAreaId = "ai-ml" | "fintech-blockchain" | "defense-security" | "mobility-transportation" | "infrastructure";

export interface StatusConfig {
  bg: string;
  text: string;
  label: string;
  description: string;
}

export interface FocusAreaConfig {
  id: FocusAreaId;
  label: string;
  color: string;
  description: string;
}

export interface PortfolioProject {
  id: string;
  name: string;
  fullName?: string;
  initials: string;
  color: string;
  position?: string;
  department?: string;
  mass?: number;
  speed?: number;
  image?: string;
  skills?: string[] | string;
  relatedIds?: string[];
  experience?: number;
  expertise?: string;
  projects?: string[];
  bio?: string;
  title: string;
  status: ProjectStatus;
  relatedProjects: string[];
  product: string;
  focusArea: FocusAreaId;
}

// ==================== Status Configuration ====================

export const STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  alpha: {
    bg: "rgba(156, 39, 176, 0.2)",
    text: "#9c27b0",
    label: "Alpha",
    description: "Active development with early users"
  },
  "pre-alpha": {
    bg: "rgba(121, 85, 72, 0.2)",
    text: "#795548",
    label: "Pre-Alpha / Seeding",
    description: "Early development and concept validation"
  },
  "early-stage": {
    bg: "rgba(230, 126, 34, 0.2)",
    text: "#e67e22",
    label: "Early Stage",
    description: "Initial investment and product development"
  },
  growth: {
    bg: "rgba(231, 76, 60, 0.2)",
    text: "#e74c3c",
    label: "Growth Stage",
    description: "Scaling operations and market expansion"
  },
  active: {
    bg: "rgba(76, 175, 80, 0.2)",
    text: "#4caf50",
    label: "Active",
    description: "Operational and maintained"
  }
};

// ==================== Focus Area Configuration ====================

export const FOCUS_AREA_CONFIG: Record<FocusAreaId, FocusAreaConfig> = {
  "ai-ml": {
    id: "ai-ml",
    label: "AI & Machine Learning",
    color: "#3498db",
    description: "Artificial intelligence and machine learning innovations"
  },
  "fintech-blockchain": {
    id: "fintech-blockchain",
    label: "Fintech & Blockchain",
    color: "#f39c12",
    description: "Financial technology and blockchain solutions"
  },
  "defense-security": {
    id: "defense-security",
    label: "Defense & Security",
    color: "#e74c3c",
    description: "Defense technology and security solutions"
  },
  "mobility-transportation": {
    id: "mobility-transportation",
    label: "Mobility & Transportation",
    color: "#2ecc71",
    description: "Transportation and mobility innovations"
  },
  "infrastructure": {
    id: "infrastructure",
    label: "Infrastructure",
    color: "#6b7280",
    description: "Supporting infrastructure and internal tools"
  }
};

// ==================== Portfolio Projects ====================

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  // AI & Machine Learning Focus Area
  {
    id: "mystira",
    name: "Mystira",
    initials: "MY",
    position: "Interactive Storytelling",
    mass: 500,
    color: "#9c27b0",
    image: "/themes/mystira-icon.png",
    fullName: "Mystira",
    speed: 0.000025,
    title: "Interactive Storytelling Platform (Alpha)",
    status: "alpha",
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
    mass: 150,
    color: "#795548",
    image: "/themes/cognitivemesh-icon.png",
    fullName: "Cognitive Mesh",
    speed: 0.000022,
    title: "Enterprise AI Transformation Framework (Pre-Alpha)",
    status: "pre-alpha",
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
    mass: 200,
    color: "#795548",
    image: "/themes/rooivalk-icon.png",
    fullName: "Phoenix Rooivalk",
    speed: 0.00002,
    title: "AI-Powered Counter-Drone Platform (Pre-Alpha)",
    status: "pre-alpha",
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
    mass: 150,
    color: "#e67e22",
    fullName: "Airkey Ltd",
    speed: 0.000019,
    title: "Digital Access Management (Early Stage)",
    status: "early-stage",
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
    mass: 80,
    color: "#795548",
    fullName: "VeritasVault",
    speed: 0.000020,
    title: "DeFi Staking Platform (Pre-Alpha)",
    status: "pre-alpha",
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
    mass: 150,
    color: "#e67e22",
    fullName: "Hop Pty Ltd",
    speed: 0.000017,
    title: "Innovative Transportation Technology (Early Stage)",
    status: "early-stage",
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
    mass: 180,
    color: "#e74c3c",
    fullName: "Chaufher Pty Ltd",
    speed: 0.000016,
    title: "Women-Focused Transportation (Growth Stage)",
    status: "growth",
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

  // Infrastructure (Supporting Projects)
  {
    id: "phoenixvc-website",
    name: "PhoenixVC Website",
    initials: "PW",
    position: "Corporate Website",
    mass: 100,
    color: "#6b7280",
    fullName: "PhoenixVC Website",
    speed: 0.000015,
    title: "Corporate Website",
    status: "active",
    bio: "The official Phoenix VC corporate website built with modern web technologies.",
    department: "Infrastructure",
    experience: 0,
    expertise: "React, TypeScript, Azure",
    projects: ["Web Development"],
    skills: ["React", "TypeScript", "Azure"],
    relatedProjects: ["mystira", "design-system"],
    product: "https://phoenixvc.tech",
    focusArea: "infrastructure"
  },
  {
    id: "design-system",
    name: "Design System",
    initials: "DS",
    position: "Component Library",
    mass: 80,
    color: "#6b7280",
    fullName: "Phoenix Design System",
    speed: 0.000018,
    title: "Component Library",
    status: "active",
    bio: "Shared design system and component library for Phoenix projects.",
    department: "Infrastructure",
    experience: 0,
    expertise: "React Components, Design Tokens",
    projects: ["UI Components"],
    skills: ["Design", "Components", "Tokens"],
    relatedProjects: ["phoenixvc-website"],
    product: "",
    focusArea: "infrastructure"
  }
];

// ==================== Helper Functions ====================

/**
 * Get a project by ID
 */
export function getProjectById(id: string): PortfolioProject | undefined {
  return PORTFOLIO_PROJECTS.find(p => p.id === id);
}

/**
 * Get projects by focus area
 */
export function getProjectsByFocusArea(focusArea: FocusAreaId): PortfolioProject[] {
  return PORTFOLIO_PROJECTS.filter(p => p.focusArea === focusArea);
}

/**
 * Get projects by status
 */
export function getProjectsByStatus(status: ProjectStatus): PortfolioProject[] {
  return PORTFOLIO_PROJECTS.filter(p => p.status === status);
}

/**
 * Get related projects for a given project
 * Combines manually specified relations with auto-generated ones from the same focus area
 */
export function getRelatedProjects(projectId: string, limit: number = 3): PortfolioProject[] {
  const project = getProjectById(projectId);
  if (!project) return [];

  // Start with manually specified related projects
  const relatedIds = new Set(project.relatedProjects);

  // Add projects from the same focus area
  const sameFocusArea = PORTFOLIO_PROJECTS.filter(
    p => p.focusArea === project.focusArea && p.id !== projectId
  );
  sameFocusArea.forEach(p => relatedIds.add(p.id));

  // Convert to project objects and limit
  return Array.from(relatedIds)
    .map(id => getProjectById(id))
    .filter((p): p is PortfolioProject => p !== undefined && p.id !== projectId)
    .slice(0, limit);
}

/**
 * Get all focus areas that have projects
 */
export function getActiveFocusAreas(): FocusAreaConfig[] {
  const activeIds = new Set(PORTFOLIO_PROJECTS.map(p => p.focusArea));
  return Object.values(FOCUS_AREA_CONFIG).filter(fa => activeIds.has(fa.id));
}

/**
 * Get status config for a project
 */
export function getStatusConfig(status: ProjectStatus): StatusConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG.active;
}

/**
 * Get focus area config by ID
 */
export function getFocusAreaConfig(focusAreaId: FocusAreaId): FocusAreaConfig {
  return FOCUS_AREA_CONFIG[focusAreaId] || FOCUS_AREA_CONFIG.infrastructure;
}

/**
 * Get color for a project based on its status
 */
export function getProjectStatusColor(project: PortfolioProject): string {
  return STATUS_CONFIG[project.status]?.text || project.color;
}

/**
 * Get color for a project based on its focus area
 */
export function getProjectFocusAreaColor(project: PortfolioProject): string {
  return FOCUS_AREA_CONFIG[project.focusArea]?.color || project.color;
}
