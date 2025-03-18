// components/Layout/Starfield/employeeStars.ts

import { EmployeeData, EmployeeStar, HoverInfo, Satellite } from "./types";
import { calculateCenter } from "./utils";
import { createSoftenedColor } from "./starUtils";
import { drawEmployeeStar } from "./starREndering";

// Initialize employee stars
export const initEmployeeStars = (
  width: number,
  height: number,
  enableEmployeeStars: boolean,
  employees: EmployeeData[],
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number,
  employeeStarSize: number,
  useSimpleRendering: boolean = false
): EmployeeStar[] => {
  if (!enableEmployeeStars || !employees || employees.length === 0) return [];

  console.log("Initializing employee stars:", employees.length);

  const employeeStars: EmployeeStar[] = [];
  const { centerX, centerY } = calculateCenter(
    width, height, sidebarWidth, centerOffsetX, centerOffsetY
  );

  employees.forEach((employee, index) => {
    const totalEmployees = employees.length;
    const angleStep = (Math.PI * 2) / totalEmployees;
    const baseAngle = index * angleStep;

    const orbitRadius = Math.min(width, height) * 0.25 + (index * 40);
    const orbitSpeed = employee.speed || (0.0005 + (0.0002 * (index % 3)));

    const x = centerX + Math.cos(baseAngle) * orbitRadius;
    const y = centerY + Math.sin(baseAngle) * orbitRadius;

    const vx = 0;
    const vy = 0;

    const satellites: Satellite[] = [];

    if (!useSimpleRendering) {
      // Create satellites
      const satelliteCount = 3 + Math.floor((employee.mass || 100) / 40);

      for (let i = 0; i < satelliteCount; i++) {
        // Distribute satellites more evenly around the star
        const angle = (i / satelliteCount) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 20 + Math.random() * 15;
        const speed = 0.005 + Math.random() * 0.01; // Increased speed for better visibility
        const eccentricity = 0.1 + Math.random() * 0.2;
        const size = (0.8 + Math.random() * 1.2) * employeeStarSize;

        // Ensure valid color format with proper hex values
        const color = employee.color ?
          `${employee.color}${Math.floor(Math.random() * 70 + 80).toString(16).padStart(2, "0")}` :
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

    const employeeStar = {
      employee,
      x,
      y,
      vx,
      vy,
      angle: baseAngle,
      rotationSpeed: 0.001 + (Math.random() * 0.001),
      orbitRadius,
      orbitSpeed,
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
      verticalFactor // Add vertical factor for orbit shaping
    } as EmployeeStar;

    employeeStars.push(employeeStar);
  });

  if (employeeStars.length >= 2) {
    // Make first employee a bright comet with wide, vertically stretched orbit
    employeeStars[0].pathType = "comet";
    employeeStars[0].trailLength = 280;
    employeeStars[0].pathEccentricity = 0.7;
    employeeStars[0].orbitRadius = Math.min(width, height) * 0.35;
    employeeStars[0].orbitSpeed = 0.0001;
    employeeStars[0].glowIntensity = 2.5;
    employeeStars[0].verticalFactor = 2.2; // Significant vertical stretch

    // Make sure all comets have trails and proper speeds
    employeeStars.forEach(star => {
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

  return employeeStars;
};

// Check if mouse is hovering over an employee star
export const checkEmployeeHover = (
  mouseX: number,
  mouseY: number,
  employeeStars: EmployeeStar[],
  employeeStarSize: number,
  currentHoverInfo: HoverInfo,
  setHoverInfo: (info: HoverInfo) => void
): boolean => {
  if (!employeeStars || !employeeStars.length) return false;

  let hoveredStar = null;
  let closestDistance = Infinity;

  // Find the closest star to the mouse
  for (const empStar of employeeStars) {
    const dist = Math.sqrt(
      Math.pow(mouseX - empStar.x, 2) +
      Math.pow(mouseY - empStar.y, 2)
    );

    // Increased hover radius for better detection
    const hoverRadius = 30 * employeeStarSize; // Increased from 25 to 30

    if (dist < hoverRadius && dist < closestDistance) {
      closestDistance = dist;
      hoveredStar = empStar;
    }

    // If this star was previously hovered but now isn't
    if (empStar.isHovered && empStar !== hoveredStar) {
      // Restore original orbit speed if it was stored
      if (empStar.originalOrbitSpeed !== undefined) {
        empStar.orbitSpeed = empStar.originalOrbitSpeed;
        empStar.originalOrbitSpeed = undefined;
      }
      empStar.isMovementPaused = false;
      empStar.isHovered = false;

      // Reset pulsation to normal
      if (empStar.pulsation && !empStar.useSimpleRendering) {
        empStar.pulsation.enabled = true;
        empStar.pulsation.minScale = 0.92;
        empStar.pulsation.maxScale = 1.08;
        empStar.pulsation.speed = 0.00002;
      }
    }
  }

  // Update the hovered star
  if (hoveredStar) {
    // If this star wasn't hovered before, store its original orbit speed
    if (!hoveredStar.isHovered) {
      hoveredStar.originalOrbitSpeed = hoveredStar.orbitSpeed;
      // Freeze the star by setting orbit speed to 0
      hoveredStar.orbitSpeed = 0;
      hoveredStar.isMovementPaused = true;
    }

    hoveredStar.isHovered = true;

    // Set more dramatic pulsation for hovered star
    if (hoveredStar.pulsation && !hoveredStar.useSimpleRendering) {
      hoveredStar.pulsation.enabled = true;
      hoveredStar.pulsation.minScale = 0.8;
      hoveredStar.pulsation.maxScale = 1.3; // Much more dramatic hover effect
      hoveredStar.pulsation.speed = 0.0006; // Faster pulsation when hovered
    }

    setHoverInfo({
      employee: hoveredStar.employee,
      x: hoveredStar.x,
      y: hoveredStar.y,
      show: true
    });

    return true;
  }

  if (currentHoverInfo.show) {
    setHoverInfo({ ...currentHoverInfo, show: false });
  }
  return false;
};

// Update employee stars animation
export const updateEmployeeStars = (
  ctx: CanvasRenderingContext2D,
  employeeStars: EmployeeStar[],
  deltaTime: number,
  employeeStarSize: number,
  employeeDisplayStyle: "initials" | "avatar" | "both"
): void => {
  if (!ctx || !employeeStars || !employeeStars.length) return;

  const cappedDeltaTime = Math.min(deltaTime, 100);

  employeeStars.forEach(empStar => {
    // Draw the star regardless of movement state
    drawEmployeeStar(ctx, empStar, cappedDeltaTime, employeeStarSize, employeeDisplayStyle);
  });
};
