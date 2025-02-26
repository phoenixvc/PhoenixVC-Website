// features/navigation/types/index.ts

/**
 * Defines the type of navigation item
 */
export type NavigationType = "section" | "page";

/**
 * Defines the visual variant of navigation items
 */
export type NavigationVariant = "header" | "simple";

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
    /** Optional icon identifier */
    icon?: string;
    /** Whether this item should open in a new tab */
    isExternal?: boolean;
    reference?: string;

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
}

export interface MobileMenuProps extends NavigationProps {
    /** Whether the mobile menu is currently open */
    isOpen: boolean;
    /** Handler for closing the mobile menu */
    onClose: () => void;
    /** Whether to show the mobile indicator */
    isMobile?: boolean;
  }
