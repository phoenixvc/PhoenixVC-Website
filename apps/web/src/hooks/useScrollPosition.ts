import { useState, useEffect } from "react";

export const useScrollPosition = (threshold = 20): boolean => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect((): (() => void) => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll);
    return (): void => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
};
