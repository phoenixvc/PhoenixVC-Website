// types.ts
import { ReactNode } from "react";

// Base interface for all sidebar items
interface SidebarItemBase {
  label: string;
  icon?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  active: boolean;
  onClick?: () => void;
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
  title: string;
  type: "group";
  children?: SidebarItemType[];
}

export interface SidebarGroup {
  title?: string;
  items: (SidebarItem | string)[];
}

// Union type for all sidebar items
export type SidebarItem = SidebarItemLink | SidebarItemButton | SidebarItemGroup;

// SidebarItemType can be a string or one of the sidebar item types
export type SidebarItemType = string | SidebarItem;

// Props for the Sidebar component
export interface SidebarProps {
  groups?: SidebarGroup[];
  style?: React.CSSProperties;
  className?: string;
  mode?: "light" | "dark";
  variant?: string;
  collapsed?: boolean;
  onClose?: () => void;
  isOpen?: boolean;
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
  title?: string;
  items: SidebarItemType[];
  style?: React.CSSProperties;
  className?: string;
  mode?: string;
  variant?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarItemProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: string;
  active: boolean;
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
