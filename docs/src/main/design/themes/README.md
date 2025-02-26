# Theme System Documentation
**File Path:** 📄 docs/features/themes.md
**Version:** 1.0.0
**Last Updated:** 2025-02-21
**Authored By:** Jurie Smit (assisted by Monica)
**Status:** Active
**Tags:** themes, dark-mode, color-schemes, customization

**Quick Links**
| 📚 Documentation | 🛠️ Development | 🔍 More |
|-----------------|----------------|----------|
| [API Reference](./themes/api-reference.md) | [Theme Development](./themes/development.md) | [Color Schemes](./themes/color-schemes.md) |
| [Usage Guide](./themes/usage-guide.md) | [Contributing](./themes/contributing.md) | [Customization](./themes/customization.md) |

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Basic Usage](#basic-usage)
- [Advanced Configuration](#advanced-configuration)
- [API Reference](#api-reference)
- [Customization Guide](#customization-guide)
- [Best Practices](#best-practices)

## Overview

The theme system provides a flexible and powerful way to manage application appearance through color schemes and dark/light modes. It supports system preferences, user customization, and persistent settings.

### Key Features
- Multiple color schemes (classic, forest, ocean, phoenix, lavender, cloud)
- Dark and light mode support
- System theme integration
- Persistent preferences
- Runtime theme switching
- Mobile-responsive theming

## Getting Started

### Installation

```bash
# If using npm
npm install @your-org/theme-system

# If using yarn
yarn add @your-org/theme-system
```

### Basic Setup

```tsx
import { ThemeProvider } from '@your-org/theme-system';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Usage

### Using the Theme Hook

```tsx
import { useTheme } from '@your-org/theme-system';

function ThemeSwitcher() {
  const { colorScheme, mode, setColorScheme, toggleMode } = useTheme();

  return (
    <div>
      <select
        value={colorScheme}
        onChange={(e) => setColorScheme(e.target.value)}
      >
        <option value="classic">Classic</option>
        <option value="ocean">Ocean</option>
        {/* ... other options */}
      </select>

      <button onClick={toggleMode}>
        Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </div>
  );
}
```

### CSS Integration

```css
/* Example theme class usage */
.theme-classic-light {
  --theme-primary: #007AFF;
  --theme-background: #FFFFFF;
  /* ... other variables */
}

.theme-classic-dark {
  --theme-primary: #0A84FF;
  --theme-background: #000000;
  /* ... other variables */
}
```

## Advanced Configuration

### Custom Initial Config

```tsx
const initialConfig = {
  colorScheme: 'ocean',
  mode: 'dark'
};

function App() {
  return (
    <ThemeProvider initialConfig={initialConfig}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### System Theme Integration

```tsx
function ThemeSettings() {
  const { useSystemMode, setUseSystemMode } = useTheme();

  return (
    <label>
      <input
        type="checkbox"
        checked={useSystemMode}
        onChange={(e) => setUseSystemMode(e.target.checked)}
      />
      Use System Theme
    </label>
  );
}
```

## API Reference

### ThemeProvider Props

| Prop | Type | Description |
|------|------|-------------|
| children | React.ReactNode | Child components |
| initialConfig | Partial<ThemeConfig> | Optional initial theme configuration |

### useTheme Hook

| Property | Type | Description |
|----------|------|-------------|
| colorScheme | ColorScheme | Current color scheme |
| mode | Mode | Current theme mode (light/dark) |
| systemMode | Mode | System preferred mode |
| useSystemMode | boolean | Whether system theme is enabled |
| setColorScheme | (scheme: ColorScheme) => void | Update color scheme |
| setMode | (mode: Mode) => void | Update theme mode |
| toggleMode | () => void | Toggle between light/dark |
| setUseSystemMode | (use: boolean) => void | Enable/disable system theme |

## Best Practices

1. **Theme Consistency**
   - Use CSS variables for theme values
   - Maintain consistent color schemes across components
   - Follow accessibility guidelines for color contrast

2. **Performance**
   - Use memoization for theme-dependent components
   - Avoid unnecessary theme switches
   - Implement proper loading states

3. **User Experience**
   - Provide smooth transitions between themes
   - Save user preferences
   - Respect system preferences by default

4. **Maintenance**
   - Document custom theme additions
   - Follow naming conventions
   - Keep theme definitions centralized

## Further Reading

- [Color Scheme Guide](./themes/color-schemes.md)
- [Theme Development](./themes/development.md)
- [Customization Guide](./themes/customization.md)
- [Contributing Guidelines](./themes/contributing.md)
