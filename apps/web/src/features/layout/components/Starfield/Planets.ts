// apps/web/src/features/layout/components/Starfield/Planets.ts
// Orbital rendering system for portfolio items (comets/planets)

import { getObjectById, SUNS } from "./cosmos/cosmicHierarchy";
import { worldToScreen } from "./cosmos/cosmicNavigation";
import { Camera } from "./cosmos/types";
import { PLANET_PHYSICS } from "./physicsConfig";
import { drawPlanet } from "./starRendering";
import { getSunStates } from "./sunSystem";
import { PortfolioProject, HoverInfo, Planet, Satellite } from "./types";
import { calculateCenter } from "./utils";
import { logger } from "@/utils/logger";

// Initialize portfolio items as orbiting comets/planets
export const initPlanets = (
  width: number,
  height: number,
  enablePlanets: boolean,
  portfolioItems: PortfolioProject[],
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number,
  planetSize: number,
  useSimpleRendering: boolean = false
): Planet[] => {
  if (!enablePlanets || !portfolioItems || portfolioItems.length === 0) return [];

  logger.debug("Initializing portfolio comets:", portfolioItems.length);

  const planets: Planet[] = [];
  const { centerX, centerY } = calculateCenter(
    width, height, sidebarWidth, centerOffsetX, centerOffsetY
  );

  portfolioItems.forEach((item, index) => {
    const totalItems = portfolioItems.length;
    const angleStep = (Math.PI * 2) / totalItems;
    const baseAngle = index * angleStep;

    const orbitRadius = Math.min(width, height) * 0.12 + (index * 25); // Reduced from 0.25 for closer orbits
    const orbitSpeed = item.speed || (0.0005 + (0.0002 * (index % 3)));

    const x = centerX + Math.cos(baseAngle) * orbitRadius;
    const y = centerY + Math.sin(baseAngle) * orbitRadius;

    const vx = 0;
    const vy = 0;

    const satellites: Satellite[] = [];

    if (!useSimpleRendering) {
      // Create satellites
      const satelliteCount = 3 + Math.floor((item.mass || 100) / 40);

      for (let i = 0; i < satelliteCount; i++) {
        // Distribute satellites more evenly around the star
        const angle = (i / satelliteCount) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 20 + Math.random() * 15;
        const speed = 0.005 + Math.random() * 0.01; // Increased speed for better visibility
        const eccentricity = 0.1 + Math.random() * 0.2;
        const size = (0.8 + Math.random() * 1.2) * planetSize;

        // Ensure valid color format with proper hex values
        const color = item.color ?
          `${item.color}${Math.floor(Math.random() * 70 + 80).toString(16).padStart(2, "0")}` :
          "rgba(255, 255, 255, 0.8)";

        satellites.push({
          angle,
          distance,
          speed,
          size,
          color,
          eccentricity
        });
      }
    }

    const pathTypes: Array<"comet" | "planet" | "star"> = ["comet", "planet", "star"];
    const pathType = pathTypes[index % pathTypes.length];

    // Determine orbital direction (alternate between clockwise and counterclockwise)
    const orbitalDirection = index % 2 === 0 ? "clockwise" : "counterclockwise";

    // Set eccentricity based on path type
    // Increased vertical eccentricity for comets
    let pathEccentricity = 0;
    let verticalFactor = 1.0;
    switch (pathType) {
      case "comet":
        pathEccentricity = 0.5 + Math.random() * 0.3;
        verticalFactor = 1.8; // Increase vertical factor for comets
        break;
      case "planet":
        pathEccentricity = 0.1 + Math.random() * 0.15;
        verticalFactor = 1.2;
        break;
      case "star":
        pathEccentricity = 0.05 + Math.random() * 0.1;
        verticalFactor = 1.0;
        break;
    }

    // Increased path tilt for more dynamic appearance
    const pathTilt = Math.random() * 30;

    let trailLength, glowIntensity;
    if (pathType === "comet") {
      trailLength = 180 + Math.random() * 120; // Longer trails for comets
    }

    if (pathType === "star" && !useSimpleRendering) {
      glowIntensity = 1.0 + Math.random() * 0.5;
    }

    // Enhanced pulsation for better visibility
    const pulsation = {
      enabled: true,
      speed: 0.00002, // Significantly reduced for smoother, slower pulsation
      minScale: 0.92, // Less dramatic min scale
      maxScale: 1.08, // Less dramatic max scale
      scale: 1.0,
      direction: 1
    };

    // Create the orbital body (comet/planet) with project data
    const planet = {
      project: item, // The portfolio item data
      x,
      y,
      vx,
      vy,
      angle: baseAngle,
      rotationSpeed: 0.001 + (Math.random() * 0.001),
      orbitRadius,
      orbitSpeed,
      // will be overwritten each frame, but initialize to the right spot:
      orbitParentId: "team-sun-system", // Assign to the binary star system
      orbitCenter: {
        x: centerX,
        y: centerY
      },
      satellites,
      orbitalDirection,
      pathType,
      pathEccentricity,
      pathTilt,
      trailLength,
      glowIntensity,
      pulsation,
      useSimpleRendering,
      verticalFactor, // Add vertical factor for orbit shaping
      isMovementPaused: false // Initialize movement as not paused
    } as Planet;

    planets.push(planet);
  });

  // Assign planets to their correct focus area sun based on project.focusArea
  const focusAreaSuns = SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");

  // Create a map of focusArea to sun id for quick lookup
  const focusAreaToSunId: Record<string, string> = {
    "ai-ml": "ai-ml-sun",
    "fintech-blockchain": "fintech-blockchain-sun",
    "defense-security": "defense-security-sun",
    "mobility-transportation": "mobility-transportation-sun"
  };

  planets.forEach((planet, index) => {
    const projectFocusArea = planet.project?.focusArea;

    if (projectFocusArea && focusAreaToSunId[projectFocusArea]) {
      // Match planet to its correct sun based on focusArea
      const targetSunId = focusAreaToSunId[projectFocusArea];
      const matchingSun = focusAreaSuns.find(sun => sun.id === targetSunId);
      if (matchingSun) {
        planet.orbitParentId = matchingSun.id;
      } else {
        // Fallback to first focus area sun
        planet.orbitParentId = focusAreaSuns[0]?.id || "ai-ml-sun";
      }
    } else if (focusAreaSuns.length > 0) {
      // For projects without focusArea (infrastructure), distribute evenly
      const sunIndex = index % focusAreaSuns.length;
      planet.orbitParentId = focusAreaSuns[sunIndex].id;
    } else {
      // Final fallback
      const randomSunIndex = Math.floor(Math.random() * SUNS.length);
      planet.orbitParentId = SUNS[randomSunIndex].id;
    }
  });

  // Group planets by their orbit parent (sun)
  const planetsBySun: Record<string, Planet[]> = {};
  planets.forEach(planet => {
    const sunId = planet.orbitParentId || "default";
    if (!planetsBySun[sunId]) {
      planetsBySun[sunId] = [];
    }
    planetsBySun[sunId].push(planet);
  });

  // For each sun, find the biggest planet (by mass or orbit radius) and make it a comet
  Object.values(planetsBySun).forEach(sunPlanets => {
    if (sunPlanets.length > 0) {
      // Find the biggest planet by mass (or orbit radius as fallback)
      const biggestPlanet = sunPlanets.reduce((biggest, current) => {
        const currentMass = current.project?.mass || current.orbitRadius || 0;
        const biggestMass = biggest.project?.mass || biggest.orbitRadius || 0;
        return currentMass > biggestMass ? current : biggest;
      }, sunPlanets[0]);

      // Make the biggest planet a comet with bright trail
      biggestPlanet.pathType = "comet";
      biggestPlanet.trailLength = 250 + Math.random() * 80;
      biggestPlanet.pathEccentricity = 0.5 + Math.random() * 0.3;
      biggestPlanet.orbitSpeed = 0.00008 + Math.random() * 0.00004;
      biggestPlanet.glowIntensity = 2.0 + Math.random() * 0.8;
      biggestPlanet.verticalFactor = 1.8 + Math.random() * 0.6;
    }
  });

  // Ensure all comets have proper trail settings
  planets.forEach(star => {
    if (star.pathType === "comet") {
      star.trailLength = star.trailLength || 200;
      star.orbitSpeed = star.orbitSpeed || 0.0001;
      star.verticalFactor = star.verticalFactor || 1.8;
    }

    // Ensure satellites have proper speeds
    if (star.satellites && star.satellites.length > 0) {
      star.satellites.forEach(satellite => {
        satellite.speed = 0.005 + Math.random() * 0.01;
      });
    }
  });

  return planets;
};

export const checkPlanetHover = (
  mouseX: number,
  mouseY: number,
  planets: Planet[],
  planetSize: number,
  currentHoverInfo: HoverInfo,
  setHoverInfo: (info: HoverInfo) => void
): boolean => {
  if (!planets || !planets.length) return false;

  // Shared hover radius constant for consistent detection
  const hoverRadius = 30 * planetSize;

  // Helper function to calculate distance between mouse and planet
  const getDistanceToPlanet = (planet: Planet): number => {
    return Math.sqrt(
      Math.pow(mouseX - planet.x, 2) +
      Math.pow(mouseY - planet.y, 2)
    );
  };

  // First, check if there's a currently hovered planet and if cursor is still within its radius
  // This prevents "stealing" the hover when another planet moves closer
  // Note: Only ONE planet can be hovered at a time by design
  const currentlyHoveredPlanet = planets.find((planet) => {
    if (!planet.isHovered) return false;
    const dist = getDistanceToPlanet(planet);
    // Keep this planet hovered if cursor is still within its radius
    return dist < hoverRadius;
  }) ?? null;

  let hoveredPlanet: Planet | null = currentlyHoveredPlanet;

  // Only look for a new planet to hover if there's no currently hovered planet
  // or if the cursor has moved outside the currently hovered planet's radius
  if (!hoveredPlanet) {
    let closestDistance = Infinity;

    // Find the closest planet to the mouse
    for (const planet of planets) {
      const dist = getDistanceToPlanet(planet);

      if (dist < hoverRadius && dist < closestDistance) {
        closestDistance = dist;
        hoveredPlanet = planet;
      }
    }
  }

  // Reset ALL planets that are NOT the hovered one
  // This prevents multiple planets from being "caught" simultaneously
  for (const planet of planets) {
    if (planet !== hoveredPlanet && planet.isHovered) {
      // Restore original orbit speed if it was stored
      if (planet.originalOrbitSpeed !== undefined) {
        planet.orbitSpeed = planet.originalOrbitSpeed;
        planet.originalOrbitSpeed = undefined;
      }
      planet.isMovementPaused = false;
      planet.isHovered = false;

      // Reset pulsation to normal
      if (planet.pulsation && !planet.useSimpleRendering) {
        planet.pulsation.enabled = true;
        planet.pulsation.minScale = 0.92;
        planet.pulsation.maxScale = 1.08;
        planet.pulsation.speed = 0.00002;
      }
    }
  }

  // Update the hovered planet (only if we found one)
  if (hoveredPlanet) {
    // If this planet wasn't hovered before, store its original orbit speed
    if (!hoveredPlanet.isHovered) {
      hoveredPlanet.originalOrbitSpeed = hoveredPlanet.orbitSpeed;
      // Freeze the planet by setting orbit speed to 0
      hoveredPlanet.orbitSpeed = 0;
      hoveredPlanet.isMovementPaused = true;
    }

    hoveredPlanet.isHovered = true;

    // Set more dramatic pulsation for hovered planet
    if (hoveredPlanet.pulsation && !hoveredPlanet.useSimpleRendering) {
      hoveredPlanet.pulsation.enabled = true;
      hoveredPlanet.pulsation.minScale = 0.8;
      hoveredPlanet.pulsation.maxScale = 1.3; // Much more dramatic hover effect
      hoveredPlanet.pulsation.speed = 0.0006; // Faster pulsation when hovered
    }

    // Use the actual mouse coordinates for tooltip positioning
    setHoverInfo({
      project: hoveredPlanet.project, // project field is required by HoverInfo interface
      x: mouseX, // Use mouse X instead of planet X
      y: mouseY, // Use mouse Y instead of planet Y
      show: true
    });

    return true;
  }

  if (currentHoverInfo.show) {
    setHoverInfo({ ...currentHoverInfo, show: false });
  }
  return false;
};

// Helper function to normalize hex color (ensure it has # prefix and is 6 chars)
const normalizeHexColor = (color: string): string => {
  if (!color) return "#f39c12";
  // Remove # if present for consistent handling
  const hex = color.startsWith("#") ? color.slice(1) : color;
  return `#${hex}`;
};

// Helper function to draw a sun at the orbital center
const drawSunAtCenter = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sunColor: string,
  sunSize: number
): void => {
  // Normalize the color to ensure consistent format
  const normalizedColor = normalizeHexColor(sunColor);
  // Get hex without # for alpha concatenation
  const hexWithoutHash = normalizedColor.slice(1);
  
  // Save the current context state
  ctx.save();
  
  // Draw outer glow
  const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, sunSize * 3);
  glowGradient.addColorStop(0, `#${hexWithoutHash}A0`);
  glowGradient.addColorStop(0.5, `#${hexWithoutHash}40`);
  glowGradient.addColorStop(1, `#${hexWithoutHash}00`);
  
  ctx.beginPath();
  ctx.arc(x, y, sunSize * 3, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.globalAlpha = 0.8;
  ctx.fill();
  
  // Draw inner core
  const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, sunSize);
  coreGradient.addColorStop(0, "#ffffff");
  coreGradient.addColorStop(0.3, normalizedColor);
  coreGradient.addColorStop(1, `#${hexWithoutHash}80`);
  
  ctx.beginPath();
  ctx.arc(x, y, sunSize, 0, Math.PI * 2);
  ctx.fillStyle = coreGradient;
  ctx.globalAlpha = 1;
  ctx.fill();
  
  // Restore the previous context state
  ctx.restore();
};

// Update portfolio items (comets/planets) animation
export const updatePlanets = (
  ctx: CanvasRenderingContext2D,
  planets: Planet[],
  deltaTime: number,
  planetSize: number,
  employeeDisplayStyle: "initials" | "avatar" | "both",
  camera?: Camera // Optional camera for cosmic navigation
): void => {
  if (!ctx || !planets || !planets.length) return;

  // Update planet velocities from click repulsion (apply accumulated forces)
  updatePlanetVelocities(planets);

  const cappedDeltaTime = Math.min(deltaTime, 100);
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Get dynamic sun positions from the sun system
  const sunStates = getSunStates();

  // Track which suns we've already drawn to avoid duplicates
  const drawnSuns = new Set<string>();

  planets.forEach(planet => {
    /* ---------- Recalc orbit centre using dynamic sun positions ---------- */
    if (planet.orbitParentId) {
      // First, try to get dynamic sun position from sun system
      const sunState = sunStates.find(s => s.id === planet.orbitParentId);
      
      if (sunState) {
        // Use dynamic sun position from the sun system with smoothing
        const targetX = sunState.x * width;
        const targetY = sunState.y * height;

        // Smooth interpolation to prevent jerky planet movement when sun moves
        if (planet.orbitCenter) {
          const smoothingFactor = 0.08; // Smooth following
          planet.orbitCenter = {
            x: planet.orbitCenter.x + (targetX - planet.orbitCenter.x) * smoothingFactor,
            y: planet.orbitCenter.y + (targetY - planet.orbitCenter.y) * smoothingFactor
          };
        } else {
          planet.orbitCenter = { x: targetX, y: targetY };
        }

        // Don't draw suns here - they're drawn by the main drawSuns function
      } else if (camera) {
        // Fallback to camera-based calculation for non-dynamic suns
        const parent = getObjectById(planet.orbitParentId);
        if (parent) {
          planet.orbitCenter = worldToScreen(
            parent.position.x,
            parent.position.y,
            camera,
            width,
            height
          );
          
          // Draw the sun at the orbital center if not already drawn
          if (!drawnSuns.has(planet.orbitParentId)) {
            drawnSuns.add(planet.orbitParentId);
            const sunSize = (parent.size || 0.05) * 50 * planetSize;
            const sunColor = parent.color || "#f39c12";
            drawSunAtCenter(ctx, planet.orbitCenter.x, planet.orbitCenter.y, sunColor, sunSize);
          }
        }
      } else if (planet.orbitCenter) {
        // No camera mode and no dynamic sun - use static parent position
        const parent = getObjectById(planet.orbitParentId);
        if (parent && !drawnSuns.has(planet.orbitParentId)) {
          drawnSuns.add(planet.orbitParentId);
          const sunSize = (parent.size || 0.05) * 50 * planetSize;
          const sunColor = parent.color || "#f39c12";
          drawSunAtCenter(ctx, planet.orbitCenter.x, planet.orbitCenter.y, sunColor, sunSize);
        }
      }
    }
    /* ------------------------------------------------------------ */

    // Draw the comet/planet regardless of movement state
    drawPlanet(ctx, planet, cappedDeltaTime, planetSize, employeeDisplayStyle);
  });
};


/**
 * Apply click repulsion to planets/comets
 * This pushes planets away from the click point and temporarily boosts their orbit speed
 * @param planets - Array of planets to affect
 * @param clickX - Click X position in canvas coordinates
 * @param clickY - Click Y position in canvas coordinates
 * @returns Number of affected planets
 */
export function applyClickRepulsionToPlanets(
  planets: Planet[],
  clickX: number,
  clickY: number
): number {
  if (!planets || planets.length === 0) return 0;
  
  let affectedCount = 0;
  const now = Date.now();
  
  for (const planet of planets) {
    const dx = planet.x - clickX;
    const dy = planet.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Only affect planets within the click repulsion radius
    if (dist < PLANET_PHYSICS.clickRepulsionRadius && dist > 1) {
      // Calculate force based on distance (closer = stronger)
      const normalizedDist = dist / PLANET_PHYSICS.clickRepulsionRadius;
      const forceFactor = Math.pow(1 - normalizedDist, 2); // Quadratic falloff
      const force = PLANET_PHYSICS.clickRepulsionForce * forceFactor;
      
      // Normalize direction (away from click)
      const nx = dx / dist;
      const ny = dy / dist;
      
      // Apply velocity (stacking effect - adds to existing velocity)
      planet.vx = (planet.vx || 0) + nx * force;
      planet.vy = (planet.vy || 0) + ny * force;
      
      // Clamp velocity to max
      const speed = Math.sqrt(planet.vx * planet.vx + planet.vy * planet.vy);
      if (speed > PLANET_PHYSICS.maxClickVelocity) {
        const scale = PLANET_PHYSICS.maxClickVelocity / speed;
        planet.vx *= scale;
        planet.vy *= scale;
      }
      
      // Temporarily boost orbit speed for dramatic effect
      if (!planet.originalOrbitSpeed) {
        planet.originalOrbitSpeed = planet.orbitSpeed;
      }
      planet.orbitSpeed = planet.originalOrbitSpeed * PLANET_PHYSICS.orbitSpeedBoost;
      
      // Schedule orbit speed reset
      setTimeout(() => {
        if (planet.originalOrbitSpeed !== undefined) {
          planet.orbitSpeed = planet.originalOrbitSpeed;
        }
      }, PLANET_PHYSICS.orbitSpeedBoostDuration);
      
      affectedCount++;
    }
  }
  
  return affectedCount;
}

/**
 * Update planet positions based on velocity (called each frame)
 * This applies the accumulated click repulsion velocity
 * @param planets - Array of planets to update
 */
export function updatePlanetVelocities(planets: Planet[]): void {
  if (!planets || planets.length === 0) return;
  
  for (const planet of planets) {
    // Apply velocity to position
    if (planet.vx || planet.vy) {
      planet.x += planet.vx || 0;
      planet.y += planet.vy || 0;
      
      // Also shift the orbit center slightly for a more dramatic effect
      if (planet.orbitCenter) {
        planet.orbitCenter.x += (planet.vx || 0) * 0.3;
        planet.orbitCenter.y += (planet.vy || 0) * 0.3;
      }
      
      // Apply decay
      planet.vx = (planet.vx || 0) * PLANET_PHYSICS.clickRepulsionDecay;
      planet.vy = (planet.vy || 0) * PLANET_PHYSICS.clickRepulsionDecay;
      
      // Zero out very small velocities
      if (Math.abs(planet.vx || 0) < 0.01) planet.vx = 0;
      if (Math.abs(planet.vy || 0) < 0.01) planet.vy = 0;
    }
  }
}
