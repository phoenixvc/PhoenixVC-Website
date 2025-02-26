# Theme Mappings

The **mappings** folder provides the configuration and transformation contracts that connect design tokens (such as colors, typography, spacing, and component states) with the generated CSS variables and runtime theme settings. This folder is essential for bridging the gap between high‐level theme definitions and the actual style output used in the UI.

> **Note:** Some mapping interfaces (e.g. for storage, system, and state) are used by both the core and component layers to ensure consistency across the theme.

---

## Table of Contents

- [Theme Mappings](#theme-mappings)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Directory Structure](#directory-structure)
  - [Module Descriptions](#module-descriptions)
    - [Variable Mappings (`variable-mappings.ts`)](#variable-mappings-variable-mappingsts)
    - [Typography Mappings (`typography-mappings.ts`)](#typography-mappings-typography-mappingsts)
    - [System Mappings (`system-mappings.ts`)](#system-mappings-system-mappingsts)
    - [State Mappings (`state-mappings.ts`)](#state-mappings-state-mappingsts)
    - [Component Variants (`component-variants.ts`)](#component-variants-component-variantsts)
    - [Color Mappings (`color-mappings.ts`)](#color-mappings-color-mappingsts)
    - [Base Mappings (`base-mappings.ts`)](#base-mappings-base-mappingsts)
  - [Subfolder: Component Mappings](#subfolder-component-mappings)
  - [Usage](#usage)
  - [Additional Recommendations](#additional-recommendations)

---

## Overview

The mappings folder defines the structure and operations for transforming design tokens into CSS variables and other theme artifacts. It organizes theme data into logical sections including:

- **Variable Mappings:**
  Combines color, typography, component, state, and system mappings with additional theme-wide settings (spacing, breakpoints, border radius, shadows, and z-indices).

- **Typography Mappings:**
  Defines font settings, heading styles, body text styles, display scales, and utility text configurations.

- **System Mappings:**
  Provides configurations for focus rings, selection colors, and overlay settings.

- **State Mappings:**
  Captures component state colors and interactive states used to represent disabled, loading, error, and success conditions.

- **Component Variants:**
  Specifies detailed color state variants for different component types (buttons, inputs, cards, modals, etc.).

- **Color Mappings:**
  Defines APIs and transformation functions for color operations, such as generating shades, palettes, and exporting color formats.

- **Base Mappings:**
  Contains core mapping configuration and helper interfaces for base scales, elevation, surface settings, and interactive states.

These mappings enable a unified approach to generating CSS variables and ensure that the theme can be easily adjusted, validated, and extended.

---

## Directory Structure

```text
/theme/types/mappings
├── base-mappings.ts           // Core mapping configuration and base mapping operations
├── color-mappings.ts          // Color mapping API, transforms, and palette generation
├── component-variants.ts      // Component-specific variant definitions (buttons, inputs, etc.)
├── state-mappings.ts          // State-related mappings for component states and interactive behaviors
├── system-mappings.ts         // System-level mapping settings (focus, selection, overlay)
├── typography-mappings.ts     // Typography settings including fonts, headings, and text styles
└── variable-mappings.ts       // Consolidates all mappings with theme-wide settings and mapping utilities
```

Additionally, a subfolder (e.g., `/theme/types/mappings/component-mappings`) contains further mappings for specific component families such as:

- `code-syntax.ts`
- `containers.ts`
- `data-display.ts`
- `feedback.ts`
- `form-elements.ts`
- `lists-trees.ts`
- `media.ts`
- `navigation.ts`
- `visualization.ts`

These files further detail component-specific mapping overrides and extensions.

---

## Module Descriptions

### Variable Mappings (`variable-mappings.ts`)

- **Purpose:**
  Defines the overall structure of theme variable mappings, combining color, typography, component, state, and system mappings. Also declares additional theme-wide settings (spacing, breakpoints, border radius, shadows, z-indices).

- **Key Interfaces:**
  - `ThemeVariableMappings`
  - `ThemeMappingUtils` (with methods for getting, setting, merging, transforming, and validating mappings)
  - `CreateThemeMappingOptions`

- **Usage:**
  Used to generate the complete set of CSS variables and to interface with the theme’s runtime configuration.

### Typography Mappings (`typography-mappings.ts`)

- **Purpose:**
  Defines font settings, text styles for headings, body, display, and utility configurations (truncate, word break, paragraph spacing, lists, and code).

- **Key Interfaces:**
  - `FontSettings`
  - `TextStyles`
  - `TypographyMappings`

### System Mappings (`system-mappings.ts`)

- **Purpose:**
  Provides system-level style settings for focus, selection, and overlay behaviors.

- **Key Interface:**
  - `SystemMappings`

### State Mappings (`state-mappings.ts`)

- **Purpose:**
  Contains mappings for component states and interactive behaviors. It includes low-level definitions for component colors and states, as well as extended mappings for form, navigation, button, and table components.

- **Key Interfaces:**
  - `StateMappings`
  - Related interfaces for form-components, navigation-components, button-components, and table-components.

### Component Variants (`component-variants.ts`)

- **Purpose:**
  Defines detailed design tokens for different component variants (buttons, inputs, selects, toggles, cards, modals, toasts, tabs, menus, badges, progress, tooltips).

- **Key Interfaces:**
  - `ButtonVariant`, `InputVariant`, `SelectVariant`, `ToggleVariant`, `CardVariant`, `ModalVariant`, `ToastVariant`, `TabVariant`, `MenuVariant`, `BadgeVariant`, `ProgressVariant`, `TooltipVariant`
  - A collection interface (`ComponentVariants`) that aggregates variants across component types.

### Color Mappings (`color-mappings.ts`)

- **Purpose:**
  Provides APIs and transformation functions for color operations. This includes functions for setting and getting colors, generating shades, and building palettes.

- **Key Interfaces:**
  - `ColorMappingAPI`
  - `ColorMappingConfig`
  - `ColorTransforms`
  - `ColorMappings` – which aggregates base, semantic, text, border, shadow, interactive, and component colors.

### Base Mappings (`base-mappings.ts`)

- **Purpose:**
  Contains the core mapping configuration used across the theme. It defines base settings for scaling, elevation, surface, interactive states, and provides helper operations for variable mappings.

- **Key Interfaces:**
  - `BaseMappingConfig`
  - `BaseMappingOperations`
  - `BaseVariableMapping`
  - `BaseMappingRegistry`
  - `BaseMappingContext`
  - `BaseMappingGeneratorOptions`
  - `BaseMappingValidator`

---

## Subfolder: Component Mappings

The `component-mappings` subfolder contains files that further detail mappings for specific component families, such as:

- **code-syntax.ts:** Mappings for code syntax highlighting.
- **containers.ts:** Layout and container mappings.
- **data-display.ts:** Mappings for tables, lists, and trees.
- **feedback.ts:** Mappings for alerts, toasts, and other feedback components.
- **form-elements.ts:** Mappings for input fields, select boxes, and related form elements.
- **lists-trees.ts:** Mappings for lists and tree structures.
- **media.ts:** Media-specific mappings.
- **navigation.ts:** Detailed mappings for navigation components.
- **visualization.ts:** Mappings for charts and visualization components.

These files extend or override the base mappings defined in the parent folder for specific component requirements.

---

## Usage

To import mapping types and utilities in your project, use the barrel file. For example:

```typescript
import { ThemeVariableMappings, TypographyMappings, ColorMappings } from '@/types/theme/mappings';
```

This enables a centralized access point for all mapping configurations and transformation APIs.

---

## Additional Recommendations

- **Centralization:**
  Ensure that shared mapping configurations (such as spacing, breakpoints, and typography settings) are defined once in the variable mappings and referenced consistently across the theme.

- **Validation & Transformation:**
  Leverage the mapping utility functions to validate and transform design tokens before generating CSS variables. This adds robustness to your theming system.

- **Modularity:**
  Keep component-specific mappings in the subfolder (`component-mappings`) to avoid bloating the main mapping files and to facilitate targeted updates for particular component families.

- **Documentation:**
  Continue to document each interface and transformation function clearly. This will ease onboarding and future maintenance.

---

This structure and organization provide a comprehensive and flexible framework for mapping design tokens to theme variables, ensuring consistency and ease of extension as your theme system evolves.
