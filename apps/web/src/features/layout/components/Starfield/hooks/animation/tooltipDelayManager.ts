/**
 * TooltipDelayManager - Reusable tooltip hide delay logic
 *
 * This utility handles the common pattern where tooltips should:
 * 1. Show immediately when hovering
 * 2. Stay visible for a delay after leaving (allows clicking tooltip)
 * 3. Check if mouse is over the tooltip element to keep it visible
 *
 * Used by both sun and planet hover systems.
 */

import { isMouseOverElement, BoundedElement } from "./hoverUtils";

// Default delay before hiding tooltip (in milliseconds)
const DEFAULT_HIDE_DELAY_MS = 200;

export interface TooltipDelayConfig {
  hideDelayMs?: number;
}

// Re-export for backwards compatibility
export type TooltipElement = BoundedElement;

/**
 * Create a tooltip delay manager instance
 */
export function createTooltipDelayManager(config: TooltipDelayConfig = {}): {
  checkShouldHideTooltip: (params: {
    isHoveringTarget: boolean;
    isTooltipCurrentlyShown: boolean;
    mouseX: number;
    mouseY: number;
    tooltipElement: TooltipElement | null;
    isMouseOverTooltipRef: boolean;
    frameTime: number;
  }) => {
    shouldHide: boolean;
    shouldShow: boolean;
    shouldKeepCurrent: boolean;
  };
  resetTimer: () => void;
  isTimerActive: () => boolean;
} {
  const hideDelayMs = config.hideDelayMs ?? DEFAULT_HIDE_DELAY_MS;
  let lastLeaveTime: number | null = null;

  /**
   * Check if tooltip should be hidden based on delay logic
   *
   * @param params - Current state parameters
   * @returns { shouldHide: boolean, shouldShow: boolean }
   */
  function checkShouldHideTooltip(params: {
    isHoveringTarget: boolean; // Is mouse over the hover target (sun/planet)?
    isTooltipCurrentlyShown: boolean; // Is tooltip currently visible?
    mouseX: number;
    mouseY: number;
    tooltipElement: TooltipElement | null;
    isMouseOverTooltipRef: boolean; // Is mouse flagged as over tooltip?
    frameTime: number;
  }): {
    shouldHide: boolean;
    shouldShow: boolean;
    shouldKeepCurrent: boolean;
  } {
    const {
      isHoveringTarget,
      isTooltipCurrentlyShown,
      mouseX,
      mouseY,
      tooltipElement,
      isMouseOverTooltipRef,
      frameTime,
    } = params;

    // Case 1: Mouse is over target - show tooltip, cancel any pending hide
    if (isHoveringTarget) {
      lastLeaveTime = null;
      return { shouldHide: false, shouldShow: true, shouldKeepCurrent: false };
    }

    // Case 2: Tooltip not shown - nothing to do
    if (!isTooltipCurrentlyShown) {
      lastLeaveTime = null;
      return { shouldHide: false, shouldShow: false, shouldKeepCurrent: true };
    }

    // Case 3: Mouse is over tooltip element - keep visible
    const isOverTooltipElement = tooltipElement
      ? isMouseOverElement(mouseX, mouseY, tooltipElement)
      : false;

    if (isOverTooltipElement || isMouseOverTooltipRef) {
      lastLeaveTime = null;
      return { shouldHide: false, shouldShow: false, shouldKeepCurrent: true };
    }

    // Case 4: Mouse left target and not over tooltip - check delay
    if (lastLeaveTime === null) {
      lastLeaveTime = frameTime;
    }

    const elapsed = frameTime - lastLeaveTime;
    if (elapsed >= hideDelayMs) {
      // Delay expired - hide tooltip
      lastLeaveTime = null;
      return { shouldHide: true, shouldShow: false, shouldKeepCurrent: false };
    }

    // Delay not expired - keep current state
    return { shouldHide: false, shouldShow: false, shouldKeepCurrent: true };
  }

  /**
   * Force reset the delay timer
   */
  function resetTimer(): void {
    lastLeaveTime = null;
  }

  /**
   * Check if delay timer is active
   */
  function isTimerActive(): boolean {
    return lastLeaveTime !== null;
  }

  return {
    checkShouldHideTooltip,
    resetTimer,
    isTimerActive,
  };
}

// Export type for the manager
export type TooltipDelayManager = ReturnType<typeof createTooltipDelayManager>;
