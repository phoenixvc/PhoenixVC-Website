// components/Layout/Starfield/blackHoles.ts
import { getColorPalette } from "./constants";
import { BlackHole, BlackHoleData, BlackHoleParticle } from "./types";

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

  // We're not using centerX and centerY here, so we don't need to destructure them
  // Instead, we'll directly use the values where needed

  blackHoles.forEach(blackHoleData => {
    // Calculate position based on screen dimensions and adjusted center
    // Use the effective width (total width - sidebar)
    const effectiveWidth = width - sidebarWidth;

    // Calculate x position: sidebar width + percentage of effective width
    const x = sidebarWidth + (effectiveWidth * blackHoleData.x);
    const y = height * blackHoleData.y;

    // Initialize orbiting particles
    const particles: BlackHoleParticle[] = [];
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
      radius: 20 * blackHoleSize // Base size of black hole
    });
  });

  return initializedBlackHoles;
};

// Draw a black hole and its particles
export const drawBlackHole = (
  ctx: CanvasRenderingContext2D,
  blackHole: BlackHole,
  deltaTime: number,
  particleSpeed: number
): void => {
  // Update and draw orbiting particles
  blackHole.particles.forEach(particle => {
    // Update angle based on speed
    particle.angle += particle.speed * deltaTime * particleSpeed;

    // Update position
    particle.x = blackHole.x + Math.cos(particle.angle) * particle.distance;
    particle.y = blackHole.y + Math.sin(particle.angle) * particle.distance;

    // Draw particle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
  });

  // Draw black hole
  const gradient = ctx.createRadialGradient(
    blackHole.x, blackHole.y, 0,
    blackHole.x, blackHole.y, blackHole.radius
  );

  gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
  gradient.addColorStop(0.7, "rgba(20, 20, 20, 0.8)");
  gradient.addColorStop(1, "rgba(20, 20, 20, 0)");

  ctx.beginPath();
  ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
};
