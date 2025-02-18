  # Breakpoints

  ## Overview
  Our design system uses a responsive breakpoint system to ensure consistent layouts across different screen sizes and devices.

  ## Breakpoint Scale
  ```scss
  $breakpoints: (
    'xs': 320px,
    'sm': 576px,
    'md': 768px,
    'lg': 992px,
    'xl': 1200px,
    'xxl': 1400px
  );
  ```

  ## Usage Guidelines

  ### Media Queries
  ```scss
  @media (min-width: $breakpoint-md) {
    // Styles for medium screens and up
  }
  ```

  ### Component Examples
  ```tsx
  const ResponsiveComponent = () => (
    <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
    ">
      {/* Content */}
    </div>
  );
  ```

  ## Best Practices
  - Use mobile-first approach
  - Avoid device-specific breakpoints
  - Test thoroughly across breakpoints
  - Consider content rather than devices

  ## Implementation
  ### Tailwind Configuration
  ```javascript
  module.exports = {
    theme: {
      screens: {
        'xs': '320px',
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
        'xxl': '1400px',
      },
    }
  }
  ```