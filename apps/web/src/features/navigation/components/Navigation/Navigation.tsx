import { useEffect, useState, MouseEvent, useCallback } from "react";
import { NavLink } from "../NavLink/NavLink";
import type { NavigationProps, NavigationItem } from "../../types";
import { NAVIGATION_ITEMS } from "../../constants";
import { twMerge } from "tailwind-merge";
import { useLocation } from "react-router-dom";
import styles from "./Navigation.module.css";

export const Navigation = ({
  items = NAVIGATION_ITEMS,
  onItemClick,
  className = "",
  variant = "header",
  activeSection: propActiveSection,
  onSectionChange,
}: NavigationProps) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>(() => {
    const hash = location.hash.replace("#", "");
    return hash || propActiveSection || "home";
  });

  // Listen to section visibility events (primary method)
  useEffect(() => {
    const handleSectionVisible = (event: Event) => {
      const customEvent = event as CustomEvent;
      const sectionId = customEvent.detail.id;
      setActiveSection(sectionId);
      onSectionChange?.(sectionId);

      // Update URL hash without triggering scroll
      const newUrl = `${window.location.pathname}#${sectionId}`;
      window.history.replaceState(null, "", newUrl);
    };

    window.addEventListener("sectionVisible", handleSectionVisible);
    return () => window.removeEventListener("sectionVisible", handleSectionVisible);
  }, [onSectionChange]);

  // Backup intersection observer
  useEffect(() => {
    const sectionIds = items
      .filter((item: NavigationItem) => item.type === "section")
      .map((item) => item.path.replace(/^\/?(#)?/, ""));

    const observer = new IntersectionObserver(
      (entries) => {
        // Filter for elements that are currently intersecting
        const visibleSections = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.id);

        if (visibleSections.length > 0) {
          // Get the first visible section
          const visibleSection = visibleSections[0];
          setActiveSection(visibleSection);
          onSectionChange?.(visibleSection);

          // Update URL hash without triggering scroll
          const newUrl = `${window.location.pathname}#${visibleSection}`;
          window.history.replaceState(null, "", newUrl);
        }
      },
      {
        threshold: [0.2, 0.5, 0.8],
        rootMargin: "-45% 0px -45% 0px"
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items, onSectionChange]);

  // Update active section when hash changes
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash) {
      setActiveSection(hash);
      onSectionChange?.(hash);
    }
  }, [location.hash, onSectionChange]);

  // Sync with prop changes
  useEffect(() => {
    if (propActiveSection && propActiveSection !== activeSection) {
      setActiveSection(propActiveSection);
    }
  }, [propActiveSection, activeSection]);

  const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>, item: NavigationItem) => {
    if (item.type === "section") {
      event.preventDefault();
      const targetId = item.reference || item.path.replace(/^\/?(#)?/, "");
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(targetId);
        onSectionChange?.(targetId);

        // Update URL hash without triggering scroll
        const newUrl = `${window.location.pathname}#${targetId}`;
        window.history.replaceState(null, "", newUrl);
      }
    }

    onItemClick?.(event);
  }, [onItemClick, onSectionChange]);

  const isItemActive = useCallback((item: NavigationItem) => {
    if (item.type === "section") {
      const sectionId = item.reference || item.path.replace(/^\/?(#)?/, "");
      return sectionId === activeSection;
    }
    return item.path === location.pathname;
  }, [activeSection, location.pathname]);

  return (
    <nav className={twMerge(styles.nav, className)} role="navigation" aria-label="Main navigation">
      {items.map((item) => (
        <NavLink
          key={item.path}
          {...item}
          isActive={isItemActive(item)}
          onClick={(e) => handleClick(e, item)}
          variant={variant}
        />
      ))}
    </nav>
  );
};
