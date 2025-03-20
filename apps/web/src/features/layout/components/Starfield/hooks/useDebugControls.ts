// hooks/useDebugControls.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { DebugSettings, MousePosition, Star, UseDebugControlsProps } from "../types";

export const useDebugControls = ({
  initialDebugMode,
  initialAnimationSpeed = 1.0,
  initialMaxVelocity = 0.5,
  initialFlowStrength = 0.05,
  initialGravitationalPull = 0.05,
  initialParticleSpeed = 0.05,
  initialStarSize = 1.0,
  initialEmployeeOrbitSpeed = 0.0001,
  initialMouseEffectRadius = 150,
  initialLineConnectionDistance = 150,
  initialLineOpacity = 0.15,
  sidebarWidth = 0
}: Omit<UseDebugControlsProps, "resetStarsCallback">) => {
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    isDebugMode: initialDebugMode,
    animationSpeed: initialAnimationSpeed,
    maxVelocity: initialMaxVelocity,
    flowStrength: initialFlowStrength,
    gravitationalPull: initialGravitationalPull,
    particleSpeed: initialParticleSpeed,
    starSize: initialStarSize,
    employeeOrbitSpeed: initialEmployeeOrbitSpeed,
    mouseEffectRadius: initialMouseEffectRadius,
    lineConnectionDistance: initialLineConnectionDistance,
    lineOpacity: initialLineOpacity,
    sidebarWidth: sidebarWidth
  });

  // Track initial debug mode changes from props
  useEffect(() => {
    console.log(`initialDebugMode changed to: ${initialDebugMode}`);
    setDebugSettings(prev => ({
      ...prev,
      isDebugMode: initialDebugMode
    }));
  }, [initialDebugMode]);

  // Function to update a specific debug setting
  const updateDebugSetting = useCallback(<K extends keyof DebugSettings>(
    key: K,
    value: DebugSettings[K]
  ) => {
    console.log(`Updating debug setting in hook: ${String(key)} = ${value}`);
    setDebugSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Debug info drawing function
  const drawDebugInfo = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mousePosition: MousePosition,
    stars: Star[],
    mouseEffectRadius: number,
    timestamp?: number
  ) => {
    // Only draw if debug mode is enabled
    if (!debugSettings.isDebugMode) return;

    // Save context state
    ctx.save();

    // Set text properties
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "12px monospace";

    // Draw debug information
    ctx.fillText(`Stars: ${stars.length}`, 10, 20);
    ctx.fillText(`FPS: ${calculateFPS(timestamp)}`, 10, 40);
    ctx.fillText(`Mouse: ${Math.round(mousePosition?.x || 0)}, ${Math.round(mousePosition?.y || 0)}`, 10, 60);
    ctx.fillText(`Effect Radius: ${mouseEffectRadius}px`, 10, 80);
    ctx.fillText(`Animation Speed: ${debugSettings.animationSpeed.toFixed(2)}x`, 10, 100);
    ctx.fillText(`Max Velocity: ${debugSettings.maxVelocity.toFixed(2)}`, 10, 120);

    // Draw mouse effect radius if mouse is on screen
    if (mousePosition?.isOnScreen) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(mousePosition.x, mousePosition.y, mouseEffectRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Restore context state
    ctx.restore();
  }, [debugSettings.isDebugMode, debugSettings.animationSpeed, debugSettings.maxVelocity]);

  // Helper function to calculate FPS
  const calculateFPS = (timestamp?: number): string => {
    if (!timestamp) return "N/A";
    // FPS calculation logic here
    return "60"; // Placeholder
  };

  return { debugSettings, updateDebugSetting, drawDebugInfo };
};
