/**
 * useTooltipRefs - Centralized tooltip ref management
 *
 * This hook consolidates all tooltip-related refs and their cleanup logic
 * that was previously scattered across Starfield.tsx:
 *
 * 1. isMouseOverProjectTooltipRef - tracks if mouse is over project tooltip
 * 2. isMouseOverSunTooltipRef - tracks if mouse is over sun tooltip
 * 3. projectTooltipElementRef - DOM ref for project tooltip bounds
 * 4. sunTooltipElementRef - DOM ref for sun tooltip bounds
 * 5. Timeout refs for debounced hide actions
 * 6. Cleanup effects to prevent stale refs when tooltips unmount
 *
 * CRITICAL: Tooltip refs can get "stuck" if the tooltip unmounts before
 * the mouseLeave event fires. The cleanup effects prevent this.
 */

import { useRef, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { HoverInfo } from "../types";

export interface TooltipRefsConfig {
  hoveredSunId: string | null;
  hoverInfo: HoverInfo;
  setHoverInfo: Dispatch<SetStateAction<HoverInfo>>;
}

export interface TooltipRefs {
  // Refs for animation loop to read
  isMouseOverProjectTooltipRef: React.MutableRefObject<boolean>;
  isMouseOverSunTooltipRef: React.MutableRefObject<boolean>;
  projectTooltipElementRef: React.MutableRefObject<HTMLDivElement | null>;
  sunTooltipElementRef: React.MutableRefObject<HTMLDivElement | null>;

  // Event handlers for tooltip components
  handleProjectTooltipMouseEnter: () => void;
  handleProjectTooltipMouseLeave: () => void;
  handleSunTooltipMouseEnter: () => void;
  handleSunTooltipMouseLeave: () => void;
}

/**
 * Hook for managing all tooltip-related refs and cleanup
 */
export function useTooltipRefs(config: TooltipRefsConfig): TooltipRefs {
  const { hoveredSunId, hoverInfo, setHoverInfo } = config;

  // --- Refs for tracking mouse over tooltips ---
  const isMouseOverProjectTooltipRef = useRef(false);
  const isMouseOverSunTooltipRef = useRef(false);

  // --- DOM refs for tooltip elements (used by isMouseOverElement checks) ---
  const projectTooltipElementRef = useRef<HTMLDivElement | null>(null);
  const sunTooltipElementRef = useRef<HTMLDivElement | null>(null);

  // --- Timeout refs for debounced hide ---
  const projectTooltipHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sunHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // === CLEANUP EFFECTS ===
  // These are CRITICAL to prevent stuck refs when tooltips unmount before mouseLeave fires

  // Clean up sun tooltip refs when hoveredSunId becomes null
  useEffect(() => {
    if (hoveredSunId === null) {
      isMouseOverSunTooltipRef.current = false;
      if (sunHideTimeoutRef.current) {
        clearTimeout(sunHideTimeoutRef.current);
        sunHideTimeoutRef.current = null;
      }
    }
  }, [hoveredSunId]);

  // Clean up project tooltip refs when tooltip hides
  useEffect(() => {
    if (!hoverInfo.show) {
      isMouseOverProjectTooltipRef.current = false;
      if (projectTooltipHideTimeoutRef.current) {
        clearTimeout(projectTooltipHideTimeoutRef.current);
        projectTooltipHideTimeoutRef.current = null;
      }
    }
  }, [hoverInfo.show]);

  // Cleanup on unmount - clear any pending timeouts
  useEffect(() => {
    return () => {
      if (sunHideTimeoutRef.current) {
        clearTimeout(sunHideTimeoutRef.current);
      }
      if (projectTooltipHideTimeoutRef.current) {
        clearTimeout(projectTooltipHideTimeoutRef.current);
      }
    };
  }, []);

  // === EVENT HANDLERS FOR TOOLTIP COMPONENTS ===

  const handleProjectTooltipMouseEnter = useCallback((): void => {
    // Clear any pending hide timeout
    if (projectTooltipHideTimeoutRef.current) {
      clearTimeout(projectTooltipHideTimeoutRef.current);
      projectTooltipHideTimeoutRef.current = null;
    }
    isMouseOverProjectTooltipRef.current = true;
  }, []);

  const handleProjectTooltipMouseLeave = useCallback((): void => {
    isMouseOverProjectTooltipRef.current = false;
    // Start hide timeout when mouse leaves tooltip
    projectTooltipHideTimeoutRef.current = setTimeout(() => {
      setHoverInfo((prev) => ({ ...prev, show: false }));
      projectTooltipHideTimeoutRef.current = null;
    }, 200);
  }, [setHoverInfo]);

  const handleSunTooltipMouseEnter = useCallback((): void => {
    // Clear any pending hide timeout
    if (sunHideTimeoutRef.current) {
      clearTimeout(sunHideTimeoutRef.current);
      sunHideTimeoutRef.current = null;
    }
    isMouseOverSunTooltipRef.current = true;
  }, []);

  const handleSunTooltipMouseLeave = useCallback((): void => {
    // Just set the ref to false - the animation loop handles clearing the hover
    // based on whether the mouse is still in the sun's hit area
    isMouseOverSunTooltipRef.current = false;
  }, []);

  return {
    isMouseOverProjectTooltipRef,
    isMouseOverSunTooltipRef,
    projectTooltipElementRef,
    sunTooltipElementRef,
    handleProjectTooltipMouseEnter,
    handleProjectTooltipMouseLeave,
    handleSunTooltipMouseEnter,
    handleSunTooltipMouseLeave,
  };
}
