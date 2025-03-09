// features/sidebar/components/Sidebar.tsx
import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import SidebarGroup from "./SidebarGroup";
import { SidebarProps } from "../types";
import { DEFAULT_SIDEBAR_GROUPS } from "../constants/sidebar.constants";

const Sidebar: React.FC<SidebarProps> = ({
  groups,
  style = {},
  className = "",
  mode = "light",
  variant = "default",
  collapsed = false,
  onClose = () => {},
  isOpen = false,
}) => {
  const themeContext = useTheme() || {
    themeName: "default",
    getComponentStyle: () => ({})
  };
  const { themeName = "default" } = themeContext;

  // Get component style from theme
  const containerStyle = themeContext.getComponentStyle?.("sidebar.container", variant) || {};
  const sidebarStyle = themeContext.getComponentStyle?.("sidebar.style", variant) || {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...containerStyle,
    ...sidebarStyle,
    ...style
  };

  // Use provided groups or default sidebar groups
  const sidebarGroups = groups || DEFAULT_SIDEBAR_GROUPS;

  return (
    <div
      className={cn(
        "sidebar h-full",
        isOpen ? (collapsed ? "w-16" : "w-64") : "w-0 md:w-64",
        `theme-${themeName}-sidebar-${variant}`,
        mode === "dark" ? "dark-mode" : "light-mode",
        className
      )}
      style={combinedStyle}
    >
      {isOpen && collapsed && (
        <div className="p-2 flex justify-end">
          <button
            onClick={onClose}
            aria-label="Toggle Sidebar"
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>
      )}

      {sidebarGroups.map((group, index) => (
        <SidebarGroup
          key={index}
          title={group.title}
          items={group.items}
          mode={mode}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default Sidebar;
