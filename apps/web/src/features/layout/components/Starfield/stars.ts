// components/Layout/Starfield/stars.ts
import { Star, BlackHole, MousePosition } from "./types";
import { getColorPalette } from "./constants";
import { distance } from "./utils";

// Global animation speed control - add this at the top of the file
const GLOBAL_SPEED_MULTIPLIER = 0.2; // Adjust this value to slow down all animations

// Initialize completely static stars
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

    // Add star with ZERO velocity and force - COMPLETELY FROZEN
    stars.push({
      x,
      y,
      size,
      color,
      vx: 0,
      vy: 0,
      originalX: x,
      originalY: y,
      mass: size * 2,
      speed: 0,  // Zero speed
      isActive: false,
      lastPushed: 0,
      targetVx: 0,
      targetVy: 0,
      // Add force tracking
      fx: 0,
      fy: 0
    });
  }

  return stars;
};

export function updateStarPositions(
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
  centerPosition: { x: number; y: number },
  mouseEffectRadius: number,
  maxVelocity: number = 0.5,
  animationSpeed: number = 1.0
) {
  // Safety check for deltaTime
  if (!deltaTime || isNaN(deltaTime) || deltaTime > 100) {
    deltaTime = 16; // Use a reasonable default if deltaTime is invalid
  }

  // Normalize deltaTime to prevent extreme values
  const normalizedDelta = Math.min(deltaTime, 32);

  // Scale time based on animation speed AND global multiplier
  const timeScale = 0.1 * animationSpeed * GLOBAL_SPEED_MULTIPLIER;

  // Update each star
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];

    // Apply flow effect if enabled
    if (enableFlowEffect) {
      star.vx += (Math.random() - 0.5) * flowStrength * normalizedDelta * timeScale;
      star.vy += (Math.random() - 0.5) * flowStrength * normalizedDelta * timeScale;
    }

    // Apply black hole gravitational pull
    if (blackHoles && blackHoles.length > 0) {
      for (let j = 0; j < blackHoles.length; j++) {
        const blackHole = blackHoles[j];
        const dx = blackHole.x - star.x;
        const dy = blackHole.y - star.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Only apply gravity if star is within influence range
        if (dist < blackHole.radius * 4) {
          const force = gravitationalPull * blackHole.mass / distSq;
          star.vx += dx / dist * force * normalizedDelta * timeScale;
          star.vy += dy / dist * force * normalizedDelta * timeScale;
        }
      }
    }

    // Apply mouse interaction
    if (enableMouseInteraction && mousePosition.isOnScreen) {
      const dx = mousePosition.x - star.x;
      const dy = mousePosition.y - star.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      if (dist < mouseEffectRadius) {
        const repelForce = 0.2 * (mouseEffectRadius - dist) / mouseEffectRadius;
        star.vx -= dx / dist * repelForce * normalizedDelta * timeScale;
        star.vy -= dy / dist * repelForce * normalizedDelta * timeScale;
      }
    }

    // Apply velocity limits
    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
    if (speed > maxVelocity * GLOBAL_SPEED_MULTIPLIER) { // Apply multiplier to max velocity too
      star.vx = (star.vx / speed) * maxVelocity * GLOBAL_SPEED_MULTIPLIER;
      star.vy = (star.vy / speed) * maxVelocity * GLOBAL_SPEED_MULTIPLIER;
    }

    // Apply damping
    star.vx *= 0.995;
    star.vy *= 0.995;

    // Update position with global speed multiplier
    star.x += star.vx * normalizedDelta * animationSpeed * GLOBAL_SPEED_MULTIPLIER;
    star.y += star.vy * normalizedDelta * animationSpeed * GLOBAL_SPEED_MULTIPLIER;

    // Wrap around edges
    if (star.x < 0) star.x = width;
    if (star.x > width) star.x = 0;
    if (star.y < 0) star.y = height;
    if (star.y > height) star.y = 0;
  }
}

// Integrate forces to update velocities and positions using Velocity Verlet integration
function integrateForces(stars: Star[], dt: number, maxVelocity: number) {
  // Apply global speed multiplier to dt
  const adjustedDt = dt * GLOBAL_SPEED_MULTIPLIER;

  stars.forEach(star => {
    // Apply strong damping
    const damping = 0.9;
    star.vx *= damping;
    star.vy *= damping;

    // Update velocity based on force with global speed multiplier
    star.vx += star.fx * adjustedDt;
    star.vy += star.fy * adjustedDt;

    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
    if (speed > maxVelocity * GLOBAL_SPEED_MULTIPLIER) { // Apply multiplier to max velocity
      star.vx = (star.vx / speed) * maxVelocity * GLOBAL_SPEED_MULTIPLIER;
      star.vy = (star.vy / speed) * maxVelocity * GLOBAL_SPEED_MULTIPLIER;
    }

    // Update position with adjusted dt
    star.x += star.vx * adjustedDt;
    star.y += star.vy * adjustedDt;
  });
}

function handleBoundaries(stars: Star[], width: number, height: number) {
  const buffer = 50;

  stars.forEach(star => {
    if (star.x < -buffer) star.x = width + buffer;
    if (star.x > width + buffer) star.x = -buffer;
    if (star.y < -buffer) star.y = height + buffer;
    if (star.y > height + buffer) star.y = -buffer;
  });
}

// Draw all stars
export const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Star[]
): void => {
  console.log(`Drawing ${stars.length} stars`);

  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

    if (star.isActive) {
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 2
      );
      gradient.addColorStop(0, star.color);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;

      // Draw a slightly larger glow
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw the actual star
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
    } else {
      ctx.fillStyle = star.color;
    }

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

  // For performance, check only every 10th star
  const connectionSources = stars.filter((_, i) => i % 10 === 0);

  ctx.lineWidth = 0.5;

  connectionSources.forEach(star1 => {
    // Check against all stars for connections
    stars.forEach(star2 => {
      // Don't connect to self
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
  // Apply global speed multiplier to duration to slow down the explosion animation
  const adjustedDuration = duration / GLOBAL_SPEED_MULTIPLIER;

  const startTime = performance.now();
  const animate = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / adjustedDuration, 1);

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

// Apply force to stars from an explosion with minimal effect
export const applyExplosionForce = (
  stars: Star[],
  x: number,
  y: number,
  radius: number,
  force: number
): void => {
  // Use extremely low force with global speed multiplier
  const adjustedForce = force * 0.001 * GLOBAL_SPEED_MULTIPLIER;

  stars.forEach(star => {
    const dist = distance(star.x, star.y, x, y);

    // Only affect stars within explosion radius
    if (dist < radius) {
      // Calculate force based on distance from center
      const explosionForce = adjustedForce * (1 - dist / radius);

      // Direction from explosion to star
      const angle = Math.atan2(star.y - y, star.x - x);

      // Apply force with velocity clamping
      star.vx += Math.cos(angle) * explosionForce;
      star.vy += Math.sin(angle) * explosionForce;

      const currentVelocity = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
      const maxExplosionVelocity = 0.00000001 * GLOBAL_SPEED_MULTIPLIER; // Apply multiplier to max velocity

      if (currentVelocity > maxExplosionVelocity) {
        star.vx = (star.vx / currentVelocity) * maxExplosionVelocity;
        star.vy = (star.vy / currentVelocity) * maxExplosionVelocity;
      }

      // Mark star as active
      star.lastPushed = Date.now();
      star.isActive = true;
    }
  });
};

// Reset stars to their original positions (with animation)
export const resetStars = (
  stars: Star[],
  duration: number = 1000
): void => {
  // Apply global speed multiplier to duration to slow down the reset animation
  const adjustedDuration = duration / GLOBAL_SPEED_MULTIPLIER;

  const startTime = performance.now();

  stars.forEach(star => {
    // Store current position and calculate target position
    const startX = star.x;
    const startY = star.y;
    const targetX = star.originalX;
    const targetY = star.originalY;

    // Reset forces and velocities
    star.fx = 0;
    star.fy = 0;
    star.vx = 0;
    star.vy = 0;

    // Create animation function for this star
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / adjustedDuration, 1);

      // Ease progress for smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      // Interpolate position
      star.x = startX + (targetX - startX) * easedProgress;
      star.y = startY + (targetY - startY) * easedProgress;

      // Continue animation until complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  });
};

// Apply click force to nearby stars with minimal effect
export const applyClickForce = (
  stars: Star[],
  clickX: number,
  clickY: number,
  radius: number,
  force: number
): void => {
  // Use extremely low force with global speed multiplier
  const adjustedForce = force * 0.001 * GLOBAL_SPEED_MULTIPLIER;

  stars.forEach(star => {
    const dx = star.x - clickX;
    const dy = star.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < radius) {
      // Calculate force based on distance (stronger near click point)
      const strength = (1 - dist / radius) * adjustedForce;

      // Calculate direction vector
      const dirX = dx / dist;
      const dirY = dy / dist;

      // Apply force as velocity change
      star.vx += dirX * strength;
      star.vy += dirY * strength;

      // Apply immediate velocity clamping after click
      const currentVelocity = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
      const maxClickVelocity = 0.01 * GLOBAL_SPEED_MULTIPLIER; // Apply multiplier to max velocity

      if (currentVelocity > maxClickVelocity) {
        star.vx = (star.vx / currentVelocity) * maxClickVelocity;
        star.vy = (star.vy / currentVelocity) * maxClickVelocity;
      }

      // Mark star as "pushed" for tracking collisions
      star.lastPushed = Date.now();
      star.isActive = true;
    }
  });
};

// New function for completely static stars
export const initStaticStars = (
  width: number,
  height: number,
  starCount: number,
  sidebarWidth: number = 0,
  centerOffsetX: number = 0,
  centerOffsetY: number = 0,
  starSize: number = 1.0,
  colorScheme: string = "white"
): Star[] => {
  return initStars(
    width,
    height,
    starCount,
    sidebarWidth,
    centerOffsetX,
    centerOffsetY,
    starSize,
    colorScheme
  );
};
