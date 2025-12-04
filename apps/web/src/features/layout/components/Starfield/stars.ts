// components/Layout/Starfield/stars.ts
import { Star, BlackHole, MousePosition } from "./types";
import { getColorPalette } from "./constants";
import { distance } from "./utils";

// Global animation speed control - add this at the top of the file
const GLOBAL_SPEED_MULTIPLIER = 0.15; // Reduced for smoother, more subtle animations

// Movement multiplier for active (clicked) stars - allows them to move faster
const ACTIVE_STAR_MOVEMENT_MULTIPLIER = 2.0; // Increased from 0.5 for more visible click effects

// Velocity limits
const ACTIVE_STAR_VELOCITY_MULTIPLIER = 32; // Doubled from 16 for more dramatic click effects
const DAMPING_FACTOR_ACTIVE = 0.985; // Less damping for active stars
const DAMPING_FACTOR_INACTIVE = 0.99; // More damping for inactive stars

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

    // Apply flow effect if enabled (reduced intensity to minimize flicker)
    if (enableFlowEffect) {
      star.vx += (Math.random() - 0.5) * flowStrength * normalizedDelta * timeScale * 0.3;
      star.vy += (Math.random() - 0.5) * flowStrength * normalizedDelta * timeScale * 0.3;
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

    // Apply velocity limits with smoother clamping
    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
    // Use a MUCH higher maxVelocity for recently pushed stars
    const effectiveMaxVelocity = star.isActive ? maxVelocity * ACTIVE_STAR_VELOCITY_MULTIPLIER : maxVelocity;
    if (speed > effectiveMaxVelocity) {
      star.vx = (star.vx / speed) * effectiveMaxVelocity;
      star.vy = (star.vy / speed) * effectiveMaxVelocity;
    }

    // Apply less damping for active stars so they travel further
    const dampingFactor = star.isActive ? DAMPING_FACTOR_ACTIVE : DAMPING_FACTOR_INACTIVE;
    star.vx *= dampingFactor;
    star.vy *= dampingFactor;

    // Update position - use higher multiplier for active stars
    const movementMultiplier = star.isActive ? ACTIVE_STAR_MOVEMENT_MULTIPLIER : GLOBAL_SPEED_MULTIPLIER;
    star.x += star.vx * normalizedDelta * animationSpeed * movementMultiplier;
    star.y += star.vy * normalizedDelta * animationSpeed * movementMultiplier;

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

export const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Star[]
): void => {
  const now = Date.now();

  stars.forEach(star => {
    // Check if star was recently pushed (within last 1500ms)
    const recentlyPushed = star.isActive && (now - star.lastPushed < 1500);

    if (recentlyPushed) {
      // Calculate how recent the push was (1.0 = just now, 0.0 = 1500ms ago)
      const recency = 1 - (now - star.lastPushed) / 1500;

      // MUCH MORE VISIBLE glow effect for pushed stars
      const glowRadius = star.size * (3 + recency * 5); // Larger glow for recent pushes
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glowRadius
      );

      // Get base color and create brighter version for center
      const baseColor = star.color;

      // Extract RGB components to create a brighter version
      let brighterColor = baseColor;
      if (baseColor.startsWith("rgba(")) {
        const parts = baseColor.substring(5, baseColor.length-1).split(",");
        if (parts.length >= 3) {
          // Increase RGB values to make brighter (max 255)
          const r = Math.min(255, parseInt(parts[0]) + 100);
          const g = Math.min(255, parseInt(parts[1]) + 100);
          const b = Math.min(255, parseInt(parts[2]) + 100);
          brighterColor = `rgba(${r}, ${g}, ${b}, 1.0)`;
        }
      }

      // Create glow gradient with higher opacity
      gradient.addColorStop(0, brighterColor);
      gradient.addColorStop(0.5, baseColor.replace(/[\d.]+\)$/, "0.7)")); // Higher opacity
      gradient.addColorStop(1, baseColor.replace(/[\d.]+\)$/, "0.2)")); // Higher opacity

      // Draw glow
      ctx.beginPath();
      ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw actual star (larger than normal)
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * (1.5 + recency), 0, Math.PI * 2);
      ctx.fillStyle = brighterColor;
      ctx.fill();
    } else {
      // Normal star rendering
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();
    }
  });
};

// ==========================================
// Connection Stagger Animation Constants
// ==========================================

/**
 * Configuration for staggered connection reveal animation
 */
const CONNECTION_STAGGER_CONFIG = {
  /** Total duration for all connections to start appearing (ms) */
  staggerDuration: 8000,
  /** Duration for individual connection fade-in (ms) */
  fadeInDuration: 2000,
  /**
   * Prime numbers used for generating unique timing offsets per connection.
   * Using primes ensures better distribution and avoids clustering of connections.
   * 7919 and 104729 are chosen as large primes to minimize collision patterns.
   */
  primeMultiplier1: 7919,
  primeMultiplier2: 104729,
  /** Modulo value for normalizing seed to 0-1 range */
  seedModulo: 10000
};

// Track when the starfield was initialized for staggered connection reveal
let connectionStartTime: number | null = null;

// Draw connections between nearby stars (network effect) with staggered reveal
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

  // Use current time for animation
  const time = Date.now();
  
  // Initialize connection start time on first call (single-threaded canvas rendering)
  if (connectionStartTime === null) {
    connectionStartTime = time;
  }
  
  // Calculate elapsed time since connections started (for stagger effect)
  const elapsedTime = time - connectionStartTime;
  
  const { staggerDuration, fadeInDuration, primeMultiplier1, primeMultiplier2, seedModulo } = CONNECTION_STAGGER_CONFIG;

  connectionSources.forEach((star1, index1) => {
    // Check against all stars for connections
    stars.forEach((star2, index2) => {
      // Don't connect to self
      if (star1 === star2) return;

      const dist = distance(star1.x, star1.y, star2.x, star2.y);

      // Only connect stars within the maximum distance
      if (dist < maxDistance) {
        // Create unique timing offset for each connection based on star indices
        // This ensures each connection has its own animation phase
        const uniqueSeed = (index1 * primeMultiplier1 + index2 * primeMultiplier2) % seedModulo;
        const phaseOffset = uniqueSeed / seedModulo * Math.PI * 2;
        
        // Calculate when this specific connection should start appearing (staggered)
        // Use the unique seed to determine when each connection appears
        const connectionDelay = (uniqueSeed / seedModulo) * staggerDuration;
        
        // Calculate stagger progress for this connection (0 = not started, 1 = fully visible)
        let staggerProgress = 0;
        if (elapsedTime > connectionDelay) {
          staggerProgress = Math.min(1, (elapsedTime - connectionDelay) / fadeInDuration);
        }
        
        // Skip drawing if this connection hasn't started appearing yet
        if (staggerProgress <= 0) return;
        
        // Create a slow, smooth pulse with unique timing per connection
        // Different frequencies for more organic feel
        const frequency1 = 0.0003 + (uniqueSeed % 100) / 100000; // Vary frequency slightly
        const frequency2 = 0.00017 + (uniqueSeed % 50) / 100000;
        
        const pulse1 = Math.sin(time * frequency1 + phaseOffset);
        const pulse2 = Math.sin(time * frequency2 + phaseOffset * 1.3);
        
        // Combine pulses for more complex animation (0.3 to 1.0 range)
        const pulseMultiplier = 0.5 + (pulse1 * 0.25 + pulse2 * 0.25);
        
        // Calculate opacity based on distance (fade out as distance increases)
        const baseLineOpacity = opacity * (1 - dist / maxDistance);
        // Apply stagger progress to create fade-in effect for each connection
        const lineOpacity = baseLineOpacity * pulseMultiplier * staggerProgress;

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

// Reset connection start time (useful when starfield is reinitialized)
export const resetConnectionStagger = (): void => {
  connectionStartTime = null;
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
  const adjustedForce = force * 0.1;

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

// Replace the existing applyClickForce function in stars.ts
// Enhanced click repulsion with much stronger force and visible effect
export const applyClickForce = (
  stars: Star[],
  clickX: number,
  clickY: number,
  radius: number = 350,
  force: number = 25
): number => {
  console.log(`applyClickForce called at (${clickX}, ${clickY}) with radius ${radius} and force ${force}`);

  // Much stronger force multiplier for visible repulsion effect
  const adjustedForce = force * 5;

  let affectedCount = 0;

  stars.forEach(star => {
    const dx = star.x - clickX;
    const dy = star.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < radius) {
      affectedCount++;

      // Calculate direction vector (away from click point)
      const dirX = dx / Math.max(dist, 1); // Avoid division by zero
      const dirY = dy / Math.max(dist, 1);

      // Use cubic easing for stronger effect at center
      const normalizedDist = dist / radius;
      const easeOut = Math.pow(1 - normalizedDist, 2); // Stronger at center
      const strength = adjustedForce * easeOut;

      // Apply strong radial force
      star.vx += dirX * strength;
      star.vy += dirY * strength;

      // Add slight tangential component for spiral effect
      const tangentStrength = strength * 0.2;
      star.vx += -dirY * tangentStrength;
      star.vy += dirX * tangentStrength;

      // Small random component for variety
      star.vx += (Math.random() - 0.5) * strength * 0.15;
      star.vy += (Math.random() - 0.5) * strength * 0.15;

      // Mark star as "pushed" for visual effects
      star.lastPushed = Date.now();
      star.isActive = true;
    }
  });

  console.log(`Total stars affected: ${affectedCount}`);
  return affectedCount;
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

// Create a click explosion effect
export const createClickExplosion = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 200,
  color: string = "rgba(255, 255, 255, 0.8)",
  duration: number = 800 // Longer duration
): void => {
  // Don"t apply global speed multiplier to make effect more visible
  const adjustedDuration = duration;

  const startTime = performance.now();
  const animate = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / adjustedDuration, 1);

    // If animation is complete, stop
    if (progress >= 1) return;

    // Calculate current radius and opacity
    const currentRadius = radius * Math.pow(progress, 0.5); // Square root for faster initial expansion
    const opacity = (1 - progress) * 0.8; // Higher opacity

    // Draw expanding ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.lineWidth = 3 * (1 - progress); // Thicker line
    ctx.strokeStyle = "rgba(255, 255, 255, " + opacity + ")"; // White ring
    ctx.stroke();

    // Draw inner glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius * 0.8);
    gradient.addColorStop(0, "rgba(255, 255, 255, " + opacity * 0.7 + ")");
    gradient.addColorStop(1, "rgba(138, 43, 226, 0)"); // Purple fade

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    // Add a bright flash at the center
    if (progress < 0.3) {
      const flashOpacity = (0.3 - progress) / 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
      ctx.fill();
    }

    // Continue animation
    requestAnimationFrame(animate);
  };

  // Start animation
  requestAnimationFrame(animate);
};

// Helper to gradually deactivate stars
export const updateStarActivity = (stars: Star[]): void => {
  const now = Date.now();

  stars.forEach(star => {
    // If star was pushed more than 1500ms ago, deactivate it
    if (star.isActive && (now - star.lastPushed > 1500)) {
      star.isActive = false;
    }
  });
};
