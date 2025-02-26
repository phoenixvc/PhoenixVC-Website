# Core Theme Types

This directory contains the foundational type definitions and configurations for the theme system. It is designed to be modular, scalable, and comprehensive—covering essential areas such as accessibility, core theme identity, class utilities, color configurations, theme configuration, transitions, validation, and CSS variable management.

> **Note:** This README is specific to the **core** folder. Other directories (e.g., components, context, mappings, etc.) have their own documentation.

---

## Table of Contents

- [Core Theme Types](#core-theme-types)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Directory Structure](#directory-structure)
  - [Module Descriptions](#module-descriptions)
    - [accessibility.ts](#accessibilityts)
    - [base.ts](#basets)
    - [classes.ts](#classests)
    - [colors.ts](#colorsts)
    - [config.ts](#configts)
    - [enums.ts](#enumsts)
    - [transition.ts](#transitionts)
    - [validation.ts](#validationts)
    - [variables.ts](#variablests)
  - [Enhancements \& Refactoring](#enhancements--refactoring)
  - [Future Considerations](#future-considerations)
  - [Suggested Utils Folder Structure](#suggested-utils-folder-structure)
  - [Additional Notes](#additional-notes)

---

## Overview

The **core** folder is the backbone of the theme system, providing key interfaces and types for:

- **Accessibility:** Parameters for contrast and motion settings.
- **Base:** Core theme identity, including color schemes, modes, scale systems, and layout configurations.
- **Classes:** Utilities for generating, parsing, and combining theme class names.
  *(Note: Class suffix definitions have been consolidated into `enums.ts`.)*
- **Colors:** Detailed definitions for base and semantic colors, including shades, palettes, and shadow properties.
- **Config:** Comprehensive theme configuration interfaces for initialization, state management, event handling, storage, and plugin support.
- **Enums:** Consolidated definitions for theme error types, event types, and class suffixes.
- **Transition:** Configuration for animation transitions.
- **Validation:** Interfaces for defining validation rules, results, and schema validators.
- **Variables:** Types for managing CSS variable mappings, formatting options, and computed theme variables.

---

## Directory Structure

```text
/types
 └── core
      ├── accessibility.ts     // Accessibility configuration interfaces
      ├── base.ts              // Core theme identity, layout, and scaling definitions
      ├── classes.ts           // Theme class utilities (generation, parsing, combination)
      ├── colors.ts            // Color definitions, shades, palette configurations, and shadow sets
      ├── config.ts            // Theme configuration: state, initialization, events, plugins, and provider props
      ├── enums.ts             // Consolidated theme error types, event types, and class suffixes
      ├── index.ts             // Aggregator/index file for core types
      ├── transition.ts        // Transition and animation configuration interface
      ├── validation.ts        // Validation rules and schema validator interfaces
      └── variables.ts         // CSS variable mappings, configurations, and computed variables
```

---

## Module Descriptions

### accessibility.ts

- **Purpose:**
  Define parameters for accessibility, including contrast and motion preferences.
- **Key Interface:**
  `AccessibilityConfig`
- **Notes:**
  Future enhancements may include additional accessibility features such as font scaling options.

### base.ts

- **Purpose:**
  Establish the core theme identity. This file defines fundamental types including:
  - `ColorScheme` (e.g., "classic", "forest", "ocean", etc.)
  - `Mode` (`'light'` | `'dark'`)
  - **Theme Scale System:** Types for spacing, font size, line height, border radius, border width, opacity, and z-index.
  - **Layout System:** CSS units and text direction.
  - Core constants (e.g., animation durations, storage/class/CSS variable prefixes, breakpoints).
- **Key Types/Namespaces:**
  `ColorScheme`, `Mode`, `ThemeScale`, `Layout`, `ThemeBreakpoints`
- **Notes:**
  As the complexity grows, consider splitting namespaces into dedicated modules (e.g., `theme-colors`, `theme-modes`, `theme-layout`, `theme-scales`).

### classes.ts

- **Purpose:**
  Provide utilities for managing theme class names.
- **Key Interfaces:**
  - `ThemeClassParts`
  - `ThemeClassGenerationOptions`
  - `ThemeClassUtils`
  - `ThemeClassOptions`
- **Notes:**
  Class suffix definitions are centralized in `enums.ts`, ensuring consistency and eliminating duplication.

### colors.ts

- **Purpose:**
  Define all color-related types:
  - **Core Color Types:** `ColorDefinition`, `ColorShades`
  - **Base Colors:** For primary, secondary, tertiary, neutral, gray, accent, and surface.
  - **Semantic Colors:** For success, warning, error, and info.
  - **Color Configuration:** Including accessibility settings, scale configurations, palette options, and shadow properties.
- **Key Interfaces:**
  `ColorDefinition`, `ColorShades`, `BaseColors`, `SemanticColors`, `ColorConfig`, `ShadowProperties`, `ComplexShadow`, `ShadowSet`
- **Notes:**
  Utility functions for color conversion, mixing, and adjustments may be moved to a dedicated helper module.

### config.ts

- **Purpose:**
  Manage the overall theme configuration:
  - Core configuration (`ThemeConfig`)
  - Theme state management (`ThemeState`)
  - Initialization options (`ThemeInitOptions`)
  - Event handling and provider props (e.g., `ThemeChangeEvent`, `ThemeProviderProps`, `ThemeContextValue`)
  - Plugin system interfaces and additional utilities (e.g., `ThemePlugin`, `ThemeConfigValidator`, `ThemeBuilder`)
- **Key Interfaces:**
  `ThemeConfig`, `ThemeState`, `ThemeInitOptions`, `ThemeProviderProps`, `ThemeContextValue`, `ThemePlugin`, `ThemeConfigValidator`, `ThemeBuilder`
- **Notes:**
  Future work could involve splitting storage and transition configurations into separate modules if the functionality grows.

### enums.ts

- **Purpose:**
  Define and consolidate various enumeration types for the theme system:
  - **Error Types:** `ThemeError`
  - **Event Types:** `ThemeEventType`
  - **Class Suffixes:** `ThemeClassSuffix`
- **Notes:**
  Consolidation of class suffixes into this module is complete.

### transition.ts

- **Purpose:**
  Define configuration for animation transitions.
- **Key Interface:**
  `TransitionConfig`
- **Notes:**
  Future extensions might include additional easing functions or advanced timing curves.

### validation.ts

- **Purpose:**
  Define interfaces for creating and processing validation rules:
  - **Validation Rules:** `ValidationRule`
  - **Validation Results:** `ValidationResult`
  - **Schema Validator:** `SchemaValidator`
- **Notes:**
  As validation logic expands, default validators could be implemented or moved to a dedicated utilities module.

### variables.ts

- **Purpose:**
  Manage CSS variable definitions, including raw mappings and computed theme variables.
- **Key Interfaces:**
  - `CSSVariableMappings`
  - `CssVariableConfig`
  - `CssVariableFormatOptions`
  - `CssVariable` and `CssVariableSet`
  - `CssVariableUtils`
  - `ThemeVariables`
- **Notes:**
  Consider isolating complex CSS variable generation logic into helper or service modules if needed.

---

## Enhancements & Refactoring

The following is a consolidated list of enhancements and refactoring tasks for the core folder. Tasks already addressed are marked as done.

- [x] **Consolidate duplicated definitions:**
  - *Done:* `ThemeClassSuffix` has been centralized in `enums.ts`.

- [ ] **Add type guards in `base.ts` for runtime safety:**
  - [ ] Implement color scheme validation.
  - [ ] Implement mode validation.
  - [ ] Implement theme scale validation.

- [ ] **Improve error handling:**
  - [ ] Define more specific error types.
  - [ ] Add error context information.
  - [ ] Implement error recovery strategies.

- [ ] **Add theme versioning support in `config.ts`:**
  - [ ] Define version type definitions.
  - [ ] Develop migration utilities.
  - [ ] Add version compatibility checks.

- [ ] **Enhance color utilities in `colors.ts`:**
  - [ ] Implement color blending functions.
  - [ ] Add accessibility helper functions.
  - [ ] Develop color adjustment utilities.

- [ ] **Enhance the style system:**
  - [ ] Introduce style optimization types.
  - [ ] Differentiate between build-time and runtime type definitions.
  - [ ] Create style composition utilities.

- [ ] **Improve the theme validation system:**
  - [ ] Enhance configuration validation.
  - [ ] Add validations for color schemes, modes, and scales.

- [ ] **Documentation Improvements:**
  - [ ] Add JSDoc comments to all type definitions.
  - [ ] Create usage examples for each module.
  - [ ] Document type relationships and dependencies.
  - [ ] Provide migration guides for future updates.

---

## Future Considerations

- **Scalability:**
  Continue supporting dynamic theming and extended accessibility options by maintaining a strict separation of concerns.

- **Testing:**
  Implement comprehensive tests for class name generation, CSS variable processing, and validation logic to ensure long-term stability.

- **Plugin System Enhancements:**
  Expand the plugin system for modular extensions and introduce robust versioning strategies for backward compatibility.

- **Performance:**
  Optimize runtime utilities (such as class parsing and CSS variable computation) for efficient performance in larger applications.

- **Community Feedback:**
  Refine the structure and utilities based on developer feedback and evolving best practices.

---

## Suggested Utils Folder Structure

```text
/utils
 ├── colors.ts    // Functions for color conversion, mixing, and adjustments
 ├── error.ts     // Enhanced error handling utilities and definitions
 ├── guards.ts    // Type guards and runtime validation helpers
 ├── testing.ts   // Testing utilities and mocks for theme configurations
 └── utils.ts     // General-purpose utility functions and helpers
```

---

## Additional Notes

- **Maintainability:**
  Regular reviews and incremental refactoring will ensure the theme system remains clean and efficient.

- **Extensibility:**
  Design interfaces and modules to accommodate new features without breaking backward compatibility.

- **Documentation:**
  Clear documentation (including JSDoc comments and usage examples) is critical for onboarding new developers and maintaining the codebase.

This README serves as a comprehensive guide for current and future developers working on the core theme types. It will be updated as new enhancements are implemented and requirements evolve.
