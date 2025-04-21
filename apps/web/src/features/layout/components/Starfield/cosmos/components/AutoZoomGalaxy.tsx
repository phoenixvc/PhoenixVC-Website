// apps/web/src/features/layout/components/Starfield/cosmos/components/AutoZoomGalaxy.tsx
import React, { useEffect, useRef, useState } from "react";
import { GALAXIES, getObjectById } from "../cosmicHierarchy";
import { Camera, CosmicNavigationState } from "../types";

interface AutoZoomGalaxyProps {
  camera: Camera;
  setCamera: React.Dispatch<React.SetStateAction<Camera>>;
  navigationState: CosmicNavigationState;
  setNavigationState: React.Dispatch<React.SetStateAction<CosmicNavigationState>>;
  canvasWidth: number;
  canvasHeight: number;
}

const AutoZoomGalaxy: React.FC<AutoZoomGalaxyProps> = ({
  camera,
  setCamera,
  navigationState,
  setNavigationState,
  canvasWidth,
  canvasHeight
}) => {
  const [hoveredGalaxyId, setHoveredGalaxyId] = useState<string | null>(null);
  // Use ReturnType<typeof setTimeout> for the timeout ref
  const zoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isZoomingRef = useRef<boolean>(false);

  // Function to check if mouse is over a galaxy
  const checkGalaxyHover = (mouseX: number, mouseY: number) => {
    // Convert screen coordinates to world coordinates
    const worldX = (mouseX / canvasWidth);
    const worldY = (mouseY / canvasHeight);

    // Check if mouse is over any galaxy
    for (const galaxy of GALAXIES) {
      const dx = galaxy.position.x - worldX;
      const dy = galaxy.position.y - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If mouse is within galaxy radius
      if (distance < galaxy.size) {
        if (hoveredGalaxyId !== galaxy.id) {
          setHoveredGalaxyId(galaxy.id);
        }
        return;
      }
    }

    // If not hovering over any galaxy
    if (hoveredGalaxyId !== null) {
      setHoveredGalaxyId(null);
    }
  };

  // Handle mouse movement on the canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      checkGalaxyHover(mouseX, mouseY);
    };

    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [canvasWidth, canvasHeight, hoveredGalaxyId]);

  // Handle zooming when hovering over a galaxy
  useEffect(() => {
    // Clear any existing timeout
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = null;
    }

    if (hoveredGalaxyId) {
      // Add a small delay before zooming to avoid jittery behavior
      zoomTimeoutRef.current = setTimeout(() => {
        const galaxy = getObjectById(hoveredGalaxyId);
        if (galaxy) {
          isZoomingRef.current = true;

          // Set camera target to zoom into the galaxy
          setCamera(prev => ({
            ...prev,
            target: {
              cx: galaxy.position.x,
              cy: galaxy.position.y,
              zoom: 2.5 // Zoom level for galaxies
            }
          }));

          // Update navigation state
          setNavigationState(prev => ({
            ...prev,
            currentLevel: "galaxy",
            currentGalaxyId: galaxy.id,
            isTransitioning: true
          }));
        }
      }, 300); // 300ms delay before zooming
    } else if (isZoomingRef.current) {
      // Zoom out when not hovering over any galaxy
      zoomTimeoutRef.current = setTimeout(() => {
        isZoomingRef.current = false;

        // Reset camera to universe view
        setCamera(prev => ({
          ...prev,
          target: {
            cx: 0.5, // Center of universe
            cy: 0.5,
            zoom: 1 // Default zoom level
          }
        }));

        // Update navigation state
        setNavigationState(prev => ({
          ...prev,
          currentLevel: "universe",
          currentGalaxyId: undefined,
          isTransitioning: true
        }));
      }, 500); // Longer delay before zooming out
    }

    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, [hoveredGalaxyId, setCamera, setNavigationState]);

  return null; // This component doesn't render anything visible
};

export default AutoZoomGalaxy;
