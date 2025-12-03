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
  // Velocity
  vx: number;
  vy: number;
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
}

// Better sun positions - accounting for sidebar (~220px) on left
// Positions are more inward from corners for better visibility
export const INITIAL_SUN_POSITIONS = [
  { x: 0.28, y: 0.22 },  // Top-left: Fintech & Blockchain (moved right for sidebar)
  { x: 0.78, y: 0.18 },  // Top-right: AI & ML
  { x: 0.25, y: 0.75 },  // Bottom-left: Defense & Security (moved right for sidebar)
  { x: 0.75, y: 0.72 },  // Bottom-right: Mobility & Transportation
];

// Global sun state (mutable for animation)
let sunStates: SunState[] = [];
let lastUpdateTime = 0;

// Constants for sun physics - slowed down by factor of 50
const GRAVITATIONAL_CONSTANT = 0.0000002; // Very slow gravitational pull (50x slower)
const SPRING_CONSTANT = 0.000002; // How strongly suns return to base position (50x slower)
const DAMPING = 0.9996; // Velocity damping (higher = slower movement)
const MIN_DISTANCE = 0.25; // Minimum distance between suns (increased to prevent clustering)
const PROPEL_THRESHOLD = 0.10; // Distance at which propel mode activates (reduced)
const PROPEL_FORCE = 0.00001; // Force applied when propelling apart (50x slower)
const ROTATION_SPEED_BOOST = 0.0004; // How fast rotation increases when close (50x slower)
const MAX_VELOCITY = 0.00002; // Maximum velocity cap (50x slower)

// Initialize sun states
export function initializeSunStates(): void {
  const focusAreaSuns = SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");
  
  sunStates = focusAreaSuns.map((sun, index) => {
    const pos = INITIAL_SUN_POSITIONS[index % INITIAL_SUN_POSITIONS.length];
    return {
      id: sun.id,
      name: sun.name,
      description: sun.description,
      color: sun.color || "#ffffff",
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      baseX: pos.x,
      baseY: pos.y,
      size: sun.size,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: 0.00002, // Slowed down by factor of 50
      isPropelling: false,
      propelTimer: 0,
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
    
    // 1. Apply spring force back to base position
    const springForceX = (sun.baseX - sun.x) * SPRING_CONSTANT;
    const springForceY = (sun.baseY - sun.y) * SPRING_CONSTANT;
    
    sun.vx += springForceX * dt;
    sun.vy += springForceY * dt;
    
    // 2. Apply gravitational pull from other suns (very subtle)
    for (let j = 0; j < sunStates.length; j++) {
      if (i === j) continue;
      
      const other = sunStates[j];
      const dx = other.x - sun.x;
      const dy = other.y - sun.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      
      // Normalize direction
      const nx = dx / dist;
      const ny = dy / dist;
      
      // Apply weak gravitational attraction
      if (dist > MIN_DISTANCE) {
        const gravForce = GRAVITATIONAL_CONSTANT / distSq;
        sun.vx += nx * gravForce * dt;
        sun.vy += ny * gravForce * dt;
      }
      
      // 3. Check for collision avoidance / propel mode
      if (dist < PROPEL_THRESHOLD) {
        sun.isPropelling = true;
        sun.propelTimer = 60; // Stay in propel mode for ~1 second
        
        // Increase rotation speed when close (slowed down by factor of 50)
        sun.rotationSpeed = Math.min(0.0005, sun.rotationSpeed + ROTATION_SPEED_BOOST * dt * 0.001);
        
        // Apply repulsion force
        const repelStrength = (PROPEL_THRESHOLD - dist) / PROPEL_THRESHOLD;
        sun.vx -= nx * PROPEL_FORCE * repelStrength * dt;
        sun.vy -= ny * PROPEL_FORCE * repelStrength * dt;
        
        // Add tangential "orbital" component to create rotating effect
        const tangentX = -ny;
        const tangentY = nx;
        const tangentForce = PROPEL_FORCE * 0.5 * repelStrength;
        sun.vx += tangentX * tangentForce * dt;
        sun.vy += tangentY * tangentForce * dt;
      }
    }
    
    // 4. Update propel timer and rotation
    if (sun.propelTimer > 0) {
      sun.propelTimer -= 1;
      if (sun.propelTimer <= 0) {
        sun.isPropelling = false;
      }
    }
    
    // Gradually reduce rotation speed when not propelling
    if (!sun.isPropelling) {
      sun.rotationSpeed = Math.max(0.00002, sun.rotationSpeed * 0.9998); // More gradual deceleration for smoother slowdown
    }
    
    // Update rotation angle
    sun.rotationAngle += sun.rotationSpeed * dt;
    
    // 5. Apply damping
    sun.vx *= DAMPING;
    sun.vy *= DAMPING;
    
    // 6. Cap velocity
    const speed = Math.sqrt(sun.vx * sun.vx + sun.vy * sun.vy);
    if (speed > MAX_VELOCITY) {
      sun.vx = (sun.vx / speed) * MAX_VELOCITY;
      sun.vy = (sun.vy / speed) * MAX_VELOCITY;
    }
    
    // 7. Update position
    sun.x += sun.vx * dt;
    sun.y += sun.vy * dt;
    
    // 8. Keep suns within bounds (with padding)
    const padding = 0.1;
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
