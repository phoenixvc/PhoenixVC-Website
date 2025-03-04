# ThemeComponentManager

A versatile theme management class for handling component styling in React applications.

## Overview

The `ThemeComponentManager` class provides a comprehensive solution for managing component themes across your application. It handles:

- CSS variable generation for component styling
- CSS class generation for traditional styling approaches
- Direct React style object generation for inline styling
- Support for different component states (default, hover, active, etc.)
- Support for complex component variants with nested structures

## Installation

```bash
npm install @your-org/theme-component-manager
```

## Usage

### Basic Setup

```typescript
import { ThemeComponentManager } from '@your-org/theme-component-manager';
import { componentRegistry } from './your-theme-registry';
import { colorMapping } from './your-color-mapping';

// Create a new instance
const themeManager = new ThemeComponentManager(componentRegistry, colorMapping);
```

### Generating CSS Variables

```typescript
// Generate variables for all components
const allVariables = themeManager.generateAllVariables('light', 'classic');

// Generate variables for a specific component
const buttonVariables = themeManager.generateComponentVariables('button', 'primary', 'light');

// Apply variables to your document
Object.entries(allVariables).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});
```

### Generating CSS Classes

```typescript
// Generate classes for all components
const allClasses = themeManager.generateAllClasses('light', 'classic');

// Generate classes for a specific component
const cardClasses = themeManager.generateComponentClasses('card', 'elevated', 'dark');

// Create a stylesheet
let styleSheet = '';
Object.entries(allClasses).forEach(([selector, styles]) => {
  styleSheet += `.${selector} { ${styles} }\n`;
});

// Apply stylesheet
const styleElement = document.createElement('style');
styleElement.textContent = styleSheet;
document.head.appendChild(styleElement);
```

### Direct React Styling

```tsx
import React from 'react';
import { ThemeComponentManager } from '@your-org/theme-component-manager';

const MyComponent: React.FC = () => {
  // Get style for a component
  const buttonStyle = themeManager.getComponentStyle('button', 'primary');
  const buttonHoverStyle = themeManager.getComponentStyle('button', 'primary', 'hover');

  return (
    <button
      style={buttonStyle}
      onMouseOver={(e) => { e.currentTarget.style = buttonHoverStyle }}
      onMouseOut={(e) => { e.currentTarget.style = buttonStyle }}
    >
      Click Me
    </button>
  );
};
```

## Component Registry Structure

The component registry should follow this structure:

```typescript
// Example registry structure
const componentRegistry = {
  button: {
    primary: {
      default: {
        background: { hex: '#0066cc' },
        foreground: { hex: '#ffffff' },
        border: { hex: '#0055bb' }
      },
      interactive: {
        hover: {
          background: { hex: '#0077dd' },
          foreground: { hex: '#ffffff' }
        },
        active: {
          background: { hex: '#0055bb' },
          foreground: { hex: '#ffffff' }
        }
      }
    },
    secondary: {
      // Another variant...
    }
  },
  card: {
    elevated: {
      default: {
        background: { hex: '#ffffff' },
        foreground: { hex: '#333333' },
        border: { hex: '#dddddd' },
        shadow: { hex: '0 2px 4px rgba(0,0,0,0.1)' }
      },
      header: {
        background: { hex: '#f5f5f5' },
        foreground: { hex: '#222222' },
        border: { hex: '#eeeeee' }
      },
      footer: {
        background: { hex: '#f9f9f9' },
        foreground: { hex: '#555555' },
        border: { hex: '#eeeeee' }
      },
      style: {
        borderRadius: '4px',
        padding: '16px'
      }
    }
  }
};
```

## Component Variant Types

The manager supports different component variant structures:

### Simple Component State

```typescript
// Direct component state
{
  background: { hex: '#0066cc' },
  foreground: { hex: '#ffffff' },
  border: { hex: '#0055bb' }
}
```

### Complex Component Variant

```typescript
// Complex variant with multiple states
{
  default: {
    background: { hex: '#ffffff' },
    foreground: { hex: '#333333' },
    border: { hex: '#dddddd' }
  },
  interactive: {
    hover: {
      background: { hex: '#f5f5f5' }
    },
    active: {
      background: { hex: '#eeeeee' }
    }
  },
  header: {
    background: { hex: '#f9f9f9' }
  },
  footer: {
    background: { hex: '#f0f0f0' }
  },
  style: {
    borderRadius: '4px',
    padding: '16px'
  }
}
```

## API Reference

### Constructor

```typescript
constructor(registry: ComponentThemeRegistry, colorMapping: ColorMapping)
```

- `registry`: The component theme registry containing all component variants
- `colorMapping`: Color mapping for theme modes and schemes

### Methods

#### Component State Retrieval

```typescript
getComponentState(component: string, variant?: string, mode?: ThemeMode): ComponentState | undefined
```

```typescript
getInteractiveState(
  component: string,
  variant?: string,
  state?: "default" | "hover" | "active" | "focus" | "disabled",
  mode?: ThemeMode
): ComponentState | undefined
```

#### CSS Variable Generation

```typescript
generateAllVariables(
  mode?: ThemeMode,
  scheme?: ThemeColorScheme,
  registry?: ComponentThemeRegistry
): Record<string, string>
```

```typescript
generateComponentVariables(
  component: string,
  variant?: string,
  mode?: ThemeMode,
  scheme?: ThemeColorScheme
): Record<string, string>
```

#### CSS Class Generation

```typescript
generateAllClasses(
  mode?: ThemeMode,
  scheme?: ThemeColorScheme,
  registry?: ComponentThemeRegistry
): Record<string, string>
```

```typescript
generateComponentClasses(
  component: string,
  variant?: string,
  mode?: ThemeMode,
  scheme?: ThemeColorScheme
): Record<string, string>
```

#### React Style Generation

```typescript
getComponentStyleFromVariant(
  variant: any,
  state?: string,
  mode?: ThemeMode
): React.CSSProperties
```

```typescript
getComponentStyle(
  component: string,
  variant?: string,
  state?: string,
  mode?: ThemeMode
): React.CSSProperties
```

#### Registry Access

```typescript
getAllComponentVariants(): ComponentThemeRegistry
```

```typescript
getComponentVariants(component: string): Record<string, any> | undefined
```

## Advanced Usage

### Custom Theme Mode

```typescript
// Get dark mode variables
const darkModeVariables = themeManager.generateAllVariables('dark');

// Switch between modes
function setThemeMode(mode: 'light' | 'dark') {
  const variables = themeManager.generateAllVariables(mode);
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}
```

### Dynamic Component Styling

```tsx
function DynamicComponent({ component, variant, state, children }) {
  const [currentState, setCurrentState] = useState(state || 'default');
  const style = themeManager.getComponentStyle(component, variant, currentState);

  return (
    <div
      style={style}
      onMouseOver={() => setCurrentState('hover')}
      onMouseOut={() => setCurrentState('default')}
      onMouseDown={() => setCurrentState('active')}
      onMouseUp={() => setCurrentState('hover')}
    >
      {children}
    </div>
  );
}
```

## Extending the Manager

You can extend the `ThemeComponentManager` class to add custom functionality:

```typescript
class ExtendedThemeManager extends ThemeComponentManager {
  // Add custom animation styles
  generateAnimationStyles(component: string, variant: string): string {
    const baseStyle = this.getComponentStyle(component, variant);
    const hoverStyle = this.getComponentStyle(component, variant, 'hover');

    return `
      .${component}-${variant} {
        transition: background-color 0.3s, color 0.3s;
        ${Object.entries(baseStyle).map(([key, value]) => `${key}: ${value};`).join('\n')}
      }

      .${component}-${variant}:hover {
        ${Object.entries(hoverStyle).map(([key, value]) => `${key}: ${value};`).join('\n')}
      }
    `;
  }
}
```

## License

MIT

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
