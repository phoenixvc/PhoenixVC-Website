// features/hero/types/index.ts
import { Variants } from 'framer-motion';

export interface HeroAnimations {
  container: Variants;
  item: Variants;
}

export interface CtaConfig {
  text: string;
  href: string;
}

export interface HeroProps {
  title?: string;
  subtitle?: string;
  primaryCta?: CtaConfig;
  secondaryCta?: CtaConfig;
  isLoading?: boolean;
  className?: string;
}

export type HeroLinks = '#investment' | '#contact';
