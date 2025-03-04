import React from "react";
import { useTheme } from "@/theme";
import { SidebarProps, SidebarItem } from "../types";
import SidebarContainer from "./SidebarContainer";
import SidebarGroup from "./SidebarGroup";
import SidebarItemComponent from "./SidebarItem";
import { SIDEBAR_LINKS } from "../constants/sidebar.constants";

const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose = () => {},
  items = SIDEBAR_LINKS,
}) => {
  // Access the theme context using the useTheme hook
  const themeContext = useTheme();
  const { themeName, themeMode } = themeContext;

  // Get component styles directly from the theme system
  const sidebarStyle = themeContext.getComponentStyle?.("sidebar", "default") || {};
  const sidebarItemStyle = themeContext.getComponentStyle?.("sidebarItem", "default") || {};
  const sidebarGroupStyle = themeContext.getComponentStyle?.("sidebarGroup", "default") || {};
  const sidebarLinkStyle = themeContext.getComponentStyle?.("sidebarLink", "default") || {};

  // Get CSS variables for specific elements if needed
  const sidebarBg = themeContext.getCssVariable?.("theme-sidebar-default-bg");
  const sidebarFg = themeContext.getCssVariable?.("theme-sidebar-default-fg");
  const sidebarBorder = themeContext.getCssVariable?.("theme-sidebar-default-border");

  // Handle case where theme system isn"t fully initialized
  if (!themeName) {
    console.warn("Theme system not fully initialized");
  }

  return (
    <SidebarContainer
      style={sidebarStyle}
      className={"theme-${themeName}-sidebar-default"}
    >
      {isOpen && (
        <>
          <button
            onClick={onClose}
            aria-label="Close Sidebar"
            style={themeContext.getComponentStyle?.("button", "secondary")}
            className={"theme-${themeName}-button-secondary"}
          >
            Close
          </button>

          {items.map((item, index) => {
            switch (item.type) {
              case "group":
                return (
                  <SidebarGroup
                    key={index}
                    title={item.label}
                    items={
                      item.children?.map((child) => ({
                        label: child.label,
                        icon: child.icon,
                        onClick: child.onClick,
                        type: "item",
                        // Pass styles instead of skin
                        style: sidebarItemStyle,
                        className: "theme-${themeName}-sidebarItem-default"
                      })) || []
                    }
                    // Pass styles instead of skin
                    style={sidebarGroupStyle}
                    className={"theme-${themeName}-sidebarGroup-default"}
                    mode={themeMode}
                  />
                );

              case "item":
                return (
                  <SidebarItemComponent
                    key={index}
                    label={item.label}
                    // Pass styles instead of skin
                    style={sidebarItemStyle}
                    className={"theme-${themeName}-sidebarItem-default"}
                    onClick={item.onClick}
                    icon={item.icon}
                  />
                );

              case "link":
                return (
                  <a
                    key={index}
                    href={item.href}
                    className={"sidebar-link theme-${themeName}-sidebarLink-default"}
                    style={{
                      ...sidebarLinkStyle,
                      // Use CSS variables directly
                      backgroundColor: "var(--theme-sidebarLink-default-bg)",
                      color: "var(--theme-sidebarLink-default-fg)",
                      borderColor: "var(--theme-sidebarLink-default-border)"
                    }}
                  >
                    {item.icon && (
                      <span className="icon">{item.icon}</span>
                    )}
                    {item.label}
                  </a>
                );

              default:
                return assertUnreachable(item);
            }
          })}
        </>
      )}
    </SidebarContainer>
  );
};

export function assertUnreachable(value: never): never {
  throw new Error("Unhandled case: ${JSON.stringify(value)}");
}

export default Sidebar;
