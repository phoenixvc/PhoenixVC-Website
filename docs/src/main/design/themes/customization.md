# Theme Customization
**File Path:** 📄 docs/features/themes/customization.md
**Version:** 1.0.0
**Last Updated:** 2025-02-21
**Status:** Active

## Custom Themes

### Creating a Theme

1. **Define Color Scheme**
```typescript
const customTheme: ThemeConfigWithColors = {
  colorScheme: 'custom',
  mode: 'light',
  colors: {
    light: {
      primary: '#custom',
      // ...
    },
    dark: {
      primary: '#custom-dark',
      // ...
    }
  }
};
```

2. **Register Theme**
```typescript
registerTheme('custom', customTheme);
```

3. **Add CSS Classes**
```css
.theme-custom-light {
  /* light mode variables */
}

.theme-custom-dark {
  /* dark mode variables */
}
```

[Additional customization documentation...]
