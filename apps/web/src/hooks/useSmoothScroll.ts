// hooks/useSmoothScroll.ts
import { useEffect } from "react";

export const useSmoothScroll = (): void => {
  useEffect((): (() => void) => {
    const handleAnchorClick = (e: Event): void => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash) {
        e.preventDefault();
        const element = document.querySelector(target.hash);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    };

    const anchors = document.querySelectorAll("a[href^=\"#\"]");
    anchors.forEach((anchor): void => {
      anchor.addEventListener("click", handleAnchorClick);
    });

    return (): void => {
      anchors.forEach((anchor): void => {
        anchor.removeEventListener("click", handleAnchorClick);
      });
    };
  }, []);
};
