// features/sidebar/components/SidebarItem.tsx
import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import { SidebarItemProps } from "../types";

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  onClick,
  icon,
  style = {},
  className = "",
  variant = "default",
  active = false,
  href = "#", // Default href
}) => {
  const themeContext = useTheme() || {
    themeName: "default",
    getComponentStyle: () => ({})
  };

  // Get component style from theme
  const itemStyle = themeContext.getComponentStyle?.("sidebar.item", variant) || {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...itemStyle,
    ...style
  };

  const itemClasses = cn(
    "flex items-center px-3 py-2 text-sm rounded-md w-full",
    active
      ? "bg-primary text-primary-foreground"
      : "hover:bg-accent hover:text-accent-foreground",
    className
  );

  // Determine if this is a link or button based on onClick
  if (onClick) {
    return (
      <button className={itemClasses} style={combinedStyle} onClick={onClick}>
        {icon && <span className="mr-2">{icon}</span>}
        <span>{label}</span>
      </button>
    );
  } else {
    return (
      <a href={href} className={itemClasses} style={combinedStyle}>
        {icon && <span className="mr-2">{icon}</span>}
        <span>{label}</span>
      </a>
    );
  }
};

export default SidebarItem;
