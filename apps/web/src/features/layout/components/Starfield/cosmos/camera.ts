// apps/web/src/features/layout/components/Starfield/cosmos/camera.ts
import { Camera, CosmicObject } from "./types";
import { CAMERA_CONFIG } from "../physicsConfig";

export function lerpCamera(camera: Camera, smoothingFactor = CAMERA_CONFIG.cameraSmoothingFactor): Camera {
  if (!camera.target) return camera;

  const newCx = camera.cx + (camera.target.cx - camera.cx) * smoothingFactor;
  const newCy = camera.cy + (camera.target.cy - camera.cy) * smoothingFactor;
  const newZoom = camera.zoom + (camera.target.zoom - camera.zoom) * smoothingFactor;

  // If we're close enough to target, remove the target
  if (Math.abs(newZoom - camera.target.zoom) < CAMERA_CONFIG.zoomConvergenceThreshold) {
    return {
      cx: newCx,
      cy: newCy,
      zoom: newZoom,
      target: undefined
    };
  }

  return {
    cx: newCx,
    cy: newCy,
    zoom: newZoom,
    target: camera.target
  };
}

export function screenToWorld(
  mouseX: number,
  mouseY: number,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
): { x: number, y: number } {
  // Convert screen coordinates to normalized coordinates (-1 to 1)
  const normalizedX = (mouseX - canvasWidth / 2) / (canvasWidth / 2);
  const normalizedY = -(mouseY - canvasHeight / 2) / (canvasHeight / 2);

  // Apply camera transform to get world coordinates
  return {
    x: camera.cx + normalizedX / camera.zoom,
    y: camera.cy + normalizedY / camera.zoom
  };
}

export function pickObject(
  worldX: number,
  worldY: number,
  objects: CosmicObject[],
  currentLevel: string
): CosmicObject | null {
  // Filter objects by level if needed
  const visibleObjects = currentLevel === "universe"
    ? objects.filter(o => o.level === "galaxy")
    : objects.filter(o => o.parentId === currentLevel);

  // Find the closest object
  let closestObject = null;
  let closestDistance = Infinity;

  for (const obj of visibleObjects) {
    const dx = worldX - obj.position.x;
    const dy = worldY - obj.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < obj.size && distance < closestDistance) {
      closestObject = obj;
      closestDistance = distance;
    }
  }

  return closestObject;
}
