// features/layout/types/index.ts
import { ThemeName, ThemeConfig } from "@/theme";
import { ReactNode } from "react";

export interface NavigationItem {
  readonly href: string;
  readonly label: string;
  readonly icon?: string;
}

export interface LayoutProps {
  children: ReactNode;
  initialConfig?: Partial<ThemeConfig>;
}

export interface HeaderProps {
  colorScheme?: ThemeName;
}

export interface FooterProps {
  colorScheme?: ThemeName;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  colorScheme?: ThemeName;
}

export interface NavigationProps {
  items?: readonly NavigationItem[];
  onItemClick?: () => void;
  className?: string;
  colorScheme?: ThemeName;
  variant?: "header" | "simple";
  activeSection?: string;
}
