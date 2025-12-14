// apps/web/src/features/layout/components/Starfield/cosmos/camera.ts
import { Camera } from "./types";
import { CAMERA_CONFIG } from "../physicsConfig";

/**
 * Smoothly interpolate camera towards its target position/zoom.
 * Returns the updated camera state.
 */
export function lerpCamera(
  camera: Camera,
  smoothingFactor = CAMERA_CONFIG.cameraSmoothingFactor,
): Camera {
  if (!camera.target) return camera;

  const newCx = camera.cx + (camera.target.cx - camera.cx) * smoothingFactor;
  const newCy = camera.cy + (camera.target.cy - camera.cy) * smoothingFactor;
  const newZoom =
    camera.zoom + (camera.target.zoom - camera.zoom) * smoothingFactor;

  // If we're close enough to target, remove the target
  if (
    Math.abs(newZoom - camera.target.zoom) <
    CAMERA_CONFIG.zoomConvergenceThreshold
  ) {
    return {
      cx: newCx,
      cy: newCy,
      zoom: newZoom,
      target: undefined,
    };
  }

  return {
    cx: newCx,
    cy: newCy,
    zoom: newZoom,
    target: camera.target,
  };
}

// NOTE: screenToWorld and pickObject functions removed -
// Use the versions in cosmicNavigation.ts instead
