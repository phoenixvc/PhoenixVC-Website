/**
 * useProjectHoverState - Hover and pinned state management for projects/suns
 *
 * This hook manages:
 * 1. Project tooltip hover state (HoverInfo)
 * 2. Pinned projects (docked tooltips)
 * 3. Sun hover state for focus areas
 * 4. Focused sun state (zoom target)
 * 5. Pin/unpin callbacks
 *
 * Single Responsibility: Manage all hover-related state for cosmic objects
 */

import {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { HoverInfo, PortfolioProject } from "../types";
import { SunInfo } from "../sunTooltip";

export interface ProjectHoverStateConfig {
  /** Maximum number of pinned projects (default: 5) */
  maxPinnedProjects?: number;
}

export interface ProjectHoverStateResult {
  // Project tooltip state
  hoverInfo: HoverInfo;
  setHoverInfo: Dispatch<SetStateAction<HoverInfo>>;

  // Pinned projects
  pinnedProjects: PortfolioProject[];
  handlePinProject: (project: PortfolioProject) => void;
  handleUnpinProject: (projectId: string) => void;
  handleUnpinAll: () => void;

  // Sun hover state
  hoveredSun: SunInfo | null;
  setHoveredSun: Dispatch<SetStateAction<SunInfo | null>>;
  hoveredSunId: string | null;
  setHoveredSunId: Dispatch<SetStateAction<string | null>>;

  // Focused sun (zoom target)
  focusedSunId: string | null;
  setFocusedSunId: Dispatch<SetStateAction<string | null>>;
}

const DEFAULT_CONFIG: Required<ProjectHoverStateConfig> = {
  maxPinnedProjects: 5,
};

/**
 * Hook for managing project and sun hover/pinned state
 */
export function useProjectHoverState(
  config: ProjectHoverStateConfig = {},
): ProjectHoverStateResult {
  const { maxPinnedProjects } = { ...DEFAULT_CONFIG, ...config };

  // Project hover state
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({
    project: null,
    x: 0,
    y: 0,
    show: false,
  });
  const [pinnedProjects, setPinnedProjects] = useState<PortfolioProject[]>([]);

  // Sun hover state for focus area suns
  const [hoveredSun, setHoveredSun] = useState<SunInfo | null>(null);
  const [hoveredSunId, setHoveredSunId] = useState<string | null>(null);

  // Focused sun state - when user clicks on a focus area, we scope the view
  const [focusedSunId, setFocusedSunId] = useState<string | null>(null);

  /**
   * Pin a project to the dock (max limit enforced)
   */
  const handlePinProject = useCallback(
    (project: PortfolioProject): void => {
      setPinnedProjects((prev) => {
        // Prevent duplicates
        if (prev.some((p) => p.id === project.id)) return prev;
        // Limit number of pinned projects
        if (prev.length >= maxPinnedProjects) return prev;
        return [...prev, project];
      });
      // Hide the floating tooltip so the user can immediately hover other items
      setHoverInfo({ project: null, x: 0, y: 0, show: false });
    },
    [maxPinnedProjects],
  );

  /**
   * Unpin a specific project
   */
  const handleUnpinProject = useCallback((projectId: string): void => {
    setPinnedProjects((prev) => prev.filter((p) => p.id !== projectId));
  }, []);

  /**
   * Unpin all projects
   */
  const handleUnpinAll = useCallback((): void => {
    setPinnedProjects([]);
  }, []);

  return {
    // Project state
    hoverInfo,
    setHoverInfo,
    pinnedProjects,
    handlePinProject,
    handleUnpinProject,
    handleUnpinAll,

    // Sun state
    hoveredSun,
    setHoveredSun,
    hoveredSunId,
    setHoveredSunId,

    // Focus state
    focusedSunId,
    setFocusedSunId,
  };
}
