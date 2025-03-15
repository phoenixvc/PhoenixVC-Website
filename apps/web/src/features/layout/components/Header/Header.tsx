// components/Layout/Header/Header.tsx
import React from "react";
import { Menu, Sun, Moon } from "lucide-react";
import styles from "./header.module.css";

interface HeaderProps {
  onMenuClick?: () => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  isDarkMode = true,
  onThemeToggle,
  isSidebarCollapsed = false,
}) => {
  const [currentPath, setCurrentPath] = React.useState("");

  React.useEffect(() => {
    const updateCurrentPath = () => {
      setCurrentPath(window.location.pathname);
    };

    updateCurrentPath();
    window.addEventListener("popstate", updateCurrentPath);

    return () => {
      window.removeEventListener("popstate", updateCurrentPath);
    };
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Focus Areas", href: "/focus-areas" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className={`${styles.header} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
      <div className={styles.logoContainer}>
        <span className={styles.logo}>Phoenix VC</span>
      </div>

      <nav className={styles.navigation}>
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`${styles.navLink} ${
              currentPath === item.href ? styles.navLinkActive : ""
            }`}
          >
            {item.name}
          </a>
        ))}
      </nav>

      <div className={styles.actions}>
        {/* Theme toggle button (only visible on desktop) */}
        {onThemeToggle && (
          <button
            className={styles.themeToggle}
            onClick={onThemeToggle}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {/* Mobile menu button */}
        {onMenuClick && (
          <button
            className={styles.menuButton}
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        )}
      </div>
    </header>
  );
};
