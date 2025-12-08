import { useTheme } from "@/theme";
import { cn } from "@/lib/utils"; // Assuming you have a utility function like this
import { LucideIcon } from "lucide-react";
import React from "react";
import { ExtendedNavLinkProps } from "../../types";

type IconProp = LucideIcon | React.ReactNode | string | undefined;

// Type for aria-current
type AriaCurrent =
  | "page"
  | "step"
  | "location"
  | "date"
  | "time"
  | "true"
  | "false"
  | boolean
  | undefined;

const renderIcon = (icon: IconProp): React.ReactElement | null => {
  if (!icon) return null;

  if (typeof icon === "string") {
    // If icon is a string, you might want to map it to a Lucide icon
    return null; // Or handle string-based icons differently
  }

  if (React.isValidElement(icon)) {
    return icon;
  }

  // If icon is a Lucide icon component
  const IconComponent = icon as LucideIcon;
  return <IconComponent size={20} />;
};

export const NavLink = ({
  path,
  label,
  icon,
  isExternal,
  onClick,
  isActive = false,
  variant = "header",
  isMobile = false,
  className,
  style,
}: ExtendedNavLinkProps): React.ReactElement => {
  const themeContext = useTheme();
  const { themeName: _themeName } = themeContext;

  // Get component styles from the theme system
  const navLinkStyle =
    themeContext.getComponentStyle?.("navLink", variant) || {};
  const activeStyle = isActive
    ? themeContext.getComponentStyle?.("navLink", "${variant}-active") || {}
    : {};

  // Get specific CSS variables if needed
  const transitionDuration =
    themeContext.getCssVariable?.("theme-transition-duration") || "200ms";

  // Combine passed style with theme style
  const combinedStyle = {
    ...navLinkStyle,
    ...activeStyle,
    ...style,
    transitionDuration,
  };

  // Base classes that don't depend on theme
  const baseClasses = "relative px-4 py-2 transition-colors";

  // Mobile-specific classes
  const mobileClasses = isMobile ? "w-full text-left" : "";

  // Generate theme-specific class
  const themeClass =
    "theme-${themeName}-navLink-${variant}${isActive ? '-active' : ''}";

  const linkProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
    href: path,
    onClick,
    className: cn(baseClasses, mobileClasses, themeClass, className),
    style: combinedStyle,
    "aria-current": (isActive ? "page" : undefined) as AriaCurrent,
    ...(isExternal && {
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "${label} (opens in new tab)",
    }),
  };

  return (
    <a {...linkProps}>
      {icon && (
        <span className="mr-2 inline-flex items-center" aria-hidden="true">
          {renderIcon(icon)}
        </span>
      )}
      {label}
      {isActive && variant === "header" && (
        <span
          className={cn(
            "absolute -bottom-1 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2",
            "theme-${themeName}-navLink-indicator",
          )}
          style={{
            backgroundColor: "currentColor",
            ...(themeContext.getComponentStyle?.(
              "navLinkIndicator",
              "default",
            ) || {}),
          }}
          aria-hidden="true"
        />
      )}
    </a>
  );
};
