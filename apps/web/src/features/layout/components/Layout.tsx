// components/Layout/Layout.tsx
import React, { useState, useEffect } from "react";
import { Header } from "./Header/Header";
import { Footer } from "./Footer/Footer";
import styles from "./layout.module.css";
import { Menu, Sun, Moon } from "lucide-react";
import { Sidebar } from "@/features/sidebar/components/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if we"re on mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile, keep open on desktop
      if (mobile) {
        setIsSidebarOpen(false);
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
    setIsSidebarOpen(prev => !prev);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Added for sidebar collapse functionality
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className={`${styles.layoutWrapper} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
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

      {/* Mobile overlay - keep as is */}
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
