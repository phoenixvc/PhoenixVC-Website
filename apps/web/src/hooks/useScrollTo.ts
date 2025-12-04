// hooks/useScrollTo.ts
import { useCallback } from "react";

/**
 * useScrollTo - A hook for smooth scrolling to elements
 * Returns a function that scrolls to an element by its ID
 */
export const useScrollTo = (): ((target: string) => void) => {
  const scrollTo = useCallback((target: string) => {
    // Remove leading # if present
    const elementId = target.startsWith("#") ? target.slice(1) : target;
    
    const element = document.getElementById(elementId);
    
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // If element not found, try to find it as a section
      const section = document.querySelector(`[id="${elementId}"]`);
      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, []);

  return scrollTo;
};

export default useScrollTo;
