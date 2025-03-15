// features/sidebar/components/SidebarItem.tsx
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import { SidebarItemProps } from "../types";
import styles from "../styles/sidebar.module.css";

const itemVariants = {
  active: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  inactive: {
    scale: 1,
    transition: { duration: 0.2 }
  }
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  onClick,
  icon,
  style = {},
  className = "",
  variant = "default",
  active = false,
  href = "#",
  mode = "light",
  collapsed = false,
  type = "link"
}) => {
  const themeContext = useTheme() || {
    themeName: "default",
    getComponentStyle: () => ({})
  };

  // Get component style from theme
  const itemStyle = themeContext.getComponentStyle?.("sidebar.item", variant) || {};

  // Combine passed style with theme style
  const combinedStyle = {
    ...itemStyle,
    ...style
  };

  // Use CSS module classes
  const itemClasses = cn(
    styles.sidebarItem,
    active && styles.sidebarItemActive,
    mode === "dark" ? styles.darkItem : styles.lightItem,
    className
  );

  // Determine if this is a link or button based on onClick
  const content = (
    <>
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      {!collapsed && <span className={styles.itemLabel}>{label}</span>}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        className={itemClasses}
        style={combinedStyle}
        onClick={onClick}
        variants={itemVariants}
        animate={active ? "active" : "inactive"}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.button>
    );
  } else {
    return (
      <motion.a
        href={href}
        className={itemClasses}
        style={combinedStyle}
        variants={itemVariants}
        animate={active ? "active" : "inactive"}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.a>
    );
  }
};

export default SidebarItem;
