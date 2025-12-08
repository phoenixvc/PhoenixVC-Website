// sunLayers.ts - Individual sun layer drawing functions
// Single Responsibility: Draw individual visual layers of a sun

import { TWO_PI, fastSin, fastCos } from "../../math";
import { SUN_RENDERING_CONFIG, OPACITY_CONFIG } from "../../renderingConfig";

// Type for sun state with pre-computed lightened colors
interface SunStateWithColors {
  rotationAngle: number;
  color: string;
  lightenedColors?: {
    light40: string;
    light50: string;
    light60: string;
    light70: string;
    light80: string;
    light85: string;
  };
}

// Type aliases for cleaner function signatures
type LayersConfig = typeof SUN_RENDERING_CONFIG.layers;
type FlaresConfig = typeof SUN_RENDERING_CONFIG.flares;
type RaysConfig = typeof SUN_RENDERING_CONFIG.rays;
type ParticlesConfig = typeof SUN_RENDERING_CONFIG.particles;
type EjectConfig = typeof SUN_RENDERING_CONFIG.ejectParticles;
type PropelConfig = typeof SUN_RENDERING_CONFIG.propelRings;
type GranulationConfig = typeof SUN_RENDERING_CONFIG.granulation;
type HoverRingConfig = typeof SUN_RENDERING_CONFIG.hoverRing;

/**
 * Draw the outermost halo glow around the sun
 */
export function drawSunHalo(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  rgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  layers: LayersConfig
): void {
  const haloSize = size * (isHighlighted ? layers.haloSize.highlighted : layers.haloSize.normal);
  const haloGradient = ctx.createRadialGradient(x, y, size * 0.3, x, y, haloSize);
  haloGradient.addColorStop(0, `rgba(${rgbStr}, ${isHighlighted ? 0.15 : 0.08})`);
  haloGradient.addColorStop(0.3, `rgba(${rgbStr}, ${isHighlighted ? 0.08 : 0.04})`);
  haloGradient.addColorStop(0.6, `rgba(${rgbStr}, ${isHighlighted ? 0.03 : 0.015})`);
  haloGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

  ctx.beginPath();
  ctx.fillStyle = haloGradient;
  ctx.globalAlpha = isDarkMode ? 1 : 0.8;
  ctx.arc(x, y, haloSize, 0, TWO_PI);
  ctx.fill();
}

/**
 * Draw the atmospheric glow layer
 */
export function drawSunAtmosphere(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  rgbStr: string, secondaryRgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  layers: LayersConfig
): void {
  const atmosphereSize = size * (isHighlighted ? layers.atmosphereSize.highlighted : layers.atmosphereSize.normal);
  const atmosphereGradient = ctx.createRadialGradient(x, y, size * 0.4, x, y, atmosphereSize);
  atmosphereGradient.addColorStop(0, `rgba(${rgbStr}, ${isHighlighted ? 0.5 : 0.35})`);
  atmosphereGradient.addColorStop(0.2, `rgba(${rgbStr}, ${isHighlighted ? 0.3 : 0.2})`);
  atmosphereGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, ${isHighlighted ? 0.12 : 0.08})`);
  atmosphereGradient.addColorStop(0.8, `rgba(${rgbStr}, ${isHighlighted ? 0.05 : 0.03})`);
  atmosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

  ctx.beginPath();
  ctx.fillStyle = atmosphereGradient;
  ctx.globalAlpha = isDarkMode ? 1 : 0.75;
  ctx.arc(x, y, atmosphereSize, 0, TWO_PI);
  ctx.fill();
}

/**
 * Draw curved solar flare tendrils
 */
export function drawSolarFlares(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: SunStateWithColors,
  rgbStr: string, secondaryRgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  flares: FlaresConfig
): void {
  const flareCount = isHighlighted ? flares.count.highlighted : flares.count.normal;
  ctx.globalAlpha = isDarkMode
    ? (isHighlighted ? OPACITY_CONFIG.sun.flares.dark.highlighted : OPACITY_CONFIG.sun.flares.dark.normal)
    : (isHighlighted ? OPACITY_CONFIG.sun.flares.light.highlighted : OPACITY_CONFIG.sun.flares.light.normal);

  // Use pre-computed lightened color (avoids hex parsing per frame)
  const light60 = sunState.lightenedColors?.light60 ?? sunState.color;

  for (let i = 0; i < flareCount; i++) {
    const baseAngle = (i * TWO_PI / flareCount) + sunState.rotationAngle * 0.5;
    const waveOffset = fastSin(time * flares.waveSpeed + i * 0.7) * 0.15;
    const angle = baseAngle + waveOffset;

    const flarePhase = fastSin(time * flares.phaseSpeed + i * 1.5);
    const flareLength = size * (isHighlighted ? flares.lengthMultiplier.highlighted : flares.lengthMultiplier.normal) * (0.7 + 0.3 * flarePhase);

    const startDist = size * 0.85;
    const cosAngle = fastCos(angle);
    const sinAngle = fastSin(angle);
    const startX = x + cosAngle * startDist;
    const startY = y + sinAngle * startDist;
    const endX = x + cosAngle * flareLength;
    const endY = y + sinAngle * flareLength;

    const curveFactor = fastSin(time * flares.curveFactor + i) * size * 0.5;
    const perpAngle = angle + Math.PI / 2;
    const cpX = (startX + endX) / 2 + fastCos(perpAngle) * curveFactor;
    const cpY = (startY + endY) / 2 + fastSin(perpAngle) * curveFactor;

    const flareGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    flareGradient.addColorStop(0, light60);
    flareGradient.addColorStop(0.3, `rgba(${rgbStr}, 0.6)`);
    flareGradient.addColorStop(0.6, `rgba(${secondaryRgbStr}, 0.3)`);
    flareGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.strokeStyle = flareGradient;
    ctx.lineWidth = size * (isHighlighted ? flares.lineWidthMultiplier.highlighted : flares.lineWidthMultiplier.normal) * (1 + 0.3 * flarePhase);
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

/**
 * Draw triangular corona rays
 */
export function drawCoronaRays(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: { rotationAngle: number },
  rgbStr: string, secondaryRgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  rays: RaysConfig
): void {
  const rayCount = isHighlighted ? rays.count.highlighted : rays.count.normal;
  ctx.globalAlpha = isDarkMode
    ? (isHighlighted ? OPACITY_CONFIG.sun.rays.dark.highlighted : OPACITY_CONFIG.sun.rays.dark.normal)
    : (isHighlighted ? OPACITY_CONFIG.sun.rays.light.highlighted : OPACITY_CONFIG.sun.rays.light.normal);

  for (let i = 0; i < rayCount; i++) {
    const baseAngle = (i * TWO_PI / rayCount) + sunState.rotationAngle;
    const waveOffset = fastSin(time * rays.waveSpeed + i * 0.4) * 0.08;
    const angle = baseAngle + waveOffset;

    const rayLengthVariation = 0.75 + 0.25 * fastSin(time * 0.00018 + i * 1.1);
    const rayLength = size * (isHighlighted ? rays.lengthMultiplier.highlighted : rays.lengthMultiplier.normal) * rayLengthVariation;

    const cosAngle = fastCos(angle);
    const sinAngle = fastSin(angle);
    const endX = x + cosAngle * rayLength;
    const endY = y + sinAngle * rayLength;

    ctx.beginPath();
    const rayWidth = size * (isHighlighted ? rays.widthMultiplier.highlighted : rays.widthMultiplier.normal);
    const perpAngle = angle + Math.PI / 2;
    const cosPerpAngle = fastCos(perpAngle);
    const sinPerpAngle = fastSin(perpAngle);

    const startDist = size * 0.75;
    const startX = x + cosAngle * startDist;
    const startY = y + sinAngle * startDist;

    ctx.moveTo(
      startX + cosPerpAngle * rayWidth,
      startY + sinPerpAngle * rayWidth
    );
    ctx.lineTo(endX, endY);
    ctx.lineTo(
      startX - cosPerpAngle * rayWidth,
      startY - sinPerpAngle * rayWidth
    );
    ctx.closePath();

    const rayGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    rayGradient.addColorStop(0, `rgba(${rgbStr}, 0.9)`);
    rayGradient.addColorStop(0.4, `rgba(${rgbStr}, 0.4)`);
    rayGradient.addColorStop(0.7, `rgba(${secondaryRgbStr}, 0.15)`);
    rayGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

    ctx.fillStyle = rayGradient;
    ctx.fill();
  }
}

/**
 * Draw the chromosphere layer
 */
export function drawChromosphere(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  rgbStr: string, secondaryRgbStr: string, isDarkMode: boolean,
  layers: LayersConfig
): void {
  ctx.globalAlpha = isDarkMode ? OPACITY_CONFIG.sun.chromosphere.dark : OPACITY_CONFIG.sun.chromosphere.light;
  const chromosphereGradient = ctx.createRadialGradient(x, y, size * 0.95, x, y, size * layers.chromosphereRadius);
  chromosphereGradient.addColorStop(0, `rgba(${rgbStr}, 0.8)`);
  chromosphereGradient.addColorStop(0.3, `rgba(${secondaryRgbStr}, 0.5)`);
  chromosphereGradient.addColorStop(0.6, `rgba(${rgbStr}, 0.3)`);
  chromosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

  ctx.beginPath();
  ctx.fillStyle = chromosphereGradient;
  ctx.arc(x, y, size * layers.chromosphereRadius, 0, TWO_PI);
  ctx.fill();
}

/**
 * Draw propulsion rings when sun is avoiding collision
 */
export function drawPropelRings(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: { color: string },
  rgbStr: string,
  propelRings: PropelConfig
): void {
  for (let r = 0; r < propelRings.count; r++) {
    const ringRadius = size * (propelRings.baseRadius + r * propelRings.radiusStep);
    const ringAlpha = 0.5 - r * 0.09;
    const ringPhase = fastSin(time * propelRings.animationSpeed + r * Math.PI / 2.5);

    ctx.beginPath();
    const ringGradient = ctx.createRadialGradient(x, y, ringRadius - 2, x, y, ringRadius + 2);
    ringGradient.addColorStop(0, `rgba(${rgbStr}, 0)`);
    ringGradient.addColorStop(0.5, sunState.color);
    ringGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = propelRings.lineWidthBase - r * propelRings.lineWidthDecrement;
    ctx.globalAlpha = ringAlpha * (0.5 + 0.5 * ringPhase);
    ctx.arc(x, y, ringRadius, 0, TWO_PI);
    ctx.stroke();
  }
}

/**
 * Draw orbiting solar particles
 */
export function drawSolarParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: SunStateWithColors,
  rgbStr: string, secondaryRgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  particles: ParticlesConfig
): void {
  const particleCount = isHighlighted ? particles.count.highlighted : particles.count.normal;
  ctx.globalAlpha = isDarkMode
    ? (isHighlighted ? OPACITY_CONFIG.sun.particles.dark.highlighted : OPACITY_CONFIG.sun.particles.dark.normal)
    : (isHighlighted ? OPACITY_CONFIG.sun.particles.light.highlighted : OPACITY_CONFIG.sun.particles.light.normal);

  // Use pre-computed lightened colors (avoids hex parsing per frame)
  const light70 = sunState.lightenedColors?.light70 ?? sunState.color;
  const light80 = sunState.lightenedColors?.light80 ?? sunState.color;

  for (let i = 0; i < particleCount; i++) {
    const orbitRadius = size * (particles.orbitBaseRadius + (i % 4) * particles.orbitRadiusStep);
    const orbitSpeed = particles.orbitSpeedBase + (i % 3) * particles.orbitSpeedVariation;
    const particleAngle = (i * TWO_PI / particleCount) + time * orbitSpeed + sunState.rotationAngle * 0.3;

    const wobble = fastSin(time * particles.wobbleSpeed + i * 1.7) * size * particles.wobbleAmount;
    const particleX = x + fastCos(particleAngle) * (orbitRadius + wobble);
    const particleY = y + fastSin(particleAngle) * (orbitRadius + wobble);

    const particlePulse = 0.7 + 0.3 * fastSin(time * particles.pulseSpeed + i * 2.1);
    const particleSize = (size * 0.04 + (i % 3) * size * 0.015) * particlePulse;

    const particleGradient = ctx.createRadialGradient(
      particleX, particleY, 0,
      particleX, particleY, particleSize * 2.5
    );

    if (i % 3 === 0) {
      particleGradient.addColorStop(0, "#ffffff");
      particleGradient.addColorStop(0.3, light70);
      particleGradient.addColorStop(0.6, `rgba(${rgbStr}, 0.5)`);
      particleGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    } else if (i % 3 === 1) {
      particleGradient.addColorStop(0, light80);
      particleGradient.addColorStop(0.4, `rgba(${rgbStr}, 0.7)`);
      particleGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    } else {
      particleGradient.addColorStop(0, `rgba(${secondaryRgbStr}, 0.9)`);
      particleGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, 0.4)`);
      particleGradient.addColorStop(1, `rgba(${secondaryRgbStr}, 0)`);
    }

    ctx.beginPath();
    ctx.fillStyle = particleGradient;
    ctx.arc(particleX, particleY, particleSize * 2.5, 0, TWO_PI);
    ctx.fill();

    if (i % 4 === 0) {
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = (isDarkMode ? 0.9 : 0.7) * particlePulse;
      ctx.arc(particleX, particleY, particleSize * 0.5, 0, TWO_PI);
      ctx.fill();
      ctx.globalAlpha = isDarkMode
        ? (isHighlighted ? OPACITY_CONFIG.sun.particles.dark.highlighted : OPACITY_CONFIG.sun.particles.dark.normal)
        : (isHighlighted ? OPACITY_CONFIG.sun.particles.light.highlighted : OPACITY_CONFIG.sun.particles.light.normal);
    }
  }
}

/**
 * Draw ejected particles flying away from the sun
 */
export function drawEjectedParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: SunStateWithColors,
  rgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  ejectParticles: EjectConfig
): void {
  const ejectCount = isHighlighted ? ejectParticles.count.highlighted : ejectParticles.count.normal;
  // Use pre-computed lightened color (avoids hex parsing per frame)
  const light60 = sunState.lightenedColors?.light60 ?? sunState.color;

  for (let i = 0; i < ejectCount; i++) {
    const ejectAngle = (i * TWO_PI / ejectCount) + time * ejectParticles.speed + sunState.rotationAngle;
    const ejectPhase = (time * 0.0002 + i * 1.5) % 1;
    const ejectDist = size * (ejectParticles.distanceRange.min + ejectPhase * (ejectParticles.distanceRange.max - ejectParticles.distanceRange.min));
    const ejectX = x + fastCos(ejectAngle) * ejectDist;
    const ejectY = y + fastSin(ejectAngle) * ejectDist;

    const ejectAlpha = Math.max(0, 1 - ejectPhase) * (isDarkMode ? 0.6 : 0.4);
    const ejectSize = size * 0.06 * (1 - ejectPhase * 0.5);

    if (ejectAlpha > 0.05) {
      const ejectGradient = ctx.createRadialGradient(
        ejectX, ejectY, 0,
        ejectX, ejectY, ejectSize * 3
      );
      ejectGradient.addColorStop(0, light60);
      ejectGradient.addColorStop(0.4, `rgba(${rgbStr}, ${ejectAlpha})`);
      ejectGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = ejectGradient;
      ctx.globalAlpha = ejectAlpha;
      ctx.arc(ejectX, ejectY, ejectSize * 3, 0, TWO_PI);
      ctx.fill();
    }
  }
}

/**
 * Draw animated hover ring when sun is highlighted
 */
export function drawHoverRing(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: SunStateWithColors,
  rgbStr: string,
  layers: LayersConfig,
  hoverRing: HoverRingConfig
): void {
  // Use pre-computed lightened colors (avoids hex parsing per frame)
  const light40 = sunState.lightenedColors?.light40 ?? sunState.color;
  const light50 = sunState.lightenedColors?.light50 ?? sunState.color;

  const dashOffset = time * hoverRing.dashSpeed;
  ctx.setLineDash(hoverRing.dashPattern as unknown as number[]);
  ctx.lineDashOffset = dashOffset;
  ctx.beginPath();
  ctx.strokeStyle = light40;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.6 + 0.25 * fastSin(time * hoverRing.pulseSpeed);
  ctx.arc(x, y, size * layers.hoverRingRadius, 0, TWO_PI);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  const innerRingGradient = ctx.createRadialGradient(x, y, size * 1.9, x, y, size * 2.1);
  innerRingGradient.addColorStop(0, `rgba(${rgbStr}, 0)`);
  innerRingGradient.addColorStop(0.5, light50);
  innerRingGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
  ctx.strokeStyle = innerRingGradient;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.75 + 0.2 * fastSin(time * hoverRing.innerPulseSpeed);
  ctx.arc(x, y, size * layers.innerRingRadius, 0, TWO_PI);
  ctx.stroke();
}

/**
 * Draw the photosphere layer
 */
export function drawPhotosphere(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  sunState: SunStateWithColors,
  rgbStr: string, isDarkMode: boolean,
  layers: LayersConfig
): void {
  // Use pre-computed lightened colors (avoids hex parsing per frame)
  const light85 = sunState.lightenedColors?.light85 ?? sunState.color;
  const light50 = sunState.lightenedColors?.light50 ?? sunState.color;

  const photosphereGradient = ctx.createRadialGradient(x, y, size * 0.25, x, y, size * layers.photosphereRadius);
  photosphereGradient.addColorStop(0, light85);
  photosphereGradient.addColorStop(0.3, light50);
  photosphereGradient.addColorStop(0.5, sunState.color);
  photosphereGradient.addColorStop(0.75, `rgba(${rgbStr}, 0.85)`);
  photosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0.4)`);

  ctx.beginPath();
  ctx.fillStyle = photosphereGradient;
  ctx.globalAlpha = isDarkMode ? 1 : 0.9;
  ctx.arc(x, y, size * layers.photosphereRadius, 0, TWO_PI);
  ctx.fill();
}

/**
 * Draw the main sun body with gradient
 */
export function drawSunBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  sunState: SunStateWithColors,
  rgbStr: string
): void {
  // Use pre-computed lightened colors (avoids hex parsing per frame)
  const light80 = sunState.lightenedColors?.light80 ?? sunState.color;
  const light50 = sunState.lightenedColors?.light50 ?? sunState.color;

  const bodyGradient = ctx.createRadialGradient(
    x - size * 0.25, y - size * 0.25, 0,
    x + size * 0.1, y + size * 0.1, size
  );
  bodyGradient.addColorStop(0, "#ffffff");
  bodyGradient.addColorStop(0.1, light80);
  bodyGradient.addColorStop(0.3, light50);
  bodyGradient.addColorStop(0.55, sunState.color);
  bodyGradient.addColorStop(0.8, `rgba(${rgbStr}, 0.95)`);
  bodyGradient.addColorStop(1, `rgba(${rgbStr}, 0.85)`);

  ctx.beginPath();
  ctx.fillStyle = bodyGradient;
  ctx.globalAlpha = 1;
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fill();
}

/**
 * Draw surface granulation texture
 */
export function drawGranulation(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  rgbStr: string,
  granulation: GranulationConfig
): void {
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < granulation.spotCount; i++) {
    const spotAngle = (time * granulation.rotationSpeed + i * TWO_PI / granulation.spotCount) % (TWO_PI);
    const spotDist = size * (0.25 + 0.45 * fastSin(i * 2.3 + time * granulation.variationSpeed));
    const spotX = x + fastCos(spotAngle) * spotDist;
    const spotY = y + fastSin(spotAngle) * spotDist;
    const spotSize = size * (0.12 + 0.08 * fastSin(i * 1.9));

    const spotGradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotSize);
    const isLightSpot = i % 2 === 0;
    const spotColor = isLightSpot ? "rgba(255, 255, 255, 0.4)" : `rgba(${rgbStr}, 0.6)`;
    spotGradient.addColorStop(0, spotColor);
    spotGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

    ctx.beginPath();
    ctx.fillStyle = spotGradient;
    ctx.arc(spotX, spotY, spotSize, 0, TWO_PI);
    ctx.fill();
  }
}

/**
 * Draw central hotspot highlight
 */
export function drawHotspot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, isHighlighted: boolean,
  layers: LayersConfig
): void {
  const hotspotGradient = ctx.createRadialGradient(
    x - size * 0.12, y - size * 0.12, 0,
    x, y, size * layers.hotspotRadius
  );
  hotspotGradient.addColorStop(0, "#ffffff");
  hotspotGradient.addColorStop(0.2, "rgba(255, 255, 255, 0.95)");
  hotspotGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
  hotspotGradient.addColorStop(0.8, "rgba(255, 255, 255, 0.15)");
  hotspotGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.fillStyle = hotspotGradient;
  ctx.globalAlpha = isHighlighted ? 1 : 0.92;
  ctx.arc(x, y, size * layers.hotspotRadius, 0, TWO_PI);
  ctx.fill();
}

/**
 * Draw specular and rim highlights
 */
export function drawHighlights(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  secondaryRgbStr: string,
  layers: LayersConfig
): void {
  // Specular highlight
  const highlightGradient = ctx.createRadialGradient(
    x - size * layers.highlightRadius, y - size * layers.highlightRadius, 0,
    x - size * 0.25, y - size * 0.25, size * layers.highlightRadius
  );
  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  highlightGradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
  highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.fillStyle = highlightGradient;
  ctx.globalAlpha = 0.8;
  ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, TWO_PI);
  ctx.fill();

  // Rim light
  const rimGradient = ctx.createRadialGradient(
    x + size * 0.4, y + size * 0.4, 0,
    x + size * 0.3, y + size * 0.3, size * layers.rimRadius
  );
  rimGradient.addColorStop(0, `rgba(${secondaryRgbStr}, 0.4)`);
  rimGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, 0.15)`);
  rimGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.fillStyle = rimGradient;
  ctx.globalAlpha = 0.5;
  ctx.arc(x + size * layers.highlightRadius, y + size * layers.highlightRadius, size * 0.2, 0, TWO_PI);
  ctx.fill();
}
