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
 *    - Uses shared TooltipDelayManager for 200ms grace period
 *    - Uses React state via callbacks
 *
 * SINGLE SOURCE OF TRUTH:
 * - checkSunHover() determines if mouse is over a sun (pure function)
 * - TooltipDelayManager handles delay logic (DRY - shared with planets)
 * - This module manages the state machine for both rendering and tooltip
 */

import { Camera } from "../../cosmos/types";
import { checkSunHover, SunHoverResult } from "./sunState";
import {
  createTooltipDelayManager,
  TooltipElement,
  TooltipDelayManager,
} from "./tooltipDelayManager";

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
export type { TooltipElement };

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
    isMouseOverTooltipRef: boolean;
    callbacks: SunHoverCallbacks;
    frameTime: number;
  }) => string | null;
  reset: () => void;
  getRenderingHoverId: () => string | null;
} {
  // Internal state (not React state - these are immediate)
  let currentRenderingHoverId: string | null = null;

  // Use shared delay manager for consistent behavior with planets
  const delayManager: TooltipDelayManager = createTooltipDelayManager();

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
    isMouseOverTooltipRef: boolean;
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
      isMouseOverTooltipRef,
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

    // === STEP 2: Manage TOOLTIP state using shared delay manager ===
    // Tooltip has different rules than rendering:
    // - Don't show sun tooltip if planet tooltip is active (UI priority)

    // Planet tooltip takes priority - clear sun tooltip
    if (isPlanetTooltipShowing) {
      if (currentTooltipSunId !== null) {
        callbacks.setHoveredSunId(null);
        callbacks.setHoveredSun(null);
      }
      // Return rendering state (hover ring still shows)
      return currentRenderingHoverId;
    }

    // Use shared delay manager for consistent behavior
    // Pass actual isMouseOverTooltipRef from animation loop
    const delayResult = delayManager.processDelay(
      {
        mouseX,
        mouseY,
        isMouseOnScreen,
        isOverContentCard,
        isMouseOverTooltipRef,
        tooltipElement,
        currentTooltipId: currentTooltipSunId,
        frameTime,
      },
      liveHoverResult !== null,
    );

    // Apply delay result
    if (delayResult.shouldClearImmediately || delayResult.shouldHide) {
      if (currentTooltipSunId !== null) {
        callbacks.setHoveredSunId(null);
        callbacks.setHoveredSun(null);
      }
    } else if (delayResult.shouldShow && liveHoverResult) {
      // Always update tooltip state when shouldShow is true
      // This fixes the race condition where React state hasn't propagated yet
      // but user re-hovers the same sun - we must always call setters to ensure
      // the tooltip shows, and update position in case mouse moved
      callbacks.setHoveredSunId(liveHoverResult.sun.id);
      callbacks.setHoveredSun({
        id: liveHoverResult.sun.id,
        name: liveHoverResult.sun.name ?? "",
        description: liveHoverResult.sun.description ?? "",
        color: liveHoverResult.sun.color ?? "#ffffff",
        x: mouseX,
        y: mouseY,
      });
    }

    // Return the LIVE hover ID for rendering
    return currentRenderingHoverId;
  }

  /**
   * Reset all state (call on unmount or when needed)
   */
  function reset(): void {
    delayManager.reset();
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

// Export type for the manager
export type SunHoverManager = ReturnType<typeof createSunHoverManager>;
