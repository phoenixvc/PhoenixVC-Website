# Theme Components

The **components** folder contains all interfaces and types related to the theme’s component styling and color tokens. This directory defines both foundational (base) color definitions and extended, component‐specific design tokens that are used throughout the UI. It also includes media query definitions for responsive behavior.

---

## Table of Contents

- [Theme Components](#theme-components)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Directory Structure](#directory-structure)
  - [Module Descriptions](#module-descriptions)
    - [Media Queries (`media.ts`)](#media-queries-mediats)
    - [Base Colors (`base-colors.ts`)](#base-colors-base-colorsts)
    - [Component Tokens (`component-tokens.ts`)](#component-tokens-component-tokensts)
  - [Usage](#usage)
  - [Additional Recommendations](#additional-recommendations)

---

## Overview

The components directory provides a centralized location for all component-related design tokens and styling interfaces. It ensures that:

- **Media Queries** are defined to support responsive designs.
- **Base Colors** (formerly known as component-colors) encapsulate the low-level, foundational color definitions and interactive state structures for components.
- **Component Tokens** extend these base definitions into full-featured, component-specific color sets for inputs, buttons, navigation, tables, charts, modals, cards, forms, and more.

This clear separation helps maintain consistency across the UI while keeping the definitions modular and maintainable.

---

## Directory Structure

```text
/theme/types/component
├── index.ts              // Barrel file that re-exports all component modules
├── media.ts              // Media query definitions for responsive design
├── base-colors.ts        // Foundational component color definitions and interactive states
└── component-tokens.ts   // Extended, component-specific color tokens and design tokens
```

---

## Module Descriptions

### Media Queries (`media.ts`)

- **Purpose:**
  Defines the default media query strings used to detect dark mode, light mode, and reduced motion preferences.
- **Key Interface:**
  - `ThemeMediaQueries` – Contains properties for `dark`, `light`, and `reducedMotion` media queries, with clear documentation on defaults.

### Base Colors (`base-colors.ts`)

- **Purpose:**
  Provides the low-level, foundational color definitions for components. This includes:
  - **ComponentColorSet:** A base interface for common component color properties.
  - **InteractiveComponentSet & InteractiveStates:** Definitions for interactive states (hover, active, focus, disabled) that can be reused by component tokens.
- **Benefits:**
  Centralizes the raw color definitions and ensures consistency in the building blocks for component tokens.

### Component Tokens (`component-tokens.ts`)

- **Purpose:**
  Extends the base color definitions from `base-colors.ts` to define full design tokens for specific components (e.g., inputs, buttons, navigation, tables, charts, modals, cards, and forms).
- **Key Interfaces:**
  - **InputComponentColorSet:** Colors for form inputs, including label, helper, icon states, and variants.
  - **ButtonComponentColorSet:** Colors for buttons, including state variations, size variations, and icon groups.
  - **NavigationComponentColorSet:** Extended tokens for navigation elements, including states, indicators, icons, badges, dropdowns, and mobile settings.
  - **TableComponentColorSet:** Defines colors for table headers, rows, cells, pagination, and additional states.
  - **ChartComponentColorSet:** Extended tokens for charts with palettes, grid, axis, labels, tooltips, legends, patterns, and animations.
  - **ModalComponentColorSet, CardComponentColorSet, FormColorSet:** Tokens for modals, cards, and forms respectively.
- **Benefits:**
  These tokens allow for consistent theming across different UI components while enabling component-specific customization.

---

## Usage

Import the component tokens and media query definitions via the barrel file. For example:

```typescript
import { ThemeMediaQueries, ComponentColorSet, InputComponentColorSet } from '@/types/component';
```

This enables you to access media queries, base colors, and component-specific tokens throughout your UI code.

---

## Additional Recommendations

- **Consistency & Maintainability:**
  By separating base definitions from extended component tokens, you can update core color logic without affecting high-level component tokens.

- **Modular Imports:**
  Use the barrel file (`index.ts`) to simplify import paths and ensure that updates to individual modules are automatically reflected.

- **Future Extensions:**
  If more component families are added, consider further subdividing the tokens (e.g., creating subfolders for forms, navigation, etc.) to maintain clarity.

This structure provides a robust and flexible foundation for theming your UI components while keeping the definitions organized and easy to manage.
