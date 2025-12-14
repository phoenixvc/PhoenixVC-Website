/**
 * useCanvasClick - Unified click/touch handling for Starfield canvas
 *
 * This hook consolidates the duplicate click logic that was in:
 * 1. handleCanvasClick (React onClick)
 * 2. DOM click listener (backup)
 * 3. onTouchEnd handler
 *
 * All three now call the same core logic.
 */

import { useCallback, RefObject, Dispatch, SetStateAction } from "react";
import { checkSunHover } from "./animation/sunState";
import { applyClickRepulsionToSunsCanvas } from "../sunSystem";
import { applyClickRepulsionToPlanets } from "../Planets";
import { MousePosition, Planet } from "../types";
import { Camera } from "../cosmos/types";
import { logger } from "@/utils/logger";

export interface CanvasClickConfig {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  planetsRef: RefObject<Planet[]>;
  cameraRef?: RefObject<Camera | undefined>;
  setMousePosition?: Dispatch<SetStateAction<MousePosition>>;
  onSunClick: (sunId: string) => void;
  applyStarfieldRepulsion: (x: number, y: number) => void;
}

export interface CanvasClickHandlers {
  handleCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleTouchEnd: (event: React.TouchEvent<HTMLCanvasElement>) => void;
}

/**
 * Core click processing logic - shared by all click/touch handlers
 */
function processCanvasClick(
  x: number,
  y: number,
  width: number,
  height: number,
  config: CanvasClickConfig,
): void {
  // Get current camera state for coordinate transformation (matches hover detection)
  const camera = config.cameraRef?.current;

  // 1. Check if click was on a sun FIRST (before any physics)
  // Pass camera to ensure click detection uses same coords as hover detection
  const sunHoverResult = checkSunHover(x, y, width, height, camera);

  if (sunHoverResult) {
    // Clicked on a sun - zoom to focus on that area
    config.onSunClick(sunHoverResult.sun.id);
    return;
  }

  // 2. Apply repulsion effects (only if NOT clicking a sun)
  // Apply to suns (orbital centers)
  applyClickRepulsionToSunsCanvas(x, y, width, height);

  // Apply to planets (orbiting portfolio items)
  const planets = config.planetsRef.current;
  if (planets && planets.length > 0) {
    applyClickRepulsionToPlanets(planets, x, y);
  }

  // Apply to background stars
  config.applyStarfieldRepulsion(x, y);

  // 3. Update mouse position state
  if (config.setMousePosition) {
    config.setMousePosition((prev) => ({
      ...prev,
      x,
      y,
      isClicked: false,
      clickTime: Date.now(),
    }));
  }
}

/**
 * Hook for unified canvas click handling
 */
export function useCanvasClick(config: CanvasClickConfig): CanvasClickHandlers {
  const { canvasRef } = config;

  // React onClick handler
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): void => {
      const canvas = canvasRef.current;
      if (!canvas) {
        logger.warn("[useCanvasClick] Canvas ref is null");
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      processCanvasClick(x, y, rect.width, rect.height, config);
    },
    [canvasRef, config],
  );

  // Touch end handler (for mobile)
  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>): void => {
      if (event.changedTouches.length === 0) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const touch = event.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      processCanvasClick(x, y, rect.width, rect.height, config);
    },
    [canvasRef, config],
  );

  // NOTE: DOM backup listener removed - React's onClick/onTouchEnd handlers are sufficient
  // The backup was causing double-firing of click events

  return {
    handleCanvasClick,
    handleTouchEnd,
  };
}
