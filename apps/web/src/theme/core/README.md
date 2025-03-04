Theme System Documentation
Overview
This theme system provides a comprehensive solution for managing design tokens, typography, colors, and component styling in a React application. It offers a type-safe, extensible architecture that supports multiple themes, color schemes, and responsive design.

Table of Contents
Architecture
Core Concepts
Type System
Mapping System
Registry System
Usage
API Reference
Examples
Best Practices
Troubleshooting
Architecture
The theme system is built on three main pillars:

Type System: Defines the structure of theme elements (colors, typography, components)
Mapping System: Handles transformations between different formats and contexts
Registry System: Manages runtime storage and retrieval of theme elements
Copy
theme/
├── types/           # Type definitions
│   ├── core/        # Core type definitions
│   └── mappings/    # Mapping type definitions
├── mappings/        # Mapping implementations
├── registry/        # Registry implementations
├── managers/        # Manager classes
├── hooks/           # React hooks
├── context/         # React context
└── utils/           # Utility functions
Core Concepts
Design Tokens
Design tokens are the atomic elements of the design system, representing colors, typography, spacing, etc. They are defined as strongly-typed objects and can be transformed into various formats (CSS variables, style objects, etc.).

Mappings
Mappings transform design tokens between different representations. For example, a color mapping can transform a color from HEX to RGB or HSL, or generate a set of related colors based on a base color.

Registries
Registries store design tokens and their variants at runtime. They provide methods for retrieving, setting, and generating tokens based on context (theme mode, color scheme, etc.).

Managers
Managers coordinate between mappings and registries to provide a unified API for the theme system. They handle operations like generating CSS variables, creating style objects, and managing theme switching.

Type System
Base Types
Copy
// Core color definition
export interface ColorDefinition {
  hex: string;
  rgb: string;
  hsl: string;
  alpha?: number;
}

// Typography scale
export interface TypographyScale {
  fontSize: string;
  lineHeight: string | number;
  letterSpacing: string;
  fontWeight: number;
  fontFamily?: string;
  textTransform?: string;
  scale?: string;
}

// Component state
export interface ComponentState {
  background: ColorDefinition;
  foreground: ColorDefinition;
  border: ColorDefinition;
  shadow?: ColorDefinition;
  opacity?: number;
}

// Interactive state extends component state with states
export interface InteractiveState extends ComponentState {
  hover: ComponentState;
  active: ComponentState;
  focus: ComponentState;
  disabled: ComponentState;
}
Component Variants
Component variants define the visual appearance of UI components in different states:

Copy
// Button variant
export interface ButtonVariant extends InteractiveState {}

// Input variant with additional states
export interface InputVariant extends InteractiveState {
  readonly: ComponentState;
  error: InputValidationState;
  success: InputValidationState;
  prefix: InputAddonState;
  suffix: InputAddonState;
  placeholder: ColorDefinition;
  label: ColorDefinition;
}

// Additional component variants...
Mapping System
Color Mapping
The ColorMapping class handles color transformations and operations:

Copy
const colorMapping = new ColorMapping({
  prefix: "color",
  format: "rgb",
  enforceContrast: true
});

// Set a base color
colorMapping.setColor("primary", {
  hex: "#0066cc",
  rgb: "rgb(0, 102, 204)",
  hsl: "hsl(210, 100%, 40%)"
});

// Generate related colors
const contrastColor = colorMapping.getContrastColor(primaryColor);
const hoverColor = colorMapping.adjustLightness(primaryColor, 0.1);
Typography Mapping
The TypographyMapping class manages typography scales and presets:

Copy
const typographyMapping = new TypographyMapping({
  baseSize: 16,
  baseLineHeight: 1.5,
  scaleRatio: 1.25,
  fontFamilies: {
    base: "'Open Sans', sans-serif",
    heading: "'Montserrat', sans-serif",
    mono: "'Roboto Mono', monospace"
  }
});

// Generate a typography preset
const preset = typographyMapping.generatePreset("default");

// Convert to CSS variables
const cssVars = typographyMapping.toCSS();
Registry System
Component Registry
The component registry stores component variants and provides methods for retrieving them:

Copy
const registry = createComponentRegistry();

// Register a button variant
registry.setVariant("button", "primary", primaryButtonVariant);

// Get a button variant
const buttonVariant = registry.getVariant("button", "primary");
Typography Registry
The typography registry stores typography presets and scales:

Copy
const typographyRegistry = createTypographyRegistry();

// Register a typography preset
typographyRegistry.presets.set("default", defaultPreset);

// Register a component-specific typography
typographyRegistry.components.set("button", {
  default: buttonTypography
});
Usage
Theme Provider
Wrap your application with the ThemeProvider to make the theme available throughout your component tree:

Copy
import { ThemeProvider } from './theme/context/theme-provider';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
Using the Theme Hook
Access theme values and functions using the useTheme hook:

Copy
import { useTheme } from './theme/hooks/useTheme';

function Button({ variant = 'primary', children }) {
  const theme = useTheme();

  // Get component style
  const style = theme.getComponentStyle('button', variant);

  // Get typography
  const typography = theme.typography.getComponentTypography('button');

  return (
    <button
      style={{
        ...style,
        ...typography
      }}
    >
      {children}
    </button>
  );
}
CSS Variables
Generate CSS variables for your theme:

Copy
import { useTheme } from './theme/hooks/useTheme';

function GlobalStyles() {
  const theme = useTheme();
  const variables = theme.generateThemeVariables();

  // Convert variables to CSS string
  const cssString = Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');

  return (
    <style>
      {`:root {
        ${cssString}
      }`}
    </style>
  );
}
API Reference
ColorMapping
Copy
class ColorMapping {
  // Constructor
  constructor(config?: Partial<ColorMappingConfig>);

  // Color management
  setColor(path: string, color: ColorDefinition): void;
  getColor(path: string): ColorDefinition | undefined;

  // Color operations
  lighten(color: ColorDefinition, amount: number): ColorDefinition;
  darken(color: ColorDefinition, amount: number): ColorDefinition;
  adjustAlpha(color: ColorDefinition, amount: number): ColorDefinition;
  adjustHue(color: ColorDefinition, degrees: number): ColorDefinition;
  adjustSaturation(color: ColorDefinition, amount: number): ColorDefinition;
  getContrastColor(color: ColorDefinition): ColorDefinition;

  // Export/Import
  toCSS(): Record<string, ColorDefinition>;
  fromCSS(variables: Record<string, ColorDefinition>): void;
}
TypographyMapping
Copy
class TypographyMapping {
  // Constructor
  constructor(options: TypographyMappingOptions);

  // Scale management
  calculateScale(level: ScaleValue): TypographyScale;
  setScale(name: string, scale: TypographyScale): void;
  getScale(name: string): TypographyScale | undefined;

  // Preset generation
  generatePreset(name?: string): TypographyPreset;

  // Export/Import
  toCSS(prefix?: string): Record<string, string>;
  fromCSS(variables: Record<string, string>, prefix?: string): void;
}
ComponentRegistryManager
Copy
class ComponentRegistryManager {
  // Constructor
  constructor(initialRegistry?: Partial<ComponentThemeRegistry>);

  // Variant management
  getVariant<T extends keyof ComponentThemeRegistry>(
    component: T,
    variant?: string
  ): ComponentThemeRegistry[T][string] | undefined;

  setVariant<T extends keyof ComponentThemeRegistry>(
    component: T,
    variant: string,
    value: ComponentThemeRegistry[T][string]
  ): void;

  // Registry access
  getRegistry(): ComponentThemeRegistry;
}
Examples
Creating a Button Component
Copy
import React from 'react';
import { useTheme } from '../theme/hooks/useTheme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
  disabled
}) => {
  const theme = useTheme();

  // Get the appropriate state based on disabled prop
  const state = disabled ? 'disabled' : 'default';

  // Get full style including colors and typography
  const style = theme.getComponentFullStyle('button', variant, state);

  return (
    <button
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
Creating a Custom Theme
Copy
import { createTheme } from '../theme/utils/create-theme';

const customTheme = createTheme({
  name: 'custom-theme',
  colors: {
    primary: {
      base: { hex: '#3f51b5', rgb: 'rgb(63, 81, 181)', hsl: 'hsl(231, 48%, 48%)' },
      light: { hex: '#757de8', rgb: 'rgb(117, 125, 232)', hsl: 'hsl(236, 71%, 68%)' },
      dark: { hex: '#002984', rgb: 'rgb(0, 41, 132)', hsl: 'hsl(224, 100%, 26%)' }
    },
    secondary: {
      base: { hex: '#f50057', rgb: 'rgb(245, 0, 87)', hsl: 'hsl(339, 100%, 48%)' },
      light: { hex: '#ff5983', rgb: 'rgb(255, 89, 131)', hsl: 'hsl(342, 100%, 67%)' },
      dark: { hex: '#bb002f', rgb: 'rgb(187, 0, 47)', hsl: 'hsl(339, 100%, 37%)' }
    }
  },
  typography: {
    baseSize: 16,
    scaleRatio: 1.333,
    fontFamilies: {
      base: "'Roboto', sans-serif",
      heading: "'Playfair Display', serif",
      mono: "'Fira Code', monospace"
    }
  }
});
Best Practices
Organizing Theme Files
Separate concerns: Keep types, implementations, and utilities in separate files
Group by domain: Group related files (e.g., all color-related files) together
Use index files: Create index files to simplify imports
Performance Considerations
Memoize theme values: Use React.useMemo to prevent unnecessary recalculations
Batch updates: When changing multiple theme values, batch updates to minimize re-renders
Use CSS variables: Prefer CSS variables over inline styles for better performance
Type Safety
Use strict typing: Avoid using any or unnecessary type assertions
Create helper types: Use utility types to make complex types more manageable
Document complex types: Add JSDoc comments to explain complex type structures
Troubleshooting
Common Issues
Theme values not updating: Ensure you're using the latest theme context value
Type errors in component variants: Check that your variant types match the expected structure
CSS variables not applying: Verify that your CSS variables are properly injected into the DOM
Debugging Tips
Inspect theme context: Use React DevTools to inspect the theme context value
Log generated CSS: Log the generated CSS variables to verify they're correct
Check component props: Verify that components are receiving the expected theme props
Contributing
Guidelines for contributing to the theme system:

Follow the type system: Ensure new features adhere to the existing type system
Add tests: Write tests for new features and bug fixes
Document changes: Update documentation when adding or changing features
Follow naming conventions: Use consistent naming for types, functions, and variables
License
This theme system is released under the MIT License. See the LICENSE file for details.


comparison to design tokens only:

Key Differences
Feature	Implementation 1	Implementation 2
Structure	Flat structure with direct design tokens	Hierarchical with computed variables
Color System	Simple color objects with string values	Complex color system with schemes, modes, and color definitions
Variable Generation	Manual setting of values	Automated generation from color definitions
Type Safety	Strong typing for each design token category	Strong typing with additional computed values
Flexibility	Simpler to understand but less flexible	More complex but highly adaptable to different contexts
Integration with Existing Types	Requires adapting your existing types	Built to work with your existing color system
CSS Variables	No direct connection to CSS variables	Integrated with CSS variable system
Default Values	Hard-coded defaults in the factory function	Computed defaults based on color schemes and modes
Strengths of Implementation 1:
Simplicity: The structure is straightforward with direct access to design tokens.
Familiarity: Follows common design system patterns used in libraries like Chakra UI or Material UI.
Ease of Use: Developers can easily access theme values without navigating through nested objects.
Comprehensive Defaults: Comes with a full set of default values for all design tokens.
Deep Merging: Includes logic for properly merging nested objects when overriding defaults.
Strengths of Implementation 2:
Integration: Built specifically to work with your existing color system and types.
Computed Values: Automatically generates theme variables from your color definitions.
Color Scheme Support: Better handles multiple color schemes and theme modes.
CSS Variable Integration: Directly connects to your CSS variable system.
Separation of Concerns: Clearly separates raw color data from computed values.
Adaptability: More easily adapts to different contexts and rendering environments.
