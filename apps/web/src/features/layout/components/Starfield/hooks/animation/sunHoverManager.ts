/**
 * SunHoverManager - Centralized hover state management for suns
 *
 * ARCHITECTURE:
 * This module separates two distinct concerns:
 *
 * 1. RENDERING STATE (immediate)
 *    - Used by drawSuns() to decide which sun shows hover ring
 *    - Must be computed fresh each frame for zero-latency visual feedback
 *    - Stored in a ref, not React state
 *
 * 2. TOOLTIP STATE (delayed)
 *    - Used by React to show/hide tooltip UI
 *    - Has 200ms grace period so user can move mouse to tooltip
 *    - Uses React state via callbacks
 *
 * SINGLE SOURCE OF TRUTH:
 * - checkSunHover() determines if mouse is over a sun (pure function)
 * - This module manages the state machine for both rendering and tooltip
 * - All hover-related logic is centralized here
 */

import { Camera } from "../../cosmos/types";
import { checkSunHover, SunHoverResult } from "./sunState";

// Configuration
const TOOLTIP_HIDE_DELAY_MS = 200;

// Types
export interface SunInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  x: number;
  y: number;
}

export interface SunHoverState {
  // The sun currently being rendered as hovered (immediate, for rendering)
  renderingHoverId: string | null;

  // The sun whose tooltip is visible (delayed, for UI)
  tooltipSunId: string | null;
  tooltipSunInfo: SunInfo | null;
}

export interface SunHoverCallbacks {
  setHoveredSunId: (id: string | null) => void;
  setHoveredSun: (sun: SunInfo | null) => void;
}

export interface TooltipElement {
  getBoundingClientRect: () => DOMRect;
}

/**
 * Creates a sun hover manager instance
 * Call this once in useAnimationLoop and pass the manager to animate()
 */
export function createSunHoverManager() {
  // Internal state (not React state - these are immediate)
  let lastLeaveTime: number | null = null;
  let currentRenderingHoverId: string | null = null;

  /**
   * Process hover state for a single frame
   * Called from animate() each frame
   *
   * @returns The sun ID to use for RENDERING (immediate)
   */
  function processFrame(params: {
    mouseX: number;
    mouseY: number;
    canvasWidth: number;
    canvasHeight: number;
    camera: Camera | undefined;
    isMouseOnScreen: boolean;
    isOverContentCard: boolean;
    isPlanetTooltipShowing: boolean;
    tooltipElement: TooltipElement | null;
    currentTooltipSunId: string | null;
    callbacks: SunHoverCallbacks;
    frameTime: number;
  }): string | null {
    const {
      mouseX,
      mouseY,
      canvasWidth,
      canvasHeight,
      camera,
      isMouseOnScreen,
      isOverContentCard,
      isPlanetTooltipShowing,
      tooltipElement,
      currentTooltipSunId,
      callbacks,
      frameTime,
    } = params;

    // === STEP 1: Compute LIVE hover state (for rendering) ===
    let liveHoverResult: SunHoverResult | null = null;

    if (isMouseOnScreen && !isOverContentCard && !isPlanetTooltipShowing) {
      liveHoverResult = checkSunHover(
        mouseX,
        mouseY,
        canvasWidth,
        canvasHeight,
        camera,
      );
    }

    // Update rendering state immediately
    currentRenderingHoverId = liveHoverResult?.sun.id ?? null;

    // === STEP 2: Manage TOOLTIP state (with delay) ===

    // Force clear conditions - immediately clear tooltip
    const shouldForceClear =
      isPlanetTooltipShowing ||
      isOverContentCard ||
      !isMouseOnScreen;

    if (shouldForceClear && currentTooltipSunId !== null) {
      // Immediate clear
      callbacks.setHoveredSunId(null);
      callbacks.setHoveredSun(null);
      lastLeaveTime = null;
    } else if (!shouldForceClear) {
      if (liveHoverResult) {
        // Mouse IS over a sun
        lastLeaveTime = null; // Cancel any pending hide

        // Update tooltip if hovering different sun
        if (currentTooltipSunId !== liveHoverResult.sun.id) {
          callbacks.setHoveredSunId(liveHoverResult.sun.id);
          callbacks.setHoveredSun({
            id: liveHoverResult.sun.id,
            name: liveHoverResult.sun.name,
            description: liveHoverResult.sun.description,
            color: liveHoverResult.sun.color,
            x: mouseX,
            y: mouseY,
          });
        }
      } else if (currentTooltipSunId !== null) {
        // Mouse NOT over any sun, but tooltip is visible
        // Check if mouse is over the tooltip element
        const isOverTooltip = tooltipElement
          ? isMouseOverElement(mouseX, mouseY, tooltipElement)
          : false;

        if (isOverTooltip) {
          // Keep tooltip visible, reset timer
          lastLeaveTime = null;
        } else {
          // Start/continue hide timer
          if (lastLeaveTime === null) {
            lastLeaveTime = frameTime;
          }

          const elapsed = frameTime - lastLeaveTime;
          if (elapsed >= TOOLTIP_HIDE_DELAY_MS) {
            // Timer expired - hide tooltip
            callbacks.setHoveredSunId(null);
            callbacks.setHoveredSun(null);
            lastLeaveTime = null;
          }
        }
      }
    }

    // Return the LIVE hover ID for rendering
    return currentRenderingHoverId;
  }

  /**
   * Reset all state (call on unmount or when needed)
   */
  function reset() {
    lastLeaveTime = null;
    currentRenderingHoverId = null;
  }

  /**
   * Get current rendering hover ID (for use outside processFrame)
   */
  function getRenderingHoverId(): string | null {
    return currentRenderingHoverId;
  }

  return {
    processFrame,
    reset,
    getRenderingHoverId,
  };
}

/**
 * Check if mouse coordinates are within an element's bounding box
 */
function isMouseOverElement(
  mouseX: number,
  mouseY: number,
  element: TooltipElement,
): boolean {
  const rect = element.getBoundingClientRect();
  return (
    mouseX >= rect.left &&
    mouseX <= rect.right &&
    mouseY >= rect.top &&
    mouseY <= rect.bottom
  );
}

// Export type for the manager
export type SunHoverManager = ReturnType<typeof createSunHoverManager>;
