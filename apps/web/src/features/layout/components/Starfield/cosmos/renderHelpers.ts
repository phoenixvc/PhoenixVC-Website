import { TWO_PI } from "../math";

export function drawGalaxySpiral(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    arms = 5,
    color = "#62b3ff"
  ): void {
    ctx.save();
    ctx.translate(cx, cy);

    for (let a = 0; a < arms; a++) {
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 4; t += 0.05) {      // 2 turns
        const r = radius * t / (Math.PI * 4);
        const x = r * Math.cos(t + a * (2 * Math.PI / arms));
        const y = r * Math.sin(t + a * (2 * Math.PI / arms));
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `${color}55`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // bright core
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.5);
    g.addColorStop(0, `${color}ff`);
    g.addColorStop(1, `${color}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, TWO_PI);
    ctx.fill();

    ctx.restore();
  }
