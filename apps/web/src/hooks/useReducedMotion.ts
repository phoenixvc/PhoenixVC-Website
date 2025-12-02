// hooks/useReducedMotion.ts
// Hook to detect user's reduced motion preference for accessibility
import { useState, useEffect } from "react";

/**
 * Detects if the user prefers reduced motion
 * Returns true if the user has requested reduced motion in their system settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") return false;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery.matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns motion-safe animation variants
 * When reduced motion is preferred, animations are disabled
 */
export function useMotionSafe<T extends Record<string, unknown>>(
  variants: T,
  reducedVariants?: T
): T {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    // Return reduced variants or empty/instant animations
    return reducedVariants ?? ({
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    } as unknown as T);
  }

  return variants;
}

export default useReducedMotion;
