// focusAreaIcons.ts - Vector icons for focus area suns
// Single Responsibility: Draw icons representing different focus areas (blockchain, AI, security, mobility)

import { TWO_PI, fastSin, fastCos } from "../../math";
import { SUN_ICON_CONFIG } from "../../renderingConfig";

/**
 * Draw a vector icon representing the focus area in the center of a sun
 */
export function drawSunIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  iconSize: number,
  sunId: string,
): void {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = Math.max(
    SUN_ICON_CONFIG.minLineWidth,
    iconSize * SUN_ICON_CONFIG.lineWidthMultiplier,
  );
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (sunId) {
    case "fintech-blockchain-sun":
      drawBlockchainIcon(ctx, x, y, iconSize);
      break;
    case "ai-ml-sun":
      drawAIIcon(ctx, x, y, iconSize);
      break;
    case "defense-security-sun":
      drawShieldIcon(ctx, x, y, iconSize);
      break;
    case "mobility-transportation-sun":
      drawMobilityIcon(ctx, x, y, iconSize);
      break;
    default:
      drawDefaultStarIcon(ctx, x, y, iconSize);
  }

  ctx.restore();
}

/**
 * Draw a blockchain/fintech icon (hexagon with nodes)
 */
function drawBlockchainIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const r = size * SUN_ICON_CONFIG.blockchain.hexagonRadius;

  // Draw hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    const px = x + r * fastCos(angle);
    const py = y + r * fastSin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // Draw nodes at vertices
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    const px = x + r * fastCos(angle);
    const py = y + r * fastSin(angle);
    ctx.beginPath();
    ctx.arc(px, py, size * SUN_ICON_CONFIG.blockchain.nodeRadius, 0, TWO_PI);
    ctx.fill();
  }

  // Draw center node
  ctx.beginPath();
  ctx.arc(x, y, size * SUN_ICON_CONFIG.blockchain.centerNodeRadius, 0, TWO_PI);
  ctx.fill();

  // Draw connecting lines from center to alternate vertices (0, 2, 4)
  for (let i = 0; i < 6; i += 2) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    const px = x + r * fastCos(angle);
    const py = y + r * fastSin(angle);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(px, py);
    ctx.stroke();
  }
}

/**
 * Draw an AI/ML icon (neural network pattern)
 */
function drawAIIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const r = size * SUN_ICON_CONFIG.ai.networkRadius;

  // Central node
  ctx.beginPath();
  ctx.arc(x, y, size * SUN_ICON_CONFIG.ai.centerNodeRadius, 0, TWO_PI);
  ctx.fill();

  // Outer nodes in a circle
  const nodeCount = SUN_ICON_CONFIG.ai.nodeCount;
  const outerNodes: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i * TWO_PI) / nodeCount - Math.PI / 2;
    const px = x + r * fastCos(angle);
    const py = y + r * fastSin(angle);
    outerNodes.push({ x: px, y: py });

    // Draw node
    ctx.beginPath();
    ctx.arc(px, py, size * SUN_ICON_CONFIG.ai.outerNodeRadius, 0, TWO_PI);
    ctx.fill();

    // Connect to center
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(px, py);
    ctx.stroke();
  }

  // Connect outer nodes to adjacent nodes (neural network connections)
  for (let i = 0; i < nodeCount; i++) {
    const next = (i + 1) % nodeCount;
    ctx.beginPath();
    ctx.moveTo(outerNodes[i].x, outerNodes[i].y);
    ctx.lineTo(outerNodes[next].x, outerNodes[next].y);
    ctx.stroke();
  }
}

/**
 * Draw a shield icon (defense/security)
 */
function drawShieldIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const w = size * SUN_ICON_CONFIG.shield.width;
  const h = size * SUN_ICON_CONFIG.shield.height;

  // Draw shield shape
  ctx.beginPath();
  ctx.moveTo(x, y - h * 0.5); // Top center
  ctx.lineTo(x + w * 0.5, y - h * 0.3); // Top right
  ctx.lineTo(x + w * 0.5, y + h * 0.1); // Right side
  ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.4, x, y + h * 0.5); // Bottom right curve
  ctx.quadraticCurveTo(x - w * 0.3, y + h * 0.4, x - w * 0.5, y + h * 0.1); // Bottom left curve
  ctx.lineTo(x - w * 0.5, y - h * 0.3); // Left side
  ctx.closePath();
  ctx.stroke();

  // Draw checkmark inside
  ctx.beginPath();
  ctx.moveTo(x - w * 0.2, y);
  ctx.lineTo(x - w * 0.05, y + h * 0.15);
  ctx.lineTo(x + w * 0.25, y - h * 0.15);
  ctx.stroke();
}

/**
 * Draw a mobility/transportation icon (wheel with spokes)
 */
function drawMobilityIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const r = size * SUN_ICON_CONFIG.mobility.outerRadius;
  const innerR = size * SUN_ICON_CONFIG.mobility.innerRadius;

  // Outer wheel
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.stroke();

  // Inner hub
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, TWO_PI);
  ctx.stroke();

  // Center point
  ctx.beginPath();
  ctx.arc(x, y, size * SUN_ICON_CONFIG.mobility.centerRadius, 0, TWO_PI);
  ctx.fill();

  // Spokes
  const spokeCount = SUN_ICON_CONFIG.mobility.spokeCount;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * TWO_PI) / spokeCount;
    ctx.beginPath();
    ctx.moveTo(x + innerR * fastCos(angle), y + innerR * fastSin(angle));
    ctx.lineTo(x + r * fastCos(angle), y + r * fastSin(angle));
    ctx.stroke();
  }

  // Motion lines (speed indicator)
  const originalLineWidth = ctx.lineWidth;
  ctx.lineWidth = originalLineWidth * 0.6;
  for (let i = 0; i < SUN_ICON_CONFIG.mobility.motionLineCount; i++) {
    const lineY = y - size * 0.1 + i * size * 0.15;
    const lineX = x + r + size * 0.15;
    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX + size * 0.3 - i * size * 0.08, lineY);
    ctx.stroke();
  }
  ctx.lineWidth = originalLineWidth;
}

/**
 * Draw a default star icon
 */
function drawDefaultStarIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const outerR = size * SUN_ICON_CONFIG.defaultStar.outerRadius;
  const innerR = size * SUN_ICON_CONFIG.defaultStar.innerRadius;
  const points = SUN_ICON_CONFIG.defaultStar.pointCount;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = x + r * fastCos(angle);
    const py = y + r * fastSin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}
