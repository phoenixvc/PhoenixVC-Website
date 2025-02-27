// sidebar/Sidebar.tsx
import React, { useState } from "react";
import styles from "./sidebar.module.css";
import { SIDEBAR_LINKS } from "../../constants";

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <aside
      className={`
        ${styles.sidebarContainer}
        ${isOpen ? styles.open : styles.closed}
      `}
    >
      <div className={styles.toggleButtonWrapper}>
        <button
          type="button"
          onClick={handleToggle}
          className={styles.toggleButton}
        >
          {isOpen ? "←" : "→"}
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.linkList}>
          {SIDEBAR_LINKS.map((link) => (
            <li key={link.href} className={styles.linkItem}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
