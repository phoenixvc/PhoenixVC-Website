// employeeStars.ts
import { EmployeeData, EmployeeStar, HoverInfo } from "./types";
import { calculateCenter } from "./utils";

// Initialize employee stars
export const initEmployeeStars = (
  width: number,
  height: number,
  enableEmployeeStars: boolean,
  employees: EmployeeData[],
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number,
  employeeStarSize: number
): EmployeeStar[] => {
  if (!enableEmployeeStars) return [];

  const employeeStars: EmployeeStar[] = [];
  const { centerX, centerY } = calculateCenter(
    width, height, sidebarWidth, centerOffsetX, centerOffsetY
  );

  // Place employees in a circular pattern around the center
  employees.forEach((employee, index) => {
    const totalEmployees = employees.length;
    const angleStep = (Math.PI * 2) / totalEmployees;
    const baseAngle = index * angleStep;

    // Calculate orbit parameters - smaller orbit radius to keep them more visible
    const orbitRadius = 100 + (index * 30); // Different orbit radii, but closer to center
    const orbitSpeed = 0.00005 + (0.00002 * (index % 3)); // Different speeds

    // Calculate initial position
    const x = centerX + Math.cos(baseAngle) * orbitRadius;
    const y = centerY + Math.sin(baseAngle) * orbitRadius;

    // Create satellites (small particles orbiting the employee star)
    const satellites = [];
    const satelliteCount = 5 + Math.floor(employee.mass / 30); // More satellites for higher mass

    for (let i = 0; i < satelliteCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 10;
      const speed = 0.001 + Math.random() * 0.002;
      const size = (0.5 + Math.random() * 1) * employeeStarSize;

      // Use employee color with transparency for satellites
      const color = employee.color ?
        `${employee.color}${Math.floor(Math.random() * 50 + 50).toString(16)}` : // Random transparency
        "rgba(255, 255, 255, 0.7)";

      satellites.push({
        angle,
        distance,
        speed,
        size,
        color
      });
    }

    employeeStars.push({
      employee,
      x,
      y,
      angle: baseAngle,
      orbitRadius,
      orbitSpeed,
      orbitCenterX: centerX,
      orbitCenterY: centerY,
      satellites
    });
  });

  return employeeStars;
};

// Check if mouse is hovering over an employee star
export const checkEmployeeHover = (
  mouseX: number,
  mouseY: number,
  employeeStars: EmployeeStar[],
  employeeStarSize: number,
  currentHoverInfo: HoverInfo,
  setHoverInfo: (info: HoverInfo) => void
): boolean => {
  if (!employeeStars.length) return false;

  for (const empStar of employeeStars) {
    const dist = Math.sqrt(
      Math.pow(mouseX - empStar.x, 2) +
      Math.pow(mouseY - empStar.y, 2)
    );

    // Increased hover radius for better detection
    const hoverRadius = 15 * employeeStarSize;
    if (dist < hoverRadius) {
      setHoverInfo({
        employee: empStar.employee,
        x: empStar.x,
        y: empStar.y,
        show: true
      });
      return true;
    }
  }

  // If we get here, we"re not hovering over any employee
  if (currentHoverInfo.show) {
    setHoverInfo({ ...currentHoverInfo, show: false });
  }
  return false;
};

// Draw an employee star with its satellites
export const drawEmployeeStar = (
  ctx: CanvasRenderingContext2D,
  empStar: EmployeeStar,
  deltaTime: number,
  employeeStarSize: number,
  employeeDisplayStyle: "initials" | "avatar" | "both"
): void => {
  // Update position based on orbit
  empStar.angle += empStar.orbitSpeed * deltaTime;
  empStar.x = empStar.orbitCenterX + Math.cos(empStar.angle) * empStar.orbitRadius;
  empStar.y = empStar.orbitCenterY + Math.sin(empStar.angle) * empStar.orbitRadius;

  // Update and draw satellites
  empStar.satellites.forEach(satellite => {
    satellite.angle += satellite.speed * deltaTime;
    const satX = empStar.x + Math.cos(satellite.angle) * satellite.distance;
    const satY = empStar.y + Math.sin(satellite.angle) * satellite.distance;

    ctx.beginPath();
    ctx.arc(satX, satY, satellite.size, 0, Math.PI * 2);
    ctx.fillStyle = satellite.color;
    ctx.fill();
  });

  const starSize = 12 * employeeStarSize;
  const baseColor = empStar.employee.color || "#ffffff";

  // Draw employee star with glow effect
  const glowGradient = ctx.createRadialGradient(
    empStar.x, empStar.y, 0,
    empStar.x, empStar.y, starSize * 1.5
  );

  glowGradient.addColorStop(0, baseColor);
  glowGradient.addColorStop(0.5, `${baseColor}40`); // 25% opacity
  glowGradient.addColorStop(1, `${baseColor}00`); // 0% opacity

  ctx.beginPath();
  ctx.arc(empStar.x, empStar.y, starSize * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.fill();

  // Inner star
  const gradient = ctx.createRadialGradient(
    empStar.x, empStar.y, 0,
    empStar.x, empStar.y, starSize
  );

  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(0.7, `${baseColor}80`); // 50% opacity
  gradient.addColorStop(1, `${baseColor}20`); // 12% opacity

  ctx.beginPath();
  ctx.arc(empStar.x, empStar.y, starSize, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw employee representation based on display style
  if (employeeDisplayStyle === "avatar" && empStar.employee.image) {
    // Create a circular clip path for the avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(empStar.x, empStar.y, starSize * 0.8, 0, Math.PI * 2);
    ctx.clip();

    // Create image element and draw when loaded
    const img = new Image();
    img.src = empStar.employee.image;

    // Only draw if the image is already loaded
    if (img.complete) {
      const imgSize = starSize * 1.6;
      ctx.drawImage(img, empStar.x - imgSize/2, empStar.y - imgSize/2, imgSize, imgSize);
    } else {
      // If image not loaded, draw initials as fallback
      ctx.font = `bold ${Math.floor(10 * employeeStarSize)}px Arial`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(empStar.employee.name, empStar.x, empStar.y);
    }

    ctx.restore();
  } else if (employeeDisplayStyle === "both" && empStar.employee.image) {
    // Draw smaller avatar with name below
    ctx.save();
    ctx.beginPath();
    ctx.arc(empStar.x, empStar.y - starSize * 0.3, starSize * 0.6, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.src = empStar.employee.image;

    if (img.complete) {
      const imgSize = starSize * 1.2;
      ctx.drawImage(img, empStar.x - imgSize/2, empStar.y - starSize * 0.3 - imgSize/2, imgSize, imgSize);
    }

    ctx.restore();

    // Draw name below
    ctx.font = `bold ${Math.floor(8 * employeeStarSize)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(empStar.employee.name, empStar.x, empStar.y + starSize * 0.5);
  } else {
    // Default: just draw initials
    ctx.font = `bold ${Math.floor(10 * employeeStarSize)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(empStar.employee.name, empStar.x, empStar.y);
  }
};

// Create tooltip configuration instead of directly returning JSX
export const getEmployeeTooltipConfig = (
  employee: EmployeeData,
  x: number,
  y: number
): {
  employee: EmployeeData;
  position: { x: number; y: number };
} => {
  return {
    employee,
    position: { x: x + 20, y: y + 20 }
  };
};

// Update employee stars animation
export const updateEmployeeStars = (
  ctx: CanvasRenderingContext2D,
  employeeStars: EmployeeStar[],
  deltaTime: number,
  employeeStarSize: number,
  employeeDisplayStyle: "initials" | "avatar" | "both"
): void => {
  employeeStars.forEach(empStar => {
    drawEmployeeStar(ctx, empStar, deltaTime, employeeStarSize, employeeDisplayStyle);
  });
};
