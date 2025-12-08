export interface NavItem {
  label: string;
  href: string;
}

export interface HeaderProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  isSidebarCollapsed: boolean;
  isSidebarOpen?: boolean;
  sidebarWidth?: number;
  isMobile?: boolean;
  gameMode: boolean;
  onGameModeToggle: () => void;
  debugMode?: boolean;
  onDebugModeToggle?: () => void;
}
