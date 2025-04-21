// apps/web/src/features/layout/components/Starfield/cosmos/adapters/PlanetAdapter.ts
import { EmployeeData } from "../../types";
import { SPECIAL_COSMIC_OBJECTS } from "../cosmicHierarchy";
import { CosmicObject } from "../types";

/**
 * Adapts existing employee data to the cosmic hierarchy structure
 * This specifically focuses on the team members in the binary star system
 */
export const adaptEmployeesToCosmicObjects = (
  employees: EmployeeData[]
): CosmicObject[] => {
  // Filter out employees that should be represented as stars
  // We're looking for employees with initials EM and JS
  const foundEmployees = employees.filter(emp =>
    emp.initials === "EM" || emp.initials === "JS"
  );

  if (foundEmployees.length === 0) {
    return [];
  }

  // Find the team binary system in our cosmic objects
  const teamBinarySystem = SPECIAL_COSMIC_OBJECTS.find(
    obj => obj.id === "team-sun-system"
  );

  if (!teamBinarySystem) {
    console.warn("Team binary system not found in cosmic objects");
    return [];
  }

  // Find the existing star objects for EM and JS
  const emStar = SPECIAL_COSMIC_OBJECTS.find(obj => obj.id === "em-founder");
  const jsStar = SPECIAL_COSMIC_OBJECTS.find(obj => obj.id === "js-cto");

  // Create updated cosmic objects based on employee data
  const updatedCosmicObjects: CosmicObject[] = [];

  foundEmployees.forEach(employee => {
    // Determine which star to update based on employee initials
    const existingStar = employee.initials === "EM" ? emStar :
                         employee.initials === "JS" ? jsStar : null;

    if (!existingStar) return;

    // Create an updated star with employee data
    const updatedStar: CosmicObject = {
      ...existingStar,
      name: employee.name || existingStar.name,
      description: employee.title || existingStar.description,
      // Preserve the original position, size, and other cosmic properties
      // but add employee data for rendering and interaction
      employeeData: employee
    };

    updatedCosmicObjects.push(updatedStar);
  });

  return updatedCosmicObjects;
};

/**
 * Updates the cosmic object rendering to incorporate employee-specific rendering
 * This function should be called during the rendering process
 */
export const renderEmployeeCosmicObject = (
  ctx: CanvasRenderingContext2D,
  cosmicObject: CosmicObject,
  time: number,
  isHovered: boolean
): void => {
  // Only process cosmic objects that have employee data
  if (!cosmicObject.employeeData) return;

  const employee = cosmicObject.employeeData;

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

  // Use employee color if available, otherwise use cosmic object color
  // Ensure we always have a valid color by providing a default
  const starColor = employee.color || cosmicObject.color || "#FFFFFF";

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

  // Draw employee initials
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${cosmicObject.size * 40}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(employee.initials || "", screenX, screenY);

  ctx.restore();
};

/**
 * Integrates the employee planets with the cosmic navigation system
 */
export const integrateEmployeesWithCosmicNavigation = (
  employees: EmployeeData[]
): void => {
  // Update the cosmic objects with employee data
  const updatedStars = adaptEmployeesToCosmicObjects(employees);

  // Replace the existing star objects in the SPECIAL_COSMIC_OBJECTS array
  updatedStars.forEach(updatedStar => {
    const index = SPECIAL_COSMIC_OBJECTS.findIndex(obj => obj.id === updatedStar.id);
    if (index !== -1) {
      SPECIAL_COSMIC_OBJECTS[index] = updatedStar;
    }
  });
};
