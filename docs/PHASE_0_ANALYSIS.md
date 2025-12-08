# Phase 0: Project Context & Design Analysis

**Date:** 2025-05-23
**Analyzer:** Jules (AI Software Engineer)
**Scope:** Phase 0 (Project Context) & Phase 0.5 (Design System & Visual Identity)

## 1. Project Context Verification

### 1.1 Overview
The project is a corporate website for **Phoenix VC**, a proprietary venture capital firm. The codebase is a monorepo containing a React frontend (`apps/web`) and an Azure Functions backend (`apps/api`).

### 1.2 Discrepancies & Findings
A comparison between the existing documentation (`docs/PROJECT_CONTEXT.md`, `README.md`) and the current codebase reveals the following discrepancies:

| Item | Documentation Claim | Current Implementation | Status |
|------|---------------------|------------------------|--------|
| **Project Version** | `README.md`: v2.0.0 (Enhanced) | `package.json`: v1.0.1 | ⚠️ Discrepancy |
| **Project Name** | `README.md`: Phoenix VC - Website | `package.json`: phoenixvc-modernized | ⚠️ Discrepancy |
| **Team Section** | `README.md`: "Added a new... Team & Advisors Section" | `App.tsx`: `LazyTeam` import is commented out. | ⚠️ Incomplete |
| **Careers/Jobs** | `PROJECT_CONTEXT.md`: Target User "Job Seekers" | No dedicated "Careers" page found. | ⚠️ Missing Feature |
| **Theme Designer** | Not mentioned | `/theme-designer` route exists as a feature. | ℹ️ Undocumented Feature |
| **Storybook** | `README.md`: Installation failed / Timeout | Not configured/running. | ⚠️ Technical Debt |

### 1.3 Verified Business Goals
- **Primary:** Showcase investment focus and portfolio.
- **Secondary:** Provide contact mechanism for entrepreneurs/partners.
- **Tertiary:** Demonstrate technical capability via a high-performance, modern web stack.

---

## 2. Design System & Visual Identity (Reverse-Engineered)

### 2.1 Design Token Specification (JSON)
The following JSON structure represents the *actual* design tokens extracted from the codebase (`theme.css`, `tailwind.config.js`). This serves as the "source of truth" for creating external design assets (Figma/Sketch).

```json
{
  "designSystem": {
    "name": "Phoenix VC Design System",
    "typography": {
      "fontFamily": {
        "primary": "Outfit, sans-serif"
      },
      "scale": {
        "h1": "text-4xl md:text-5xl lg:text-6xl",
        "h2": "text-3xl md:text-4xl",
        "h3": "text-2xl md:text-3xl",
        "body": "text-base"
      }
    },
    "spacing": {
      "radius": "0.5rem (8px)"
    },
    "themes": [
      {
        "name": "Classic (Base)",
        "mode": "light",
        "colors": {
          "primary": "hsl(222.2, 47.4%, 11.2%)",
          "secondary": "hsl(210, 40%, 96.1%)",
          "accent": "hsl(210, 40%, 96.1%)",
          "background": "hsl(210, 20%, 98%)",
          "foreground": "hsl(210, 20%, 15%)",
          "muted": "hsl(210, 40%, 96.1%)",
          "border": "hsl(220, 15%, 85%)",
          "destructive": "hsl(0, 84.2%, 60.2%)"
        }
      },
      {
        "name": "Phoenix",
        "mode": "light",
        "colors": {
          "primary": "hsl(32, 100%, 50%)",
          "secondary": "hsl(15, 23%, 42%)",
          "accent": "hsl(24, 96%, 60%)",
          "background": "hsl(255, 255%, 255%)"
        }
      },
      {
        "name": "Ocean",
        "mode": "light",
        "colors": {
          "primary": "hsl(59, 130%, 246%)",
          "secondary": "hsl(37, 99%, 235%)"
        }
      }
    ]
  }
}
```

### 2.2 Visual Identity Elements
- **Typography:** **Outfit** is used globally. It provides a modern, clean geometric sans-serif look.
- **Corner Radius:** Consistent `0.5rem` (8px) radius on buttons, cards, and inputs creates a soft, approachable feel.
- **Shadows:** Soft, diffused shadows (`0 0 15px rgba(0,0,0,0.1)`) are used to create depth without harsh borders.
- **Animation:** `framer-motion` is used for smooth transitions (e.g., page loads, hover states), reinforcing the "high-tech" brand value.

---

## 3. Design-Code Consistency Assessment

### 3.1 Detailed Audit
| Component / Token | Documentation (DESIGN_SYSTEM.md) | Implementation (Code) | Consistency Verdict |
|-------------------|----------------------------------|-----------------------|---------------------|
| **Theme System** | Describes "Classic", "Ocean", "Phoenix". | Implemented via CSS Variables in `theme.css`. | ✅ **High** |
| **Typography** | Font "Outfit". | Configured in `tailwind.config.js`. | ✅ **High** |
| **Buttons** | "Centralized, reusable Button". | `Button.tsx` exists, uses `cva` for variants. | ✅ **High** |
| **Iconography** | Mentions `Lucide React`. | Imports seen in components. | ✅ **High** |
| **Accessibility** | Mentions "focus trapping", "semantic HTML". | `Button.tsx` has `focus-visible` styles. `App.tsx` has `ScrollToHash`. | ⚠️ **Medium** (Needs verification of actual focus trap implementation in Modals). |
| **Color Values** | High-level description only. | Precise HSL values defined in `theme.css`. | ℹ️ **Gap** (Docs lack specifics, but code is precise). |

### 3.2 Key Findings
1.  **Strong Structural Foundation:** The implementation of the design system using CSS variables and Tailwind utilities is robust and scalable. The multi-theme support is well-architected.
2.  **Documentation Gap:** The `DESIGN_SYSTEM.md` is descriptive but lacks the *technical specification* (the exact color codes) needed for a designer to reproduce the system in Figma without looking at the code. The JSON above bridges this gap.
3.  **Component Library:** The component library seems nascent. Only `Button`, `Skeleton`, `Logo`, `Disclaimer`, and `DropdownMenu` were found in `components/ui`. More complex patterns (Cards, Forms) might be embedded in feature folders rather than the shared library.

---

## 4. Confidence Levels & Assumptions

- **Project Context:** **High Confidence.** The discrepancies are clear and the core business value is evident despite the version mismatch.
- **Design System:** **High Confidence.** The code is the source of truth and is well-structured.
- **Assumptions:**
    - I assume the `Team` section is commented out due to incompleteness or pending content, not a change in business goals.
    - I assume the `/theme-designer` is an internal tool for testing themes.
