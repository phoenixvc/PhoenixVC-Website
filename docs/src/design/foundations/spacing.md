  # Spacing

  ## Overview
  Our spacing system ensures consistent layout and component spacing across the application.

  ## Spacing Scale
  ```scss
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  ```

  ## Usage
  ### Tailwind Classes
  ```tsx
  const SpacingExample = () => (
    <div className="space-y-4">
      <div className="p-4">Padding: 16px</div>
      <div className="m-6">Margin: 24px</div>
      <div className="gap-2">Gap: 8px</div>
    </div>
  );
  ```

  ## Guidelines
  1. **Consistency**: Use the spacing scale consistently
  2. **Rhythm**: Maintain vertical rhythm with consistent spacing
  3. **Hierarchy**: Use larger spacing for major sections
  4. **Responsiveness**: Adjust spacing based on viewport size

  ## Common Patterns
  ### Card Spacing
  ```tsx
  const Card = () => (
    <div className="p-4 space-y-2">
      <h3 className="text-lg">Title</h3>
      <p className="text-gray-600">Content</p>
    </div>
  );
  ```

  ### Layout Spacing
  ```tsx
  const Layout = () => (
    <div className="container mx-auto px-4 py-8">
      <main className="space-y-8">
        {/* Content */}
      </main>
    </div>
  );
  ```