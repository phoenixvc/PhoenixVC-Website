/**
 * PlanetHoverManager - Centralized hover state management for planets
 *
 * Similar to SunHoverManager, this separates:
 * 1. RENDERING STATE - Planet objects have `isHovered` property (mutable)
 * 2. TOOLTIP STATE - React state with 200ms delay for interactivity
 *
 * Unlike suns, planets mutate their own state via checkPlanetHover(),
 * so this manager primarily handles the tooltip delay logic.
 */

import { Camera } from "../../cosmos/types";
import { HoverInfo, Planet } from "../../types";
import { checkPlanetHover } from "../../Planets";
import { isMouseOverElement, BoundedElement } from "./hoverUtils";

// Configuration
const TOOLTIP_HIDE_DELAY_MS = 200;

export interface PlanetHoverCallbacks {
  setHoverInfo: (info: HoverInfo) => void;
}

// Re-export for backwards compatibility
export type TooltipElement = BoundedElement;

/**
 * Creates a planet hover manager instance
 */
export function createPlanetHoverManager() {
  let lastLeaveTime: number | null = null;

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

    // Force clear conditions
    if (!isMouseOnScreen || isOverContentCard) {
      if (currentHoverInfo.show && !isMouseOverTooltipRef) {
        callbacks.setHoverInfo({ project: null, x: 0, y: 0, show: false });
        lastLeaveTime = null;
      }
      return false;
    }

    // Create wrapper that handles delay logic
    const setHoverInfoWithDelay = (newInfo: HoverInfo): void => {
      // Don't hide if mouse is over tooltip
      if (!newInfo.show && isMouseOverTooltipRef) {
        lastLeaveTime = null;
        return;
      }

      // Handle delayed hiding
      if (!newInfo.show && currentHoverInfo.show) {
        // Mouse left planet - check delay
        if (lastLeaveTime === null) {
          lastLeaveTime = frameTime;
        }

        const elapsed = frameTime - lastLeaveTime;
        if (elapsed >= TOOLTIP_HIDE_DELAY_MS) {
          callbacks.setHoverInfo(newInfo);
          lastLeaveTime = null;
        }
        // If delay not expired, don't update
        return;
      }

      // Showing tooltip - clear delay timer
      if (newInfo.show) {
        lastLeaveTime = null;
      }

      // Only update if changed significantly
      if (
        newInfo.show !== currentHoverInfo.show ||
        (newInfo.project?.id !== currentHoverInfo.project?.id)
      ) {
        callbacks.setHoverInfo(newInfo);
      }
    };

    // Check if mouse is over tooltip element (allows clicking)
    if (currentHoverInfo.show && !isOverContentCard) {
      const isOverTooltip = tooltipElement
        ? isMouseOverElement(mouseX, mouseY, tooltipElement)
        : false;

      if (isOverTooltip || isMouseOverTooltipRef) {
        lastLeaveTime = null;
        return true; // Keep showing tooltip
      }
    }

    // Call existing checkPlanetHover with delay wrapper
    const isHovering = checkPlanetHover(
      mouseX,
      mouseY,
      planets,
      planetSize,
      currentHoverInfo,
      setHoverInfoWithDelay,
      camera,
      canvasWidth,
      canvasHeight,
    );

    return isHovering;
  }

  /**
   * Reset state
   */
  function reset() {
    lastLeaveTime = null;
  }

  /**
   * Check if delay timer is active
   */
  function isTimerActive(): boolean {
    return lastLeaveTime !== null;
  }

  return {
    processFrame,
    reset,
    isTimerActive,
  };
}

export type PlanetHoverManager = ReturnType<typeof createPlanetHoverManager>;
