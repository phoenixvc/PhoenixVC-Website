// components/Layout/Header/Header.tsx
import { FC, useEffect, useState } from "react";
import styles from "./header.module.css";
import { Menu, Sun, Moon, Bug, Gamepad2 } from "lucide-react";
import { HeaderProps, NavItem } from "./types";

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Focus Areas", href: "/focus-areas" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

const Header: FC<HeaderProps> = ({
  onMenuClick,
  isDarkMode,
  onThemeToggle,
  isSidebarCollapsed,
  gameMode,
  onGameModeToggle,
  debugMode = false, // Debug disabled by default
  onDebugModeToggle,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState("/");

  // Handle scroll event to add transparency
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Set active path based on current location
    const currentPath = window.location.pathname;
    setActivePath(currentPath);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <header
      className={`${styles.header} ${
        scrolled ? styles.headerScrolled : ""
      } ${!isDarkMode ? styles.lightMode : ""}`}
    >
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          {(window.innerWidth < 768 || !isSidebarCollapsed) && (
            <button
              className={styles.menuButton}
              onClick={onMenuClick}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
          )}

          {(window.innerWidth < 768 || isSidebarCollapsed) && (
            <a href="/" className={styles.logoContainer}>
              <span className={styles.logoText}>Phoenix VC</span>
            </a>
          )}
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.href} className={styles.navItem}>
                <a
                  href={item.href}
                  className={`${styles.navLink} ${
                    activePath === item.href ? styles.activeNavLink : ""
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.headerControls}>
          {onGameModeToggle && (
            <button
              className={`${styles.controlButton} ${
                gameMode ? styles.activeControl : ""
              }`}
              onClick={onGameModeToggle}
              aria-label="Toggle game mode"
              title={gameMode ? "Disable Game Mode" : "Enable Game Mode"}
            >
              <Gamepad2 size={18} />
            </button>
          )}

          {onDebugModeToggle && (
            <button
              className={`${styles.controlButton} ${
                debugMode ? styles.activeControl : ""
              }`}
              onClick={onDebugModeToggle}
              aria-label="Toggle debug mode"
              title={debugMode ? "Disable Debug Mode" : "Enable Debug Mode"}
            >
              <Bug size={18} />
            </button>
          )}

          <button
            className={styles.themeToggleButton}
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
