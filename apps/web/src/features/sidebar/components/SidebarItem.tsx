import React from "react";
import { SidebarItemProps } from "../types";

const SidebarItem: React.FC<SidebarItemProps> = ({ label, skin, onClick, icon }) => {
  return (
    <div
      className="sidebar-item"
      onClick={onClick} // Safely use onClick
      style={{
        background: skin?.colors.surface.background,
        color: skin?.colors.surface.foreground,
        border: `1px solid ${skin?.colors.surface.border}`,
      }}
    >
      {icon && <span className="sidebar-item-icon">{icon}</span>}
      <span className="sidebar-item-label">{label}</span>
    </div>
  );
};

export default SidebarItem;
