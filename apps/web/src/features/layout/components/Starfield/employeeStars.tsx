// components/Layout/Starfield/employeeStars.ts
import { EmployeeData, EmployeeStar, HoverInfo, Satellite } from "./types";
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

    // Initialize velocity components
    const vx = 0; // Initial x velocity
    const vy = 0; // Initial y velocity

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

    // Determine path type based on index or other criteria
    // For this example, we'll use a pattern: comet, planet, star, asteroid, satellite, binary, repeat...
    const pathTypes: Array<"comet" | "satellite" | "planet" | "asteroid" | "star" | "binary"> =
      ["comet", "planet", "star", "asteroid", "satellite", "binary"];
    const pathType = pathTypes[index % pathTypes.length];

    // Determine orbital direction (alternate between clockwise and counterclockwise)
    const orbitalDirection = index % 2 === 0 ? "clockwise" : "counterclockwise";

    // Set eccentricity based on path type
    let pathEccentricity = 0;
    switch (pathType) {
      case "comet": pathEccentricity = 0.7 + Math.random() * 0.25; break; // High eccentricity
      case "planet": pathEccentricity = 0.05 + Math.random() * 0.15; break; // Low eccentricity
      case "star": pathEccentricity = 0.01 + Math.random() * 0.05; break; // Very low eccentricity
      case "asteroid": pathEccentricity = 0.2 + Math.random() * 0.4; break; // Medium eccentricity
      case "satellite": pathEccentricity = 0.1 + Math.random() * 0.2; break; // Low-medium eccentricity
      case "binary": pathEccentricity = 0.3 + Math.random() * 0.2; break; // Medium eccentricity
    }

    // Set path tilt (variation in orbital plane)
    const pathTilt = Math.random() * 30; // 0-30 degrees tilt

    // Additional properties based on path type
    let trailLength, glowIntensity, pulsation;

    if (pathType === "comet") {
      trailLength = 50 + Math.random() * 100; // Longer trail for comets
    }

    if (pathType === "star") {
      glowIntensity = 0.7 + Math.random() * 0.3; // Stronger glow for stars
    }

    // Some objects pulsate
    if (Math.random() > 0.7) {
      pulsation = {
        enabled: true,
        speed: 0.0005 + Math.random() * 0.001,
        minScale: 0.8 + Math.random() * 0.1,
        maxScale: 1.1 + Math.random() * 0.2
      };
    } else {
      pulsation = {
        enabled: false,
        speed: 0,
        minScale: 1,
        maxScale: 1
      };
    }

// Create the employee star
const employeeStar: EmployeeStar = {
  employee,
  x,
  y,
  vx,
  vy,
  angle: baseAngle,
  rotationSpeed: 0.001 + (Math.random() * 0.001),
  orbitRadius,
  orbitSpeed,
  orbitCenter: {
    x: centerX,
    y: centerY
  },
  satellites,
  orbitalDirection,
  pathType,
  pathEccentricity,
  pathTilt,
  trailLength,
  glowIntensity,
  pulsation
};

employeeStars.push(employeeStar);
});

// Link binary stars and create comet for first employee
if (employeeStars.length >= 3) {
  // Make first employee a comet with wide and irregular orbit
  employeeStars[0].pathType = "comet";
  employeeStars[0].trailLength = 200;
  employeeStars[0].pathEccentricity = 0.85; // Very elliptical orbit
  employeeStars[0].orbitRadius = Math.max(width, height) * 0.4; // Much wider orbit
  employeeStars[0].orbitSpeed = 0.00002; // Slower speed for the wider orbit
  employeeStars[0].pathTilt = 25; // Add significant tilt for irregularity

  // Add some randomness to the orbit center to make it more irregular
  employeeStars[0].orbitCenter = {
    x: centerX + (width * 0.1 * (Math.random() - 0.5)), // Offset center by up to 10% of width
    y: centerY + (height * 0.1 * (Math.random() - 0.5)) // Offset center by up to 10% of height
  };

  // Give it a variable velocity for more irregular movement
  employeeStars[0].vx = 0.02 * (Math.random() - 0.5);
  employeeStars[0].vy = 0.02 * (Math.random() - 0.5);

  // Link employees 1 and 2 as binary system
  employeeStars[1].pathType = "binary";
  employeeStars[2].pathType = "binary";

  // Make the binary stars share a common orbit center
  const binaryCenterX = (employeeStars[1].orbitCenter.x + employeeStars[2].orbitCenter.x) / 2;
  const binaryCenterY = (employeeStars[1].orbitCenter.y + employeeStars[2].orbitCenter.y) / 2;

  employeeStars[1].orbitCenter = { x: binaryCenterX, y: binaryCenterY };
  employeeStars[2].orbitCenter = { x: binaryCenterX, y: binaryCenterY };

  // Offset their angles to create binary orbit effect
  employeeStars[2].angle = employeeStars[1].angle + Math.PI; // Opposite sides of orbit
}

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

  // If we get here, we're not hovering over any employee
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
  // Store previous position for trail drawing
  const prevX = empStar.x;
  const prevY = empStar.y;

  // Calculate orbital movement based on direction and eccentricity
  const directionMultiplier = empStar.orbitalDirection === "clockwise" ? 1 : -1;
  const speedMultiplier = directionMultiplier * empStar.orbitSpeed * deltaTime;

  // Update angle
  empStar.angle += speedMultiplier;

  // Calculate new position based on path type and eccentricity
  if (empStar.pathType === "binary") {
    // Binary stars orbit around a common center point
    // For simplicity, we'll just use a modified elliptical orbit
    const a = empStar.orbitRadius;
    const b = empStar.orbitRadius * (1 - empStar.pathEccentricity);
    const angle = empStar.angle + (Math.PI / 4); // Offset the angle for visual interest

    empStar.x = empStar.orbitCenter.x + a * Math.cos(angle);
    empStar.y = empStar.orbitCenter.y + b * Math.sin(angle);
  } else {
    // For other path types, use elliptical orbit with eccentricity
    const a = empStar.orbitRadius;
    const b = empStar.orbitRadius * (1 - empStar.pathEccentricity);

    // Apply path tilt (simulated 3D effect)
    const tiltRadians = empStar.pathTilt * (Math.PI / 180);
    const baseX = a * Math.cos(empStar.angle);
    const baseY = b * Math.sin(empStar.angle);

    // Apply tilt transformation
    empStar.x = empStar.orbitCenter.x + baseX;
    empStar.y = empStar.orbitCenter.y + baseY * Math.cos(tiltRadians);
  }

  // Apply pulsation if enabled
  let scaleFactor = 1;
  if (empStar.pulsation && empStar.pulsation.enabled) {
    const pulseFactor = Math.sin(Date.now() * empStar.pulsation.speed);
    const pulseRange = empStar.pulsation.maxScale - empStar.pulsation.minScale;
    scaleFactor = empStar.pulsation.minScale + (pulseRange * (pulseFactor + 1) / 2);
  }

  // Draw trail for comets
  if (empStar.pathType === "comet" && empStar.trailLength) {
    const trailLength = empStar.trailLength;
    const gradient = ctx.createLinearGradient(
      empStar.x, empStar.y,
      prevX + (prevX - empStar.x) * (trailLength / 100),
      prevY + (prevY - empStar.y) * (trailLength / 100)
    );

    const baseColor = empStar.employee.color || "#ffffff";
    gradient.addColorStop(0, `${baseColor}FF`); // Full opacity at comet head
    gradient.addColorStop(0.2, `${baseColor}AA`); // 67% opacity
    gradient.addColorStop(0.6, `${baseColor}55`); // 33% opacity
    gradient.addColorStop(1, `${baseColor}00`); // Transparent at tail end

    ctx.beginPath();
    ctx.moveTo(empStar.x, empStar.y);

    // Calculate trail points
    const trailPoints = 20;
    const angleRadians = Math.atan2(prevY - empStar.y, prevX - empStar.x);
    const trailX = empStar.x + Math.cos(angleRadians) * trailLength;
    const trailY = empStar.y + Math.sin(angleRadians) * trailLength;

    // Draw trail as a tapered shape
    ctx.lineTo(trailX, trailY - 5);
    ctx.lineTo(trailX, trailY + 5);
    ctx.closePath();

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Update and draw satellites
  empStar.satellites.forEach(satellite => {
    satellite.angle += satellite.speed * deltaTime;
    const satX = empStar.x + Math.cos(satellite.angle) * satellite.distance * scaleFactor;
    const satY = empStar.y + Math.sin(satellite.angle) * satellite.distance * scaleFactor;

    ctx.beginPath();
    ctx.arc(satX, satY, satellite.size * scaleFactor, 0, Math.PI * 2);
    ctx.fillStyle = satellite.color;
    ctx.fill();
  });

  const starSize = 12 * employeeStarSize * scaleFactor;
  const baseColor = empStar.employee.color || "#ffffff";

  // Adjust glow intensity based on path type
  const glowMultiplier = empStar.glowIntensity ||
    (empStar.pathType === "star" ? 2.0 :
     empStar.pathType === "planet" ? 1.2 :
     empStar.pathType === "comet" ? 1.5 : 1.0);

  // Draw employee star with glow effect
  const glowGradient = ctx.createRadialGradient(
    empStar.x, empStar.y, 0,
    empStar.x, empStar.y, starSize * 1.5 * glowMultiplier
  );

  glowGradient.addColorStop(0, baseColor);
  glowGradient.addColorStop(0.5, `${baseColor}40`); // 25% opacity
  glowGradient.addColorStop(1, `${baseColor}00`); // 0% opacity

  ctx.beginPath();
  ctx.arc(empStar.x, empStar.y, starSize * 1.5 * glowMultiplier, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.fill();

  // Inner star with visual adjustments based on path type
  const gradient = ctx.createRadialGradient(
    empStar.x, empStar.y, 0,
    empStar.x, empStar.y, starSize
  );

  // Customize appearance based on path type
  switch (empStar.pathType) {
    case "star":
      gradient.addColorStop(0, "#FFFFFF");
      gradient.addColorStop(0.2, baseColor);
      gradient.addColorStop(0.7, `${baseColor}80`);
      gradient.addColorStop(1, `${baseColor}20`);
      break;
    case "planet":
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.5, `${baseColor}A0`);
      gradient.addColorStop(0.8, `${baseColor}60`);
      gradient.addColorStop(1, `${baseColor}20`);
      break;
    case "comet":
      gradient.addColorStop(0, "#FFFFFF");
      gradient.addColorStop(0.3, baseColor);
      gradient.addColorStop(0.7, `${baseColor}80`);
      gradient.addColorStop(1, `${baseColor}40`);
      break;
    case "asteroid":
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.6, `${baseColor}90`);
      gradient.addColorStop(1, `${baseColor}30`);
      break;
    case "binary":
      gradient.addColorStop(0, "#FFFFFF");
      gradient.addColorStop(0.4, baseColor);
      gradient.addColorStop(0.8, `${baseColor}70`);
      gradient.addColorStop(1, `${baseColor}30`);
      break;
    default:
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.7, `${baseColor}80`);
      gradient.addColorStop(1, `${baseColor}20`);
  }

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
      ctx.font = `bold ${Math.floor(10 * employeeStarSize * scaleFactor)}px Arial`;
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
    ctx.font = `bold ${Math.floor(8 * employeeStarSize * scaleFactor)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(empStar.employee.name, empStar.x, empStar.y + starSize * 0.5);
  } else {
    // Default: just draw initials
    ctx.font = `bold ${Math.floor(10 * employeeStarSize * scaleFactor)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(empStar.employee.name, empStar.x, empStar.y);
  }

  // Draw path type indicator (optional)
  const pathTypeLabels = {
    comet: "☄️",
    star: "★",
    planet: "○",
    asteroid: "•",
    satellite: "◦",
    binary: "⦿"
  };

  // Uncomment to show path type indicators
  /*
  ctx.font = `${Math.floor(8 * employeeStarSize)}px Arial`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(pathTypeLabels[empStar.pathType], empStar.x + starSize * 1.5, empStar.y - starSize * 1.5);
  */
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
  // First update binary stars if any (they need special handling)
  const binaryStars = employeeStars.filter(star => star.pathType === "binary");

  // Group binary stars (for this example, we'll just pair consecutive binary stars)
  for (let i = 0; i < binaryStars.length - 1; i += 2) {
    const star1 = binaryStars[i];
    const star2 = binaryStars[i + 1];

    if (star1 && star2) {
      // Calculate common center point
      const centerX = (star1.orbitCenter.x + star2.orbitCenter.x) / 2;
      const centerY = (star1.orbitCenter.y + star2.orbitCenter.y) / 2;

      // Update orbit centers to be the common center
      star1.orbitCenter = { x: centerX, y: centerY };
      star2.orbitCenter = { x: centerX, y: centerY };

      // Offset angles to create binary orbit effect
      star2.angle = star1.angle + Math.PI; // Opposite sides of orbit
    }
  }

  // Draw all stars
  employeeStars.forEach(empStar => {
    drawEmployeeStar(ctx, empStar, deltaTime, employeeStarSize, employeeDisplayStyle);
  });
};
