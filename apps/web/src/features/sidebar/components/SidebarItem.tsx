// SidebarItem.tsx
import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import { SidebarItemProps } from "../types";

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  style = {},
  className = "",
  onClick,  // Accept onClick prop
  variant = "default"
}) => {
  const themeContext = useTheme() || {
    themeName: "default",
    getComponentStyle: () => ({})
  };
  const { themeName = "default" } = themeContext;

  // Get component style from theme
  const itemStyle = themeContext.getComponentStyle?.("sidebarItem", variant) || {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...itemStyle,
    ...style
  };

  return (
    <div
      onClick={onClick}  // Use onClick prop
      className={cn(
        "flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
        `theme-${themeName}-sidebarItem-${variant}`,
        className
      )}
      style={combinedStyle}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </div>
  );
};

export default SidebarItem;
