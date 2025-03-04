// features/sidebar/components/SidebarItem.tsx
import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import { SidebarItemProps } from "../types";

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  style = {},
  className = "",
  onClick,
  active = false,
  variant = "default"
}) => {
  const themeContext = useTheme() || {
    themeName: "default",
    getComponentStyle: () => ({})
  };
  const { themeName = "default" } = themeContext;

  // Get component style from theme - use the correct path structure
  const itemStylePath = active ? "sidebar.item.active" : "sidebar.item.default";
  const itemStyle = themeContext.getComponentStyle?.(itemStylePath, variant) || {};

  // Get icon style if icon exists
  const iconStyle = icon ? (themeContext.getComponentStyle?.("sidebar.icon", variant) || {}) : {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...itemStyle,
    ...style
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center p-2 rounded cursor-pointer",
        active ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800",
        `theme-${themeName}-sidebarItem-${variant}`,
        active ? `theme-${themeName}-sidebarItem-active-${variant}` : "",
        className
      )}
      style={combinedStyle}
    >
      {icon && (
        <span
          className="mr-2"
          style={active ?
            (themeContext.getComponentStyle?.("sidebar.icon.active", variant) || iconStyle) :
            iconStyle
          }
        >
          {icon}
        </span>
      )}
      {label}
    </div>
  );
};

export default SidebarItem;
