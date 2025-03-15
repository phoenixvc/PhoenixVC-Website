// types.ts
import { ReactNode } from "react";

// Base interface for all sidebar items
interface SidebarItemBase {
  label: string;
  icon?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  active?: boolean; // Make active optional with default false
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
  title?: string; // Make title optional
  type: "group";
  children: SidebarItemType[];
}

// Union type for all sidebar items
export type SidebarItem = SidebarItemLink | SidebarItemButton | SidebarItemGroup;

// SidebarItemType can be a SidebarItem (not a string anymore)
export type SidebarItemType = SidebarItem;

// Define what a sidebar group is in the context of the sidebar component
export interface SidebarGroup {
  title?: string;
  items: SidebarItemLink[]; // Specifically use SidebarItemLink for items
}

// Props for the Sidebar component
export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDarkMode?: boolean;
  isMobile?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  onCollapse?: () => void;
  mode?: "light" | "dark";
}

// Props for the SidebarContainer component
export interface SidebarContainerProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: string;
  isOpen?: boolean;
  onClick?: () => void;
  mode?: "light" | "dark";
  collapsed?: boolean;
}

// Props for the SidebarGroup component
export interface SidebarGroupProps {
  title?: string;
  items: SidebarItemLink[]; // Use SidebarItemLink specifically
  mode?: "light" | "dark";
  variant?: string;
  collapsed?: boolean;
  isDarkMode?: boolean;
}

// Props for the SidebarItem component
export interface SidebarItemProps extends SidebarItemLink {
  style?: React.CSSProperties;
  className?: string;
  variant?: string;
  mode?: "light" | "dark";
  collapsed?: boolean;
}
