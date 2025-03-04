import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import styles from "../styles/sidebar.module.css";

interface SidebarContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: string;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  style = {},
  className = "",
  variant = "default"
}) => {
  const themeContext = useTheme();
  const { themeName } = themeContext;

  // Get component style directly from the theme system
  const containerStyle = themeContext.getComponentStyle?.("sidebar", variant) || {};

  // Get specific CSS variables if needed
  const boxShadow = themeContext.getCssVariable?.("theme-sidebar-shadow") || "0px 4px 6px rgba(0, 0, 0, 0.1)";

  // Combine passed style with theme style
  const combinedStyle = {
    ...containerStyle,
    boxShadow,
    ...style
  };

  return (
    <div
      className={cn(
        styles.sidebarContainer,
        "theme-${themeName}-sidebar-${variant}",
        className
      )}
      style={combinedStyle}
    >
      {children}
    </div>
  );
};

export default SidebarContainer;
