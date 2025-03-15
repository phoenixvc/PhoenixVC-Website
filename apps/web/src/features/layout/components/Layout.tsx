// components/Layout/Layout.tsx
import React, { useState, useEffect } from "react";
import { Footer } from "./Footer/Footer";
import styles from "./layout.module.css";
import { Menu, Sun, Moon } from "lucide-react";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import Header from "./Header/Header";
import InteractiveStarfield from "./Starfield/InteractiveStarfield";
import starfieldStyles from "./Starfield/interactiveStarfield.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);

  // Check if we"re on mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile, keep open on desktop
      if (mobile) {
        setIsSidebarOpen(false);
        setIsCollapsed(false); // Ensure not collapsed on mobile
        setSidebarWidth(0); // No sidebar on mobile when closed
      } else {
        setIsSidebarOpen(true);
        setSidebarWidth(isCollapsed ? 60 : 220); // Set width based on collapsed state
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [isCollapsed]);

  // Update sidebar width when collapse state changes
  useEffect(() => {
    if (!isMobile) {
      setSidebarWidth(isCollapsed ? 60 : 220);
    }
  }, [isCollapsed, isMobile]);

  // Check for system preference on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle open/closed
      setIsSidebarOpen(prev => !prev);
      setSidebarWidth(prev => prev === 0 ? 220 : 0);
    } else {
      // On desktop, toggle between collapsed and full
      setIsCollapsed(prev => !prev);
      setSidebarWidth(isCollapsed ? 220 : 60);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Separate function for sidebar collapse (used by sidebar component)
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className={`${styles.layoutWrapper} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
      {/* Interactive starfield background */}
      <InteractiveStarfield
        sidebarWidth={sidebarWidth}
        isDarkMode={isDarkMode} // Pass the isDarkMode prop
      />

      {/* Sidebar component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => isMobile && setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
        isMobile={isMobile}
        collapsed={isCollapsed}
        onToggle={toggleSidebar}
        onCollapse={toggleCollapse}
        mode={isDarkMode ? "dark" : "light"}
      />

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.visible : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div
        className={styles.contentWrapper}
        style={{
          marginLeft: isMobile ? 0 : (isSidebarOpen ? (isCollapsed ? "60px" : "220px") : 0)
        }}
      >
        <Header
          onMenuClick={toggleSidebar}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          isSidebarCollapsed={isCollapsed}
        />

        <main className={styles.mainContent}>
          {children}
        </main>

        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default Layout;
