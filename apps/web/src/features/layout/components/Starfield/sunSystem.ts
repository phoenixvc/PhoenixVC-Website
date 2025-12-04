// sunSystem.ts - Dynamic sun positioning with gravitational interactions
import { SUNS } from "./cosmos/cosmicHierarchy";

export interface SunState {
  id: string;
  name: string;
  description?: string;
  color: string;
  // Current position (0-1 normalized, will be multiplied by canvas dimensions)
  x: number;
  y: number;
  // Base position (where sun wants to return to)
  baseX: number;
  baseY: number;
  // Size multiplier
  size: number;
  // Rotation angle for when suns get close
  rotationAngle: number;
  rotationSpeed: number;
  // Is this sun in "propel" mode (avoiding collision)
  isPropelling: boolean;
  propelTimer: number;
  // Unique drift parameters for independent movement
  driftPhaseX: number;
  driftPhaseY: number;
  driftSpeedX: number;
  driftSpeedY: number;
  driftAmplitudeX: number;
  driftAmplitudeY: number;
}

// Better sun positions - accounting for sidebar (~220px) on left
// Positions spread further apart towards corners for better separation
export const INITIAL_SUN_POSITIONS = [
  { x: 0.22, y: 0.18 },  // Top-left: Fintech & Blockchain (moved more towards corner)
  { x: 0.82, y: 0.15 },  // Top-right: AI & ML (moved more towards corner)
  { x: 0.20, y: 0.82 },  // Bottom-left: Defense & Security (moved more towards corner)
  { x: 0.80, y: 0.80 },  // Bottom-right: Mobility & Transportation (moved more towards corner)
];

// Global sun state (mutable for animation)
let sunStates: SunState[] = [];
let lastUpdateTime = 0;

// Constants for sun physics - extremely slow, subtle drifting motion
const PROPEL_THRESHOLD = 0.15; // Distance at which repulsion activates
const ROTATION_SPEED_BOOST = 0.000015; // Rotation speed increase when close (10x slower)
const DRIFT_AMPLITUDE_MIN = 0.003; // Minimum drift amplitude (much smaller - stays in place)
const DRIFT_AMPLITUDE_MAX = 0.006; // Maximum drift amplitude (much smaller)
const DRIFT_SPEED_MIN = 0.00003; // Minimum drift speed (10x slower)
const DRIFT_SPEED_MAX = 0.00008; // Maximum drift speed (10x slower)

// Initialize sun states
export function initializeSunStates(): void {
  const focusAreaSuns = SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");
  
  sunStates = focusAreaSuns.map((sun, index) => {
    const pos = INITIAL_SUN_POSITIONS[index % INITIAL_SUN_POSITIONS.length];
    
    // Create unique drift parameters for each sun so they move independently
    const driftPhaseX = Math.random() * Math.PI * 2; // Random starting phase
    const driftPhaseY = Math.random() * Math.PI * 2;
    const driftSpeedX = DRIFT_SPEED_MIN + Math.random() * (DRIFT_SPEED_MAX - DRIFT_SPEED_MIN);
    const driftSpeedY = DRIFT_SPEED_MIN + Math.random() * (DRIFT_SPEED_MAX - DRIFT_SPEED_MIN);
    // Vary the speed slightly so X and Y don't sync up
    const driftAmplitudeX = DRIFT_AMPLITUDE_MIN + Math.random() * (DRIFT_AMPLITUDE_MAX - DRIFT_AMPLITUDE_MIN);
    const driftAmplitudeY = DRIFT_AMPLITUDE_MIN + Math.random() * (DRIFT_AMPLITUDE_MAX - DRIFT_AMPLITUDE_MIN);
    
    return {
      id: sun.id,
      name: sun.name,
      description: sun.description,
      color: sun.color || "#ffffff",
      x: pos.x,
      y: pos.y,
      baseX: pos.x,
      baseY: pos.y,
      size: sun.size,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: 0.00001,
      isPropelling: false,
      propelTimer: 0,
      driftPhaseX,
      driftPhaseY,
      driftSpeedX,
      driftSpeedY,
      driftAmplitudeX,
      driftAmplitudeY,
    };
  });
  
  lastUpdateTime = Date.now();
}

// Update sun physics
export function updateSunPhysics(deltaTime: number): void {
  if (sunStates.length === 0) {
    initializeSunStates();
    return;
  }
  
  const dt = Math.min(deltaTime, 50); // Cap delta time to prevent physics explosions
  
  // Update each sun
  for (let i = 0; i < sunStates.length; i++) {
    const sun = sunStates[i];
    
    // 1. Calculate smooth sinusoidal drift - unique for each sun
    // This creates a gentle, organic floating motion
    sun.driftPhaseX += sun.driftSpeedX * dt;
    sun.driftPhaseY += sun.driftSpeedY * dt;
    
    // Calculate target position based on base + smooth drift
    const driftX = Math.sin(sun.driftPhaseX) * sun.driftAmplitudeX;
    const driftY = Math.sin(sun.driftPhaseY) * sun.driftAmplitudeY;
    const targetX = sun.baseX + driftX;
    const targetY = sun.baseY + driftY;
    
    // 2. Smoothly interpolate current position towards target (lerp)
    // This creates smooth, non-stuttery movement - very slow for subtle motion
    const lerpFactor = 0.005; // Extremely slow interpolation for minimal movement
    sun.x += (targetX - sun.x) * lerpFactor;
    sun.y += (targetY - sun.y) * lerpFactor;
    
    // 3. Check for proximity to other suns and apply gentle repulsion
    for (let j = 0; j < sunStates.length; j++) {
      if (i === j) continue;
      
      const other = sunStates[j];
      const dx = other.x - sun.x;
      const dy = other.y - sun.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If suns get too close, push them apart gently
      if (dist < PROPEL_THRESHOLD && dist > 0.001) {
        sun.isPropelling = true;
        sun.propelTimer = 60;
        
        // Normalize direction
        const nx = dx / dist;
        const ny = dy / dist;
        
        // Apply gentle repulsion directly to position (not velocity)
        const repelStrength = (PROPEL_THRESHOLD - dist) / PROPEL_THRESHOLD;
        const repelForce = repelStrength * 0.001;
        sun.x -= nx * repelForce;
        sun.y -= ny * repelForce;
        
        // Increase rotation speed when close
        sun.rotationSpeed = Math.min(0.0003, sun.rotationSpeed + ROTATION_SPEED_BOOST * dt * 0.0001);
      }
    }
    
    // 4. Update propel timer
    if (sun.propelTimer > 0) {
      sun.propelTimer -= 1;
      if (sun.propelTimer <= 0) {
        sun.isPropelling = false;
      }
    }
    
    // 5. Gradually reduce rotation speed when not propelling
    if (!sun.isPropelling) {
      sun.rotationSpeed = Math.max(0.00001, sun.rotationSpeed * 0.998);
    }
    
    // 6. Update rotation angle smoothly
    sun.rotationAngle += sun.rotationSpeed * dt;
    
    // 7. Keep suns within bounds (with padding)
    const padding = 0.12;
    sun.x = Math.max(padding, Math.min(1 - padding, sun.x));
    sun.y = Math.max(padding, Math.min(1 - padding, sun.y));
  }
}

// Get current sun states
export function getSunStates(): SunState[] {
  return sunStates;
}

// Get sun position by id
export function getSunPosition(sunId: string): { x: number; y: number } | null {
  const sun = sunStates.find(s => s.id === sunId);
  if (sun) {
    return { x: sun.x, y: sun.y };
  }
  return null;
}

// Get all sun positions (for orbit calculations)
export function getAllSunPositions(): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  for (const sun of sunStates) {
    positions.set(sun.id, { x: sun.x, y: sun.y });
  }
  return positions;
}

// Map focus area to sun id
export function getFocusAreaSunId(focusArea: string): string {
  const mapping: Record<string, string> = {
    "fintech-blockchain": "fintech-blockchain-sun",
    "ai-ml": "ai-ml-sun",
    "defense-security": "defense-security-sun",
    "mobility-transportation": "mobility-transportation-sun",
  };
  return mapping[focusArea] || "fintech-blockchain-sun";
}

// Check if mouse is hovering over a sun - returns only the CLOSEST sun
// This ensures only one sun is highlighted at a time
export function checkSunHover(
  mouseX: number, 
  mouseY: number, 
  canvasWidth: number, 
  canvasHeight: number,
  hoverRadius: number = 40
): { sun: SunState; distance: number } | null {
  if (sunStates.length === 0) {
    initializeSunStates();
  }
  
  let closestSun: SunState | null = null;
  let closestDistance = Infinity;
  
  for (const sun of sunStates) {
    // Convert normalized position to canvas coordinates
    const sunX = sun.x * canvasWidth;
    const sunY = sun.y * canvasHeight;
    
    // Calculate distance from mouse to sun center
    const dx = mouseX - sunX;
    const dy = mouseY - sunY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate effective hover radius based on sun size
    const sunRadius = Math.max(20, Math.min(canvasWidth, canvasHeight) * sun.size * 0.5);
    const effectiveRadius = sunRadius + hoverRadius;
    
    // Check if within hover radius and closer than previous closest
    if (distance < effectiveRadius && distance < closestDistance) {
      closestSun = sun;
      closestDistance = distance;
    }
  }
  
  if (closestSun) {
    return { sun: closestSun, distance: closestDistance };
  }
  
  return null;
}
