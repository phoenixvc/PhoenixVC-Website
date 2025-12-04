// apps/web/src/features/layout/components/Starfield/cosmos/adapters/PlanetAdapter.ts
import { PortfolioProject } from "../../types";
import { SPECIAL_COSMIC_OBJECTS } from "../cosmicHierarchy";
import { CosmicObject } from "../types";
import { logger } from "@/utils/logger";

/**
 * Adapts existing project data to the cosmic hierarchy structure
 * This specifically focuses on the team members in the binary star system
 */
export const adaptProjectsToCosmicObjects = (
  projects: PortfolioProject[]
): CosmicObject[] => {
  // Filter out projects that should be represented as stars
  // We're looking for projects with initials EM and JS
  const foundProjects = projects.filter(proj =>
    proj.initials === "EM" || proj.initials === "JS"
  );

  if (foundProjects.length === 0) {
    return [];
  }

  // Find the team binary system in our cosmic objects
  const teamBinarySystem = SPECIAL_COSMIC_OBJECTS.find(
    obj => obj.id === "team-sun-system"
  );

  if (!teamBinarySystem) {
    logger.warn("Team binary system not found in cosmic objects");
    return [];
  }

  // Find the existing star objects for EM and JS
  const emStar = SPECIAL_COSMIC_OBJECTS.find(obj => obj.id === "em-founder");
  const jsStar = SPECIAL_COSMIC_OBJECTS.find(obj => obj.id === "js-cto");

  // Create updated cosmic objects based on project data
  const updatedCosmicObjects: CosmicObject[] = [];

  foundProjects.forEach(project => {
    // Determine which star to update based on project initials
    const existingStar = project.initials === "EM" ? emStar :
                         project.initials === "JS" ? jsStar : null;

    if (!existingStar) return;

    // Create an updated star with project data
    const updatedStar: CosmicObject = {
      ...existingStar,
      name: project.name || existingStar.name,
      description: project.title || existingStar.description,
      // Preserve the original position, size, and other cosmic properties
      // but add project data for rendering and interaction
      projectData: project
    };

    updatedCosmicObjects.push(updatedStar);
  });

  return updatedCosmicObjects;
};

/**
 * Updates the cosmic object rendering to incorporate project-specific rendering
 * This function should be called during the rendering process
 */
export const renderProjectCosmicObject = (
  ctx: CanvasRenderingContext2D,
  cosmicObject: CosmicObject,
  time: number,
  isHovered: boolean
): void => {
  // Only process cosmic objects that have project data
  if (!cosmicObject.projectData) return;

  const project = cosmicObject.projectData;

  // Calculate screen coordinates based on cosmic object position
  // This would need to be adjusted based on your camera system
  const screenX = cosmicObject.position.x;
  const screenY = cosmicObject.position.y;

  // Draw a glowing star
  ctx.save();

  // Draw glow
  const glowRadius = cosmicObject.size * (isHovered ? 1.5 : 1.2);
  const gradient = ctx.createRadialGradient(
    screenX, screenY, 0,
    screenX, screenY, glowRadius * 100
  );

  // Use project color if available, otherwise use cosmic object color
  // Ensure we always have a valid color by providing a default
  const starColor = project.color || cosmicObject.color || "#FFFFFF";

  gradient.addColorStop(0, `${starColor}FF`); // Full opacity at center
  gradient.addColorStop(0.5, `${starColor}80`); // Mid opacity
  gradient.addColorStop(1, `${starColor}00`); // Transparent at edge

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(screenX, screenY, glowRadius * 100, 0, Math.PI * 2);
  ctx.fill();

  // Draw star core
  ctx.fillStyle = starColor; // Using the same validated color
  ctx.beginPath();
  ctx.arc(screenX, screenY, cosmicObject.size * 50, 0, Math.PI * 2);
  ctx.fill();

  // Draw project initials
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${cosmicObject.size * 40}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(project.initials || "", screenX, screenY);

  ctx.restore();
};

/**
 * Integrates the project planets with the cosmic navigation system
 */
export const integrateProjectsWithCosmicNavigation = (
  projects: PortfolioProject[]
): void => {
  // Update the cosmic objects with project data
  const updatedStars = adaptProjectsToCosmicObjects(projects);

  // Replace the existing star objects in the SPECIAL_COSMIC_OBJECTS array
  updatedStars.forEach(updatedStar => {
    const index = SPECIAL_COSMIC_OBJECTS.findIndex(obj => obj.id === updatedStar.id);
    if (index !== -1) {
      SPECIAL_COSMIC_OBJECTS[index] = updatedStar;
    }
  });
};

// Legacy aliases for backward compatibility
export const adaptEmployeesToCosmicObjects = adaptProjectsToCosmicObjects;
export const renderEmployeeCosmicObject = renderProjectCosmicObject;
export const integrateEmployeesWithCosmicNavigation = integrateProjectsWithCosmicNavigation;
