export interface NavItem {
    href: string;
    label: string;
  }

  export interface NavLinkProps extends NavItem {
    onClick?: () => void;
  }
