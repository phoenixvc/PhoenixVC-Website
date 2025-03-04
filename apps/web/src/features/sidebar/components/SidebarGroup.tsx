import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { SidebarGroupProps } from "../types";

const SidebarGroup: React.FC<SidebarGroupProps> = ({
  title,
  items,
  style = {},
  className = "",
  mode = "light",
  variant = "default"
}) => {
  const themeContext = useTheme();
  const { themeName } = themeContext;

  // Get component style directly from the theme system
  const groupStyle = themeContext.getComponentStyle?.("sidebarGroup", variant) || {};
  const titleStyle = themeContext.getComponentStyle?.("sidebarGroupTitle", variant) || {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...groupStyle,
    ...style
  };

  return (
    <div
      className={cn(
        "sidebar-group",
        "theme-${themeName}-sidebarGroup-${variant}",
        mode === "dark" ? "dark-mode" : "light-mode",
        className
      )}
      style={combinedStyle}
    >
      <h3 style={titleStyle}>{title}</h3>
      <ul>
        {items.map((item, index) => {
          if (typeof item === "string") {
            return (
              <li
                key={index}
                className={"theme-${themeName}-sidebarGroupItem-${variant}"}
                style={themeContext.getComponentStyle?.("sidebarGroupItem", variant) || {}}
              >
                {item}
              </li>
            );
          }

          return (
            <SidebarItem
              key={index}
              label={item.label}
              style={item.style}
              className={cn(
                "theme-${themeName}-sidebarItem-${variant}",
                item.className
              )}
              onClick={item.onClick}
              icon={item.icon}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default SidebarGroup;
