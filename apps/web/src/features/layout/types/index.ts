// features/layout/types/index.ts
import { ColorScheme, ThemeConfig } from '@/theme/types';
import { ReactNode } from 'react';

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
  colorScheme?: ColorScheme;
}

export interface FooterProps {
  colorScheme?: ColorScheme;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  colorScheme?: ColorScheme;
}

export interface NavigationProps {
  items?: readonly NavigationItem[];
  onItemClick?: () => void;
  className?: string;
  colorScheme?: ColorScheme;
  variant?: 'header' | 'simple';
  activeSection?: string;
}
