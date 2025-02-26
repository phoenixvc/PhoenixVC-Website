# Theme Context Types

The **context** folder contains the interfaces and types related to runtime theme management. It defines how the theme is provided, consumed, and managed in a React application. This includes provider configuration, context state, error handling, and event definitions. Note that storage-related interfaces have been moved to the core module.

---

## Table of Contents

- [Theme Context Types](#theme-context-types)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Directory Structure](#directory-structure)
  - [Module Descriptions](#module-descriptions)
    - [Provider Configuration](#provider-configuration)
    - [Context State \& Value](#context-state--value)
    - [Error Handling](#error-handling)
    - [Theme Events](#theme-events)
  - [Additional Recommendations](#additional-recommendations)
  - [Usage](#usage)

---

## Overview

This folder extends the fundamental theme definitions (provided in the core module) to implement a runtime theme system using React context. It includes:

- **Provider Configuration:** Interfaces for configuring the Theme Provider (including context-specific options like `storagePrefix`, `disableInitialTransitions`, and `debug`).
- **Context State & Value:** Definitions for the overall context state, which extends the core `ThemeState` (now represented by `ExtendedThemeState`) with flags such as `isLoading` and `error`, and combines actions (e.g. `reset`, `updateConfig`, `refresh`).
- **Error Handling:** A dedicated module for error codes, error payloads, and an extended error interface for context.
- **Theme Events:** Interfaces that define theme-related event types, payloads, and the event manager contract.

*Note:* Storage interfaces have been moved to the core module to avoid duplication and promote reuse.

---

## Directory Structure

```text
/types/theme/context
├── context.ts        // Provider configuration, context state/value, and core context actions
├── errors.ts         // Error-related interfaces and event payloads
├── events.ts         // Theme event types, payloads, and event manager interfaces
├── state.ts          // Extended theme state, adding context-specific properties (e.g., isLoading, error)
```

---

## Module Descriptions

### Provider Configuration

- **ThemeProviderExtraConfig:**
  Defines context-specific configuration options such as `storagePrefix`, `disableInitialTransitions`, and `debug`.

- **ThemeProviderConfig:**
  Combines the core `ThemeConfig` (from the core module) with `ThemeProviderExtraConfig`. This ensures that provider options extend the fundamental theme settings.

- **ThemeProviderProps:**
  The properties required by the Theme Provider component. This includes children, an optional initial configuration, error handlers, and additional UI-related props (e.g. `className`, `forceColorScheme`).

### Context State & Value

- **ExtendedThemeState & ThemeContextState:**
  `ExtendedThemeState` extends the core `ThemeState` with context-specific flags like `isLoading` and `error`.
  `ThemeContextState` composes `ExtendedThemeState` with additional runtime flags (e.g. `isInitialized`).

- **ThemeContextActions:**
  Defines methods that update the theme state (e.g. `reset`, `updateConfig`, `refresh`).

- **ThemeContextType:**
  Contains core functions for manipulating the theme (e.g. getters/setters for color scheme and mode, and helper functions).
  *Note:* While these functions are implemented here, some of the pure helper methods may later be moved to dedicated utility modules.

- **ThemeContextValue:**
  Combines `ThemeContextType` with `ThemeContextActions` and includes the current context state. This interface is the value provided by the React Context.

### Error Handling

- **errors.ts:**
  Consolidates error codes, levels, and interfaces for both general theme errors (`ThemeError`) and context-specific errors (`ThemeContextError`).
  It also includes the base payload for theme event errors.

### Theme Events

- **events.ts:**
  Defines the various theme event types (e.g., `theme:init`, `theme:change`, `theme:mode-change`), payload interfaces for events (such as `ThemeChangeEventPayload`, `ThemeModeChangeEventPayload`, etc.), and the contract for the event emitter/manager.

---

## Additional Recommendations

- **Reuse Core Types:**
  Interfaces in this folder extend or reference core types (e.g., `ThemeConfig` and `ThemeState`). This avoids duplication and ensures consistency.

- **Modular Organization:**
  Error and event interfaces are separated into their own modules (`errors.ts` and `events.ts`), making the context folder easier to maintain and refactor in the future.

- **Separation of Implementation and Declaration:**
  Factory functions (for creating the theme context, provider, and hooks) are maintained separately (in a dedicated file like `factory.ts`) to isolate implementation details from type declarations.

- **Storage Interfaces:**
  Since storage has been moved to the core module, the context folder now focuses solely on runtime state and provider logic.

---

## Usage

When using the theme context in your application:

1. **Import Context and Provider Types:**

   ```typescript
   import { ThemeProviderProps, ThemeContextValue } from '@/types/theme/context/context';
   ```

2. **Use the Provider and Context in Your Application:**
   - Create a Theme Context using your factory function (from `factory.ts` if implemented).
   - Wrap your application with the Theme Provider.
   - Consume the context using a custom hook (also provided by the factory).

3. **Handling Errors and Events:**
   - Import error types from `errors.ts` and event types from `events.ts` as needed to implement error handling or custom event subscriptions.

This modular and consolidated structure should make it easier to maintain and extend your theme context system while ensuring consistency with the core theme types.
