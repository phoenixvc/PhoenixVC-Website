# Component Mappings

The **component-mappings** subfolder provides detailed mappings for specific component families. These interfaces define how design tokens and theme variables are applied to various components, enabling fine-tuned control over component appearance. They extend and customize the base theme tokens defined in the core modules to meet the unique requirements of each component type.

---

## Table of Contents

- [Component Mappings](#component-mappings)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Directory Structure](#directory-structure)
  - [Module Descriptions](#module-descriptions)
    - [Code Syntax Mappings (`code-syntax.ts`)](#code-syntax-mappings-code-syntaxts)
    - [Container Mappings (`containers.ts`)](#container-mappings-containersts)
    - [Data Display Mappings (`data-display.ts`)](#data-display-mappings-data-displayts)
    - [Feedback Mappings (`feedback.ts`)](#feedback-mappings-feedbackts)
    - [Form Element Mappings (`form-elements.ts`)](#form-element-mappings-form-elementsts)
    - [List and Tree Mappings (`list-trees.ts`)](#list-and-tree-mappings-list-treests)
    - [Media Mappings (`media.ts`)](#media-mappings-mediats)
    - [Navigation Mappings (`navigation.ts`)](#navigation-mappings-navigationts)
    - [Visualization Mappings (`visualization.ts`)](#visualization-mappings-visualizationts)
  - [Usage](#usage)
  - [Additional Recommendations](#additional-recommendations)
  - [Conclusion](#conclusion)

---

## Overview

The component mappings subfolder contains interfaces that specify how component-specific design tokens (such as colors, interactive states, and variants) are applied to various UI components. These mappings allow for consistent styling and theming across the UI by extending core theme definitions and adding component-specific details.

---

## Directory Structure

```text
/theme/types/mappings/component-mappings
├── code-syntax.ts         // Mappings for code syntax highlighting and styling.
├── containers.ts          // Mappings for container components (cards, modals, drawers, etc.).
├── data-display.ts        // Mappings for data display components (tables, badges, tags, avatars, etc.).
├── feedback.ts            // Mappings for feedback components (alerts, toasts, notifications).
├── form-elements.ts       // Mappings for form elements (inputs, selects, checkboxes, radios, etc.).
├── list-trees.ts          // Mappings for lists and tree structures.
├── media.ts               // Mappings for media-related components (video controls, skeletons, uploads).
├── navigation.ts          // Mappings for navigation components (navbar, sidebar, tabs, breadcrumbs, menus).
└── visualization.ts       // Mappings for charting and visualization components.
```

---

## Module Descriptions

### Code Syntax Mappings (`code-syntax.ts`)

Defines the mappings for code-related components, including syntax highlighting rules (colors for comments, strings, keywords, variables, functions, operators, classes, numbers, constants, regex, and markup), along with line numbering, selection, and highlighting styles.

**Example:**

```typescript
const codeSyntaxMapping: CodeSyntaxMappings = {
  code: {
    background: { hex: '#1e1e1e', rgb: '30,30,30', hsl: '0,0%,12%' },
    text: { hex: '#d4d4d4', rgb: '212,212,212', hsl: '0,0%,83%' },
    border: { hex: '#333333', rgb: '51,51,51', hsl: '0,0%,20%' },
    syntax: {
      comment: '#6a9955',
      string: '#ce9178',
      keyword: '#569cd6',
      variable: '#9cdcfe',
      function: '#dcdcaa',
      operator: '#c586c0',
      class: '#4ec9b0',
      number: '#b5cea8',
      constant: '#4fc1ff',
      regex: '#d16969',
      markup: '#ce9178'
    },
    lineNumber: '#858585',
    selection: '#264f78',
    highlight: '#264f78'
  }
};
```

---

### Container Mappings (`containers.ts`)

Defines the mappings for container components such as cards, modals, drawers, popovers, tooltips, accordions, and collapses. For modals and drawers, it includes additional properties like overlay and backdrop colors.

**Example:**

```typescript
const containerMapping: ContainerMappings = {
  card: { background: { hex: '#ffffff', rgb: '255,255,255', hsl: '0,0%,100%' }, text: { hex: '#333333', rgb: '51,51,51', hsl: '0,0%,20%' }, border: { hex: '#e5e5e5', rgb: '229,229,229', hsl: '0,0%,90%' } },
  modal: {
    background: { hex: '#ffffff', rgb: '255,255,255', hsl: '0,0%,100%' },
    text: { hex: '#333333', rgb: '51,51,51', hsl: '0,0%,20%' },
    border: { hex: '#e5e5e5', rgb: '229,229,229', hsl: '0,0%,90%' },
    overlay: '#000000',
    backdrop: '#000000'
  },
  drawer: {
    background: { hex: '#ffffff', rgb: '255,255,255', hsl: '0,0%,100%' },
    overlay: '#000000'
  },
  popover: { /* ... */ },
  tooltip: { /* ... */ },
  accordion: { /* ... */ },
  collapse: { /* ... */ }
};
```

---

### Data Display Mappings (`data-display.ts`)

Provides mappings for data display components such as tables, badges, tags, avatars, progress bars, and spinners. These mappings often use semantic colors to maintain consistency with core theme semantics.

**Example:**

```typescript
const dataDisplayMapping: DataDisplayMappings = {
  table: { /* table color mappings */ },
  badge: {
    success: { background: { hex: '#dff0d8', rgb: '223,240,216', hsl: '120,50%,90%' }, text: { hex: '#3c763d', rgb: '60,118,61', hsl: '120,30%,30%' }, border: { hex: '#d6e9c6', rgb: '214,233,198', hsl: '120,40%,85%' } },
    // Other semantic keys...
  },
  tag: {
    success: { /* ... */ },
    // Other semantic keys...
  },
  avatar: { background: { hex: '#cccccc', rgb: '204,204,204', hsl: '0,0%,80%' }, ring: '#ffffff', placeholder: '#f0f0f0' },
  progress: {
    track: '#e0e0e0',
    indicator: { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#17a2b8' },
    text: '#333333'
  },
  spinner: { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#17a2b8' }
};
```

---

### Feedback Mappings (`feedback.ts`)

Specifies mappings for feedback components like alerts, toasts, and notifications. These mappings use semantic color tokens to differentiate between various message types.

**Example:**

```typescript
const feedbackMapping: FeedbackMappings = {
  alert: {
    success: { background: { hex: '#dff0d8', rgb: '223,240,216', hsl: '120,50%,90%' }, text: { hex: '#3c763d', rgb: '60,118,61', hsl: '120,30%,30%' }, border: { hex: '#d6e9c6', rgb: '214,233,198', hsl: '120,40%,85%' } },
    // Additional mappings for error, warning, and info...
  },
  toast: {
    success: { /* similar structure */ },
    // Additional mappings...
  },
  notification: {
    success: { /* similar structure */ },
    // Additional mappings...
  }
};
```

---

### Form Element Mappings (`form-elements.ts`)

Provides mappings for form elements such as inputs, selects, checkboxes, radios, switches, textareas, and buttons. These mappings extend the base input tokens with additional properties and variants for form controls.

**Example:**

```typescript
const formElementMapping: FormElementMappings = {
  input: { /* input mapping */ },
  select: { /* select mapping */ },
  checkbox: { /* checkbox mapping */ },
  radio: { /* radio mapping */ },
  switch: { /* switch mapping */ },
  textarea: { /* textarea mapping */ },
  button: {
    primary: { /* button mapping for primary variant */ },
    secondary: { /* secondary variant mapping */ },
    ghost: { /* ghost variant mapping */ },
    link: { /* link variant mapping */ },
    danger: { /* danger variant mapping */ }
  }
};
```

---

### List and Tree Mappings (`list-trees.ts`)

Defines mappings for list and tree components, including item states (hover, active, selected) and dividers.

**Example:**

```typescript
const listTreeMapping: ListTreeMappings = {
  list: {
    background: { hex: '#ffffff', rgb: '255,255,255', hsl: '0,0%,100%' },
    text: { hex: '#333333', rgb: '51,51,51', hsl: '0,0%,20%' },
    border: { hex: '#e5e5e5', rgb: '229,229,229', hsl: '0,0%,90%' },
    item: {
      hover: '#f0f0f0',
      active: '#e0e0e0',
      selected: '#d0d0d0'
    },
    divider: '#cccccc'
  },
  tree: {
    background: { hex: '#ffffff', rgb: '255,255,255', hsl: '0,0%,100%' },
    text: { hex: '#333333', rgb: '51,51,51', hsl: '0,0%,20%' },
    border: { hex: '#e5e5e5', rgb: '229,229,229', hsl: '0,0%,90%' },
    item: {
      hover: '#f0f0f0',
      active: '#e0e0e0',
      selected: '#d0d0d0'
    },
    expandIcon: '#888888'
  }
};
```

---

### Media Mappings (`media.ts`)

Contains mappings for media components such as videos, skeleton loaders, and upload components. These mappings detail styles for controls, progress bars, overlays, and other media-specific UI elements.

**Example:**

```typescript
const mediaMapping: MediaMappings = {
  video: {
    background: { hex: '#000000', rgb: '0,0,0', hsl: '0,0%,0%' },
    text: { hex: '#ffffff', rgb: '255,255,255', hsl: '0,0%,100%' },
    border: { hex: '#333333', rgb: '51,51,51', hsl: '0,0%,20%' },
    controls: {
      background: { hex: '#222222', rgb: '34,34,34', hsl: '0,0%,13%' },
      text: { hex: '#ffffff', rgb: '255,255,255', hsl: '0,0%,100%' },
      border: { hex: '#444444', rgb: '68,68,68', hsl: '0,0%,27%' }
    },
    progress: '#007BFF',
    buffer: '#CCCCCC'
  },
  skeleton: {
    base: '#eeeeee',
    highlight: '#f5f5f5',
    animation: 'linear infinite 1.5s'
  },
  upload: {
    background: { hex: '#ffffff', rgb: '255,255,255', hsl: '0,0%,100%' },
    text: { hex: '#333333', rgb: '51,51,51', hsl: '0,0%,20%' },
    border: { hex: '#e5e5e5', rgb: '229,229,229', hsl: '0,0%,90%' },
    dragActive: '#dff0d8',
    dragReject: '#f2dede',
    progressBar: '#5bc0de'
  }
};
```

---

### Navigation Mappings (`navigation.ts`)

Defines mappings for navigation components such as navbar, sidebar, tabs, breadcrumbs, menus, and pagination. These mappings extend the base navigation color tokens defined in the core.

**Example:**

```typescript
const navigationMapping: NavigationMappings = {
  navbar: { /* mapping based on NavigationColorSet */ },
  sidebar: { /* mapping based on NavigationColorSet */ },
  tab: { /* mapping based on NavigationColorSet */ },
  breadcrumb: { /* mapping based on NavigationColorSet */ },
  menu: { /* mapping based on NavigationColorSet */ },
  pagination: { /* mapping based on NavigationColorSet */ }
};
```

---

### Visualization Mappings (`visualization.ts`)

Provides mappings for charting and visualization components. This includes both the chart color set and additional palette arrays for various data visualization needs (categorical, sequential, diverging, qualitative).

**Example:**

```typescript
const visualizationMapping: VisualizationMappings = {
  chart: { /* mapping based on ChartColorSet */ },
  datavis: {
    categorical: ['#ff0000', '#00ff00', '#0000ff'],
    sequential: ['#f7fbff', '#08306b'],
    diverging: ['#d73027', '#fee08b', '#1a9850'],
    qualitative: ['#66c2a5', '#fc8d62', '#8da0cb']
  }
};
```

---

## Usage

To import these mapping interfaces and types in your project, use the barrel file from the `component-mappings` subfolder:

```typescript
import { CodeSyntaxMappings, ContainerMappings, DataDisplayMappings } from '@/types/mappings/component-mappings';
```

This centralized import simplifies access and ensures consistency when applying theme tokens to various components.

---

## Additional Recommendations

- **Inline Documentation:**
  Each mapping interface should include an `@example` section in its JSDoc comments (as shown above) to illustrate typical usage scenarios.

- **Type Consistency:**
  Ensure that all mappings reference core types correctly (e.g., using `ColorDefinition`, `ColorSet`, `SemanticColors`) and that expected formats (such as arrays vs. single values) are clearly documented.

- **Modular Organization:**
  The separation into files (code-syntax, containers, data-display, etc.) is effective. Continue to refine as the project grows by grouping similar components or creating subfolders if needed.

---

## Conclusion

The **component-mappings** subfolder is organized to provide clear, detailed mappings for various UI component families. These mappings bridge the gap between core design tokens and component-specific styles, ensuring a consistent and extensible theme system.

By following the examples and guidelines provided, you can extend and customize the mappings to suit the evolving needs of your application.

Adding a New Component Type to the Base Library
If you wanted to add a new component type to your existing base library, here's the step-by-step process you would follow:

1. Define the Component Variant Interface
First, you would create a new interface that defines the structure of your component's variants. This should follow the same pattern as your existing components.

For example, if you wanted to add an "Accordion" component:

Copy
// Define the Accordion variant interface
export interface AccordionVariant {
  container: ComponentState;
  header: InteractiveState;
  content: ComponentState;
  icon: {
    default: ColorDefinition;
    expanded: ColorDefinition;
  };
  expanded: {
    header: ComponentState;
    content: ComponentState;
  };
}
2. Add to ComponentVariantType Union
You would add your new variant type to the ComponentVariantType union to ensure type safety:

Copy
type ComponentVariantType =
  | ButtonVariant
  | InputVariant
  // ... other existing variants
  | AccordionVariant; // Add your new variant here
3. Add to ComponentVariants Interface
Next, you would add your new component to the ComponentVariants interface:

Copy
export interface ComponentVariants {
  // Existing components
  button: {
    primary: ButtonVariant;
    // ... other button variants
  };
  // ... other components

  // Add your new component (with optional marker if appropriate)
  accordion?: {
    default: AccordionVariant;
    [key: string]: AccordionVariant;
  };

  // Index signature remains unchanged
  [key: string]: { [variantKey: string]: ComponentVariantType } | undefined;
}
4. Implement Default Variants
When implementing the theme, you would create default variants for your new component:

Copy
// In your theme implementation file
const theme: Theme = {
  // ... other theme properties

  components: {
    // ... existing components

    // Add your new component
    accordion: {
      default: {
        container: {
          background: colors.neutral[50],
          foreground: colors.neutral[900],
          border: colors.neutral[200]
        },
        header: {
          background: colors.neutral[100],
          foreground: colors.neutral[900],
          border: colors.neutral[200],
          hover: {
            background: colors.neutral[200],
            foreground: colors.neutral[900]
          },
          active: {
            background: colors.neutral[300],
            foreground: colors.neutral[900]
          }
        },
        content: {
          background: colors.neutral[50],
          foreground: colors.neutral[800],
          border: colors.neutral[200]
        },
        icon: {
          default: colors.neutral[500],
          expanded: colors.primary[500]
        },
        expanded: {
          header: {
            background: colors.neutral[100],
            foreground: colors.neutral[900],
            border: colors.neutral[300]
          },
          content: {
            background: colors.neutral[50],
            foreground: colors.neutral[800],
            border: colors.neutral[200]
          }
        }
      },
      // You could add additional variants like "compact" or "bordered"
      compact: {
        // ... variant-specific styling
      }
    }
  }
};
5. Create Component Usage Utilities (Optional)
You might want to create utility functions or hooks to easily access your new component's variants:

Copy
// In a utilities file
export function useAccordionVariant(variant: string = 'default'): AccordionVariant {
  const theme = useTheme();
  return theme.components.accordion?.[variant] || theme.components.accordion?.default;
}
