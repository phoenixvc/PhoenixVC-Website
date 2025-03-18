// components/Layout/Layout.tsx
import React, { useState, useEffect, useRef } from "react";
import { Footer } from "./Footer/Footer";
import styles from "./layout.module.css";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import Header from "./Header/Header";
import InteractiveStarfield, { StarfieldRef } from "./Starfield/InteractiveStarfield";
import { MousePosition, Star } from "./Starfield/types";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [gameMode, setGameMode] = useState(false);
  // Disable debug mode by default
  const [debugMode, setDebugMode] = useState(false);

  // Create a ref to the starfield component
  const starfieldRef = useRef<StarfieldRef>(null);

  // Check if we're on mobile on mount and when window resizes
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
      setSidebarWidth(prev => (prev === 0 ? 220 : 0));
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

  // Toggle game mode
  const toggleGameMode = () => {
    setGameMode(prev => !prev);
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    console.log("Debug mode toggle clicked in Layout, current value:", debugMode);
    const newDebugMode = !debugMode;

    // Update local state
    setDebugMode(newDebugMode);

    // Update the starfield component's debug mode
    if (starfieldRef.current) {
      console.log("Updating starfield debug mode to:", newDebugMode);
      starfieldRef.current.updateDebugSetting("isDebugMode", newDebugMode);
    } else {
      console.warn("Starfield ref is not available");
    }
  };

  const customDebugInfo = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mousePosition: { x: number; y: number; isOnScreen?: boolean } | null,
    stars: Star[],
    mouseEffectRadius: number,
    timestamp?: number
  ) => {
    // Custom debug visualization
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 200, 120);

    ctx.font = "14px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("Custom Debug Info", 20, 30);
    ctx.fillText(`Stars: ${stars.length}`, 20, 50);

    // Handle null mousePosition
    if (mousePosition) {
      ctx.fillText(`Mouse: ${Math.round(mousePosition.x)}, ${Math.round(mousePosition.y)}`, 20, 70);

      // Draw mouse effect radius
      if (mousePosition.isOnScreen) {
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, mouseEffectRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(138, 43, 226, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else {
      ctx.fillText("Mouse: Not available", 20, 70);
    }

    ctx.fillText(`Dark Mode: ${isDarkMode ? "On" : "Off"}`, 20, 90);
    ctx.fillText(`Game Mode: ${gameMode ? "On" : "Off"}`, 20, 110);
  };

  return (
    <div
      className={`${styles.layoutWrapper} ${
        isDarkMode ? styles.darkMode : styles.lightMode
      } ${styles.starfieldContainer}`}
    >
      <InteractiveStarfield
        key={`starfield-${isDarkMode}-${sidebarWidth}-${gameMode}`}
        sidebarWidth={sidebarWidth}
        isDarkMode={isDarkMode}
        enableFlowEffect={true}
        enableBlackHole={true}
        enableMouseInteraction={true}
        enableEmployeeStars={true}
        starDensity={1.8}
        starSize={1.5}
        particleSpeed={0.05}
        flowStrength={0.01}
        gravitationalPull={0.05}
        mouseEffectRadius={220}
        mouseEffectColor="rgba(138, 43, 226, 0.15)"
        blackHoleSize={1.5}
        gameMode={gameMode}
        maxVelocity={0.5}
        debugMode={debugMode}
        animationSpeed={1.0}
        drawDebugInfo={customDebugInfo}
      />

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
          marginLeft: isMobile ? 0 : isSidebarOpen ? (isCollapsed ? "60px" : "220px") : 0,
        }}
      >
        <Header
          onMenuClick={toggleSidebar}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          isSidebarCollapsed={isCollapsed}
          gameMode={gameMode}
          onGameModeToggle={toggleGameMode}
          debugMode={debugMode}
          onDebugModeToggle={toggleDebugMode}
        />

        <main className={`${styles.mainContent} ${isDarkMode ? styles.darkMain : styles.lightMain}`}>
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<{ isDarkMode: boolean }>, { isDarkMode })
              : child
          )}
        </main>

        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default Layout;
