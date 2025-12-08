import { useCallback, useEffect, useState } from "react";
import {
  DebugSettings,
  MousePosition,
  Star,
  UseDebugControlsProps,
} from "../types";
import { TWO_PI } from "../math";

const STORAGE_KEY = "starfieldDebugSettings";

function loadSaved(): Partial<DebugSettings> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(settings: DebugSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* silent‑fail – quota, private‑mode, etc. */
  }
}

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
  sidebarWidth = 0,
}: Omit<UseDebugControlsProps, "resetStarsCallback">): {
  debugSettings: DebugSettings;
  updateDebugSetting: <K extends keyof DebugSettings>(
    key: K,
    value: DebugSettings[K],
  ) => void;
  drawDebugInfo: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mousePosition: MousePosition,
    stars: Star[],
    mouseEffectRadius: number,
    timestamp?: number,
  ) => void;
} => {
  /* ---------- bootstrap ---------- */
  const saved = loadSaved();

  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    isDebugMode: saved?.isDebugMode ?? initialDebugMode,
    animationSpeed: saved?.animationSpeed ?? initialAnimationSpeed,
    maxVelocity: saved?.maxVelocity ?? initialMaxVelocity,
    flowStrength: saved?.flowStrength ?? initialFlowStrength,
    gravitationalPull: saved?.gravitationalPull ?? initialGravitationalPull,
    particleSpeed: saved?.particleSpeed ?? initialParticleSpeed,
    starSize: saved?.starSize ?? initialStarSize,
    employeeOrbitSpeed: saved?.employeeOrbitSpeed ?? initialEmployeeOrbitSpeed,
    mouseEffectRadius: saved?.mouseEffectRadius ?? initialMouseEffectRadius,
    lineConnectionDistance:
      saved?.lineConnectionDistance ?? initialLineConnectionDistance,
    lineOpacity: saved?.lineOpacity ?? initialLineOpacity,
    repulsionEnabled: saved?.repulsionEnabled ?? true,
    repulsionRadius: saved?.repulsionRadius ?? 300,
    repulsionForce: saved?.repulsionForce ?? 100,
    sidebarWidth,
  });

  /* re‑persist whenever anything changes */
  useEffect(() => {
    save(debugSettings);
  }, [debugSettings]);

  /* sync external prop → state when dev toggles the debug flag */
  useEffect(() => {
    setDebugSettings((prev) => ({ ...prev, isDebugMode: initialDebugMode }));
  }, [initialDebugMode]);

  const updateDebugSetting = useCallback(
    <K extends keyof DebugSettings>(key: K, value: DebugSettings[K]): void => {
      setDebugSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* -------------- debug HUD drawing -------------- */
  const drawDebugInfo = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      mousePosition: MousePosition,
      stars: Star[],
      mouseEffectRadius: number,
      timestamp?: number,
    ): void => {
      if (!debugSettings.isDebugMode) return;

      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "12px monospace";

      const lines = [
        `Stars: ${stars.length}`,
        `FPS: ${timestamp ? (1000 / timestamp).toFixed(1) : "—"}`,
        `Mouse: ${Math.round(mousePosition.x)},${Math.round(mousePosition.y)}`,
        `Effect Radius: ${mouseEffectRadius}`,
        `Repulse R/F: ${debugSettings.repulsionRadius}/${debugSettings.repulsionForce}`,
        `AnimSpeed: ${debugSettings.animationSpeed.toFixed(2)}x`,
        `MaxVel: ${debugSettings.maxVelocity.toFixed(2)}`,
      ];

      lines.forEach((txt, i) => ctx.fillText(txt, 10, 20 + i * 18));

      if (mousePosition.isOnScreen) {
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, mouseEffectRadius, 0, TWO_PI);
        ctx.stroke();
      }
      ctx.restore();
    },
    [debugSettings],
  );

  return { debugSettings, updateDebugSetting, drawDebugInfo };
};
