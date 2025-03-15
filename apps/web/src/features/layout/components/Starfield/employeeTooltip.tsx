// components/Layout/Starfield/EmployeeTooltip.tsx
import React, { FC } from "react";
import styles from "./employeeTooltip.module.css";
import { EmployeeData } from "./types";

interface EmployeeTooltipProps {
  employee: EmployeeData; // We expect a non-null employee here
  x: number;
  y: number;
}

const EmployeeTooltip: FC<EmployeeTooltipProps> = ({ employee, x, y }) => {
  // Calculate tooltip position to ensure it stays within viewport
  const adjustPosition = () => {
    const tooltipWidth = 250; // Estimated tooltip width
    const tooltipHeight = 120; // Estimated tooltip height
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Start with the default position (to the right and below the cursor)
    let posX = x + 15;
    let posY = y + 15;

    // Adjust if tooltip would go off the right edge
    if (posX + tooltipWidth > windowWidth) {
      posX = x - tooltipWidth - 15;
    }

    // Adjust if tooltip would go off the bottom edge
    if (posY + tooltipHeight > windowHeight) {
      posY = y - tooltipHeight - 15;
    }

    return { left: posX, top: posY };
  };

  const position = adjustPosition();

  return (
    <div
      className={styles.tooltip}
      style={{
        left: position.left,
        top: position.top,
        borderColor: employee.color || "rgba(255, 255, 255, 0.2)"
      }}
    >
      <div className={styles.tooltipHeader} style={{ backgroundColor: employee.color || "rgba(50, 50, 50, 0.9)" }}>
        {employee.image && (
          <div className={styles.tooltipAvatar}>
            <img src={employee.image} alt={employee.name} />
          </div>
        )}
        <div className={styles.tooltipTitle}>
          <h3>{employee.fullName || employee.name}</h3>
          <p>{employee.position}</p>
        </div>
      </div>

      <div className={styles.tooltipContent}>
        {/* Additional employee details could go here */}
        <div className={styles.tooltipStat}>
          <span className={styles.tooltipLabel}>Experience:</span>
          <span className={styles.tooltipValue}>{Math.floor(employee.mass / 10)} years</span>
        </div>

        <div className={styles.tooltipStat}>
          <span className={styles.tooltipLabel}>Expertise:</span>
          <span className={styles.tooltipValue}>
            {employee.position.split(" ").slice(-1)[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTooltip;
