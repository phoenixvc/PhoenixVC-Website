<!--color-formats-tokens.md-->
# Color Formats and Design Tokens

## Overview

This document explains both the technical aspects of color formats (HSL, RGB, and Hex) and their integration with design tokens in modern design systems. We'll cover how these fundamental building blocks work together to create consistent, maintainable, and scalable design systems.

## Design Tokens

Design tokens are the atomic elements of a design system - the values for colors, spacing, typography, etc., that are used in place of hard-coded values. They help maintain consistency across platforms and provide a single source of truth.

### Token Structure

```typescript
export interface DesignToken<T> {
  value: T;
  type: 'color' | 'spacing' | 'typography' | 'shadow';
  description?: string;
  category?: string;
  attributes?: {
    mode?: 'light' | 'dark';
    state?: 'hover' | 'active' | 'disabled';
    [key: string]: any;
  };
}

export interface ColorToken extends DesignToken<ColorDefinition> {
  type: 'color';
  references?: string[]; // References to other tokens
  transforms?: ColorTransform[];
}

export interface ColorTransform {
  type: 'lighten' | 'darken' | 'alpha' | 'saturate' | 'desaturate';
  amount: number;
}
```

### Token Categories

1. **Global Tokens**
   ```typescript
   const globalTokens = {
     colors: {
       blue500: {
         value: { hex: '#0066FF', rgb: 'rgb(0, 102, 255)', hsl: 'hsl(217, 100%, 50%)' },
         type: 'color',
         category: 'global'
       }
     }
   };
   ```

2. **Semantic Tokens**
   ```typescript
   const semanticTokens = {
     colors: {
       primary: {
         value: '{colors.blue500}', // Reference to global token
         type: 'color',
         category: 'semantic'
       },
       'primary-hover': {
         value: '{colors.blue500}',
         transforms: [{ type: 'darken', amount: 10 }],
         type: 'color',
         category: 'semantic'
       }
     }
   };
   ```

## Color Definition with Tokens

```typescript
export type ShadeLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type ColorShades = Record<ShadeLevel, ColorToken>;

export interface ColorDefinition {
  hex: string;
  rgb: string;
  hsl: string;
  alpha?: number;
}

// Example usage with tokens
const primaryColors: ColorShades = {
  500: {
    value: {
      hex: '#0066FF',
      rgb: 'rgb(0, 102, 255)',
      hsl: 'hsl(217, 100%, 50%)'
    },
    type: 'color',
    category: 'brand',
    description: 'Primary brand color'
  },
  // ... other shades
};
```

## Color Definition

Our project uses the following type definition for colors:

```ts
export type ShadeLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type ColorShades = Record<ShadeLevel, ColorDefinition>;

export interface ColorDefinition {
  hex: string;
  rgb: string;
  hsl: string;
  alpha?: number; // Optional opacity (0 to 1)
}
```

## Base vs. Mode Colors

In many theming systems, colors are split into two categories:

1. **Base (Brand) Colors**
   These are often primary, secondary, and accent colors—brand‐specific hues that might need multiple shades (e.g., 50 through 900).
   - We typically generate or store a **full palette** of shades (each shade is a `ColorDefinition`) for use in various components/states.
   - HSL is especially valuable here because it lets us easily create lighter or darker shades.

2. **Mode-Specific Colors**
   These are your global UI colors for a given mode (light/dark), such as `background`, `text`, `border`, or `muted`.
   - Usually **only one** color definition is needed per key (no multi‐level palette).
   - For example, `background` in dark mode might be a deep navy, while `text` might be near‐white.

Both groups benefit from having **valid HSL** (as well as `hex` and `rgb`) so they can be dynamically adjusted or transformed (e.g., darkening a background in dark mode).

---

## RGB

- **Definition:** Stands for Red, Green, Blue.
- **Format:**
  - For opaque colors: `rgb(r, g, b)`
  - With transparency: `rgba(r, g, b, a)`
- **Value Range:**
  - r, g, b: 0–255
  - a: 0 (fully transparent) to 1 (fully opaque)
- **Usage:**
  - Ideal for representing colors as they appear on digital displays.
  - The rgba format is used when transparency effects are needed.
- **Example:**
  - Opaque: `rgb(255, 87, 51)`
  - With alpha: `rgba(255, 87, 51, 0.8)`

## Hexadecimal (Hex)

- **Definition:** A compact representation of RGB values in hexadecimal (base-16) format.
- **Format:**
  - Opaque: `#RRGGBB` or shorthand `#RGB`
  - With transparency (extended): `#RRGGBBAA` or shorthand `#RGBA`
- **Usage:**
  - Commonly used in CSS and web development due to its brevity.
  - Extended hex codes allow for the inclusion of an alpha channel.
- **Example:**
  - Opaque: `#FF5733`
  - With alpha (if supported): `#FF573380`

## HSL

- **Definition:** Stands for Hue, Saturation, Lightness.
- **Format:**
  - Opaque: `hsl(h, s%, l%)`
  - With transparency: `hsla(h, s%, l%, a)`
- **Details:**
  - **Hue (h):** A degree on the color wheel (0–360).
  - **Saturation (s):** A percentage (0%–100%) indicating color intensity.
  - **Lightness (l):** A percentage (0%–100%) indicating brightness.
  - **Alpha (a):** Optional value (0 to 1) representing opacity.
- **Usage:**
  - Particularly useful for adjusting colors intuitively (e.g., modifying brightness or saturation).
  - The hsla format is used when a transparency level is required.
- **Example:**
  - Opaque: `hsl(9, 100%, 60%)`
  - With alpha: `hsla(9, 100%, 60%, 0.8)`

## Conversions

- **RGB to Hex:**
  Convert each RGB component to its two-digit hexadecimal equivalent. Extended conversion may include the alpha channel if provided.

- **Hex to RGB:**
  Convert hex codes by splitting them into pairs and converting each pair back to a decimal value. Extended hex codes can also yield an alpha value.

- **RGB to HSL / HSL to RGB:**
  These conversions require mathematical formulas and may involve handling the alpha channel separately, ensuring that the opacity is preserved during conversion.

---

## Clamping & Rounding in HSL

Many teams prefer that **Hue** (`h`) be an **integer** between 0 and 360, while **Saturation** (`s`) and **Lightness** (`l`) can remain decimal values but are **clamped** into the range [0, 100]. For example:

- **Hue:** `h = Math.round(h * 360)` then clamp 0..360
- **Saturation:** clamp to 0..100 but can be 77.4
- **Lightness:** clamp to 0..100 but can be e.g. 35.6

This approach prevents out-of-range or negative values (like `-5%`), while still allowing nuanced partial percentages.

## Design Token Integration

### Token Resolution

```typescript
interface TokenResolver {
  resolve(token: string): ColorDefinition;
  resolveReference(reference: string): ColorToken;
  applyTransforms(color: ColorDefinition, transforms: ColorTransform[]): ColorDefinition;
}

// Example usage
const resolver = new TokenResolver();
const primaryColor = resolver.resolve('{colors.primary}');
```

### Mode-Specific Tokens

```typescript
const modeTokens = {
  light: {
    background: {
      value: { hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)', hsl: 'hsl(0, 0%, 100%)' },
      type: 'color',
      attributes: { mode: 'light' }
    }
  },
  dark: {
    background: {
      value: { hex: '#1A1A1A', rgb: 'rgb(26, 26, 26)', hsl: 'hsl(0, 0%, 10%)' },
      type: 'color',
      attributes: { mode: 'dark' }
    }
  }
};
```

## Best Practices

### Token Naming

```typescript
// ✅ Good
const tokens = {
  'color-primary-500': '#0066FF',
  'color-background-surface': '#FFFFFF',
  'color-text-default': '#1A1A1A'
};

// ❌ Avoid
const tokens = {
  blue: '#0066FF',
  white: '#FFFFFF',
  dark: '#1A1A1A'
};
```

### Token Organization

1. **Hierarchy**
   ```typescript
   const tokens = {
     color: {
       brand: {
         primary: { /* ... */ },
         secondary: { /* ... */ }
       },
       semantic: {
         success: { /* ... */ },
         error: { /* ... */ }
       }
     }
   };
   ```

2. **Variants**
   ```typescript
   const buttonTokens = {
     primary: {
       background: { value: '{color.brand.primary}' },
       text: { value: '{color.base.white}' },
       hover: {
         background: {
           value: '{color.brand.primary}',
           transforms: [{ type: 'darken', amount: 10 }]
         }
       }
     }
   };
   ```

## Tooling Integration

```typescript
interface TokenTooling {
  // Export tokens to different platforms
  exportToCSS(): string;
  exportToAndroid(): string;
  exportToiOS(): string;

  // Validation
  validate(): ValidationResult;

  // Documentation
  generateDocs(): Documentation;
}
```

## Library Comparisons and Best Practices

### Popular Design System Approaches

#### Tailwind CSS
- Implements numeric HSL transformations for color palette generation
- Clamps values to ensure valid ranges `[0..100]`
- Provides consistent color scaling across the system

#### Chakra UI
- Features comprehensive light/dark mode toggling
- Implements systematic shade scaling (`50,100,200...900`)
- Maintains strict color definition validity

#### Material UI
- Organizes colors by main/light/dark variants
- Supports theme mode overrides
- Enforces color value clamping for consistency

### Our Implementation

Our design system aligns with these industry standards while maintaining its own advantages:

1. **Shade Generation**
   - Generates multiple shades for brand colors
   - Provides single-value definitions for mode-specific surfaces
   - Example:
   ```typescript
   const brandColor = {
     50: { hsl: 'hsl(217, 100%, 95%)', /* other formats */ },
     500: { hsl: 'hsl(217, 100%, 50%)', /* other formats */ },
     900: { hsl: 'hsl(217, 100%, 15%)', /* other formats */ }
   };
   ```

2. **Color Validation**
   - Clamps HSL values to prevent invalid color strings
   - Rounds decimal values for consistent output
   - Example:
   ```typescript
   // Instead of: hsl(221, 77.4%, -5%)
   // We output: hsl(221, 77%, 0%)
   ```

3. **Format Benefits**
   | Format    | Strength                     | Best For                    |
   |-----------|------------------------------|----------------------------|
   | RGB/rgba  | Screen-based accuracy        | Display output            |
   | Hex       | Concise notation             | Code and design handoff   |
   | HSL/hsla  | Intuitive manipulation       | Dynamic color generation  |

### Implementation Guidelines

1. **Theme Structure**
   - Use palettes for base/brand colors
   - Implement single definitions for mode-specific colors
   - Example:
   ```typescript
   const theme = {
     colors: {
       brand: {
         primary: brandColor,
         // Other brand colors...
       },
       mode: {
         light: {
           background: '#FFFFFF',
           text: '#1A1A1A'
         },
         dark: {
           background: '#1A1A1A',
           text: '#FFFFFF'
         }
       }
     }
   };
   ```

2. **Color Management**
   - Clamp and round HSL values
   - Maintain valid ranges for all color formats
   - Ensure smooth color transformations

### Best Practices

1. **Color Definitions**
   ```typescript
   interface ColorDefinition {
     hex: string;
     rgb: string;
     hsl: string;
     alpha?: number;
   }
   ```

2. **Value Processing**
   - Clamp hue to `[0..360]`
   - Restrict saturation/lightness to `[0..100]`
   - Round values appropriately

3. **Format Consistency**
   - Maintain all three formats (hex, RGB, HSL)
   - Use appropriate format for each context
   - Enable smooth transitions between formats

> **Pro Tip**: Always ensure each `ColorDefinition` maintains valid values across all formats. Using integer hues with carefully managed saturation/lightness decimals provides the best balance of precision and usability.

## Conclusion

Design tokens extend beyond simple color formats to provide:
- **Consistency**: Single source of truth for design values
- **Maintainability**: Centralized management of design decisions
- **Scalability**: Easy updates across platforms
- **Documentation**: Self-documenting design system
- **Flexibility**: Support for multiple platforms and frameworks

This approach combines the technical precision of color formats with the systematic benefits of design tokens. This yields a theming pipeline that matches industry standards while providing the flexibility and consistency needed for modern applications.
