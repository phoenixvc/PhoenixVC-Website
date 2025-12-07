// features/sidebar/components/SidebarContainer.tsx
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
  onClick,
  mode: _mode = "light",
  collapsed: _collapsed = false
}) => {
  const themeContext = useTheme() || {
    themeName: "default",
    getComponentStyle: () => ({})
  };
  const { themeName: _themeName = "default" } = themeContext;

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

  // Get component style from theme using the consistent path structure
  const containerStyle = themeContext.getComponentStyle?.("sidebar.container", variant) || {};
  const sidebarStyle = themeContext.getComponentStyle?.("sidebar.style", variant) || {};

  // Combine styles with priority: theme style > default variant style > passed style
  const combinedStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: isMobile ? "100%" : "var(--theme-sidebar-width, 240px)",
    backgroundColor: "var(--theme-sidebar-bg, #ffffff)",
    color: "var(--theme-sidebar-text, #333333)",
    boxShadow: "var(--theme-sidebar-shadow, 0px 4px 6px rgba(0, 0, 0, 0.1))",
    borderRight: "var(--theme-sidebar-border, 1px solid #e5e7eb)",
    zIndex: 40,
    transition: "transform 0.3s ease",
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    overflow: "auto",
    ...containerStyle,
    ...sidebarStyle,
    ...style
  };

  // Define CSS classes for open/closed states
  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-40 flex flex-col",
    "bg-background border-r shadow-sm",
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
    isMobile ? "w-full md:w-64" : "w-64",
    "transition-transform duration-300 ease-in-out",
    `theme-${themeName}-sidebar-${variant}`,
    className
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={sidebarClasses}
        style={combinedStyle}
        aria-expanded={isOpen}
      >
        {children}
      </aside>
    </>
  );
};

export default SidebarContainer;
