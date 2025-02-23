# Theme Styles

The **styles** folder contains all interfaces and types related to the theme’s styling system. This folder is responsible for defining how styles are structured, computed, processed, and managed within the theme framework.

---

## Table of Contents

- [Theme Styles](#theme-styles)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Directory Structure](#directory-structure)
  - [Module Descriptions](#module-descriptions)
    - [Base Styles (`base.ts`)](#base-styles-basets)
    - [Computed \& Semantic Styles (`computed.ts`)](#computed--semantic-styles-computedts)
    - [Style Processing \& Manager (`processing.ts`)](#style-processing--manager-processingts)
    - [Barrel File (`index.ts`)](#barrel-file-indexts)
  - [Usage](#usage)
  - [Additional Recommendations](#additional-recommendations)

---

## Overview

The **styles** folder defines the contracts and types that govern how theme styles are handled in the system. It is divided into three main modules:

- **Base Styles:**
  Contains the foundational style interfaces for basic, hover, focus, active, and disabled states.

- **Computed & Semantic Styles:**
  Combines base styles with semantic mappings and interactive state definitions, providing a unified interface for computed styles.

- **Style Processing:**
  Defines options and results for generating and processing styles, along with the API for a style manager that can dynamically handle styles.

This modular design enhances maintainability, clarity, and extensibility.

---

## Directory Structure

```text
/types/theme/styles
├── base.ts         // Fundamental style definitions (BaseStyles, HoverStyles, etc.)
├── computed.ts     // Semantic and computed style interfaces (SemanticStyles, ComputedStyles, etc.)
├── processing.ts   // Interfaces for style generation, processing results, and the style manager API
└── index.ts        // Barrel file re-exporting all style modules
```

---

## Module Descriptions

### Base Styles (`base.ts`)

- **Purpose:**
  Defines the core style interfaces that form the foundation of the theme styling system.

- **Key Interfaces:**
  - `BaseStyles` – A generic interface for basic style properties.
  - `HoverStyles` – Extends `BaseStyles` to specify hover-specific properties.
  - `FocusStyles` – Extends `BaseStyles` for focus state styling.
  - `ActiveStyles` – Extends `BaseStyles` for active state styling.
  - `DisabledStyles` – Extends `BaseStyles` for disabled state styling.

### Computed & Semantic Styles (`computed.ts`)

- **Purpose:**
  Provides interfaces that combine the basic style definitions with semantic and interactive mappings.

- **Key Interfaces:**
  - `SemanticStyles` – Defines semantic color mappings (e.g., success, warning, error, info).
  - `InteractiveStyles` – Specifies style properties for interactive states (hover, active, focus, disabled).
  - `SemanticStyleSet` – Represents a full set of styles (background, color, border, icon, hover, active) for a semantic meaning.
  - `SemanticStyleMap` – Maps semantic keys to their corresponding `SemanticStyleSet`.
  - `ComputedStyles` – Combines base, hover, focus, active, disabled, semantic, and interactive styles into one interface.

### Style Processing & Manager (`processing.ts`)

- **Purpose:**
  Contains interfaces for style generation and processing, including configuration options, processing results, and the API for managing styles dynamically.

- **Key Interfaces:**
  - `RawStyles` – A recursive type for raw style definitions.
  - `StyleGenerationOptions` – Options for generating styles (e.g., prefix, scope, format, minification).
  - `StyleProcessingResult` – The result of processing styles, including generated CSS, CSS variables, class names, and dependency tracking.
  - `StyleManagerConfig` – Configuration options for the style manager (e.g., transforms, source maps).
  - `StyleTransform` – Functions to transform style properties, values, or selectors.
  - `StyleManager` – API to add, remove, retrieve, and clear styles.
  - `StyleCompilationOptions` and `StyleCompilationResult` – Additional options and results specific to compiling and optimizing styles.
  - `StyleUtils` – Utility functions for merging styles, converting raw styles to CSS, generating class names, and processing styles.

### Barrel File (`index.ts`)

- **Purpose:**
  Re-exports all style-related modules for simplified import paths.

- **Content Example:**

  ```typescript
  export * from './base';
  export * from './computed';
  export * from './processing';
  ```

---

## Usage

To use the style types and utilities in your theme system, import the required modules via the barrel file:

```typescript
import {
  BaseStyles,
  ComputedStyles,
  StyleGenerationOptions,
  StyleManager,
  StyleUtils
} from '@/types/theme/styles';
```

You can then:

- Define your component styles using the base interfaces.
- Compute combined styles by leveraging the `ComputedStyles` interface.
- Process raw style definitions using the provided generation options and the style manager API.

---

## Additional Recommendations

- **Maintainability:**
  The separation into `base.ts`, `computed.ts`, and `processing.ts` helps maintain a clear structure as your styling needs evolve.

- **Extensibility:**
  Adding new style states or processing options can be done within the appropriate module without affecting unrelated parts of the system.

- **Utility Functions:**
  Consider implementing common style utilities (such as merging styles or generating class names) within `StyleUtils` to promote code reuse and consistency.

This structure provides a robust and flexible foundation for your theme's styling system while keeping the types well-organized and easy to extend.
