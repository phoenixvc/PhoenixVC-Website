# Design System & Visual Identity

This document outlines the design system reverse-engineered from the project's theme files. It serves as a foundational guide for maintaining visual consistency and brand coherence across the Phoenix VC website.

## 1. Color System

The project uses a sophisticated, multi-theme color system defined in `apps/web/src/theme/theme.css`. It includes a base theme ("Classic") and several alternative themes, each with light and dark modes.

### Core Design Tokens (Classic Theme)

These are the foundational colors used in the default theme.

**Light Mode:**
- `background`: `hsl(210 20% 98%)`
- `foreground`: `hsl(210 20% 15%)`
- `primary`: `hsl(222.2 47.4% 11.2%)`
- `primary-foreground`: `hsl(210 40% 98%)`
- `secondary`: `hsl(210 40% 96.1%)`
- `accent`: `hsl(210 40% 96.1%)`
- `destructive`: `hsl(0 84.2% 60.2%)`
- `border`: `hsl(220 15% 85%)`

**Dark Mode:**
- `background`: `hsl(222.2 84% 4.9%)`
- `foreground`: `hsl(210 40% 98%)`
- `primary`: `hsl(210 40% 98%)`
- `primary-foreground`: `hsl(222.2 47.4% 11.2%)`
- `secondary`: `hsl(217.2 32.6% 17.5%)`
- `accent`: `hsl(217.2 32.6% 17.5%)`
- `destructive`: `hsl(0 62.8% 30.6%)`
- `border`: `hsl(220 30% 20%)`

### Alternative Themes

The application supports multiple alternative themes, each with a distinct color palette for both light and dark modes.

| Theme     | Primary (Light)              | Primary (Dark)               |
|-----------|------------------------------|------------------------------|
| **Ocean**   | `rgb(59 130 246)`            | `rgb(96 165 250)`            |
| **Lavender**| `rgb(147 51 234)`            | `rgb(168 85 247)`            |
| **Phoenix** | `hsl(32 100% 50%)`           | `hsl(24 96% 60%)`            |
| **Forest**  | `hsl(120 40% 35%)`           | `hsl(120 40% 55%)`           |
| **Cloud**   | `hsl(222.2 47.4% 11.2%)`     | `hsl(210 40% 98%)`           |

## 2. Typography

- **Primary Font:** The primary font used across the application is **'Outfit'**.
- **Smoothing:** Fonts are anti-aliased for better readability (`-webkit-font-smoothing: antialiased`).

### Typographic Scale

The CSS defines a clear typographic hierarchy for headings:
- **h1:** `text-4xl` (font-size: 2.25rem), `font-bold`. Responsive up to `text-6xl`.
- **h2:** `text-3xl` (font-size: 1.875rem), `font-bold`. Responsive up to `text-4xl`.
- **h3:** `text-2xl` (font-size: 1.5rem), `font-bold`. Responsive up to `text-3xl`.

## 3. Spacing & Radius

- **Border Radius:** A consistent border radius token is defined: `--radius: 0.5rem;`. This is used for elements like cards and inputs to ensure a uniform look and feel.

## 4. Shadows & Effects

- **Shadows:** The system defines a standard shadow token: `--shadow: 0 0 15px rgba(0, 0, 0, 0.1);`. The dark mode variant is darker for better contrast.
- **Backdrop Blur:** A backdrop blur effect is available: `--backdrop-blur: 4px;` (8px in dark mode).

This initial documentation captures the core elements of the design system. It will be used as the benchmark for the UI/UX consistency assessment in the next phase of the analysis.
