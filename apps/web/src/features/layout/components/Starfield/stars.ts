// components/Layout/Starfield/stars.ts
import { Star, BlackHole, MousePosition, CenterPosition } from "./types";
import { getColorPalette } from "./constants";
import { applyGravity, distance } from "./utils";

// Initialize stars
export const initStars = (
  width: number,
  height: number,
  count: number,
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number,
  starSize: number,
  colorScheme: string
): Star[] => {
  const stars: Star[] = [];
  const colors = getColorPalette(colorScheme);

  // Calculate effective width (accounting for sidebar)
  const effectiveWidth = width - sidebarWidth;

  for (let i = 0; i < count; i++) {
    // Position stars within the effective width (after sidebar)
    const x = sidebarWidth + Math.random() * effectiveWidth;
    const y = Math.random() * height;

    // Random size with weighted distribution (more small stars)
    const sizeMultiplier = Math.pow(Math.random(), 2) * 2 + 0.5;
    const size = sizeMultiplier * starSize;

    // Random color from palette
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Initial velocity (very small random values)
    const vx = (Math.random() - 0.5) * 0.2;
    const vy = (Math.random() - 0.5) * 0.2;

    // Add star with all properties
    stars.push({
      x,
      y,
      size,
      color,
      vx,
      vy,
      originalX: x,
      originalY: y,
      mass: size * 2, // Mass proportional to size
      speed: 0.5 + Math.random() * 0.5 // Random speed factor
    });
  }

  return stars;
};

// Update star positions based on various effects
export const updateStarPositions = (
  stars: Star[],
  width: number,
  height: number,
  deltaTime: number,
  enableFlowEffect: boolean,
  flowStrength: number,
  mousePosition: MousePosition,
  enableMouseInteraction: boolean,
  blackHoles: BlackHole[],
  gravitationalPull: number,
  heroMode: boolean,
  centerPosition: CenterPosition,
  mouseEffectRadius: number
): void => {
  // Time scaling factor to normalize animation speed
  const timeScale = deltaTime / 16; // Normalize to ~60fps

  stars.forEach(star => {
    // Start with current velocity
    let vx = star.vx;
    let vy = star.vy;

    // Apply flow effect if enabled (gentle rightward movement)
    if (enableFlowEffect) {
      vx += 0.001 * flowStrength * timeScale;
    }

    // Apply mouse interaction if enabled and mouse is on screen
    if (enableMouseInteraction && mousePosition.isOnScreen) {
      const dist = distance(star.x, star.y, mousePosition.x, mousePosition.y);

      // Only affect stars within the effect radius
      if (dist < mouseEffectRadius) {
        // Calculate force based on distance (stronger when closer)
        const force = (1 - dist / mouseEffectRadius) * 0.02 * timeScale;

        // Direction from mouse to star
        const dx = star.x - mousePosition.x;
        const dy = star.y - mousePosition.y;
        const angle = Math.atan2(dy, dx);

        // Apply force in the direction away from mouse
        vx += Math.cos(angle) * force;
        vy += Math.sin(angle) * force;
      }
    }

    // Apply black hole gravity
    blackHoles.forEach(blackHole => {
      const { vx: newVx, vy: newVy } = applyGravity(
        star.x ?? 0, star.y ?? 0, vx ?? 0, vy ?? 0, star.mass ?? 0,
        blackHole.x, blackHole.y, blackHole.mass * gravitationalPull,
        timeScale
      );

      vx = newVx;
      vy = newVy;
    });

    // In hero mode, add attraction to center of container
    if (heroMode && centerPosition) {
      // Gentle attraction to center
      const dist = distance(star.x, star.y, centerPosition.x, centerPosition.y);
      if (dist > 100) { // Only attract stars that are far from center
        const { vx: newVx, vy: newVy } = applyGravity(
          star.x ?? 0, star.y ?? 0, vx, vy, star.mass ?? 0,
          centerPosition.x, centerPosition.y, 500, // Center has strong mass
          timeScale * 0.1 // Reduce time scale for gentler effect
        );

        // Mix with original velocity for smoother effect
        vx = vx * 0.95 + newVx * 0.05;
        vy = vy * 0.95 + newVy * 0.05;
      }
    }

    // Apply velocity with time scaling
    star.x += vx * timeScale;
    star.y += vy * timeScale;

    // Store updated velocity
    star.vx = vx;
    star.vy = vy;

    // Wrap around screen edges with some margin
    const margin = 50;

    if (star.x < -margin) star.x = width + margin;
    if (star.x > width + margin) star.x = -margin;
    if (star.y < -margin) star.y = height + margin;
    if (star.y > height + margin) star.y = -margin;
  });
};

// Draw all stars
export const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Star[]
): void => {
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = star.color;
    ctx.fill();
  });
};

// Draw connections between nearby stars (network effect)
export const drawConnections = (
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  maxDistance: number,
  opacity: number,
  colorScheme: string
): void => {
  const baseColor = colorScheme === "white" ? "255, 255, 255" : "147, 51, 234"; // White or purple

  // For performance, we"ll limit how many stars we check
  // by using a subset of stars for connection sources
  const connectionSources = stars.filter((_, i) => i % 3 === 0);

  ctx.lineWidth = 0.5;

  connectionSources.forEach(star1 => {
    // Check against all stars for connections
    stars.forEach(star2 => {
      // Don"t connect to self
      if (star1 === star2) return;

      const dist = distance(star1.x, star1.y, star2.x, star2.y);

      // Only connect stars within the maximum distance
      if (dist < maxDistance) {
        // Calculate opacity based on distance (fade out as distance increases)
        const lineOpacity = opacity * (1 - dist / maxDistance);

        // Draw line with calculated opacity
        ctx.beginPath();
        ctx.moveTo(star1.x, star1.y);
        ctx.lineTo(star2.x, star2.y);
        ctx.strokeStyle = `rgba(${baseColor}, ${lineOpacity})`;
        ctx.stroke();
      }
    });
  });
};

// Create an explosion effect at a point
export const createExplosion = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  duration: number
): void => {
  const startTime = performance.now();
  const animate = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Expand radius and fade out
    const currentRadius = radius * progress;
    const alpha = 1 - progress;

    // Draw explosion
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
    gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`);
    gradient.addColorStop(1, `${color}00`); // Fully transparent at edge

    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Continue animation until complete
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Apply force to stars from an explosion
export const applyExplosionForce = (
  stars: Star[],
  x: number,
  y: number,
  radius: number,
  force: number
): void => {
  stars.forEach(star => {
    const dist = distance(star.x, star.y, x, y);

    // Only affect stars within explosion radius
    if (dist < radius) {
      // Calculate force based on distance from center (stronger closer to center)
      const explosionForce = force * (1 - dist / radius);

      // Direction from explosion to star
      const angle = Math.atan2(star.y - y, star.x - x);

      // Apply force
      star.vx += Math.cos(angle) * explosionForce;
      star.vy += Math.sin(angle) * explosionForce;
    }
  });
};

// Reset stars to their original positions (with animation)
export const resetStars = (
  stars: Star[],
  duration: number = 1000
): void => {
  const startTime = performance.now();

  stars.forEach(star => {
    // Store current position and calculate target position
    const startX = star.x;
    const startY = star.y;
    const targetX = star.originalX;
    const targetY = star.originalY;

    // Store original velocity
    const originalVx = star.vx;
    const originalVy = star.vy;

    // Set target velocity to 0
    star.targetVx = 0;
    star.targetVy = 0;

    // Create animation function for this star
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease progress for smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      // Interpolate position
      star.x = startX + (targetX - startX) * easedProgress;
      star.y = startY + (targetY - startY) * easedProgress;

      // Interpolate velocity
      star.vx = originalVx * (1 - easedProgress);
      star.vy = originalVy * (1 - easedProgress);

      // Continue animation until complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  });
};
