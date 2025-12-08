import { PortfolioProject } from "../types";

// apps/web/src/features/layout/components/Starfield/cosmos/types.ts
export type Level = "universe" | "galaxy" | "sun" | "planet" | "special";

export interface CosmicNavigationState {
  currentLevel: Level;
  currentGalaxyId?: string;
  currentSunId?: string; // Changed from currentStarSystemId
  currentPlanetId?: string;
  currentSpecialObjectId?: string;
  isTransitioning: boolean;
}

export interface Camera {
  cx: number; // center-x in world space
  cy: number; // center-y in world space
  zoom: number; // 1 = full universe, higher values = zoomed in
  target?: {
    cx: number;
    cy: number;
    zoom: number;
  }; // for smooth lerp
}

export interface CosmicObject {
  id: string;
  name: string;
  description?: string;
  position: {
    x: number; // 0-1 (relative to universe width)
    y: number; // 0-1 (relative to universe height)
  };
  size: number; // logical radius in world px
  level: Level;
  parentId?: string;
  color?: string;
  type?: string;
  projectData?: PortfolioProject;
}
