// Sidebar.tsx
import React, { useState } from "react";
import { useTheme } from "@/theme";
import { SidebarProps, SidebarItemType } from "../types";
import SidebarContainer from "./SidebarContainer";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";
import { SIDEBAR_LINKS } from "../constants/sidebar.constants";

const Sidebar: React.FC<SidebarProps> = ({
  isOpen: propIsOpen = false,
  onClose = () => {},
  items = SIDEBAR_LINKS,
  style = {},
  className = "",
  variant = "default"
}) => {
  // Local state to track sidebar open state
  const [isOpen, setIsOpen] = useState(propIsOpen);

  // Use the prop value when it changes
  React.useEffect(() => {
    setIsOpen(propIsOpen);
  }, [propIsOpen]);

  const themeContext = useTheme();
  const { themeName = "default", themeMode = "light" } = themeContext || {};

  // Handler for toggling sidebar
  const handleToggleSidebar = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (!newIsOpen) {
      onClose();
    }
  };

  // Handler for closing sidebar
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  // Helper function to render sidebar items safely
  const renderSidebarItem = (item: SidebarItemType, index: number) => {
    // Handle string items
    if (typeof item === "string") {
      return <div key={index}>{item}</div>;
    }

    // For object items, handle based on type
    if (typeof item === "object" && item !== null) {
      // Handle group items
      if ("type" in item && item.type === "group") {
        return (
          <SidebarGroup
            key={index}
            title={item.label}
            items={item.children || []}
            style={item.style}
            className={item.className}
            mode={themeMode}
            variant={variant}
          />
        );
      }

      // Handle link items
      if ("type" in item && item.type === "link") {
        return (
          <div key={index} className="mb-2">
            <a
              href={item.href}
              className={`flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${item.className || ""}`}
              style={item.style}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </a>
          </div>
        );
      }

      // Handle button/item items - use SidebarItem component
      if ("type" in item && (item.type === "item" || item.type === "button")) {
        return (
          <div key={index} className="mb-2">
            <SidebarItem
              label={item.label}
              icon={item.icon}
              onClick={item.onClick}
              style={item.style}
              className={item.className}
              variant={variant}
            />
          </div>
        );
      }
    }

    // Fallback for any other type
    console.warn(`Unknown sidebar item type at index ${index}:`, item);
    return null;
  };

  return (
    <SidebarContainer
      style={style}
      className={className}
      isOpen={isOpen}
      variant={variant}
      onClick={!isOpen ? handleToggleSidebar : undefined}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Menu</h2>
        {isOpen && (
          <button
            onClick={handleClose}
            aria-label="Close Sidebar"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="p-4 overflow-y-auto">
          {items.map((item, index) => renderSidebarItem(item, index))}
        </div>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
