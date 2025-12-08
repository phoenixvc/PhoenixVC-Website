import React, { FC, useEffect, useState } from "react";
import styles from "./sunTooltip.module.css";

export interface SunInfo {
  id: string;
  name: string;
  description?: string;
  color: string;
  x: number;
  y: number;
}

interface SunTooltipProps {
  sun: SunInfo;
  isDarkMode?: boolean;
  onClick?: (sunId: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const SunTooltip: FC<SunTooltipProps> = ({
  sun,
  isDarkMode = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isVisible, setIsVisible] = useState(false);

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
    const tooltipWidth = 200;
    const tooltipHeight = 80;
    const windowWidth =
      typeof window !== "undefined" ? window.innerWidth : 1200;
    const windowHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;

    let tooltipX = sun.x + 30;
    let tooltipY = sun.y - tooltipHeight / 2;

    if (tooltipX + tooltipWidth > windowWidth - 20) {
      tooltipX = sun.x - tooltipWidth - 30;
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

  const handleClick = (): void => {
    if (onClick) {
      onClick(sun.id);
    }
  };

  return (
    <div
      className={`
        ${styles.sunTooltip}
        ${isVisible ? styles.visible : ""}
        ${!isDarkMode ? styles.lightMode : ""}
        ${onClick ? styles.clickable : ""}
      `}
      style={{
        ...position,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0) scale(1)"
          : "translateY(10px) scale(0.95)",
      }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={styles.sunGlow}
        style={{
          background: `radial-gradient(circle at center, ${sun.color}40 0%, transparent 70%)`,
        }}
      />
      <div className={styles.sunIcon} style={{ backgroundColor: sun.color }}>
        <div className={styles.sunCore} />
      </div>
      <div className={styles.sunInfo}>
        <h4 className={styles.sunName}>{sun.name}</h4>
        {sun.description && (
          <p className={styles.sunDescription}>{sun.description}</p>
        )}
        <span className={styles.clickHint}>Click to explore</span>
      </div>
    </div>
  );
};

export default SunTooltip;
