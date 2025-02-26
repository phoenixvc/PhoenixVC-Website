import { ReactNode } from "react";

export const CTAVariants = {
  primary: "primary",
  secondary: "secondary",
} as const;

export type CTAVariant = keyof typeof CTAVariants;

export interface CTAButtonProps {
  href: string;
  className?: string;
  children: ReactNode;
  variant?: CTAVariant;
  "aria-label"?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
}
