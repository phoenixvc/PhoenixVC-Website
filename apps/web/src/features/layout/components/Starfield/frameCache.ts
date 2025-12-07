// frameCache.ts - Per-frame caching for expensive operations
// This module provides cached values that are updated once per animation frame
// to avoid redundant Date.now() and window dimension lookups

import type { SunState } from "./sunSystem";

/**
 * Frame cache for values that should only be computed once per animation frame.
 * Call updateFrameCache() at the start of each animation frame.
 */
let cachedFrameTime = Date.now();
let cachedWindowWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
let cachedWindowHeight = typeof window !== "undefined" ? window.innerHeight : 1080;

// Sun states cache - updated once per frame to avoid multiple getSunStates() calls
let cachedSunStates: SunState[] | null = null;
let sunStatesCacheFrameId = -1;
let currentFrameId = 0;

/**
 * Update the frame cache. Call this once at the start of each animation frame.
 */
export function updateFrameCache(): void {
  cachedFrameTime = Date.now();
  currentFrameId++;
  // Invalidate sun states cache for new frame
  // (actual update happens lazily on first access)
}

/**
 * Set the cached sun states for this frame.
 * Called by sunSystem.ts after updating sun physics.
 */
export function setCachedSunStates(states: SunState[]): void {
  cachedSunStates = states;
  sunStatesCacheFrameId = currentFrameId;
}

/**
 * Get cached sun states if available for current frame.
 * Returns null if cache is stale (caller should fetch fresh and call setCachedSunStates).
 */
export function getCachedSunStates(): SunState[] | null {
  if (sunStatesCacheFrameId === currentFrameId && cachedSunStates !== null) {
    return cachedSunStates;
  }
  return null;
}

/**
 * Check if sun states cache is valid for current frame.
 */
export function isSunStatesCacheValid(): boolean {
  return sunStatesCacheFrameId === currentFrameId && cachedSunStates !== null;
}

/**
 * Update window dimensions cache. Call this on window resize events.
 */
export function updateWindowDimensionsCache(): void {
  if (typeof window !== "undefined") {
    cachedWindowWidth = window.innerWidth;
    cachedWindowHeight = window.innerHeight;
  }
}

/**
 * Get the cached frame time (milliseconds since epoch).
 * This value is only updated once per frame via updateFrameCache().
 */
export function getFrameTime(): number {
  return cachedFrameTime;
}

/**
 * Get the cached window width.
 * This value is only updated on resize via updateWindowDimensionsCache().
 */
export function getWindowWidth(): number {
  return cachedWindowWidth;
}

/**
 * Get the cached window height.
 * This value is only updated on resize via updateWindowDimensionsCache().
 */
export function getWindowHeight(): number {
  return cachedWindowHeight;
}

// Initialize window dimensions on module load
if (typeof window !== "undefined") {
  updateWindowDimensionsCache();

  // Set up resize listener to update dimensions cache
  window.addEventListener("resize", updateWindowDimensionsCache);
}
