import React from "react";
import styles from "../styles/sidebar.module.css";
import { SidebarContainerProps } from "../types"; // Import the aligned interface

const SidebarContainer: React.FC<SidebarContainerProps> = ({ skin, children }) => {
  // Inline styles derived from the skin
  const inlineStyles: React.CSSProperties = {
    backgroundColor: skin?.colors.surface.background, // Set the background color from the skin
    color: skin?.colors.surface.foreground, // Set the foreground color from the skin
    border: `1px solid ${skin?.colors.surface.border}`, // Set the border color
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Example fallback shadow
  };

  return (
    <div className={styles.sidebarContainer} style={inlineStyles}>
      {children} {/* Render the children passed to the container */}
    </div>
  );
};

export default SidebarContainer;
