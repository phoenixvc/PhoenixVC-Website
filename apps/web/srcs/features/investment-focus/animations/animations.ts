// features/investment-focus/animations/index.ts
import { containerVariants, itemVariants } from "@/animations/variants";
import { Variants } from "framer-motion";

// TODO: Production hardening:
// 1. Create a more specific `cardVariants` in the central animation file.
// 2. Add a centralized `iconVariants` for hover effects.

const cardVariants: Variants = {
  ...itemVariants,
  hover: {
    y: -8,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const iconVariants: Variants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export const investmentFocusAnimations = {
  container: containerVariants,
  header: itemVariants,
  card: cardVariants,
  icon: iconVariants,
};
