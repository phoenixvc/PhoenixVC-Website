// sunState.ts - Sun state management and hover detection
// Single Responsibility: Manage sun initialization state and hover detection

import { SUNS } from "../../cosmos/cosmicHierarchy";
import { getSunStates, initializeSunStates } from "../../sunSystem";

/**
 * Encapsulated module state to prevent leakage
 * Using an object allows for cleaner reset and testing
 */
interface SunModuleState {
  initialized: boolean;
  sizesCalculated: boolean;
}

const moduleState: SunModuleState = {
  initialized: false,
  sizesCalculated: false
};

/**
 * Get current module initialization state
 */
export function getSunModuleState(): Readonly<SunModuleState> {
  return { ...moduleState };
}

/**
 * Mark sun system as initialized
 */
export function markSunSystemInitialized(): void {
  moduleState.initialized = true;
}

/**
 * Mark sun sizes as calculated
 */
export function markSunSizesCalculated(): void {
  moduleState.sizesCalculated = true;
}

/**
 * Check if sun system is initialized
 */
export function isSunSystemInitialized(): boolean {
  return moduleState.initialized;
}

/**
 * Check if sun sizes have been calculated
 */
export function areSunSizesCalculated(): boolean {
  return moduleState.sizesCalculated;
}

/**
 * Reset animation module state - call this when unmounting the starfield component
 * to prevent memory leaks and stale state on remount
 */
export function resetAnimationModuleState(): void {
  moduleState.initialized = false;
  moduleState.sizesCalculated = false;
}

/**
 * Get the focus area suns for external use
 */
export function getFocusAreaSuns(): typeof SUNS {
  return SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");
}

/**
 * Check if mouse is hovering over a sun - returns only the CLOSEST sun
 * Uses dynamic sun positions from the sun system
 */
export function checkSunHover(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number
): { sun: typeof SUNS[0]; index: number; x: number; y: number } | null {
  const sunStates = getSunStates();

  // Initialize if needed
  if (sunStates.length === 0) {
    initializeSunStates();
    return null;
  }

  let closestSun: { sun: typeof SUNS[0]; index: number; x: number; y: number; distance: number } | null = null;
  const focusAreaSuns = SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");

  for (let i = 0; i < sunStates.length; i++) {
    const sunState = sunStates[i];
    const x = sunState.x * width;
    const y = sunState.y * height;
    const baseSize = Math.max(20, Math.min(width, height) * sunState.size * 0.35);
    // Increase hit area for better clickability - using 4x multiplier for generous hit box
    const hitRadius = baseSize * 4;

    const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
    if (distance <= hitRadius) {
      // Find matching sun from SUNS array
      const matchingSun = focusAreaSuns.find(s => s.id === sunState.id);
      if (matchingSun) {
        // Only keep the closest sun
        if (!closestSun || distance < closestSun.distance) {
          closestSun = { sun: matchingSun, index: i, x, y, distance };
        }
      }
    }
  }

  // Return without the distance property
  if (closestSun) {
    return { sun: closestSun.sun, index: closestSun.index, x: closestSun.x, y: closestSun.y };
  }
  return null;
}

/**
 * Get current sun positions for external use (e.g., orbit centers)
 */
export function getCurrentSunPositions(width: number, height: number): Map<string, { x: number; y: number }> {
  const sunStates = getSunStates();
  const positions = new Map<string, { x: number; y: number }>();

  for (const sun of sunStates) {
    positions.set(sun.id, { x: sun.x * width, y: sun.y * height });
  }

  return positions;
}
