export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export interface SidebarLink {
  label: string;
  href: string;
  icon?: React.ReactNode; // If you want to include icons
}
