/**
 * PlanetHoverManager - Centralized hover state management for planets
 *
 * ARCHITECTURE:
 * Similar to SunHoverManager, this separates:
 * 1. RENDERING STATE - Planet objects have `isHovered` property (mutable)
 * 2. TOOLTIP STATE - React state with 200ms delay for interactivity
 *
 * SINGLE SOURCE OF TRUTH:
 * - checkPlanetHover() determines if mouse is over a planet and mutates state
 * - TooltipDelayManager handles delay logic (DRY - shared with suns)
 * - This module manages the state machine for tooltip
 */

import { Camera } from "../../cosmos/types";
import { HoverInfo, Planet } from "../../types";
import { checkPlanetHover } from "../../Planets";
import {
  createTooltipDelayManager,
  TooltipElement,
  TooltipDelayManager,
} from "./tooltipDelayManager";

export interface PlanetHoverCallbacks {
  setHoverInfo: (info: HoverInfo) => void;
}

// Re-export for backwards compatibility
export type { TooltipElement };

/**
 * Creates a planet hover manager instance
 */
export function createPlanetHoverManager(): {
  processFrame: (params: {
    mouseX: number;
    mouseY: number;
    canvasWidth: number;
    canvasHeight: number;
    camera: Camera | undefined;
    planets: Planet[];
    planetSize: number;
    isMouseOnScreen: boolean;
    isOverContentCard: boolean;
    currentHoverInfo: HoverInfo;
    tooltipElement: TooltipElement | null;
    isMouseOverTooltipRef: boolean;
    callbacks: PlanetHoverCallbacks;
    frameTime: number;
  }) => boolean;
  reset: () => void;
  isTimerActive: () => boolean;
} {
  // Use shared delay manager for consistent behavior with suns
  const delayManager: TooltipDelayManager = createTooltipDelayManager();

  // Track pending hover info for delay processing
  let pendingHoverInfo: HoverInfo | null = null;

  /**
   * Process planet hover state for a single frame
   * Returns true if a planet is being hovered
   */
  function processFrame(params: {
    mouseX: number;
    mouseY: number;
    canvasWidth: number;
    canvasHeight: number;
    camera: Camera | undefined;
    planets: Planet[];
    planetSize: number;
    isMouseOnScreen: boolean;
    isOverContentCard: boolean;
    currentHoverInfo: HoverInfo;
    tooltipElement: TooltipElement | null;
    isMouseOverTooltipRef: boolean;
    callbacks: PlanetHoverCallbacks;
    frameTime: number;
  }): boolean {
    const {
      mouseX,
      mouseY,
      canvasWidth,
      canvasHeight,
      camera,
      planets,
      planetSize,
      isMouseOnScreen,
      isOverContentCard,
      currentHoverInfo,
      tooltipElement,
      isMouseOverTooltipRef,
      callbacks,
      frameTime,
    } = params;

    // === STEP 1: Check live hover state (for RENDERING) ===
    // checkPlanetHover mutates planet.isHovered directly for rendering
    // We capture the hover info via callback for tooltip processing
    // Use object wrapper to make TypeScript understand mutation
    const captured: { info: HoverInfo | null } = { info: null };

    const captureCallback = (info: HoverInfo): void => {
      captured.info = info;
    };

    // Always call checkPlanetHover to update planet.isHovered states
    const isHoveringPlanet = checkPlanetHover(
      mouseX,
      mouseY,
      planets,
      planetSize,
      currentHoverInfo,
      captureCallback,
      camera,
      canvasWidth,
      canvasHeight,
    );

    // Store pending info for potential show
    if (captured.info?.show) {
      pendingHoverInfo = captured.info;
    }

    // === STEP 2: Manage TOOLTIP state using shared delay manager ===
    const currentTooltipId = currentHoverInfo.show
      ? currentHoverInfo.project?.id ?? null
      : null;

    const delayResult = delayManager.processDelay(
      {
        mouseX,
        mouseY,
        isMouseOnScreen,
        isOverContentCard,
        isMouseOverTooltipRef,
        tooltipElement,
        currentTooltipId,
        frameTime,
      },
      isHoveringPlanet,
    );

    // Apply delay result
    if (delayResult.shouldClearImmediately || delayResult.shouldHide) {
      if (currentHoverInfo.show) {
        callbacks.setHoverInfo({ project: null, x: 0, y: 0, show: false });
      }
      pendingHoverInfo = null;
    } else if (delayResult.shouldShow && pendingHoverInfo?.show) {
      // Always update tooltip state when shouldShow is true
      // This ensures immediate updates when switching between planets
      // (matching sunHoverManager behavior for consistency)
      callbacks.setHoverInfo(pendingHoverInfo);
    }

    return isHoveringPlanet;
  }

  /**
   * Reset state
   */
  function reset(): void {
    delayManager.reset();
    pendingHoverInfo = null;
  }

  /**
   * Check if delay timer is active
   */
  function isTimerActive(): boolean {
    return delayManager.isDelayActive();
  }

  return {
    processFrame,
    reset,
    isTimerActive,
  };
}

export type PlanetHoverManager = ReturnType<typeof createPlanetHoverManager>;
