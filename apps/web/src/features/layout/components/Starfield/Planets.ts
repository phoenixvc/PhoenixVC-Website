// apps/web/src/features/layout/components/Starfield/Planets.ts
// Orbital rendering system for portfolio items (comets/planets)

import { getObjectById, SUNS } from "./cosmos/cosmicHierarchy";
import { worldToScreen } from "./cosmos/cosmicNavigation";
import { Camera } from "./cosmos/types";
import { drawPlanet } from "./starRendering";
import { PortfolioProject, HoverInfo, Planet, Satellite } from "./types";
import { calculateCenter } from "./utils";

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

  console.log("Initializing portfolio comets:", portfolioItems.length);

  const planets: Planet[] = [];
  const { centerX, centerY } = calculateCenter(
    width, height, sidebarWidth, centerOffsetX, centerOffsetY
  );

  portfolioItems.forEach((item, index) => {
    const totalItems = portfolioItems.length;
    const angleStep = (Math.PI * 2) / totalItems;
    const baseAngle = index * angleStep;

    const orbitRadius = Math.min(width, height) * 0.25 + (index * 40);
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

  // Instead of hardcoding "team-sun-system"
  planets.forEach(planet => {
    // Get a random sun ID from your cosmic hierarchy
    const suns = SUNS; // Import this from cosmicHierarchy.ts
    const randomSunIndex = Math.floor(Math.random() * suns.length);
    planet.orbitParentId = suns[randomSunIndex].id;
  });

  if (planets.length >= 2) {
    // Make first portfolio item a bright comet with wide, vertically stretched orbit
    planets[0].pathType = "comet";
    planets[0].trailLength = 280;
    planets[0].pathEccentricity = 0.7;
    planets[0].orbitRadius = Math.min(width, height) * 0.35;
    planets[0].orbitSpeed = 0.0001;
    planets[0].glowIntensity = 2.5;
    planets[0].verticalFactor = 2.2; // Significant vertical stretch

    // Make sure all comets have trails and proper speeds
    planets.forEach(star => {
      if (star.pathType === "comet") {
        star.trailLength = star.trailLength || 180;
        star.orbitSpeed = 0.0001;
        star.verticalFactor = star.verticalFactor || 1.8;
      }

      // Ensure satellites have proper speeds
      if (star.satellites && star.satellites.length > 0) {
        star.satellites.forEach(satellite => {
          satellite.speed = 0.005 + Math.random() * 0.01; // Increased speed for better visibility
        });
      }
    });
  }

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

  let hoveredPlanet = null;
  let closestDistance = Infinity;

  // Find the closest planet to the mouse
  for (const planet of planets) {
    const dist = Math.sqrt(
      Math.pow(mouseX - planet.x, 2) +
      Math.pow(mouseY - planet.y, 2)
    );

    // Increased hover radius for better detection
    const hoverRadius = 30 * planetSize; // Increased from 25 to 30

    if (dist < hoverRadius && dist < closestDistance) {
      closestDistance = dist;
      hoveredPlanet = planet;
    }

    // If this planet was previously hovered but now isn't
    if (planet.isHovered && planet !== hoveredPlanet) {
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

  // Update the hovered planet
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

  const cappedDeltaTime = Math.min(deltaTime, 100);

  // Track which suns we've already drawn to avoid duplicates
  const drawnSuns = new Set<string>();

  planets.forEach(planet => {
    /* ---------- Recalc orbit centre if camera is available ---------- */
    if (camera && planet.orbitParentId) {
      const parent = getObjectById(planet.orbitParentId);
      if (parent) {
        planet.orbitCenter = worldToScreen(
          parent.position.x,
          parent.position.y,
          camera,
          ctx.canvas.width,
          ctx.canvas.height
        );
        
        // Draw the sun at the orbital center if not already drawn
        if (!drawnSuns.has(planet.orbitParentId)) {
          drawnSuns.add(planet.orbitParentId);
          const sunSize = (parent.size || 0.05) * 50 * planetSize;
          const sunColor = parent.color || "#f39c12";
          drawSunAtCenter(ctx, planet.orbitCenter.x, planet.orbitCenter.y, sunColor, sunSize);
        }
      }
    } else if (planet.orbitCenter && planet.orbitParentId) {
      // No camera mode - draw sun at the stored orbit center
      if (!drawnSuns.has(planet.orbitParentId)) {
        drawnSuns.add(planet.orbitParentId);
        const parent = getObjectById(planet.orbitParentId);
        if (parent) {
          const sunSize = (parent.size || 0.05) * 50 * planetSize;
          const sunColor = parent.color || "#f39c12";
          drawSunAtCenter(ctx, planet.orbitCenter.x, planet.orbitCenter.y, sunColor, sunSize);
        }
      }
    }
    // If no camera, use the existing orbit center from initialization
    /* ------------------------------------------------------------ */

    // Draw the comet/planet regardless of movement state
    drawPlanet(ctx, planet, cappedDeltaTime, planetSize, employeeDisplayStyle);
  });
};
