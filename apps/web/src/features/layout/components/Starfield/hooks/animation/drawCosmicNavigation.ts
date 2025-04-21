import { renderCosmicHierarchy } from "../../cosmos/renderCosmicHierarchy";
import { Camera, CosmicNavigationState } from "../../cosmos/types";

/**
 * Draws the cosmic navigation interface on the canvas
 */
export function drawCosmicNavigation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  navigationState: CosmicNavigationState,
  camera: Camera,
  time: number,
  hoveredObjectId: string | null,
  isDarkMode: boolean
): void {
  // Only render if we have valid dimensions
  if (!width || !height) return;

  // Save the current state
  ctx.save();

  // Do NOT clear here – the main animation loop already did
  // Draw the cosmic hierarchy
  renderCosmicHierarchy(
    ctx,
    width,
    height,
    navigationState,
    camera,
    time,
    hoveredObjectId,
    1.0, // starSizeFactor
    isDarkMode
  );

  // Restore the context state
  ctx.restore();

  // Log that we've rendered (for debugging)
  console.log(`Rendered cosmic navigation at time ${time}, level: ${navigationState.currentLevel}`);
}
