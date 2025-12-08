import React, { FC, useEffect, useRef, useState } from "react";
import styles from "./tooltip.module.css";
import { PortfolioProject } from "./types";

interface TooltipProps {
  project: PortfolioProject;
  x: number;
  y: number;
  isPinned?: boolean;
  isDarkMode?: boolean;
  onPin?: (project: PortfolioProject) => void;
  onUnpin?: () => void;
}

const Tooltip: FC<TooltipProps> = ({
  project,
  x,
  y,
  isPinned = false,
  isDarkMode = true,
  onPin,
  onUnpin,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return (): void => clearTimeout(timer);
  }, []);

  // Calculate tooltip position to ensure it stays within viewport
  const adjustPosition = (): {
    left: number;
    top: number;
    position: "fixed";
  } => {
    const tooltipWidth = 280;
    const tooltipHeight = 250;
    const windowWidth =
      typeof window !== "undefined" ? window.innerWidth : 1200;
    const windowHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;

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
      position: "fixed" as const,
    };
  };

  const position = adjustPosition();

  // Extract data from project object
  const yearsExperience =
    project.experience ||
    (project.mass ? Math.floor(project.mass / 10) : 5) +
      Math.floor(Math.random() * 5);
  const expertise =
    project.expertise ||
    (project.position
      ? project.position.split(" ").slice(-1)[0]
      : "Technology");
  const badgeText = project.department || project.product || "Team Member";
  const projectCount = Array.isArray(project.projects)
    ? project.projects.length
    : project.projects || 0;

  // Event handlers
  const handleTooltipClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (!isPinned && onPin) {
      onPin(project);
    }
  };

  const handleCloseClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onUnpin) {
      onUnpin();
    }
  };

  // Get project color
  const projectColor = project.color || (isDarkMode ? "#9d4edd" : "#7b2cbf");

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
        <div className={styles.tooltipCloseButton} onClick={handleCloseClick}>
          ×
        </div>
      )}

      <div
        className={styles.tooltipGlowEffect}
        style={{
          background: `radial-gradient(circle at left center, ${isDarkMode ? "rgba(157, 78, 221, 0.12)" : "rgba(123, 44, 191, 0.08)"} 0%, rgba(0, 0, 0, 0) 70%)`,
        }}
      />

      <div className={styles.tooltipHeader}>
        {project.image && (
          <div
            className={styles.tooltipAvatar}
            style={{
              border: `3px solid ${projectColor}`,
              boxShadow: `0 0 10px ${isDarkMode ? "rgba(157, 78, 221, 0.2)" : "rgba(123, 44, 191, 0.12)"}`,
            }}
          >
            <img src={project.image} alt={project.name} />
          </div>
        )}
        <div className={styles.tooltipTitle}>
          <h3>{project.fullName || project.name}</h3>
          <p>{project.position}</p>
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

        {project.bio && (
          <div className={styles.tooltipBio}>
            <p>{project.bio}</p>
          </div>
        )}

        <div className={styles.tooltipFooter}>
          <div
            className={styles.tooltipBadge}
            style={{ backgroundColor: projectColor }}
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
