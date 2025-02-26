// features/contact/animations/index.ts
import { ContactAnimations } from "../types";
import { ANIMATION_DURATION } from "../constants";

export const contactAnimations: ContactAnimations = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_DURATION.container,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_DURATION.item,
        ease: "easeOut"
      }
    }
  }
};
