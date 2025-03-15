// components/Layout/Layout.tsx
import React, { useState, useEffect } from "react";
import { Footer } from "./Footer/Footer";
import styles from "./layout.module.css";
import { Menu, Sun, Moon } from "lucide-react";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import Header from "./Header/Header";
import InteractiveStarfield from "./InteractiveStarField";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if we're on mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile, keep open on desktop
      if (mobile) {
        setIsSidebarOpen(false);
        setIsCollapsed(false); // Ensure not collapsed on mobile
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Check for system preference on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle open/closed
      setIsSidebarOpen(prev => !prev);
    } else {
      // On desktop, toggle between collapsed and full
      setIsCollapsed(prev => !prev);
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
      {/* Add the interactive starfield */}
      <InteractiveStarfield />

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

      {isMobile && isSidebarOpen && (
        <div
          className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.visible : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={styles.contentWrapper}
        style={{
          width: isMobile ? "100%" : "100%", // Always 100% width
          marginLeft: isMobile ? "0" : (isCollapsed ? "60px" : "220px"), // Adjust margin based on sidebar state
        }}
      >
        <Header
          onMenuClick={toggleSidebar}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          isSidebarCollapsed={isCollapsed} // Pass the collapsed state
        />

        <main className={styles.mainContent}>
          {children}
        </main>

        <Footer isDarkMode={isDarkMode} />
      </div>

      {/* Keep your mobile toggle buttons as is */}
    </div>
  );
};

export default Layout;
