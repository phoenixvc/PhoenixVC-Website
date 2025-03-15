// features/sidebar/components/SidebarGroup.tsx
import React from "react";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import { SidebarGroupProps, SidebarItemLink } from "../types";
import styles from "../styles/sidebar.module.css";

const SidebarGroup: React.FC<SidebarGroupProps> = ({
  title = "",
  items,
  mode = "light",
  variant = "default",
  collapsed = false,
  isDarkMode = true
}) => {
  const groupTitleClass = cn(
    styles.groupTitle,
    collapsed ? styles.groupTitleCollapsed : ""
  );

  return (
    <div className={styles.sidebarGroup}>
      {title && <div className={groupTitleClass}>{title}</div>}
      <div className={styles.itemsContainer}>
        {items.map((item, index) => (
          <SidebarItem
            key={index}
            label={item.label}
            icon={item.icon}
            href={item.href}
            active={item.active || false}
            onClick={item.onClick}
            mode={mode}
            variant={variant}
            collapsed={collapsed}
            type="link"
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarGroup;
