  # Typography

  ## Overview
  Our typography system ensures consistent and readable text across all interfaces.

  ## Font Family
  ```scss
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  ```

  ## Type Scale
  ```scss
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  ```

  ## Usage
  ### Text Components
  ```tsx
  const Typography = () => (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">Heading 1</h1>
      <h2 className="text-3xl font-semibold">Heading 2</h2>
      <p className="text-base">Body text</p>
      <code className="text-sm font-mono">Code</code>
    </div>
  );
  ```

  ## Guidelines
  1. **Hierarchy**: Use size and weight to establish clear hierarchy
  2. **Readability**: Maintain appropriate line heights and widths
  3. **Responsiveness**: Adjust font sizes for different viewports
  4. **Consistency**: Use the type scale consistently

  ## Font Weights
  ```scss
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  ```

  ## Implementation
  ### Tailwind Configuration
  ```javascript
  module.exports = {
    theme: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
    }
  }
  ```