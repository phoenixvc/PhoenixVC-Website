import React, { FC, useEffect, useRef, useState } from "react";
import styles from "./tooltip.module.css";
import { EmployeeData } from "./types";

interface TooltipProps {
  employee: EmployeeData;
  x: number;
  y: number;
  isPinned?: boolean;
  isDarkMode?: boolean;
  onPin?: (employee: EmployeeData) => void;
  onUnpin?: () => void;
}

const Tooltip: FC<TooltipProps> = ({
  employee,
  x,
  y,
  isPinned = false,
  isDarkMode = true,
  onPin,
  onUnpin
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Calculate tooltip position to ensure it stays within viewport
  const adjustPosition = () => {
    const tooltipWidth = 280;
    const tooltipHeight = 250;
    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    let tooltipX = x + 20;
    let tooltipY = y - tooltipHeight / 2;

    if (tooltipX + tooltipWidth > windowWidth - 20) {
      tooltipX = x - tooltipWidth - 20;
    }

    if (tooltipY < 20) {
      tooltipY = 20;
    } else if (tooltipY + tooltipHeight > windowHeight - 20) {
      tooltipY = windowHeight - tooltipHeight - 20;
    }

    return {
      left: tooltipX,
      top: tooltipY,
      position: "fixed" as const
    };
  };

  const position = adjustPosition();

  // Extract data from employee object
  const yearsExperience = employee.experience ||
                         (employee.mass ? Math.floor(employee.mass / 10) : 5) +
                         Math.floor(Math.random() * 5);
  const expertise = employee.expertise ||
                   (employee.position ? employee.position.split(" ").slice(-1)[0] : "Technology");
  const badgeText = employee.department || employee.product || "Team Member";
  const projectCount = Array.isArray(employee.projects)
    ? employee.projects.length
    : (employee.projects || 0);

  // Event handlers
  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPinned && onPin) {
      onPin(employee);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnpin) {
      onUnpin();
    }
  };

  // Get employee color
  const employeeColor = employee.color || (isDarkMode ? "#9d4edd" : "#7b2cbf");

  return (
    <div
      ref={tooltipRef}
      className={`
        ${styles.tooltip}
        ${isVisible ? styles.visible : ""}
        ${isPinned ? styles.pinned : ""}
        ${!isDarkMode ? styles.lightMode : ""}
      `}
      style={{
        ...position,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
      }}
      onClick={handleTooltipClick}
    >
      {isPinned && (
        <div
          className={styles.tooltipCloseButton}
          onClick={handleCloseClick}
        >×</div>
      )}

      <div className={styles.tooltipGlowEffect} style={{
        background: `radial-gradient(circle at left center, ${isDarkMode ? "rgba(157, 78, 221, 0.12)" : "rgba(123, 44, 191, 0.08)"} 0%, rgba(0, 0, 0, 0) 70%)`
      }} />

      <div className={styles.tooltipHeader}>
        {employee.image && (
          <div
            className={styles.tooltipAvatar}
            style={{
              border: `3px solid ${employeeColor}`,
              boxShadow: `0 0 10px ${isDarkMode ? "rgba(157, 78, 221, 0.2)" : "rgba(123, 44, 191, 0.12)"}`
            }}
          >
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

        <div className={styles.tooltipStat}>
          <span className={styles.tooltipLabel}>Projects:</span>
          <span className={styles.tooltipValue}>{projectCount}</span>
        </div>

        {employee.bio && (
          <div className={styles.tooltipBio}>
            <p>{employee.bio}</p>
          </div>
        )}

        <div className={styles.tooltipFooter}>
          <div
            className={styles.tooltipBadge}
            style={{ backgroundColor: employeeColor }}
          >
            {badgeText}
          </div>

          {isPinned && (
            <div className={styles.tooltipPinnedIndicator}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4V2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Pinned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
