import { getObjectById, getObjectsByLevel } from "./cosmicHierarchy";
import { Camera, CosmicNavigationState, CosmicObject } from "./types";

/**
 * Picks a cosmic object at the given screen coordinates
 * @param clientX Mouse X position
 * @param clientY Mouse Y position
 * @param camera Current camera state
 * @param width Canvas width
 * @param height Canvas height
 * @returns The picked cosmic object or null if none was found
 */

export function pickObject(
  screenX: number,
  screenY: number,
  camera: Camera,
  width: number,
  height: number
): CosmicObject | null {
  // Convert screen coordinates to world coordinates
  const worldCoords = screenToWorld(screenX, screenY, camera, width, height);
  
  // Get all objects at the current navigation level
  const objects = getAllObjectsAtCurrentLevel(camera);
  
  // Find the object closest to the click point
  let closestObject: CosmicObject | null = null;
  let closestDistance = Infinity;
  
  for (const obj of objects) {
    const dx = obj.position.x - worldCoords.x;
    const dy = obj.position.y - worldCoords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if the click is within the object's radius
    // Use a larger radius for easier clicking
    const clickRadius = obj.size * 1.5;
    
    if (distance < clickRadius && distance < closestDistance) {
      closestObject = obj;
      closestDistance = distance;
    }
  }
  
  return closestObject;
}

/**
 * Drills down into the cosmic hierarchy when an object is clicked
 * @param currentState Current navigation state
 * @param currentCamera Current camera state
 * @param clickedObject The object that was clicked
 * @returns New navigation state and camera
 */
export function drillDown(
  currentState: CosmicNavigationState,
  camera: Camera,
  clickedObject: CosmicObject
): { nav: CosmicNavigationState, cam: Camera } {
  // Default to current state
  let newState = { ...currentState };
  let newCamera = { ...camera };
  
  // Determine new state based on clicked object level
  switch (clickedObject.level) {
    case "galaxy":
      newState = {
        currentLevel: "galaxy",
        currentGalaxyId: clickedObject.id,
        currentSunId: undefined,
        currentPlanetId: undefined,
        currentSpecialObjectId: undefined,
        isTransitioning: true
      };
      
      // Set camera to zoom to galaxy position
      newCamera = {
        ...camera,
        target: {
          cx: clickedObject.position.x,
          cy: clickedObject.position.y,
          zoom: 2.5  // Zoom level for galaxy view
        }
      };
      break;
      
    case "sun":
      newState = {
        currentLevel: "sun",
        currentGalaxyId: clickedObject.parentId,
        currentSunId: clickedObject.id,
        currentPlanetId: undefined,
        currentSpecialObjectId: undefined,
        isTransitioning: true
      };
      
      // Set camera to zoom to sun position
      newCamera = {
        ...camera,
        target: {
          cx: clickedObject.position.x,
          cy: clickedObject.position.y,
          zoom: 5  // Zoom level for sun view
        }
      };
      break;
      
    case "planet":
      newState = {
        currentLevel: "planet",
        currentGalaxyId: currentState.currentGalaxyId,
        currentSunId: clickedObject.parentId,
        currentPlanetId: clickedObject.id,
        currentSpecialObjectId: undefined,
        isTransitioning: true
      };
      
      // Set camera to zoom to planet position
      newCamera = {
        ...camera,
        target: {
          cx: clickedObject.position.x,
          cy: clickedObject.position.y,
          zoom: 8  // Zoom level for planet view
        }
      };
      break;
      
    case "special":
      newState = {
        currentLevel: "special",
        currentGalaxyId: undefined,
        currentSunId: undefined,
        currentPlanetId: undefined,
        currentSpecialObjectId: clickedObject.id,
        isTransitioning: true
      };
      
      // Set camera to zoom to special object position
      newCamera = {
        ...camera,
        target: {
          cx: clickedObject.position.x,
          cy: clickedObject.position.y,
          zoom: 4  // Zoom level for special objects
        }
      };
      break;
  }
  
  return { nav: newState, cam: newCamera };
}

function getAllObjectsAtCurrentLevel(camera: Camera): CosmicObject[] {
  // Base visibility on zoom level
  if (camera.zoom < 1.5) {
    // Universe view - show galaxies
    return getObjectsByLevel("galaxy");
  } else if (camera.zoom < 4) {
    // Galaxy view - show suns
    return getObjectsByLevel("sun");
  } else if (camera.zoom < 7) {
    // Sun view - show planets
    return getObjectsByLevel("planet");
  } else {
    // Planet view - show details
    return getObjectsByLevel("planet");
  }
}

/**
 * Helper function to get the parent galaxy ID for an object
 */
export function getParentGalaxyId(obj: CosmicObject): string | undefined {
  if (obj.level === "planet") {
    // For planets, get the parent sun first
    const parentSun = getObjectById(obj.parentId || "");
    if (parentSun) {
      // Then return the parent galaxy of the sun
      return parentSun.parentId;
    }
  }
  return undefined;
}

/**
 * Converts world coordinates to screen coordinates based on the camera position and zoom
 * @param worldX X coordinate in world space (0-1)
 * @param worldY Y coordinate in world space (0-1)
 * @param camera Current camera state
 * @param width Canvas width
 * @param height Canvas height
 * @returns Screen coordinates {x, y}
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: Camera,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: (worldX - camera.cx) * width * camera.zoom + width / 2,
    y: (worldY - camera.cy) * height * camera.zoom + height / 2
  };
}

/**
 * Converts screen coordinates to world coordinates
 * @param screenX X coordinate in screen space
 * @param screenY Y coordinate in screen space
 * @param camera Current camera state
 * @param width Canvas width
 * @param height Canvas height
 * @returns World coordinates {x, y}
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: camera.cx + (screenX - width / 2) / (width * camera.zoom),
    y: camera.cy + (screenY - height / 2) / (height * camera.zoom)
  };
}

/**
 * Checks if an object is visible in the current viewport
 * @param worldX X coordinate in world space
 * @param worldY Y coordinate in world space
 * @param radius Object radius
 * @param camera Current camera state
 * @param width Canvas width
 * @param height Canvas height
 * @returns True if the object is visible
 */
export function isVisibleInViewport(
  worldX: number,
  worldY: number,
  radius: number,
  camera: Camera,
  width: number,
  height: number
): boolean {
  const screenX = (worldX - camera.cx) * width * camera.zoom + width / 2;
  const screenY = (worldY - camera.cy) * height * camera.zoom + height / 2;

  // Add a small margin around the viewport for smoother transitions
  return (
    screenX + radius > -100 &&
    screenX - radius < width + 100 &&
    screenY + radius > -100 &&
    screenY - radius < height + 100
  );
}