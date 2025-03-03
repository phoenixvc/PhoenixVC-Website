// Example component using the hook
import { useComponentTheme } from "@/theme/core/useComponentTheme";
import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  onClick,
  disabled
}) => {
  const { getComponentStyles, getComponentClasses } = useComponentTheme();

  // Get the appropriate state based on disabled prop
  const state = disabled ? "disabled" : "default";

  // Get styles for the current state
  const styles = getComponentStyles("button", variant, state);

  // Get classes for the component
  const className = getComponentClasses("button", variant);

  return (
    <button
      className={className}
      style={styles}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
