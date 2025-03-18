// components/Layout/Starfield/EmployeeTooltip.tsx
import React, { FC, useEffect, useState } from "react";
import styles from "./employeeTooltip.module.css";
import { EmployeeData } from "./types";

interface EmployeeTooltipProps {
  employee: EmployeeData;
  x: number;
  y: number;
  isPinned?: boolean;
}

const EmployeeTooltip: FC<EmployeeTooltipProps> = ({ employee, x, y, isPinned = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add animation delay for smoother appearance
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Calculate tooltip position to ensure it stays within viewport
  const adjustPosition = () => {
    const tooltipWidth = 280; // Wider tooltip
    const tooltipHeight = 180; // Taller tooltip
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Position tooltip to the side that has more space
    let posX = x + 20;
    let posY = y - tooltipHeight / 2; // Center vertically by default

    // Adjust if tooltip would go off the right edge
    if (posX + tooltipWidth > windowWidth - 20) {
      posX = x - tooltipWidth - 20;
    }

    // Adjust if tooltip would go off the top or bottom edge
    if (posY < 20) {
      posY = 20;
    } else if (posY + tooltipHeight > windowHeight - 20) {
      posY = windowHeight - tooltipHeight - 20;
    }

    return { left: posX, top: posY };
  };

  const position = adjustPosition();

  // Extract years of experience from employee data or use a default
  const yearsExperience = employee.experience ||
                         (employee.mass ? Math.floor(employee.mass / 10) : 5) +
                         Math.floor(Math.random() * 5);

  // Extract expertise areas or generate from position
  const expertise = employee.expertise ||
                   (employee.position ? employee.position.split(" ").slice(-1)[0] : "Technology");

  return (
    <div
      className={`${styles.tooltip} ${isVisible ? styles.visible : ""} ${isPinned ? styles.pinned : ""}`}
      style={{
        left: position.left,
        top: position.top,
        borderColor: employee.color || "#8a2be2",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        pointerEvents: isPinned ? "auto" : "none" // Allow interaction when pinned
      }}
    >
      {isPinned && (
        <div className={styles.tooltipCloseButton}>×</div>
      )}

      <div
        className={styles.tooltipGlow}
        style={{
          boxShadow: `0 0 30px ${employee.color || "#8a2be2"}40`,
          background: `radial-gradient(circle at center, ${employee.color || "#8a2be2"}30 0%, transparent 70%)`
        }}
      />

      <div className={styles.tooltipHeader}>
        {employee.image && (
          <div className={styles.tooltipAvatar} style={{ borderColor: employee.color || "#8a2be2" }}>
            <img src={employee.image} alt={employee.name} />
          </div>
        )}
        <div className={styles.tooltipTitle}>
          <h3>{employee.fullName || employee.name}</h3>
          <p>{employee.position}</p>
        </div>
      </div>

      <div className={styles.tooltipContent}>
        <div className={styles.tooltipStat}>
          <span className={styles.tooltipLabel}>Experience:</span>
          <span className={styles.tooltipValue}>{yearsExperience} years</span>
        </div>

        <div className={styles.tooltipStat}>
          <span className={styles.tooltipLabel}>Expertise:</span>
          <span className={styles.tooltipValue}>{expertise}</span>
        </div>

        {employee.projects && employee.projects.length > 0 && (
          <div className={styles.tooltipStat}>
            <span className={styles.tooltipLabel}>Projects:</span>
            <span className={styles.tooltipValue}>{employee.projects.length}</span>
          </div>
        )}

        {employee.bio && (
          <div className={styles.tooltipBio}>
            <p>{employee.bio}</p>
          </div>
        )}

        <div className={styles.tooltipFooter}>
          <div className={styles.tooltipBadge} style={{ backgroundColor: employee.color || "#8a2be2" }}>
            {employee.department || "Team Member"}
          </div>

          {isPinned && (
            <div className={styles.tooltipPinnedIndicator}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Pinned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTooltip;
