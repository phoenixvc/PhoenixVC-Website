import { NavigationItemProps } from "../../types";
import { useTheme } from "@/theme";
import { twMerge } from "tailwind-merge";
import { LucideIcon } from "lucide-react"; // Changed from IconType
import React from "react";

type IconProp = LucideIcon | React.ReactNode | string | undefined;

interface ExtendedNavLinkProps extends Omit<NavigationItemProps, 'icon'> {
  isMobile?: boolean;
  variant?: 'header' | 'simple';
  isActive?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  icon?: IconProp;
}

// Type for aria-current
type AriaCurrent = 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' | boolean | undefined;

const renderIcon = (icon: IconProp) => {
  if (!icon) return null;

  if (typeof icon === 'string') {
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
}: ExtendedNavLinkProps) => {
  const { colorSchemeClasses } = useTheme();

  const baseStyles = "transition-colors duration-200 relative px-4 py-2";

  const variantStyles = {
    header: twMerge(
      isActive
        ? `${colorSchemeClasses.activeBg} ${colorSchemeClasses.activeText}`
        : `${colorSchemeClasses.hoverBg} ${colorSchemeClasses.text}`,
      isMobile && "w-full text-left"
    ),
    simple: colorSchemeClasses.text,
  };

  const linkProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
    href: path,
    onClick,
    className: twMerge(
      baseStyles,
      variantStyles[variant],
      isMobile && "w-full text-left"
    ),
    "aria-current": (isActive ? "page" : undefined) as AriaCurrent,
    ...(isExternal && {
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": `${label} (opens in new tab)`,
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
          className="absolute -bottom-1 left-1/2 w-2 h-2 bg-current rounded-full transform -translate-x-1/2"
          aria-hidden="true"
        />
      )}
    </a>
  );
};
