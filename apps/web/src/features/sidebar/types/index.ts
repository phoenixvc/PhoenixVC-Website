
import { ComponentStateConfig, ComputedColorSet, ComputedComponentSet, ComputedSemanticSet, InteractiveStates } from "@/theme/types/mappings/base-mappings";

// Main SidebarProps interface
export interface SidebarProps {
  isOpen: boolean; // Determines if the sidebar is open
  onClose: () => void; // Function to close the sidebar
  children?: React.ReactNode; // Optional custom children (e.g., custom content)
  items: Array<SidebarItem | SidebarGroup | SidebarLink>; // Items can be either individual links or groups or items
  skin?: ComponentSkin; // The final appearance of the sidebar, using ComponentSkin
}

// Sidebar item type for individual links
export interface SidebarItem {
  type: "item" | "group" | "link";
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  children?: SidebarItem[];
  skin?: ComponentSkin;
}

// Sidebar group type for grouped links
export interface SidebarGroup {
  type: "group"; // Specifies this is a group
  label: string; // Label for the group
  icon?: React.ReactNode; // Optional icon for the group
  children: Array<SidebarItem>; // Array of child items within the group
  skin?: ComponentSkin; // The final appearance of the sidebar group
}

// Sidebar link type for external links
export interface SidebarLink {
  type: "link"; // Specifies this is a link
  label: string; // Label for the link
  href: string; // URL for the link
  icon?: React.ReactNode; // Optional icon for the link
  skin?: ComponentSkin; // The final appearance of the sidebar link
}

// Props for a group of sidebar items
export interface SidebarGroupProps {
  title: string; // Title of the group
  items: Array<SidebarItem>; // Array of item labels
  skin?: ComponentSkin; // The final appearance of the sidebar group
  mode?: "light" | "dark"
}

// Props for the sidebar container
export interface SidebarContainerProps {
  skin?: ComponentSkin; // The final appearance of the sidebar container
  children: React.ReactNode; // Content inside the container
}

// Props for individual sidebar items
export interface SidebarItemProps {
  label: string; // Label for the item
  skin?: ComponentSkin; // The final appearance of the sidebar item
  onClick?: () => void; // Optional click handler
  icon?: React.ReactNode; // Optional icon for the item

}

/**
 * Component skin configuration, representing the final appearance.
 */

export interface ComponentSkin {
  colors: {
    surface: SurfaceColors;
  };
  states: {
    interactive: InteractiveStates;
    component: ComponentStateConfig;
  };
  computed: ComputedSets;
}

export interface ComputedSets {
  colorSet: ComputedColorSet;
  semanticSet: ComputedSemanticSet;
  componentSet: ComputedComponentSet;
}

export interface SurfaceColors {
  background: string;
  foreground: string;
  border: string;
  elevation?: string;
  overlay?: string;
}
