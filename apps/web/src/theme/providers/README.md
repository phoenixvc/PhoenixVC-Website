Theme System Documentation
Overview
This document provides comprehensive guidance on the theme system implementation, common issues, and best practices for maintaining a consistent UI across the application.

Table of Contents
Theme Architecture
Core Components
Common Issues and Solutions
Best Practices
API Reference
Migration Guide
Examples
Theme Architecture
The theme system is built on a provider-based architecture that manages theme state globally and provides styling interfaces for components. It consists of:

Theme Provider: Central state management for theme selection
Component Manager: Handles component-specific styling
Theme Hooks: Custom hooks for accessing theme properties
Error Boundary: Catches and handles theme-related errors
Key Concepts
Theme Context: Provides theme data to all child components
Component Styles: Theme-specific styling for individual components
CSS Variables: Dynamic values that change based on active theme
Theme Transitions: Smooth transitions between theme changes
Core Components
ThemeProvider
The ThemeProvider is the root component that initializes the theme system:

Copy
<ThemeProvider defaultTheme="light" storageKey="theme-preference">
  <App />
</ThemeProvider>
ThemeToggle
A component that allows users to switch between themes:

Copy
<ThemeToggle />
useTheme Hook
Copy
const { themeName, setTheme, getComponentStyle } = useTheme();
Common Issues and Solutions
Maximum Update Depth Exceeded
Issue: Infinite render loops in theme components.

Error Message:

Copy
Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
Solutions:

Check dependency arrays in useEffect hooks:

Copy
// Incorrect - missing dependency array
useEffect(() => {
  setTheme(preferredTheme);
});

// Correct
useEffect(() => {
  setTheme(preferredTheme);
}, [preferredTheme, setTheme]);
Prevent state updates during rendering:

Copy
// Incorrect - updates state during render
function ThemeToggle() {
  const { themeName, setTheme } = useTheme();
  if (someCriteria) {
    setTheme('dark'); // This causes infinite loop
  }
  return <button>Toggle</button>;
}

// Correct - use event handler or useEffect
function ThemeToggle() {
  const { themeName, setTheme } = useTheme();

  useEffect(() => {
    if (someCriteria) {
      setTheme('dark');
    }
  }, [someCriteria, setTheme]);

  return <button>Toggle</button>;
}
Memoize expensive calculations:

Copy
// Use useMemo to prevent recalculations
const themeStyles = useMemo(() => {
  return calculateStyles(themeName);
}, [themeName]);
Check for circular dependencies between components that use and modify theme state.

Theme Not Applying Correctly
Issue: Components don't reflect theme changes.

Solutions:

Ensure components are wrapped in ThemeProvider
Verify theme names match exactly
Check that component styles are properly registered
Best Practices
Component Styling
Use the theme system for all styling decisions:

Copy
const styles = themeContext.getComponentStyle("button", variant);
Provide fallback styles:

Copy
const styles = themeContext.getComponentStyle?.("button", variant) || defaultStyles;
Combine theme styles with component-specific styles:

Copy
const combinedStyle = {
  ...themeContext.getComponentStyle("button", variant),
  ...props.style
};
Theme Transitions
Use CSS transitions for smooth theme changes:

Copy
.themed-component {
  transition: background-color var(--theme-transition-duration, 200ms);
}
Access transition durations from theme:

Copy
const transitionDuration = themeContext.getCssVariable?.("theme-transition-duration") || "200ms";
Performance Optimization
Memoize theme-dependent values:

Copy
const themeClasses = useMemo(() => {
  return `theme-${themeName}-${component}`;
}, [themeName, component]);
Avoid unnecessary re-renders:

Copy
const MemoizedComponent = React.memo(ThemedComponent);
API Reference
ThemeProvider Props
Prop	Type	Description
defaultTheme	string	Initial theme to use
storageKey	string	Key for storing theme preference
children	ReactNode	Child components
useTheme Hook
Return Value	Type	Description
themeName	string	Current active theme
setTheme	(theme: string) => void	Function to change theme
getComponentStyle	(component: string, variant?: string) => object	Get styles for component
getCssVariable	(name: string) => string	Get CSS variable value
Migration Guide
Migrating from CSS Modules
Replace direct class imports with theme classes:
Copy
// Before
import styles from './Button.module.css';
<button className={styles.button}>Click</button>

// After
const { themeName } = useTheme();
<button className={`theme-${themeName}-button`}>Click</button>
Migrating from Inline Styles
Move inline styles to theme definitions:
Copy
// Before
<button style={{ backgroundColor: 'blue', color: 'white' }}>Click</button>

// After
const styles = themeContext.getComponentStyle("button", "primary");
<button style={styles}>Click</button>
Examples
Basic Theme Toggle
Copy
function ThemeToggle() {
  const { themeName, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(themeName === 'dark' ? 'light' : 'dark');
  }, [themeName, setTheme]);

  return (
    <button onClick={toggleTheme}>
      {themeName === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  );
}
Themed Component
Copy
function ThemedButton({ variant = "primary", children, ...props }) {
  const themeContext = useTheme();
  const { themeName } = themeContext;

  // Get component styles from theme
  const buttonStyle = themeContext.getComponentStyle?.("button", variant) || {};

  // Combine with passed styles
  const combinedStyle = {
    ...buttonStyle,
    ...props.style
  };

  // Generate theme-specific class
  const themeClass = `theme-${themeName}-button-${variant}`;

  return (
    <button
      className={`base-button ${themeClass} ${props.className || ''}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </button>
  );
}
This documentation provides a comprehensive guide to understanding and working with the theme system. By following these practices, you can maintain a consistent UI while avoiding common pitfalls like infinite render loops.
