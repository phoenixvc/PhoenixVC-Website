// SidebarContainer.tsx
import React from "react";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import { SidebarContainerProps } from "../types";

interface ExtendedSidebarContainerProps extends SidebarContainerProps {
  onClick?: () => void;
}

const SidebarContainer: React.FC<ExtendedSidebarContainerProps> = ({
  children,
  style = {},
  className = "",
  variant = "default",
  isOpen = false,
  onClick
}) => {
  const themeContext = useTheme();
  const { themeName = "default" } = themeContext || { themeName: "default" };

  // Add responsive state
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Default variant styles
  const defaultVariantStyle: React.CSSProperties = {
    backgroundColor: "var(--theme-sidebar-bg, #ffffff)",
    color: "var(--theme-sidebar-text, #333333)",
    boxShadow: "var(--theme-sidebar-shadow, 0px 4px 6px rgba(0, 0, 0, 0.1))",
    borderRight: "var(--theme-sidebar-border, 1px solid #e5e7eb)"
  };

  // Get component style directly from the theme system or use default
  const themeStyle = themeContext?.getComponentStyle?.("sidebar", variant) || {};

  // Combine styles with priority: theme style > default variant style > passed style
  const containerStyle: React.CSSProperties = {
    ...defaultVariantStyle,
    ...themeStyle,
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: isMobile ? "100%" : "var(--theme-sidebar-width, 240px)",
    zIndex: 1000,
    transition: "transform 0.3s ease",
    transform: isOpen ? "translateX(0)" : "translateX(-80%)",
    cursor: isOpen ? "default" : "pointer",
    ...style
  };

  // For mobile, fully hide when closed
  if (isMobile && !isOpen) {
    containerStyle.transform = "translateX(-100%)";
  }

  // Define CSS classes for open/closed states
  const sidebarClasses = cn(
    "sidebar-container",
    isOpen ? "sidebar-open" : "sidebar-closed",
    isMobile ? "sidebar-mobile" : "sidebar-desktop",
    `theme-${themeName}-sidebar-${variant}`,
    className
  );

  return (
    <aside
      className={sidebarClasses}
      style={containerStyle}
      onClick={onClick}
      aria-expanded={isOpen}
    >
      {children}
    </aside>
  );
};

export default SidebarContainer;
