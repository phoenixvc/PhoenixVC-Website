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
import { isMouseOverElement, BoundedElement } from "./hoverUtils";

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

// Re-export for backwards compatibility
export type TooltipElement = BoundedElement;

/**
 * Creates a sun hover manager instance
 * Call this once in useAnimationLoop and pass the manager to animate()
 */
export function createSunHoverManager(): {
  processFrame: (params: {
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
  }) => string | null;
  reset: () => void;
  getRenderingHoverId: () => string | null;
} {
  // Internal state (not React state - these are immediate)
  let lastLeaveTime: number | null = null;
  let currentRenderingHoverId: string | null = null;
  // Track tooltip state INTERNALLY to avoid React state sync issues
  let internalTooltipSunId: string | null = null;

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

    // === STEP 1: Compute LIVE hover state (for RENDERING) ===
    // CRITICAL: Detection should ALWAYS run when mouse is on screen and over canvas.
    // Do NOT block detection based on planet tooltip state - that's a TOOLTIP concern,
    // not a RENDERING concern. The hover ring should appear immediately.
    let liveHoverResult: SunHoverResult | null = null;

    if (isMouseOnScreen && !isOverContentCard) {
      liveHoverResult = checkSunHover(
        mouseX,
        mouseY,
        canvasWidth,
        canvasHeight,
        camera,
      );
    }

    // Update rendering state immediately - this controls the hover ring
    currentRenderingHoverId = liveHoverResult?.sun.id ?? null;

    // === STEP 2: Manage TOOLTIP state (with delay) ===
    // Tooltip has different rules than rendering:
    // - Don't show sun tooltip if planet tooltip is active (UI priority)
    // - Has 200ms grace period for mouse to move to tooltip

    // Force clear sun tooltip when:
    // - Planet tooltip is showing (UI priority - planet wins)
    // - Mouse is over a content card
    // - Mouse left the screen
    if (!isMouseOnScreen || isOverContentCard) {
      // Mouse left canvas area - clear tooltip
      if (internalTooltipSunId !== null) {
        callbacks.setHoveredSunId(null);
        callbacks.setHoveredSun(null);
        internalTooltipSunId = null;
      }
      lastLeaveTime = null;
    } else if (isPlanetTooltipShowing) {
      // Planet tooltip takes priority - hide sun tooltip but DON'T reset timer
      // This way if planet tooltip closes, sun tooltip can reappear
      if (internalTooltipSunId !== null) {
        callbacks.setHoveredSunId(null);
        callbacks.setHoveredSun(null);
        internalTooltipSunId = null;
      }
      // Keep lastLeaveTime as-is so delay continues
    } else {
      // Normal operation - mouse on screen, no planet tooltip blocking
      if (liveHoverResult) {
        // Mouse IS over a sun - show/update tooltip
        lastLeaveTime = null; // Cancel any pending hide

        // Use INTERNAL state for comparison to avoid React async issues
        if (internalTooltipSunId !== liveHoverResult.sun.id) {
          internalTooltipSunId = liveHoverResult.sun.id;
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
      } else if (internalTooltipSunId !== null) {
        // Mouse NOT over any sun, but tooltip is visible
        // Check if mouse is over the tooltip element (allows clicking)
        const isOverTooltip = tooltipElement
          ? isMouseOverElement(mouseX, mouseY, tooltipElement)
          : false;

        if (isOverTooltip) {
          // Keep tooltip visible while mouse is over it
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
            internalTooltipSunId = null;
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
  function reset(): void {
    lastLeaveTime = null;
    currentRenderingHoverId = null;
    internalTooltipSunId = null;
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

// Export type for the manager
export type SunHoverManager = ReturnType<typeof createSunHoverManager>;
