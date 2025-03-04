// types.ts
import { ReactNode } from "react";

// Base interface for all sidebar items
interface SidebarItemBase {
  label: string;
  icon?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

// Link item
export interface SidebarItemLink extends SidebarItemBase {
  type: "link";
  href: string;
  target?: string;
}

// Button item
export interface SidebarItemButton extends SidebarItemBase {
  type: "button" | "item";
  onClick?: () => void;
}

// Group item
export interface SidebarItemGroup extends SidebarItemBase {
  type: "group";
  children?: SidebarItemType[];
}

// Union type for all sidebar items
export type SidebarItem = SidebarItemLink | SidebarItemButton | SidebarItemGroup;

// SidebarItemType can be a string or one of the sidebar item types
export type SidebarItemType = string | SidebarItem;

// Props for the Sidebar component
export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  items?: SidebarItemType[];
  style?: React.CSSProperties;
  className?: string;
  variant?: string;
}

// Props for the SidebarContainer component
export interface SidebarContainerProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: string;
  isOpen?: boolean;
  onClick?: () => void;
}

// Props for the SidebarGroup component
export interface SidebarGroupProps {
  title: string;
  items: SidebarItemType[];
  style?: React.CSSProperties;
  className?: string;
  mode?: string;
  variant?: string;
}

export interface SidebarItemProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: string;
}

/**
 * Component skin configuration, representing the final appearance.
 */

// export interface ComponentSkin {
//   colors: {
//     surface: SurfaceColors;
//   };
//   states: {
//     interactive: InteractiveStates;
//     component: ComponentStateConfig;
//   };
//   computed: ComputedSets;
// }
