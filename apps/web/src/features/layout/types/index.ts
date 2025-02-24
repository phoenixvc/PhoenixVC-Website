// features/layout/types/index.ts
import { ThemeColorScheme, ThemeConfig } from '@/theme';
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
  colorScheme?: ThemeColorScheme;
}

export interface FooterProps {
  colorScheme?: ThemeColorScheme;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  colorScheme?: ThemeColorScheme;
}

export interface NavigationProps {
  items?: readonly NavigationItem[];
  onItemClick?: () => void;
  className?: string;
  colorScheme?: ThemeColorScheme;
  variant?: 'header' | 'simple';
  activeSection?: string;
}
