import React from "react";
import SidebarItem from "./SidebarItem";
import { SidebarGroupProps } from "../types";

const SidebarGroup: React.FC<SidebarGroupProps> = ({ title, items, skin }) => {
  // Inline styles derived from the skin (with fallback values)
  const inlineStyles: React.CSSProperties = {
    color: skin?.colors.surface.foreground || "#000", // Fallback to black if skin is undefined
  };

  return (
    <div
      // Uncomment and adjust styles if needed
      // className={`${styles.sidebarGroup} ${
      //   mode === "dark" ? styles.darkMode : styles.lightMode
      // }`}
    >
      <h3 style={inlineStyles}>{title}</h3>
      <ul>
        {items.map((item, index) => {
          if (typeof item === "string") {
            return (
              <li
                key={index}
                style={{
                  color: skin?.colors.surface.foreground || "#000", // Fallback to black
                }}
              >
                {item}
              </li>
            );
          }

          return (
            <SidebarItem
              key={index}
              label={item.label}
              skin={skin} // Pass `skin`, even if undefined
              onClick={item.onClick}
              icon={item.icon}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default SidebarGroup;
