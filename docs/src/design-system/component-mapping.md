# Component Mappings System

## Executive Summary

The Component Mappings System provides a robust, type-safe solution for managing component-level styling and theming in modern web applications. It bridges the gap between design tokens and component-specific implementations, ensuring consistent styling across your application's component library.

## Core Features

- 🎨 Component-specific theme generation
- 🔄 Variant management for components
- 🎯 Interactive state handling
- 📊 CSS variable generation
- 🔐 Type-safe component definitions

## Implementation

### 1. Core Structure

```typescript
// component-mappings.ts
import { ColorMapping } from './color-mappings';
import {
    ButtonVariant,
    ComponentState,
    FormComponentState,
    InputVariant,
    InteractiveState,
    NavigationItem,
    TableVariant,
    ComponentConfig,
    ThemeVariant
} from './interfaces';
import { MappingUtils } from './mapping-utils';

export class ComponentMapping {
    private colorMapping: ColorMapping;
    private components: Map<string, ComponentConfig>;
    private variants: Map<string, ThemeVariant>;
    private cache: Map<string, any>;

    constructor(colorMapping: ColorMapping) {
        this.colorMapping = colorMapping;
        this.components = new Map();
        this.variants = new Map();
        this.cache = new Map();
    }

    // ... existing methods
}
```

### 2. Enhanced Interface Definitions

```typescript
// interfaces.ts
export interface ComponentConfig {
    base: ComponentState;
    variants: Record<string, ThemeVariant>;
    states: InteractiveState;
    modifiers?: Record<string, any>;
}

export interface ThemeVariant {
    name: string;
    base: ComponentState;
    states?: InteractiveState;
    modifiers?: Record<string, any>;
}

export interface ComponentState {
    background: string;
    foreground: string;
    border?: string;
    shadow?: string;
    opacity?: number;
}
```

### 3. Component Registration System

```typescript
// component-registry.ts
export class ComponentRegistry {
    private static instance: ComponentRegistry;
    private registry: Map<string, ComponentConfig>;

    private constructor() {
        this.registry = new Map();
    }

    static getInstance(): ComponentRegistry {
        if (!ComponentRegistry.instance) {
            ComponentRegistry.instance = new ComponentRegistry();
        }
        return ComponentRegistry.instance;
    }

    register(name: string, config: ComponentConfig): void {
        this.registry.set(name, config);
    }

    get(name: string): ComponentConfig | undefined {
        return this.registry.get(name);
    }
}
```

### 4. Usage Example

```typescript
// Example usage
const colorMapping = new ColorMapping();
const componentMapping = new ComponentMapping(colorMapping);

// Register button component
componentMapping.setComponent('button', {
    base: {
        background: 'transparent',
        foreground: colorMapping.getColor('text.primary'),
        border: colorMapping.getColor('border.default')
    },
    variants: {
        primary: componentMapping.generatePrimaryButton(),
        secondary: componentMapping.generateSecondaryButton()
    }
});

// Generate CSS variables
const css = componentMapping.toCSS();
```

## Best Practices

1. **Component Organization**
   - Group related components together
   - Use consistent naming conventions
   - Implement proper type safety

2. **State Management**
   - Handle all interactive states
   - Consider accessibility states
   - Implement proper focus management

3. **Performance Optimization**
   - Implement caching for generated styles
   - Minimize runtime calculations
   - Use efficient data structures

4. **Maintenance**
   - Document component variants
   - Version control component definitions
   - Implement migration strategies

## API Reference

### Component Methods

```typescript
interface ComponentMapping {
    // Component Registration
    setComponent(name: string, config: ComponentConfig): void;
    getComponent(name: string): ComponentConfig;

    // Variant Management
    setVariant(component: string, variant: string, config: ThemeVariant): void;
    getVariant(component: string, variant: string): ThemeVariant;

    // Style Generation
    generateAll(): Record<string, any>;
    toCSS(prefix?: string): Record<string, string>;
    fromCSS(variables: Record<string, string>, prefix?: string): void;
}
```

### Utility Functions

```typescript
export const componentUtils = {
    createInteractiveState,
    createFormComponentState,
    mergeStates,
    generateVariant,
    createComponentConfig
};
```

## Migration Guide

### From v1.x to v2.x

1. Update component configurations:
```typescript
// Old format
const buttonConfig = {
    background: 'primary',
    foreground: 'white'
};

// New format
const buttonConfig: ComponentConfig = {
    base: {
        background: colorMapping.getColor('primary'),
        foreground: colorMapping.getColor('white')
    },
    variants: {},
    states: componentUtils.createInteractiveState(baseState)
};
```

2. Implement new registry system:
```typescript
const registry = ComponentRegistry.getInstance();
registry.register('button', buttonConfig);
```

## Contributing

1. Follow the type-safe implementation
2. Add proper documentation
3. Include test cases
4. Update migration guides

## Testing

```typescript
import { ComponentMapping } from './component-mappings';
import { expect } from 'jest';

describe('ComponentMapping', () => {
    let componentMapping: ComponentMapping;

    beforeEach(() => {
        componentMapping = new ComponentMapping(new ColorMapping());
    });

    test('should generate primary button variant', () => {
        const variant = componentMapping.generatePrimaryButton();
        expect(variant).toHaveProperty('background');
        expect(variant).toHaveProperty('foreground');
    });
});
```
