# Phase 1c: Core Analysis & Identification

**Date:** 2025-05-23
**Analyzer:** Jules (AI Software Engineer)
**Scope:** Phase 1c (Bugs, UX, Performance, Refactoring) & Phase 1d (Specs)

## 1. Findings by Category

### 1.1 Bugs (≥ 7)
| ID | Severity | File/Location | Description | Impact |
|----|----------|---------------|-------------|--------|
| B1 | High | `apps/web/src/features/layout/components/Starfield/Starfield.tsx` | Double mouse event listeners were active (fixed in this phase). | Performance degradation, potential race conditions in state updates. |
| B2 | High | `Starfield.tsx` (Logic) | `isClicked` state could get stuck if mouse left screen. | Interactive elements (repulsion) remained active unintentionally. |
| B3 | Medium | `DebugControlsOverlay.tsx` | Debug Info overlapping with Controls UI on smaller screens or due to CSS positioning. | Poor DX, unreadable metrics. |
| B4 | Medium | `package.json` | Project version mismatch (v1.0.1 vs v2.0.0 in README). | Confusion during release management. |
| B5 | Medium | `apps/web/src/features/hero/components/Hero/Hero.tsx` | `HeroSkeleton` is imported but logic for `isLoading` prop usage is minimal/hardcoded. | Layout shift if data loading is introduced. |
| B6 | Low | `apps/web/src/theme/theme.css` | Hardcoded colors in some CSS variables vs Tailwind config. | Inconsistent theming if variables are overridden. |
| B7 | Low | `apps/web/src/features/layout/components/Starfield/types.ts` | Duplicate/Legacy types (e.g., `PortfolioProject` vs local definition). | Type confusion and maintenance overhead. |

### 1.2 UI/UX Improvements (≥ 7)
| ID | Priority | Description | Deviation/Note |
|----|----------|-------------|----------------|
| U1 | High | **Add Focus Trap to Modals** | Accessibility requirement (WCAG). Current implementation in `Dialog` needs verification. |
| U2 | High | **Keyboard Navigation for Starfield** | Canvas elements are not keyboard accessible. Needs `aria-label` or alternative nav. |
| U3 | Medium | **Loading States** | Skeleton loaders are present but transitions are abrupt. Add `AnimatePresence`. |
| U4 | Medium | **Theme Toggle Visibility** | Toggle is subtle. Needs better contrast or position for accessibility. |
| U5 | Medium | **404 Page** | `NotFound` component is generic. Needs to align with Starfield theme. |
| U6 | Low | **Scrollbar Styling** | Custom scrollbar in `theme.css` might not have sufficient contrast in all themes. |
| U7 | Low | **Mouse Trail** | Mouse trail effect (glow) is purely visual. Consider adding subtle feedback for clickable elements. |

**Note:** For UI/UX items, see Section 3 for Snapshot Test Specs.

### 1.3 Performance / Structural Improvements (≥ 7)
| ID | Impact | Description |
|----|--------|-------------|
| P1 | High | **Adaptive Performance** (Implemented) | Dynamically adjust star density/effects based on FPS. |
| P2 | High | **Canvas Rendering** | `useAnimationLoop` runs heavy calculations (connections) every frame. Throttling implemented but could be improved with Web Workers. |
| P3 | Medium | **Bundle Size** | `dist/assets/index-DVFfMn2z.js` is 647kB. Needs code splitting for `Starfield` logic vs React code. |
| P4 | Medium | **Event Listeners** | Global window listeners in `useMouseInteraction` should be scoped or debounced more aggressively. |
| P5 | Medium | **Object Allocation** | `animate.ts` creates new objects in some loops. Use object pooling for particles. |
| P6 | Low | **CSS Duplication** | Overlap between `tailwind.config.js` and `theme.css` variables. |
| P7 | Low | **Asset Optimization** | SVG icons in `lucide-react` are efficient, but custom SVGs need optimization. |

### 1.4 Refactoring Opportunities (≥ 7)
| ID | Effort | Description |
|----|--------|-------------|
| R1 | Medium | **Unify Mouse Logic** | Consolidate `Starfield.tsx` and `useMouseInteraction.ts` (Done). |
| R2 | Medium | **Type consolidation** | Move all shared types to `apps/web/src/types/shared.ts`. |
| R3 | Low | **Extract Constants** | Move physics constants (gravity, friction) to a config file. |
| R4 | High | **Component Composition** | `Starfield.tsx` is too large (800+ lines). Extract `CanvasLayer`, `OverlayLayer`. |
| R5 | Medium | **Hook Extraction** | Extract `usePerformanceMonitor` from `Starfield.tsx`. |
| R6 | Low | **Theme Logic** | Move `getThemeStyles` in `Hero.tsx` to `useTheme` hook. |
| R7 | Low | **Logger** | Replace `console.log` with a proper `logger` utility (mostly done, verify usage). |

### 1.5 New Features (3)
| Feature | Value | Feasibility |
|---------|-------|-------------|
| **Interactive Constellations** | Connect portfolio items into "constellations" based on tags/categories. | High (physics engine supports connections). |
| **Theme Designer UI** | A visual editor for the `theme.css` variables (exists as route, needs polish). | Medium. |
| **Cosmic Navigation** | "Zoom out" to see ecosystem view vs "Zoom in" to project details. | High (Camera logic exists). |

### 1.6 Missing Documentation (≥ 7)
1.  **Starfield Physics Model:** How `vx`, `vy`, `mass` interact.
2.  **Theme System Guide:** How to add a new theme (colors + variables).
3.  **Deployment Playbook:** Azure SWA specific configurations.
4.  **Performance Tuning:** How to adjust particle limits for mobile.
5.  **Component Storybook:** (Missing entirely).
6.  **Architecture Diagram:** Relationship between React and Canvas loop.
7.  **Contribution Guide:** Setup for local dev (mostly covered in README but needs details on "workspaces").

### 1.7 Incomplete Features & TODOs
- `apps/web/src/features/hero/TODO.md`: Mentions "Add more animations".
- `apps/api/package.json`: "test": "echo 'No tests yet...'".
- `Starfield.tsx`: "TODO: Refactor into smaller components" (Implied by size).
- `package.json`: "api:deploy": "TODO: cd apps/api && func..."

---

## 2. Prioritized Summary

| Priority | Item | Category | Effort |
|----------|------|----------|--------|
| **P0** | **Fix Mouse Interactions** | Bug | Low (Done) |
| **P0** | **Adaptive Performance** | Performance | Medium (Done) |
| **P1** | **Bundle Size (647kB chunk)** | Performance | High |
| **P1** | **Accessibility (Focus/Keyboard)** | UI/UX | Medium |
| **P2** | **Refactor Starfield.tsx** | Refactoring | High |
| **P2** | **Add Tests (API & UI)** | QA | Medium |
| **P3** | **Documentation** | Docs | Low |

---

## 3. UI Snapshot Audit Specs (#RUN_UI_SNAPSHOT_AUDIT)

### 3.1 Critical Flows
1.  **Landing Page Load**: Verify Hero section, Navigation, and Starfield background visibility.
2.  **Theme Toggle**: Verify visual changes when switching Light/Dark modes.
3.  **Project Hover**: Verify tooltip appears when hovering a star/project.
4.  **Mobile Menu**: Verify hamburger menu opens/closes on mobile viewport.

### 3.2 Playwright Spec (`tests/ui/snapshot.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Phoenix VC UI Snapshots', () => {

  test('Landing Page - Desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas[data-starfield="true"]');
    // Wait for animation to settle (optional, or disable animation via CSS)
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('landing-desktop.png');
  });

  test('Theme Toggle', async ({ page }) => {
    await page.goto('/');
    // Click theme toggle (assume aria-label="Toggle theme")
    await page.click('button[aria-label="Toggle theme"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('landing-dark-mode.png');
  });

  test('Project Tooltip Hover', async ({ page }) => {
    await page.goto('/');
    // Move mouse to center to trigger hover on a potential star
    // Note: This is flaky with random stars. Better to mock data or use a fixed star.
    await page.mouse.move(500, 300);
    await page.waitForSelector('[data-testid="project-tooltip"]', { timeout: 5000 }).catch(() => {});
    // We capture the whole page to see the tooltip context
    await expect(page).toHaveScreenshot('project-tooltip.png');
  });

  test('Mobile Menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.click('button[aria-label="Open menu"]');
    await expect(page).toHaveScreenshot('mobile-menu-open.png');
  });

});
```

### 3.3 Recommendation
- Install Playwright: `npm init playwright@latest`.
- Configure `playwright.config.ts` to use the local dev server (`http://localhost:5173`).
- Run `npx playwright test --update-snapshots` to generate baselines.
