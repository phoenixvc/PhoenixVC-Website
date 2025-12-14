/**
 * useCameraAnimation - Camera zoom and animation management for Starfield
 *
 * This hook manages:
 * 1. Internal camera state (cx, cy, zoom, target)
 * 2. Camera state ref for synchronous animation loop access
 * 3. Smooth lerp animation between camera positions
 * 4. zoomToSun function for focusing on specific suns
 *
 * The camera uses a dual-state pattern:
 * - React state (internalCamera): For triggering re-renders and storing target
 * - Ref (cameraStateRef): For synchronous access in animation loop (60fps)
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  MutableRefObject,
} from "react";
import { Camera } from "../cosmos/types";
import { CAMERA_CONFIG } from "../physicsConfig";
import { getSunPosition } from "../sunSystem";
import { logger } from "@/utils/logger";
import { Planet } from "../types";

export interface CameraAnimationConfig {
  /** Current focused sun ID (for toggle logic) */
  focusedSunId: string | null;
  /** Setter for focused sun ID */
  setFocusedSunId: (id: string | null) => void;
  /** Setter for hovered sun ID (to reset on zoom out) */
  setHoveredSunId: (id: string | null) => void;
  /** Setter for hovered sun (to reset on zoom out) */
  setHoveredSun: (sun: unknown) => void;
  /** Ref to employee stars (planets) for orbit radius calculation */
  employeeStarsRef: MutableRefObject<Planet[]>;
  /** Ref to canvas dimensions for zoom calculation */
  dimensionsRef: MutableRefObject<{ width: number; height: number }>;
}

export interface CameraAnimationResult {
  /** Current camera state */
  camera: Camera;
  /** Setter for camera state (rarely needed externally) */
  setCamera: React.Dispatch<React.SetStateAction<Camera>>;
  /** Ref for synchronous camera access in animation loop */
  cameraStateRef: MutableRefObject<{ cx: number; cy: number; zoom: number }>;
  /** Ref to camera animation frame (for cleanup) */
  cameraAnimationRef: MutableRefObject<number | null>;
  /** Function to zoom camera to a specific sun */
  zoomToSun: (sunId: string) => void;
}

/**
 * Hook for managing camera zoom animations
 */
export function useCameraAnimation({
  focusedSunId,
  setFocusedSunId,
  setHoveredSunId,
  setHoveredSun,
  employeeStarsRef,
  dimensionsRef,
}: CameraAnimationConfig): CameraAnimationResult {
  // Internal camera state for sun zoom functionality
  const [internalCamera, setInternalCamera] = useState<Camera>({
    cx: CAMERA_CONFIG.defaultCenterX,
    cy: CAMERA_CONFIG.defaultCenterY,
    zoom: CAMERA_CONFIG.defaultZoom,
    target: undefined,
  });

  // Animation frame ref for cleanup
  const cameraAnimationRef = useRef<number | null>(null);

  // Store current camera state in a ref for animation loop access
  // This ref holds the ANIMATED camera position (not the target)
  const cameraStateRef = useRef({
    cx: CAMERA_CONFIG.defaultCenterX,
    cy: CAMERA_CONFIG.defaultCenterY,
    zoom: CAMERA_CONFIG.defaultZoom,
  });

  /**
   * Zoom the camera to focus on a specific sun
   * If clicking the same sun, toggles off (zoom out)
   */
  const zoomToSun = useCallback(
    (sunId: string): void => {
      // Cancel any existing camera animation
      if (cameraAnimationRef.current) {
        cancelAnimationFrame(cameraAnimationRef.current);
      }

      // If clicking on the same sun, toggle off (zoom out)
      if (focusedSunId === sunId) {
        setFocusedSunId(null);
        // Reset hover state when zooming out
        setHoveredSunId(null);
        setHoveredSun(null);

        // Set camera target to zoom out
        setInternalCamera((prev) => ({
          ...prev,
          target: {
            cx: 0.5,
            cy: 0.5,
            zoom: 1,
          },
        }));
        return;
      }

      // Get the sun's current position
      const sunPosition = getSunPosition(sunId);
      if (!sunPosition) {
        logger.warn(`[Starfield] Could not find sun with id: ${sunId}`);
        return;
      }

      setFocusedSunId(sunId);

      // Calculate the maximum orbit radius of planets around this sun
      // This helps determine the optimal zoom level
      const planetsForSun = employeeStarsRef.current.filter(
        (planet) => planet.orbitParentId === sunId,
      );

      let maxOrbitRadius = 0;
      if (planetsForSun.length > 0) {
        planetsForSun.forEach((planet) => {
          if (planet.orbitRadius) {
            maxOrbitRadius = Math.max(maxOrbitRadius, planet.orbitRadius);
          }
        });
      }

      // Calculate zoom level based on orbit size
      // Default to sunFocusZoom if no planets, otherwise calculate dynamically
      const canvasSize = dimensionsRef.current
        ? Math.min(dimensionsRef.current.width, dimensionsRef.current.height)
        : 1000; // Default fallback size
      const normalizedOrbitRadius = maxOrbitRadius / canvasSize;

      // Calculate zoom: larger orbits = less zoom to fit everything in view
      const calculatedZoom =
        normalizedOrbitRadius > 0
          ? Math.max(
              CAMERA_CONFIG.minSunFocusZoom,
              Math.min(
                CAMERA_CONFIG.maxSunFocusZoom,
                CAMERA_CONFIG.sunFocusZoomDivisor /
                  (1 +
                    normalizedOrbitRadius * CAMERA_CONFIG.sunFocusOrbitMultiplier),
              ),
            )
          : CAMERA_CONFIG.sunFocusZoom;

      // Set camera target to zoom in on the sun
      setInternalCamera((prev) => ({
        ...prev,
        target: {
          cx: sunPosition.x,
          cy: sunPosition.y,
          zoom: calculatedZoom,
        },
      }));
    },
    [focusedSunId, setFocusedSunId, setHoveredSunId, setHoveredSun, employeeStarsRef, dimensionsRef],
  );

  // Smooth camera lerp animation - only runs when there's an active target
  // Use a serialized target key to detect when target changes
  const targetKey = internalCamera.target
    ? `${internalCamera.target.cx}-${internalCamera.target.cy}-${internalCamera.target.zoom}`
    : null;

  useEffect(() => {
    // Helper function to sync cameraStateRef with current internalCamera position
    const syncCameraStateRef = (): void => {
      cameraStateRef.current = {
        cx: internalCamera.cx,
        cy: internalCamera.cy,
        zoom: internalCamera.zoom,
      };
    };

    // Only start animation if there's an active target
    if (!internalCamera.target) {
      // No target, ensure any running animation is stopped
      if (cameraAnimationRef.current) {
        cancelAnimationFrame(cameraAnimationRef.current);
        cameraAnimationRef.current = null;
      }
      // Sync cameraStateRef with current camera position when no target
      syncCameraStateRef();
      return;
    }

    // Cancel any existing animation before starting a new one
    if (cameraAnimationRef.current) {
      cancelAnimationFrame(cameraAnimationRef.current);
      cameraAnimationRef.current = null;
    }

    // Sync cameraStateRef with current camera position before starting new animation
    syncCameraStateRef();

    // Store the target for this animation cycle
    const targetCx = internalCamera.target.cx;
    const targetCy = internalCamera.target.cy;
    const targetZoom = internalCamera.target.zoom;

    const animateCamera = (): void => {
      // Read the current animated position from ref (updated each frame)
      const {
        cx: currentCx,
        cy: currentCy,
        zoom: currentZoom,
      } = cameraStateRef.current;

      const smoothing = CAMERA_CONFIG.cameraSmoothingFactor;
      const newCx = currentCx + (targetCx - currentCx) * smoothing;
      const newCy = currentCy + (targetCy - currentCy) * smoothing;
      const newZoom = currentZoom + (targetZoom - currentZoom) * smoothing;

      // Update the ref with the new animated position (for next frame)
      cameraStateRef.current = { cx: newCx, cy: newCy, zoom: newZoom };

      // Check if we're close enough to target
      const isCloseEnough =
        Math.abs(newCx - targetCx) < CAMERA_CONFIG.positionConvergenceThreshold &&
        Math.abs(newCy - targetCy) < CAMERA_CONFIG.positionConvergenceThreshold &&
        Math.abs(newZoom - targetZoom) < CAMERA_CONFIG.zoomConvergenceThreshold;

      if (isCloseEnough) {
        // Reached target, set final values and clear target
        cameraStateRef.current = {
          cx: targetCx,
          cy: targetCy,
          zoom: targetZoom,
        };
        setInternalCamera({
          cx: targetCx,
          cy: targetCy,
          zoom: targetZoom,
          target: undefined,
        });
        cameraAnimationRef.current = null;
        return;
      }

      // Update React state to trigger re-render for visual updates
      // (The animation loop reads from cameraStateRef, not React state)
      setInternalCamera((prev) => ({
        cx: newCx,
        cy: newCy,
        zoom: newZoom,
        target: prev.target, // Keep the target
      }));

      // Continue animation for next frame
      cameraAnimationRef.current = requestAnimationFrame(animateCamera);
    };

    // Start the animation
    cameraAnimationRef.current = requestAnimationFrame(animateCamera);

    return (): void => {
      if (cameraAnimationRef.current) {
        cancelAnimationFrame(cameraAnimationRef.current);
        cameraAnimationRef.current = null;
      }
    };
    // targetKey is a stable serialized key derived from internalCamera.target
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);

  return {
    camera: internalCamera,
    setCamera: setInternalCamera,
    cameraStateRef,
    cameraAnimationRef,
    zoomToSun,
  };
}
