/**
 * Shared utilities for hover detection and coordinate transforms
 */

import { Camera } from "../../cosmos/types";

/**
 * Element interface for tooltip bounds checking
 */
export interface BoundedElement {
  getBoundingClientRect: () => DOMRect;
}

/**
 * Check if mouse coordinates are within an element's bounding box
 * Used by hover managers to detect when mouse is over tooltips
 */
export function isMouseOverElement(
  mouseX: number,
  mouseY: number,
  element: BoundedElement,
): boolean {
  const rect = element.getBoundingClientRect();
  return (
    mouseX >= rect.left &&
    mouseX <= rect.right &&
    mouseY >= rect.top &&
    mouseY <= rect.bottom
  );
}

/**
 * Transform screen coordinates to world coordinates accounting for camera transform
 * This is the inverse of the canvas transformation applied in animate.ts
 *
 * Used by planet and sun hover detection to convert mouse position to world space.
 * Note: This uses pixel-space world coords, not normalized coords.
 *
 * @param screenX Mouse X in screen coordinates
 * @param screenY Mouse Y in screen coordinates
 * @param camera Current camera state (or undefined if no camera transform)
 * @param width Canvas width
 * @param height Canvas height
 * @returns World coordinates {x, y} in pixel space
 */
export function screenToWorldCoords(
  screenX: number,
  screenY: number,
  camera: Camera | undefined,
  width: number,
  height: number,
): { x: number; y: number } {
  // If no camera or zoom is 1, no transform is applied - coords are the same
  if (!camera || camera.zoom === 1) {
    return { x: screenX, y: screenY };
  }

  // Reverse the canvas transform from animate.ts:
  // ctx.translate(viewportCenterX, viewportCenterY);
  // ctx.scale(cameraValues.zoom, cameraValues.zoom);
  // ctx.translate(-cameraCenterX, -cameraCenterY);
  const viewportCenterX = width / 2;
  const viewportCenterY = height / 2;
  const cameraCenterX = camera.cx * width;
  const cameraCenterY = camera.cy * height;

  // Reverse: subtract viewport center, divide by zoom, add camera center
  const worldX = (screenX - viewportCenterX) / camera.zoom + cameraCenterX;
  const worldY = (screenY - viewportCenterY) / camera.zoom + cameraCenterY;

  return { x: worldX, y: worldY };
}
