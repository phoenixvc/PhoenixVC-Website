// components/Layout/Sidebar/Sidebar.tsx
import React from "react";
import { ChevronLeft } from "lucide-react";
import styles from "../styles/sidebar.module.css";
import { SidebarProps } from "../types";
import { DEFAULT_SIDEBAR_GROUPS } from "../constants/sidebar.constants";

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
  isDarkMode = true,
  isMobile = false,
  collapsed = false,
  onToggle,
  onCollapse,
  mode = "dark"
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

  // Don"t render if closed on mobile
  if (isMobile && !isOpen) return null;

  const sidebarClasses = [
    styles.sidebar,
    collapsed ? styles.sidebarCollapsed : "",
    isDarkMode ? styles.darkMode : styles.lightMode,
    isMobile ? styles.mobileSidebar : "",
    isMobile && isOpen ? styles.sidebarExpanded : ""
  ].filter(Boolean).join(" ");

  // Function to check if a link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return currentPath === href;
    }
    // For hash links, check if they"re in the current URL
    if (href.startsWith("/#")) {
      return window.location.hash === href.substring(1);
    }
    // For other links, check if the path starts with the href
    return currentPath.startsWith(href);
  };

  return (
    <aside className={sidebarClasses}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarLogo}>Phoenix VC</span>
        {onCollapse && !isMobile && (
          <button
            className={styles.sidebarToggle}
            onClick={onCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={20} className={collapsed ? styles.rotateIcon : ""} />
          </button>
        )}
        {isMobile && onClose && (
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        )}
      </div>

      <div className={styles.sidebarContent}>
        {DEFAULT_SIDEBAR_GROUPS.map((group) => (
          <div key={group.title} className={styles.sidebarSection}>
            <h3 className={styles.sidebarSectionTitle}>{group.title}</h3>
            <nav className={styles.sidebarNav}>
              {group.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`${styles.sidebarLink} ${
                    isLinkActive(item.href) ? styles.sidebarLinkActive : ""
                  }`}
                >
                  <span className={styles.sidebarIcon}>
                    {item.icon}
                  </span>
                  <span className={styles.sidebarLabel}>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
};
