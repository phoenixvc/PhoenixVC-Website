import { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export interface NavLinkProps extends NavItem {
  onClick?: () => void;
}
