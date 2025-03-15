// components/Layout/Sidebar/Sidebar.tsx
import React from "react";
import { Home, Briefcase, FileText, Code, Mail, FileIcon, Palette, ChevronLeft } from "lucide-react";
import styles from "../styles/sidebar.module.css";
import { SidebarProps } from "../types";

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

  // Don't render if closed on mobile
  if (isMobile && !isOpen) return null;

  const mainNavigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Portfolio", href: "/portfolio", icon: Briefcase },
    { name: "Blog", href: "/blog", icon: FileText },
    { name: "Projects", href: "/projects", icon: Code },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const resources = [
    { name: "Documentation", href: "/documentation", icon: FileIcon },
    { name: "Theme Designer", href: "/theme-designer", icon: Palette },
  ];

  const sidebarClasses = [
    styles.sidebar,
    collapsed ? styles.sidebarCollapsed : "",
    isDarkMode ? styles.darkMode : styles.lightMode,
    isMobile ? styles.mobileSidebar : "",
    isMobile && isOpen ? styles.sidebarExpanded : ""
  ].filter(Boolean).join(" ");

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
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarSectionTitle}>Main Navigation</h3>
          <nav className={styles.sidebarNav}>
            {mainNavigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`${styles.sidebarLink} ${
                  currentPath === item.href ? styles.sidebarLinkActive : ""
                }`}
              >
                <span className={styles.sidebarIcon}>
                  <item.icon size={18} />
                </span>
                <span className={styles.sidebarLabel}>{item.name}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarSectionTitle}>Resources</h3>
          <nav className={styles.sidebarNav}>
            {resources.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`${styles.sidebarLink} ${
                  currentPath === item.href ? styles.sidebarLinkActive : ""
                }`}
              >
                <span className={styles.sidebarIcon}>
                  <item.icon size={18} />
                </span>
                <span className={styles.sidebarLabel}>{item.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};
