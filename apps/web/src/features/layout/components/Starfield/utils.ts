// utils.ts
import { BlackHole, EmployeeStar, OrbitingParticle, BlackHoleData, EmployeeData } from "./types";
import { getColorPalette } from "./constants";

// Calculate the effective center point accounting for sidebar and offsets
export const calculateCenter = (
  width: number,
  height: number,
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number
) => {
  // Adjust for sidebar by shifting center to the right
  const effectiveWidth = width - sidebarWidth;
  const centerX = sidebarWidth + (effectiveWidth / 2) + centerOffsetX;
  const centerY = height / 2 + centerOffsetY;

  return { centerX, centerY };
};

// Initialize black holes
export const initBlackHoles = (
  width: number,
  height: number,
  enableBlackHole: boolean,
  blackHoles: BlackHoleData[],
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number,
  blackHoleSize: number,
  particleSpeed: number,
  colorScheme: string,
  starSize: number
): BlackHole[] => {
  if (!enableBlackHole) return [];

  const initializedBlackHoles: BlackHole[] = [];

  blackHoles.forEach(blackHoleData => {
    // Calculate position based on screen dimensions and adjusted center
    // Use the effective width (total width - sidebar)
    const effectiveWidth = width - sidebarWidth;

    // Calculate x position: sidebar width + percentage of effective width
    const x = sidebarWidth + (effectiveWidth * blackHoleData.x);
    const y = height * blackHoleData.y;

    // Initialize orbiting particles
    const particles: OrbitingParticle[] = [];
    const colors = getColorPalette(colorScheme);

    for (let i = 0; i < blackHoleData.particles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 25 + Math.random() * 25;
      const speed = (0.0005 + Math.random() * 0.001) * particleSpeed;

      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = (0.5 + Math.random() * 1.5) * starSize;

      particles.push({
        angle,
        distance,
        speed,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        size,
        color
      });
    }

    initializedBlackHoles.push({
      id: blackHoleData.id,
      x,
      y,
      mass: blackHoleData.mass,
      particles,
      size: 20 * blackHoleSize // Base size of black hole
    });
  });

  return initializedBlackHoles;
};

// Initialize employee stars
export const initEmployeeStars = (
  width: number,
  height: number,
  enableEmployeeStars: boolean,
  employees: EmployeeData[],
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number,
  employeeStarSize: number
): EmployeeStar[] => {
  if (!enableEmployeeStars) return [];

  const employeeStars: EmployeeStar[] = [];
  const { centerX, centerY } = calculateCenter(
    width, height, sidebarWidth, centerOffsetX, centerOffsetY
  );

  // Place employees in a circular pattern around the center
  employees.forEach((employee, index) => {
    const totalEmployees = employees.length;
    const angleStep = (Math.PI * 2) / totalEmployees;
    const baseAngle = index * angleStep;

    // Calculate orbit parameters - smaller orbit radius to keep them more visible
    const orbitRadius = 100 + (index * 30); // Different orbit radii, but closer to center
    const orbitSpeed = 0.00005 + (0.00002 * (index % 3)); // Different speeds

    // Calculate initial position
    const x = centerX + Math.cos(baseAngle) * orbitRadius;
    const y = centerY + Math.sin(baseAngle) * orbitRadius;

    // Create satellites (small particles orbiting the employee star)
    const satellites = [];
    const satelliteCount = 5 + Math.floor(employee.mass / 30); // More satellites for higher mass

    for (let i = 0; i < satelliteCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 10;
      const speed = 0.001 + Math.random() * 0.002;
      const size = (0.5 + Math.random() * 1) * employeeStarSize;

      // Use employee color with transparency for satellites
      const color = employee.color ?
        `${employee.color}${Math.floor(Math.random() * 50 + 50).toString(16)}` : // Random transparency
        "rgba(255, 255, 255, 0.7)";

      satellites.push({
        angle,
        distance,
        speed,
        size,
        color
      });
    }

    employeeStars.push({
      employee,
      x,
      y,
      angle: baseAngle,
      orbitRadius,
      orbitSpeed,
      orbitCenterX: centerX,
      orbitCenterY: centerY,
      satellites
    });
  });

  return employeeStars;
};
