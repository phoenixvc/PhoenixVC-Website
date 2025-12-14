/**
 * TooltipDelayManager - Unified delay logic for all tooltips (DRY/SOLID)
 *
 * This module provides a single source of truth for tooltip delay behavior:
 * - 200ms grace period before hiding tooltip
 * - Cancel delay when mouse returns to target or tooltip
 * - Force clear when mouse leaves screen or goes over content card
 *
 * Used by both SunHoverManager and PlanetHoverManager to ensure consistent behavior.
 */

import { isMouseOverElement, BoundedElement } from "./hoverUtils";

// Shared configuration - single source of truth
export const TOOLTIP_HIDE_DELAY_MS = 200;

export type TooltipElement = BoundedElement;

export interface TooltipDelayState {
  lastLeaveTime: number | null;
  currentId: string | null;
}

export interface TooltipDelayParams {
  mouseX: number;
  mouseY: number;
  isMouseOnScreen: boolean;
  isOverContentCard: boolean;
  isMouseOverTooltipRef: boolean;
  tooltipElement: TooltipElement | null;
  currentTooltipId: string | null;
  frameTime: number;
}

export interface TooltipDelayResult {
  shouldShow: boolean;
  shouldHide: boolean;
  shouldClearImmediately: boolean;
}

/**
 * Creates a tooltip delay manager for consistent delay behavior
 */
export function createTooltipDelayManager(): {
  /**
   * Process delay logic for a frame
   * @returns Object indicating what action to take
   */
  processDelay: (
    params: TooltipDelayParams,
    isHoveringTarget: boolean,
  ) => TooltipDelayResult;

  /**
   * Check if mouse is currently over the tooltip element
   */
  isMouseOverTooltip: (
    mouseX: number,
    mouseY: number,
    tooltipElement: TooltipElement | null,
    isMouseOverTooltipRef: boolean,
  ) => boolean;

  /**
   * Reset delay state
   */
  reset: () => void;

  /**
   * Get current delay timer state
   */
  isDelayActive: () => boolean;

  /**
   * Cancel any active delay (call when showing new tooltip)
   */
  cancelDelay: () => void;
} {
  let lastLeaveTime: number | null = null;

  function processDelay(
    params: TooltipDelayParams,
    isHoveringTarget: boolean,
  ): TooltipDelayResult {
    const {
      mouseX,
      mouseY,
      isMouseOnScreen,
      isOverContentCard,
      isMouseOverTooltipRef,
      tooltipElement,
      currentTooltipId,
      frameTime,
    } = params;

    // Case 1: Mouse left screen - clear immediately
    if (!isMouseOnScreen) {
      lastLeaveTime = null;
      return {
        shouldShow: false,
        shouldHide: currentTooltipId !== null,
        shouldClearImmediately: true,
      };
    }

    // Case 2: Mouse over content card - clear unless over tooltip
    if (isOverContentCard) {
      if (currentTooltipId !== null && !isMouseOverTooltipRef) {
        lastLeaveTime = null;
        return {
          shouldShow: false,
          shouldHide: true,
          shouldClearImmediately: true,
        };
      }
      return {
        shouldShow: false,
        shouldHide: false,
        shouldClearImmediately: false,
      };
    }

    // Case 3: Currently hovering target - show tooltip, cancel any delay
    if (isHoveringTarget) {
      lastLeaveTime = null;
      return {
        shouldShow: true,
        shouldHide: false,
        shouldClearImmediately: false,
      };
    }

    // Case 4: Not hovering target, but tooltip is showing
    if (currentTooltipId !== null) {
      // Check if mouse is over the tooltip itself
      const isOverTooltip =
        isMouseOverTooltipRef ||
        (tooltipElement
          ? isMouseOverElement(mouseX, mouseY, tooltipElement)
          : false);

      if (isOverTooltip) {
        // Keep tooltip visible while mouse is over it
        lastLeaveTime = null;
        return {
          shouldShow: false, // Don't update, just maintain
          shouldHide: false,
          shouldClearImmediately: false,
        };
      }

      // Start or continue delay timer
      if (lastLeaveTime === null) {
        lastLeaveTime = frameTime;
      }

      const elapsed = frameTime - lastLeaveTime;
      if (elapsed >= TOOLTIP_HIDE_DELAY_MS) {
        // Delay expired - hide tooltip
        lastLeaveTime = null;
        return {
          shouldShow: false,
          shouldHide: true,
          shouldClearImmediately: false,
        };
      }

      // Delay still active - don't hide yet
      return {
        shouldShow: false,
        shouldHide: false,
        shouldClearImmediately: false,
      };
    }

    // Case 5: Not hovering and no tooltip showing
    return {
      shouldShow: false,
      shouldHide: false,
      shouldClearImmediately: false,
    };
  }

  function isMouseOverTooltip(
    mouseX: number,
    mouseY: number,
    tooltipElement: TooltipElement | null,
    isMouseOverTooltipRef: boolean,
  ): boolean {
    return (
      isMouseOverTooltipRef ||
      (tooltipElement
        ? isMouseOverElement(mouseX, mouseY, tooltipElement)
        : false)
    );
  }

  function reset(): void {
    lastLeaveTime = null;
  }

  function isDelayActive(): boolean {
    return lastLeaveTime !== null;
  }

  function cancelDelay(): void {
    lastLeaveTime = null;
  }

  return {
    processDelay,
    isMouseOverTooltip,
    reset,
    isDelayActive,
    cancelDelay,
  };
}

export type TooltipDelayManager = ReturnType<typeof createTooltipDelayManager>;
