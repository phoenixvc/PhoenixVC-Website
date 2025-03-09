// features/sidebar/components/SidebarGroup.tsx
import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { SidebarGroupProps, SidebarItemType } from "../types";

const SidebarGroup: React.FC<SidebarGroupProps> = ({
  title,
  items = [],
  style = {},
  className = "",
  mode = "light",
  variant = "default",
  active = false,
  onClick,
}) => {
  const themeContext = useTheme() || {
    themeName: "default",
    getComponentStyle: () => ({})
  };

  // Get component style from theme
  const groupStyle = themeContext.getComponentStyle?.("sidebar.group", variant) || {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...groupStyle,
    ...style
  };

  return (
    <div
      className={cn(
        "sidebar-group mb-4",
        mode === "dark" ? "text-gray-200" : "text-gray-700",
        className
      )}
      style={combinedStyle}
    >
      {title && (
        <h3 className={cn(
          "text-xs font-semibold uppercase tracking-wider px-4 py-2",
          mode === "dark" ? "text-gray-400" : "text-gray-500"
        )}>
          {title}
        </h3>
      )}

      <div className="space-y-1 px-2">
        {items.map((item, index) => {
          if (typeof item === "string") {
            return (
              <SidebarItem
                key={index}
                label={item}
                active={false}
                variant={variant}
              />
            );
          } else {
            // Handle different item types
            if (item.type === "link") {
              return (
                <SidebarItem
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  active={item.active || false}
                  style={item.style}
                  className={item.className}
                  variant={variant}
                  href={item.href || "#"} // Pass href for link items
                />
              );
            } else if (item.type === "button" || item.type === "item") {
              return (
                <SidebarItem
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  active={item.active || false}
                  onClick={item.onClick}
                  style={item.style}
                  className={item.className}
                  variant={variant}
                />
              );
            }
            // Add handling for group type if needed
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default SidebarGroup;
