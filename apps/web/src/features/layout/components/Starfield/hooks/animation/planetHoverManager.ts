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
  let lastLeaveTime: number | null = null;
  // Track tooltip state INTERNALLY to avoid React state sync issues
  let internalTooltipProjectId: string | null = null;

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

    // Force clear when mouse leaves screen - ALWAYS clear
    if (!isMouseOnScreen) {
      if (internalTooltipProjectId !== null) {
        callbacks.setHoverInfo({ project: null, x: 0, y: 0, show: false });
        internalTooltipProjectId = null;
        lastLeaveTime = null;
      }
      return false;
    }

    // When over content card, clear tooltip
    if (isOverContentCard) {
      if (internalTooltipProjectId !== null) {
        callbacks.setHoverInfo({ project: null, x: 0, y: 0, show: false });
        internalTooltipProjectId = null;
        lastLeaveTime = null;
      }
      return false;
    }

    // Check if mouse is over tooltip element (allows clicking on tooltip)
    const isOverTooltip = tooltipElement
      ? isMouseOverElement(mouseX, mouseY, tooltipElement)
      : false;

    // Create wrapper that handles delay logic with INTERNAL state tracking
    const setHoverInfoWithDelay = (newInfo: HoverInfo): void => {
      if (newInfo.show && newInfo.project) {
        // Showing tooltip - update immediately
        lastLeaveTime = null;
        if (internalTooltipProjectId !== newInfo.project.id) {
          internalTooltipProjectId = newInfo.project.id;
          callbacks.setHoverInfo(newInfo);
        }
      } else if (!newInfo.show && internalTooltipProjectId !== null) {
        // Hiding tooltip - check if over tooltip element first
        if (isOverTooltip || isMouseOverTooltipRef) {
          lastLeaveTime = null;
          return; // Keep showing, mouse is over tooltip
        }

        // Start/continue delay timer
        if (lastLeaveTime === null) {
          lastLeaveTime = frameTime;
        }

        const elapsed = frameTime - lastLeaveTime;
        if (elapsed >= TOOLTIP_HIDE_DELAY_MS) {
          callbacks.setHoverInfo(newInfo);
          internalTooltipProjectId = null;
          lastLeaveTime = null;
        }
        // If delay not expired, don't hide yet
      }
    };

    // ALWAYS run checkPlanetHover - don't skip based on tooltip state
    // This ensures we properly detect when mouse leaves a planet
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

    // If mouse is over tooltip, keep showing
    if (internalTooltipProjectId !== null && (isOverTooltip || isMouseOverTooltipRef)) {
      lastLeaveTime = null;
      return true;
    }

    return isHovering;
  }

  /**
   * Reset state
   */
  function reset(): void {
    lastLeaveTime = null;
    internalTooltipProjectId = null;
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
