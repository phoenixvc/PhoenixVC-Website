export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}
