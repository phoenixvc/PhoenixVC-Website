// features/navigation/types/index.ts
import { LucideIcon } from "lucide-react";
import React from "react";

/**
 * Type for icon props that can be a Lucide icon, React node, string, or undefined
 */
export type IconProp = LucideIcon | React.ReactNode | string | undefined;

/**
 * Defines the type of navigation item
 */
export type NavigationType = "section" | "page";

/**
 * Defines the visual variant of navigation items
 */
export type NavigationVariant = "header" | "simple" | string;

/**
 * Base navigation item interface
 */
export interface NavigationItem {
    /** The path or section identifier */
    path: string;
    /** Display text for the navigation item */
    label: string;
    /** Whether this is a section on the landing page */
    type: NavigationType;
    /** Optional icon identifier or component */
    icon?: IconProp;
    /** Whether this item should open in a new tab */
    isExternal?: boolean;
    /** Optional reference identifier */
    reference?: string;
    /** Optional style properties */
    style?: React.CSSProperties;
}

/**
 * Props for the Navigation component
 */
export interface NavigationProps {
    /** Array of navigation items to display */
    items: NavigationItem[];
    /** Optional click handler for navigation items */
    onItemClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    /** Optional CSS classes */
    className?: string;
    /** Visual variant of the navigation */
    variant?: NavigationVariant;
    /** Currently active section identifier */
    activeSection?: string;
    /** Handler for section changes */
    onSectionChange?: (section: string) => void;
    /** Optional style properties */
    style?: React.CSSProperties;
}

/**
 * Props for individual navigation items
 */
export interface NavigationItemProps extends NavigationItem {
    /** Optional click handler */
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    /** Whether this item is currently active */
    isActive?: boolean;
    /** Visual variant inherited from parent navigation */
    variant?: NavigationVariant;
    /** Optional CSS classes */
    className?: string;
    /** Optional style properties */
    style?: React.CSSProperties;
}

/**
 * Extended props for NavLink component
 */
export interface ExtendedNavLinkProps extends Omit<NavigationItemProps, "icon"> {
    /** Whether this is displayed in mobile view */
    isMobile?: boolean;
    /** Visual variant of the link */
    variant?: NavigationVariant;
    /** Whether this link is currently active */
    isActive?: boolean;
    /** Optional click handler */
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    /** Icon component or identifier */
    icon?: IconProp;
    /** Optional CSS classes */
    className?: string;
    /** Optional style properties */
    style?: React.CSSProperties;
}

/**
 * Props for the MobileMenu component
 */
interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: {
      path: string;
      label: string;
    }[];
    className?: string;
  }

