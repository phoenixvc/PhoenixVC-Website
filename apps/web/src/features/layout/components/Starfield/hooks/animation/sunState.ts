// sunState.ts - Sun state management and hover detection
// Single Responsibility: Manage sun initialization state and hover detection

import { SUNS } from "../../cosmos/cosmicHierarchy";
import { getSunStates, initializeSunStates } from "../../sunSystem";
import { Camera, CosmicObject } from "../../cosmos/types";
import { SUN_RENDERING_CONFIG } from "../../renderingConfig";

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
  sizesCalculated: false,
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
  return SUNS.filter((sun) => sun.parentId === "focus-areas-galaxy");
}

/**
 * Transform screen coordinates to world coordinates accounting for camera transform
 * This is the inverse of the canvas transformation applied in animate.ts
 * @param screenX Mouse X in screen coordinates
 * @param screenY Mouse Y in screen coordinates
 * @param camera Current camera state (or undefined if no camera transform)
 * @param width Canvas width
 * @param height Canvas height
 * @returns World coordinates {x, y}
 */
function screenToWorldCoords(
  screenX: number,
  screenY: number,
  camera: Camera | undefined,
  width: number,
  height: number,
): { x: number; y: number } {
  // If no camera or zoom is 1, no transform is applied - coords are the same
  if (!camera || camera.zoom === 1) {
    return { x: screenX, y: screenY };
  }

  // Reverse the canvas transform from animate.ts:
  // ctx.translate(viewportCenterX, viewportCenterY);
  // ctx.scale(cameraValues.zoom, cameraValues.zoom);
  // ctx.translate(-cameraCenterX, -cameraCenterY);
  const viewportCenterX = width / 2;
  const viewportCenterY = height / 2;
  const cameraCenterX = camera.cx * width;
  const cameraCenterY = camera.cy * height;

  // Reverse: subtract viewport center, divide by zoom, add camera center
  const worldX = (screenX - viewportCenterX) / camera.zoom + cameraCenterX;
  const worldY = (screenY - viewportCenterY) / camera.zoom + cameraCenterY;

  return { x: worldX, y: worldY };
}

/**
 * Check if mouse is hovering over a sun - returns only the CLOSEST sun
 * Uses dynamic sun positions from the sun system
 * @param mouseX Mouse X in screen coordinates
 * @param mouseY Mouse Y in screen coordinates
 * @param width Canvas width
 * @param height Canvas height
 * @param camera Optional camera for coordinate transformation
 */
export function checkSunHover(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  camera?: Camera,
): { sun: CosmicObject; index: number; x: number; y: number } | null {
  const sunStates = getSunStates();

  // Initialize if needed
  if (sunStates.length === 0) {
    initializeSunStates();
    return null;
  }

  // Transform mouse coordinates from screen to world space
  const worldMouse = screenToWorldCoords(mouseX, mouseY, camera, width, height);

  let closestSun: {
    sun: CosmicObject;
    index: number;
    x: number;
    y: number;
    distance: number;
  } | null = null;
  const focusAreaSuns = SUNS.filter(
    (sun) => sun.parentId === "focus-areas-galaxy",
  );

  for (let i = 0; i < sunStates.length; i++) {
    const sunState = sunStates[i];
    // Sun positions are in world coordinates (normalized * canvas dimensions)
    const x = sunState.x * width;
    const y = sunState.y * height;

    // Use exact same size calculation as rendering
    const baseSize = Math.max(
      SUN_RENDERING_CONFIG.minSize,
      Math.min(width, height) * sunState.size * SUN_RENDERING_CONFIG.sizeMultiplier,
    );

    // Fix: Do not divide by zoomFactor for world-space comparison.
    // The visual radius in world space is baseSize.
    // We add a small buffer (1.1x) for usability, but keep it tight to prevent stickiness.
    const hitRadius = baseSize * 1.1;

    // Compare world mouse coords with world sun coords
    const distance = Math.sqrt(
      Math.pow(worldMouse.x - x, 2) + Math.pow(worldMouse.y - y, 2),
    );
    if (distance <= hitRadius) {
      // Find matching sun from SUNS array
      const matchingSun = focusAreaSuns.find((s) => s.id === sunState.id);
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
    return {
      sun: closestSun.sun,
      index: closestSun.index,
      x: closestSun.x,
      y: closestSun.y,
    };
  }
  return null;
}

/**
 * Get current sun positions for external use (e.g., orbit centers)
 */
export function getCurrentSunPositions(
  width: number,
  height: number,
): Map<string, { x: number; y: number }> {
  const sunStates = getSunStates();
  const positions = new Map<string, { x: number; y: number }>();

  for (const sun of sunStates) {
    positions.set(sun.id, { x: sun.x * width, y: sun.y * height });
  }

  return positions;
}
