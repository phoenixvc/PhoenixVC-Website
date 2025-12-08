import {
  GALAXIES,
  getChildrenOf,
  getObjectById
} from "./cosmicHierarchy";
import { drawGalaxySpiral } from "./renderHelpers"; // NEW ⭐
import {
  Camera,
  CosmicNavigationState,
  CosmicObject
} from "./types";
import { TWO_PI, fastSin } from "../math";

/* ────────────────────────────────────────────────────────────
   Utility: visibility check (unchanged)
   ────────────────────────────────────────────────────────── */
const _isObjectVisible = (
  obj: CosmicObject,
  camera: Camera,
  width: number,
  height: number
): boolean => {
  const screenX =
    (obj.position.x - camera.cx) * width * camera.zoom + width / 2;
  const screenY =
    (obj.position.y - camera.cy) * height * camera.zoom + height / 2;

  const screenRadius = obj.size * 50 * camera.zoom;

  return (
    screenX + screenRadius >= -100 &&
    screenX - screenRadius <= width + 100 &&
    screenY + screenRadius >= -100 &&
    screenY - screenRadius <= height + 100
  );
};

/* ────────────────────────────────────────────────────────────
   Main render entry
   ────────────────────────────────────────────────────────── */
export function renderCosmicHierarchy(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  navigationState: CosmicNavigationState,
  camera: Camera,
  time: number,
  hoveredId: string | null,
  starSizeFactor = 1,
  isDarkMode = true
): void {
  const { currentLevel, currentGalaxyId, currentSunId } = navigationState;

  ctx.save();

  /* world‑to‑screen transform */
  ctx.translate(width / 2, height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.cx * width, -camera.cy * height);

  /* what do we draw? */
  let objectsToDraw: CosmicObject[] = [];
  switch (currentLevel) {
    case "universe":
      objectsToDraw = GALAXIES;
      break;

    case "galaxy": {
      if (currentGalaxyId) {
        const galaxy = getObjectById(currentGalaxyId);
        const suns   = getChildrenOf(currentGalaxyId);
        if (galaxy) objectsToDraw = [galaxy, ...suns];
      }
      break;
    }

    case "sun": {
      if (currentSunId) {
        const sun     = getObjectById(currentSunId);
        const planets = getChildrenOf(currentSunId);
        if (sun) objectsToDraw = [sun, ...planets];
      }
      break;
    }

    default:
      /* nothing */
  }

  /* ─────────── draw phase ─────────── */
  for (const obj of objectsToDraw) {
    /* tiny objects not worth the fill cost */
    if (obj.size * 50 * camera.zoom < 0.5) continue;

    const x    = obj.position.x * width;
    const y    = obj.position.y * height;
    const size = obj.size * 50 * starSizeFactor;
    const base = obj.color || (isDarkMode ? "#ffffff" : "#000000");
    const onHover = obj.id === hoveredId;

    /* glow */
    ctx.beginPath();
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    glow.addColorStop(0, `${base}80`);
    glow.addColorStop(1, `${base}00`);
    ctx.fillStyle   = glow;
    ctx.globalAlpha = (onHover ? 1 : 0.7) * 0.5;
    ctx.arc(x, y, size * 2, 0, TWO_PI);
    ctx.fill();
    ctx.globalAlpha = onHover ? 1 : 0.7;   // reset

    /* body */
    switch (obj.level) {
      case "galaxy":
        // fancier look:
        drawGalaxySpiral(ctx, x, y, size * 2, 6, base);
        break;

      default:
        ctx.beginPath();
        ctx.fillStyle = base;
        ctx.arc(x, y, size, 0, TWO_PI);
        ctx.fill();
    }

    /* hover pulse */
    if (onHover) {
      const pulse = size * (1 + 0.2 * fastSin(time * 0.003));
      ctx.beginPath();
      ctx.strokeStyle = base;
      ctx.lineWidth   = 2;
      ctx.globalAlpha = 0.8;
      ctx.arc(x, y, pulse, 0, TWO_PI);
      ctx.stroke();
      ctx.globalAlpha = 1; // keep clean
    }
  }

  ctx.restore();
}

/* ────────────────────────────────────────────────────────────
   Sun/planet helpers (unchanged from your code)
   ────────────────────────────────────────────────────────── */
export function renderSunLevel(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  sunId: string,
  time: number,
  hoveredObjectId: string | null
): void {
  const sun = getObjectById(sunId);
  if (!sun) return;

  drawSun(ctx, sun, canvasWidth, canvasHeight, 2, true, time);
  getChildrenOf(sunId).forEach((planet) =>
    drawPlanet(
      ctx,
      planet,
      canvasWidth,
      canvasHeight,
      1,
      hoveredObjectId === planet.id,
      time
    )
  );
}

export function drawSun(
  ctx: CanvasRenderingContext2D,
  sun: CosmicObject,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  isActive: boolean,
  _time: number
): void {
  const x    = sun.position.x * canvasWidth;
  const y    = sun.position.y * canvasHeight;
  const size = sun.size * 50 * scale;

  /* glow */
  ctx.beginPath();
  const g = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
  g.addColorStop(0, `${sun.color}A0`);
  g.addColorStop(0.7, `${sun.color}50`);
  g.addColorStop(1, `${sun.color}00`);
  ctx.fillStyle   = g;
  ctx.globalAlpha = isActive ? 0.8 : 0.6;
  ctx.arc(x, y, size * 3, 0, TWO_PI);
  ctx.fill();

  /* body */
  ctx.beginPath();
  ctx.fillStyle   = sun.color || "#ffdb58";
  ctx.globalAlpha = isActive ? 1 : 0.8;
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fill();
}

export function drawPlanet(
  ctx: CanvasRenderingContext2D,
  planet: CosmicObject,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  isActive: boolean,
  _time: number
): void {
  const x    = planet.position.x * canvasWidth;
  const y    = planet.position.y * canvasHeight;
  const size = planet.size * 50 * scale;

  ctx.beginPath();
  ctx.fillStyle   = planet.color || "#3498db";
  ctx.globalAlpha = isActive ? 1 : 0.8;
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fill();

  if (isActive) {
    ctx.beginPath();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth   = 2;
    ctx.globalAlpha = 0.6;
    ctx.arc(x, y, size * 1.2, 0, TWO_PI);
    ctx.stroke();
  }
}
