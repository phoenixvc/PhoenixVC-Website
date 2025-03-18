// components/Layout/Starfield/starEffects.ts

import { EmployeeData, EmployeeStar } from "./types";
import { hexToRgb } from "./starUtils";

// Draw star glow and core
export function drawStarGlow(
  ctx: CanvasRenderingContext2D,
  empStar: EmployeeStar,
  starSize: number,
  softRgb: {r: number, g: number, b: number}
): void {
  // Enhanced glow effect - softer glow
  const glowMultiplier = empStar.glowIntensity ||
    (empStar.pathType === "star" ? 2.5 :  // Reduced from 2.8
     empStar.pathType === "planet" ? 1.6 : // Reduced from 1.8
     empStar.pathType === "comet" ? 2.0 : 1.6); // Reduced from 2.2/1.8

  const glowGradient = ctx.createRadialGradient(
    empStar.x, empStar.y, 0,
    empStar.x, empStar.y, starSize * 2.0 * glowMultiplier // Reduced from 2.2
  );

  // Use rgba format for star glow to avoid color parsing issues - softer glow
  glowGradient.addColorStop(0, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`); // Reduced opacity
  glowGradient.addColorStop(0.3, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.4)`); // Reduced opacity
  glowGradient.addColorStop(0.6, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.2)`); // Reduced opacity
  glowGradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0)`);

  ctx.beginPath();
  ctx.arc(empStar.x, empStar.y, starSize * 2.0 * glowMultiplier, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.fill();

  const gradient = ctx.createRadialGradient(
    empStar.x, empStar.y, 0,
    empStar.x, empStar.y, starSize
  );

  // Enhanced core appearance based on path type - with softer colors
  switch (empStar.pathType) {
    case "star":
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)"); // Slightly reduced opacity
      gradient.addColorStop(0.2, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`);
      gradient.addColorStop(0.7, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.5)`); // Reduced from 0.56
      gradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.2)`); // Reduced from 0.25
      break;
    case "planet":
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)"); // Slightly reduced opacity
      gradient.addColorStop(0.3, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`);
      gradient.addColorStop(0.7, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.55)`); // Reduced from 0.63
      gradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.2)`); // Reduced from 0.25
      break;
    case "comet":
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)"); // Slightly reduced opacity
      gradient.addColorStop(0.2, "rgba(255, 255, 238, 0.9)"); // Softer yellow tint for comet core
      gradient.addColorStop(0.4, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.85)`);
      gradient.addColorStop(0.7, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.5)`); // Reduced from 0.56
      gradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.25)`); // Reduced from 0.31
      break;
    default:
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)"); // Slightly reduced opacity
      gradient.addColorStop(0.3, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.85)`);
      gradient.addColorStop(0.8, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.45)`); // Reduced from 0.5
      gradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.15)`); // Reduced from 0.19
  }

  ctx.beginPath();
  ctx.arc(empStar.x, empStar.y, starSize, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

// Draw comet trail
export function drawStarTrail(
  ctx: CanvasRenderingContext2D,
  empStar: EmployeeStar,
  starSize: number,
  softRgb: {r: number, g: number, b: number},
  employeeStarSize: number,
  scaleFactor: number
): void {
  const trailLength = empStar.trailLength || 180;

  // Add wobble to comet path for more natural movement - slower wobble
  const wobbleTime = Date.now() * 0.0003; // Reduced from 0.0005
  const wobbleAmount = 4 * Math.sin(wobbleTime); // Reduced from 5

  ctx.beginPath();

  const dx = -Math.sin(empStar.angle) * (empStar.orbitalDirection === "clockwise" ? 1 : -1);
  const dy = Math.cos(empStar.angle) * (empStar.orbitalDirection === "clockwise" ? 1 : -1);

  const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;
  const normalizedDx = dx / magnitude;
  const normalizedDy = dy / magnitude;

  const trailEndX = empStar.x - normalizedDx * trailLength;
  const trailEndY = empStar.y - normalizedDy * trailLength;

  const perpDx = -normalizedDy;
  const perpDy = normalizedDx;

  // Wider trail for better visibility with wobble effect
  const startWidth = 15 * employeeStarSize * scaleFactor;
  const endWidth = 1 * employeeStarSize * scaleFactor;

  // Create curved trail path with wobble
  ctx.moveTo(empStar.x + perpDx * startWidth/2, empStar.y + perpDy * startWidth/2);

  // Create control points for curved trail
  const cp1x = empStar.x - normalizedDx * trailLength * 0.3 + perpDx * startWidth/3 + wobbleAmount;
  const cp1y = empStar.y - normalizedDy * trailLength * 0.3 + perpDy * startWidth/3 - wobbleAmount/2;

  const cp2x = empStar.x - normalizedDx * trailLength * 0.6 + perpDx * endWidth + wobbleAmount/2;
  const cp2y = empStar.y - normalizedDy * trailLength * 0.6 + perpDy * endWidth - wobbleAmount;

  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, trailEndX + perpDx * endWidth/2, trailEndY + perpDy * endWidth/2);
  ctx.lineTo(trailEndX - perpDx * endWidth/2, trailEndY - perpDy * endWidth/2);

  const cp3x = empStar.x - normalizedDx * trailLength * 0.6 - perpDx * endWidth - wobbleAmount/2;
  const cp3y = empStar.y - normalizedDy * trailLength * 0.6 - perpDy * endWidth + wobbleAmount;

  const cp4x = empStar.x - normalizedDx * trailLength * 0.3 - perpDx * startWidth/3 - wobbleAmount;
  const cp4y = empStar.y - normalizedDy * trailLength * 0.3 - perpDy * startWidth/3 + wobbleAmount/2;

  ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, empStar.x - perpDx * startWidth/2, empStar.y - perpDy * startWidth/2);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(
    empStar.x, empStar.y,
    trailEndX, trailEndY
  );

  // Softer color variations in the comet trail
  const r = softRgb.r;
  const g = softRgb.g;
  const b = softRgb.b;

  // Create softer color variations
  const colorVar1 = `rgba(${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b)}, 0.9)`; // Reduced opacity
  const colorVar2 = `rgba(${r}, ${g}, ${b}, 0.7)`; // Reduced opacity
  const colorVar3 = `rgba(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b + 20)}, 0.4)`; // Reduced opacity
  const colorVar4 = `rgba(${r}, ${g}, ${b}, 0.2)`; // Reduced opacity
  const colorVar5 = `rgba(${r}, ${g}, ${b}, 0)`;

  gradient.addColorStop(0, colorVar1);
  gradient.addColorStop(0.2, colorVar2);
  gradient.addColorStop(0.5, colorVar3);
  gradient.addColorStop(0.8, colorVar4);
  gradient.addColorStop(1, colorVar5);

  ctx.fillStyle = gradient;
  ctx.fill();

  // Enhanced glow effect with softer glow
  ctx.save();
  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`; // Softer shadow
  ctx.shadowBlur = 15; // Slightly reduced from 18

  ctx.beginPath();
  ctx.moveTo(empStar.x, empStar.y);
  ctx.lineTo(trailEndX, trailEndY);
  ctx.lineWidth = 3 * employeeStarSize * scaleFactor;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`; // Reduced opacity
  ctx.stroke();

  ctx.restore();

  // Add small particles that break off from the comet trail - slower and less frequent
  const particleCount = 4; // Reduced from 5
  const particleTime = Date.now() * 0.0007; // Reduced from 0.001

  ctx.save();
  for (let i = 0; i < particleCount; i++) {
    const particlePos = 0.2 + (i / particleCount) * 0.6; // Position along trail (0-1)
    const particleX = empStar.x - normalizedDx * trailLength * particlePos;
    const particleY = empStar.y - normalizedDy * trailLength * particlePos;

    // Add some randomness to particle position - with slower movement
    const particleOffsetX = (Math.sin(particleTime * (i + 2) * 0.5) * trailLength * 0.04); // Reduced frequency and amount
    const particleOffsetY = (Math.cos(particleTime * (i + 1) * 0.4) * trailLength * 0.04); // Reduced frequency and amount

    const particleSize = (0.5 + Math.sin(particleTime * (i + 1) * 1) * 0.2) * starSize * 0.2; // Reduced frequency
    const particleOpacity = 0.25 + Math.sin(particleTime * (i + 3) * 0.8) * 0.15; // Reduced opacity and frequency

    ctx.beginPath();
    ctx.arc(
      particleX + particleOffsetX,
      particleY + particleOffsetY,
      particleSize,
      0, Math.PI * 2
    );
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particleOpacity})`;
    ctx.fill();

    // Add glow to particles - softer glow
    ctx.beginPath();
    ctx.arc(
      particleX + particleOffsetX,
      particleY + particleOffsetY,
      particleSize * 2,
      0, Math.PI * 2
    );
    const particleGradient = ctx.createRadialGradient(
      particleX + particleOffsetX,
      particleY + particleOffsetY,
      0,
      particleX + particleOffsetX,
      particleY + particleOffsetY,
      particleSize * 2
    );
    particleGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particleOpacity * 0.8})`); // Reduced opacity
    particleGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = particleGradient;
    ctx.fill();
  }
  ctx.restore();
}

// Draw satellites
export function drawSatellites(
    ctx: CanvasRenderingContext2D,
    empStar: EmployeeStar,
    scaleFactor: number,
    softRgb: {r: number, g: number, b: number},
    deltaTime: number
  ): void {
    const fixedDelta = empStar.useSimpleRendering ? 0.2 : 0.5;

    // Draw orbit paths for satellites (optional visual enhancement) - more subtle
    if (empStar.satellites && empStar.satellites.length > 0 && !empStar.useSimpleRendering) {
      empStar.satellites.forEach(satellite => {
        const a = satellite.distance * scaleFactor;
        const b = satellite.distance * (1 - satellite.eccentricity) * scaleFactor;

        ctx.beginPath();
        ctx.ellipse(
          empStar.x,
          empStar.y,
          a,
          b,
          0,
          0,
          Math.PI * 2
        );
        // Use rgba format for orbit path to avoid color parsing issues - more subtle
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"; // Reduced from 0.2
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    }

    // Update and draw satellites with smoother patterns
    if (empStar.satellites && empStar.satellites.length > 0) {
      empStar.satellites.forEach((satellite, index) => {
        // Independent pulsation for satellites - smoother and slower
        const satelliteTime = Date.now() * 0.0005; // Reduced from 0.001
        const satellitePulse = 0.9 + Math.sin(satelliteTime * (index + 1) * 0.3) * 0.1; // Reduced amplitude

        // Update satellite position - key fix here
        const directionMult = index % 2 === 0 ? 1 : -1; // Alternate directions
        satellite.angle += satellite.speed * fixedDelta * directionMult;

        const eccentricity = satellite.eccentricity || 0.1;
        const a = satellite.distance * scaleFactor;
        const b = satellite.distance * (1 - eccentricity) * scaleFactor;

        // Calculate satellite position relative to the employee star
        const satX = empStar.x + a * Math.cos(satellite.angle);
        const satY = empStar.y + b * Math.sin(satellite.angle);

        // Draw satellite glow with independent pulsation - softer glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(satX, satY, satellite.size * 1.8 * scaleFactor * satellitePulse, 0, Math.PI * 2); // Reduced from 2.0
        const glowGradient = ctx.createRadialGradient(
          satX, satY, 0,
          satX, satY, satellite.size * 1.8 * scaleFactor * satellitePulse // Reduced from 2.0
        );

        // Use rgba format for satellite glow to avoid color parsing issues - softer colors
        const satRgb = hexToRgb(satellite.color) || { r: 255, g: 255, b: 255 };
        const softSatRgb = {
          r: Math.round(satRgb.r * 0.85 + 38),
          g: Math.round(satRgb.g * 0.85 + 38),
          b: Math.round(satRgb.b * 0.85 + 38)
        };

        glowGradient.addColorStop(0, `rgba(${softSatRgb.r}, ${softSatRgb.g}, ${softSatRgb.b}, 0.9)`); // Reduced opacity
        glowGradient.addColorStop(0.5, `rgba(${softSatRgb.r}, ${softSatRgb.g}, ${softSatRgb.b}, 0.4)`); // Reduced opacity
        glowGradient.addColorStop(1, `rgba(${softSatRgb.r}, ${softSatRgb.g}, ${softSatRgb.b}, 0)`);

        ctx.fillStyle = glowGradient;
        ctx.fill();
        ctx.restore();

        // Draw satellite core
        ctx.beginPath();
        ctx.arc(satX, satY, satellite.size * scaleFactor * satellitePulse, 0, Math.PI * 2);

        // Use softer satellite color
        const softSatColor = `rgba(${softSatRgb.r}, ${softSatRgb.g}, ${softSatRgb.b}, 0.9)`;
        ctx.fillStyle = softSatColor;
        ctx.fill();

        ctx.save();
        ctx.shadowColor = softSatColor;
        ctx.shadowBlur = 3; // Reduced from 4
        ctx.beginPath();
        ctx.arc(satX, satY, satellite.size * 0.6 * scaleFactor * satellitePulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; // Slightly reduced opacity
        ctx.fill();
        ctx.restore();

        // Add occasional particle effects from satellites - less frequent
        if (Math.random() < 0.01) { // Reduced from 0.02 to 0.01 (1% chance each frame)
          const particleCount = 2 + Math.floor(Math.random() * 2); // Reduced from 3+3

          ctx.save();
          for (let i = 0; i < particleCount; i++) {
            const particleAngle = Math.random() * Math.PI * 2;
            const particleDistance = satellite.size * (2 + Math.random() * 2); // Reduced range
            const particleX = satX + Math.cos(particleAngle) * particleDistance;
            const particleY = satY + Math.sin(particleAngle) * particleDistance;
            const particleSize = satellite.size * 0.25 * Math.random(); // Reduced from 0.3

            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${softSatRgb.r}, ${softSatRgb.g}, ${softSatRgb.b}, ${0.2 + Math.random() * 0.3})`; // Reduced opacity
            ctx.fill();
          }
          ctx.restore();
        }
      });
    }
  }

  // Draw hover/select effects
  export function drawHoverEffects(
    ctx: CanvasRenderingContext2D,
    empStar: EmployeeStar,
    starSize: number,
    softRgb: {r: number, g: number, b: number}
  ): void {
    if (empStar.isHovered || empStar.isSelected) {
      // Add a pulsing ring around the star when hovered or selected
      ctx.save();
      const pulseTime = Date.now() * 0.0005; // Reduced from 0.001 to 0.0005 for slower pulse
      const pulseOpacity = 0.4 + Math.sin(pulseTime * 1.5) * 0.2; // Reduced frequency and amplitude
      const pulseSize = starSize * (1.3 + Math.sin(pulseTime * 1) * 0.2); // Reduced frequency and amplitude

      ctx.beginPath();
      ctx.arc(empStar.x, empStar.y, pulseSize, 0, Math.PI * 2);
      ctx.lineWidth = 1.5 + Math.sin(pulseTime * 2) * 0.5; // Reduced frequency and amplitude
      ctx.strokeStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, ${pulseOpacity})`;
      ctx.stroke();
      ctx.restore();

      // Add "click for details" indicator when hovered
      if (empStar.isHovered && !empStar.isSelected) {
        ctx.save();
        const clickIndicatorSize = starSize * 0.4;
        const clickIndicatorX = empStar.x + starSize * 1.2;
        const clickIndicatorY = empStar.y - starSize * 1.2;

        // Draw pulsing circle with smoother animation
        const clickPulse = 0.85 + Math.sin(pulseTime * 2.5) * 0.15; // Reduced amplitude
        ctx.beginPath();
        ctx.arc(clickIndicatorX, clickIndicatorY, clickIndicatorSize * clickPulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(pulseTime * 2) * 0.2})`;
        ctx.fill();

        // Draw click icon
        ctx.beginPath();
        ctx.moveTo(clickIndicatorX - clickIndicatorSize * 0.3, clickIndicatorY);
        ctx.lineTo(clickIndicatorX, clickIndicatorY + clickIndicatorSize * 0.3);
        ctx.lineTo(clickIndicatorX + clickIndicatorSize * 0.3, clickIndicatorY - clickIndicatorSize * 0.3);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.stroke();
        ctx.restore();
      }

      // Add floating skill icons around the star when hovered
      if (empStar.isHovered || empStar.isSelected) {
        const skills = getSkillsForEmployee(empStar.employee);
        const skillCount = skills.length;

        if (skillCount > 0) {
          ctx.save();
          const iconSize = starSize * 0.5;
          const orbitRadius = starSize * 2.2;

          skills.forEach((skill, i) => {
            const angle = (i / skillCount) * Math.PI * 2 + Date.now() * 0.0005; // Slower rotation
            const iconX = empStar.x + Math.cos(angle) * orbitRadius;
            const iconY = empStar.y + Math.sin(angle) * orbitRadius;

            // Draw skill icon background
            ctx.beginPath();
            ctx.arc(iconX, iconY, iconSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.3)`;
            ctx.fill();

            // Draw skill icon border
            ctx.beginPath();
            ctx.arc(iconX, iconY, iconSize, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.8)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw skill text or icon
            ctx.font = `bold ${Math.floor(iconSize * 1.2)}px Arial`;
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(skill.charAt(0), iconX, iconY);
          });
          ctx.restore();
        }
      }
    }
  }

  // Draw star flares
  export function drawStarFlares(
    ctx: CanvasRenderingContext2D,
    empStar: EmployeeStar,
    starSize: number,
    softRgb: {r: number, g: number, b: number}
  ): void {
    // Create occasional "star flares" that randomly appear on stars - less frequent
    if (empStar.pathType === "star" && Math.random() < 0.002) { // Reduced from 0.005 to 0.002 (0.2% chance)
      ctx.save();
      const flareCount = 2 + Math.floor(Math.random() * 2); // Reduced from 3+3
      const flareLength = starSize * (1.8 + Math.random() * 2.2); // Reduced slightly

      for (let i = 0; i < flareCount; i++) {
        const flareAngle = (i / flareCount) * Math.PI * 2 + Math.random() * 0.5;

        ctx.beginPath();
        ctx.moveTo(empStar.x, empStar.y);
        ctx.lineTo(
          empStar.x + Math.cos(flareAngle) * flareLength,
          empStar.y + Math.sin(flareAngle) * flareLength
        );

        const flareGradient = ctx.createLinearGradient(
          empStar.x, empStar.y,
          empStar.x + Math.cos(flareAngle) * flareLength,
          empStar.y + Math.sin(flareAngle) * flareLength
        );

        flareGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)"); // Reduced opacity
        flareGradient.addColorStop(0.3, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.5)`); // Reduced opacity
        flareGradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0)`);

        ctx.strokeStyle = flareGradient;
        ctx.lineWidth = 1.5 + Math.random() * 1.5; // Reduced from 2+2
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Draw nebula effects
  export function drawNebulaEffects(
    ctx: CanvasRenderingContext2D,
    empStar: EmployeeStar,
    starSize: number,
    softRgb: {r: number, g: number, b: number}
  ): void {
    // Add subtle background nebula effects behind important stars - more subtle
    // Use nullish coalescing to provide a default value of 0 for mass if it's undefined
    if (((empStar.employee.mass ?? 0) > 200 || empStar.isSelected) && !empStar.useSimpleRendering) {
      ctx.save();
      const nebulaSize = starSize * 7; // Reduced from 8
      const nebulaOpacity = 0.12; // Reduced from 0.15

      const nebulaGradient = ctx.createRadialGradient(
        empStar.x, empStar.y, 0,
        empStar.x, empStar.y, nebulaSize
      );

      nebulaGradient.addColorStop(0, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, ${nebulaOpacity})`);
      nebulaGradient.addColorStop(0.5, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, ${nebulaOpacity/2})`);
      nebulaGradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0)`);

      ctx.beginPath();
      ctx.arc(empStar.x, empStar.y, nebulaSize, 0, Math.PI * 2);
      ctx.fillStyle = nebulaGradient;
      ctx.globalCompositeOperation = "screen";
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }
  }

  // Draw connections between related stars
  export function drawConnections(
    ctx: CanvasRenderingContext2D,
    empStar: EmployeeStar,
    allStars: EmployeeStar[],
    softRgb: {r: number, g: number, b: number}
  ): void {
    const relatedStars = findRelatedEmployeeStars(empStar, allStars);

    if (relatedStars.length > 0) {
      ctx.save();

      relatedStars.forEach(relatedStar => {
        // Draw connection line with animated dash pattern - slower animation
        const dashOffset = Date.now() * 0.005; // Reduced from 0.01

        ctx.beginPath();
        ctx.moveTo(empStar.x, empStar.y);
        ctx.lineTo(relatedStar.x, relatedStar.y);

        // Create gradient for connection line - softer
        const connectionGradient = ctx.createLinearGradient(
          empStar.x, empStar.y,
          relatedStar.x, relatedStar.y
        );

        connectionGradient.addColorStop(0, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.6)`); // Reduced from 0.7
        connectionGradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.25)`); // Reduced from 0.3

        ctx.strokeStyle = connectionGradient;
        ctx.lineWidth = 1.2; // Reduced from 1.5
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = dashOffset;
        ctx.stroke();

        // Draw small indicator at midpoint - more subtle
        const midX = (empStar.x + relatedStar.x) / 2;
        const midY = (empStar.y + relatedStar.y) / 2;

        ctx.beginPath();
        ctx.arc(midX, midY, 2.5, 0, Math.PI * 2); // Reduced from 3
        ctx.fillStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.7)`; // Reduced from 0.8
        ctx.fill();
      });

      ctx.restore();
    }
  }

  // Helper function to find related stars
  export function findRelatedEmployeeStars(empStar: EmployeeStar, allStars: EmployeeStar[]): EmployeeStar[] {
    if (!empStar || !empStar.employee || !empStar.employee.relatedIds || !allStars) {
      return [];
    }

    return allStars.filter(star =>
      star !== empStar &&
      empStar.employee.relatedIds &&
      empStar.employee.relatedIds.includes(star.employee.id)
    );
  }

  // Helper function to get employee skills
  export function getSkillsForEmployee(employee: EmployeeData): string[] {
    if (!employee || !employee.skills) {
      return [];
    }

    return Array.isArray(employee.skills) ? employee.skills : [employee.skills];
  }
