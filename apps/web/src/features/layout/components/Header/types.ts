export interface NavItem {
    label: string;
    href: string;
  }

  export interface HeaderProps {
    onMenuClick: () => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
    isSidebarCollapsed: boolean;
    gameMode: boolean;
    onGameModeToggle: () => void;
    debugMode?: boolean;
    onDebugModeToggle?: () => void;
  }
