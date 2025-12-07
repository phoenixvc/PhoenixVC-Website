// features/sidebar/components/SidebarToggle.tsx
import React from "react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "../styles/sidebarToggle.module.css";

interface SidebarToggleProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  isMobile?: boolean;
  isDarkMode?: boolean;
  onToggle?: () => void;
  onCollapse?: () => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isOpen: _isOpen = true,
  isCollapsed = false,
  isMobile = false,
  isDarkMode: _isDarkMode = true,
  onToggle = () => {},
  onCollapse = () => {}
}) => {
  // Always use dark mode styling for the toggle
  const toggleClasses = cn(
    styles.toggleButton,
    styles.darkMode
  );

  const handleClick = (): void => {
    if (isMobile) {
      onToggle();
    } else {
      onCollapse();
    }
  };

  return (
    <button
      className={toggleClasses}
      onClick={handleClick}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isMobile ? (
        <Menu size={18} />
      ) : isCollapsed ? (
        <ChevronRight size={18} />
      ) : (
        <ChevronLeft size={18} />
      )}
    </button>
  );
};

export default SidebarToggle;
