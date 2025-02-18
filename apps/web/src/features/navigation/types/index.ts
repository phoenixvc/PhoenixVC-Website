// features/navigation/types/index.ts

/**
 * Represents a navigation item with its properties
 */
export interface NavigationItem {
    /** The URL or anchor link */
    href: string;
    /** Display text for the link */
    label: string;
    /** Optional icon identifier */
    icon?: string;
}

/**
 * Props for the NavLink component
 */
export interface NavLinkProps extends NavigationItem {
    /** Optional click handler */
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    /** Whether this link represents the current active section */
    isActive?: boolean;
    /** Whether this link is rendered in mobile view */
    isMobile?: boolean;
    /** Visual variant of the link */
    variant?: 'header' | 'simple';
    colorScheme?: string;
}

/**
 * Props for the main Navigation component
 */
export interface NavigationProps {
    /** Array of navigation items to display */
    items?: readonly NavigationItem[];
    /** Optional click handler for navigation items */
    onItemClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    /** Optional CSS classes */
    className?: string;
    /** Visual variant of the navigation */
    variant?: 'header' | 'simple';
    /** Currently active section identifier */
    activeSection?: string;
}

/**
 * Props for the MobileMenu component
 */
export interface MobileMenuProps {
    /** Whether the mobile menu is currently open */
    isOpen: boolean;
    /** Handler to close the mobile menu */
    onClose: () => void;
    /** Navigation items to display in mobile menu */
    items: readonly NavigationItem[];
    /** Currently active section identifier */
    activeSection?: string;
}
