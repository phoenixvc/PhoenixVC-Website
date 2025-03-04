import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { SidebarGroupProps, SidebarItem as SidebarItemType } from "../types";

const SidebarGroup: React.FC<SidebarGroupProps> = ({
  title,
  items,
  style = {},
  className = "",
  mode = "light",
  variant = "default"
}) => {
  const themeContext = useTheme() || {
    themeName: "default",
    getComponentStyle: () => ({})
  };
  const { themeName = "default" } = themeContext;

  // Get component style directly from the theme system
  const groupStyle = themeContext.getComponentStyle?.("sidebarGroup", variant) || {};
  const titleStyle = themeContext.getComponentStyle?.("sidebarGroupTitle", variant) || {};
  const linkStyle = themeContext.getComponentStyle?.("sidebarLink", variant) || {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...groupStyle,
    ...style
  };

  return (
    <div
      className={cn(
        "sidebar-group mb-4",
        `theme-${themeName}-sidebarGroup-${variant}`,
        mode === "dark" ? "dark-mode" : "light-mode",
        className
      )}
      style={combinedStyle}
    >
      <h3
        className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-2"
        style={titleStyle}
      >
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item, index) => {
          if (typeof item === "string") {
            return (
              <li
                key={index}
                className={`theme-${themeName}-sidebarGroupItem-${variant}`}
                style={themeContext.getComponentStyle?.("sidebarGroupItem", variant) || {}}
              >
                {item}
              </li>
            );
          }

          // Type assertion to help TypeScript understand the structure
          const sidebarItem = item as SidebarItemType;

          // Handle different item types
          if (sidebarItem.type === "link" && "href" in sidebarItem) {
            return (
              <a
                key={index}
                href={sidebarItem.href}
                className={cn(
                  `theme-${themeName}-sidebarLink-${variant}`,
                  "flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800",
                  sidebarItem.className
                )}
                style={{
                  ...linkStyle,
                  ...sidebarItem.style
                }}
              >
                {sidebarItem.icon && <span className="mr-2">{sidebarItem.icon}</span>}
                {sidebarItem.label}
              </a>
            );
          }

          // Default to SidebarItem for "item" type or unspecified
          // Only pass onClick if it exists
          return (
            <SidebarItem
              key={index}
              label={sidebarItem.label}
              style={sidebarItem.style}
              className={cn(
                `theme-${themeName}-sidebarItem-${variant}`,
                sidebarItem.className
              )}
              icon={sidebarItem.icon}
              {...("onClick" in sidebarItem ? { onClick: sidebarItem.onClick } : {})}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SidebarGroup;
