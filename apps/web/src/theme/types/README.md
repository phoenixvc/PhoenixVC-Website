# Theme Types

The **types** folder is the central location for all type definitions, interfaces, and configuration contracts used throughout the theme system. It serves as the foundation for theming across the application, ensuring consistency, modularity, and scalability. The folder is organized into several subdirectories, each responsible for a specific domain of the theme system.

---

## Table of Contents

- [Theme Types](#theme-types)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Directory Structure](#directory-structure)
  - [Subfolder Descriptions](#subfolder-descriptions)
    - [components](#components)
    - [constants](#constants)
    - [context](#context)
    - [core](#core)
    - [extensions](#extensions)
    - [hooks](#hooks)
    - [mappings](#mappings)
    - [schemas](#schemas)
    - [styles](#styles)
    - [utils](#utils)
  - [Usage \& Integration](#usage--integration)
  - [Additional Recommendations](#additional-recommendations)

---

## Overview

The **types** folder contains all the type definitions and interfaces that power the theme system. These types define:

- **Core configurations** (e.g., theme identity, colors, transitions, storage, and validation).
- **Context** for runtime theming (e.g., provider configuration, state, errors, and events).
- **Component tokens and styles** for UI components.
- **Mappings** that transform design tokens into CSS variables and other runtime values.
- **Utilities and schemas** that help enforce and validate theme configurations.

This organized approach enables consistency and reusability across the entire theming architecture.

---

## Directory Structure

```text
/types
├── components/       // Component-specific design tokens and color definitions
│   ├── README.md
│   ├── base-colors.ts
│   ├── component-tokens.ts
│   ├── index.ts
│   └── media.ts
├── constants/        // Global constants used across the theme system
├── context/          // Runtime theme context types (provider, state, errors, events)
│   ├── README.md
│   ├── context.ts
│   ├── error.ts
│   ├── events.ts
│   └── state.ts
├── core/             // Fundamental theme types (colors, config, variables, etc.)
│   ├── README.md
│   ├── accessibility.ts
│   ├── base.ts
│   ├── classes.ts
│   ├── colors.ts
│   ├── config.ts
│   ├── enums.ts
│   ├── index.ts
│   ├── storage.ts
│   ├── transition.ts
│   ├── validation.ts
│   └── variables.ts
├── extensions/       // Plugin and extension interfaces for theme customization
│   └── plugin.ts
├── hooks/            // Custom hooks for theme-related logic
├── index.ts          // Aggregator barrel for all type definitions
├── mappings/         // Mapping interfaces to transform design tokens into CSS variables
│   ├── README.md
│   ├── base-mappings.ts
│   ├── color-mappings.ts
│   ├── component-mappings/  // Subfolder for component-specific mapping overrides
│   │   ├── README.md
│   │   ├── code-syntax.ts
│   │   ├── containers.ts
│   │   ├── data-display.ts
│   │   ├── feedback.ts
│   │   ├── form-elements.ts
│   │   ├── index.ts
│   │   ├── lists-trees.ts
│   │   ├── media.ts
│   │   ├── navigation.ts
│   │   └── visualization.ts
│   ├── component-variants.ts
│   ├── index.ts
│   ├── state-mappings.ts
│   ├── system-mappings.ts
│   ├── theme-mappings.ts
│   ├── typography-mappings.ts
│   └── utils.ts
├── schemas/          // Schema definitions for validating theme configurations
├── styles/           // Style-related types for base styles, computed styles, and style processing
│   ├── README.md
│   ├── base.ts
│   ├── computed.ts
│   ├── index.ts
│   └── processing.ts
└── utils/            // General-purpose utilities and helper types for the theme system
    ├── colors.ts
    ├── factory.ts
    ├── guards.ts
    ├── testing.ts
    └── utils.ts
```

---

## Subfolder Descriptions

### components

- **Purpose:**
  Contains design tokens and color definitions specific to UI components.
- **Contents:**
  - `base-colors.ts`: Foundational component color definitions.
  - `component-tokens.ts`: Extended, component-specific tokens.
  - `media.ts`: Media query definitions for responsive behavior.
- **Notes:**
  This folder defines how components are styled using tokens that extend core color definitions.

### constants

- **Purpose:**
  Global constants and values used across the theme system.

### context

- **Purpose:**
  Contains interfaces for runtime theme context—provider props, state, error handling, and events.
- **Notes:**
  This is where the theme provider logic and context-based theming are defined.

### core

- **Purpose:**
  Defines the fundamental theme interfaces, including color definitions, configurations, transitions, validation, and variables.
- **Notes:**
  Core types serve as the foundation and are reused by other modules.

### extensions

- **Purpose:**
  Provides interfaces for plugins and extensions to the theme system.

### hooks

- **Purpose:**
  Contains custom React hooks for theme management.

### mappings

- **Purpose:**
  Provides a set of interfaces and utilities to map design tokens into CSS variables and runtime values.
- **Subfolders:**
  - `component-mappings`: Contains overrides and extensions for component-specific mappings.
- **Notes:**
  Mappings unify the design tokens into a coherent theming output.

### schemas

- **Purpose:**
  Contains schema definitions for validating theme configurations.

### styles

- **Purpose:**
  Defines styling interfaces for the theme system. This includes:
  - `base.ts`: Base style definitions.
  - `computed.ts`: Combined and semantic style interfaces.
  - `processing.ts`: Interfaces for style generation and management.

### utils

- **Purpose:**
  Contains helper functions and utility types that support the theme system (e.g., color conversion, factory functions, guards, testing utilities).

---

## Usage & Integration

The overall types folder serves as the single source of truth for all type definitions in the theme system. Import the types you need using the provided barrel file:

```typescript
import { ThemeConfig, ColorDefinition } from '@/types';
import { TypographyMappings } from '@/types/mappings/typography-mappings';
import { BaseStyles } from '@/types/styles/base';
```

This structure ensures that all parts of your theme system—from core configurations to component tokens and style processing—are easily accessible and consistently defined.

---

## Additional Recommendations

- **Consistent Documentation:**
  Each interface should include inline documentation and examples to facilitate understanding and ease of use.
- **Modular Design:**
  The clear separation into subfolders promotes reusability and simplifies future maintenance and extension.
- **Centralized Imports:**
  Use the barrel file (`index.ts`) in the root of the types folder to simplify import paths throughout your project.
- **Testing and Validation:**
  Consider adding unit tests for mapping utilities and validation functions to ensure robustness as your theme evolves.

---
