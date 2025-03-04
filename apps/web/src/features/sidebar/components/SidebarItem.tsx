import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  onClick,
  icon,
  style = {},
  className = "",
  variant = "default"
}) => {
  const themeContext = useTheme();
  const { themeName } = themeContext;

  // Get component style directly from the theme system
  const itemStyle = themeContext.getComponentStyle?.("sidebarItem", variant) || {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...itemStyle,
    ...style
  };

  return (
    <div
      className={cn(
        "sidebar-item",
        `theme-${themeName}-sidebarItem-${variant}`,
        className
      )}
      onClick={onClick}
      style={combinedStyle}
    >
      {icon && <span className="sidebar-item-icon">{icon}</span>}
      <span className="sidebar-item-label">{label}</span>
    </div>
  );
};

export default SidebarItem;
