  # Iconography

  ## Overview
  Our icon system provides a consistent visual language across all interfaces and platforms.

  ## Icon Sets
  We primarily use [Lucide](https://lucide.dev/) icons, supplemented with custom icons when needed.

  ### Default Icon Sizes
  ```scss
  --icon-size-xs: 16px;
  --icon-size-sm: 20px;
  --icon-size-md: 24px;
  --icon-size-lg: 32px;
  --icon-size-xl: 48px;
  ```

  ## Usage
  ### React Components
  ```tsx
  import { Camera, User, Settings } from 'lucide-react';

  const IconExample = () => (
    <div className="flex gap-2">
      <Camera className="w-6 h-6" />
      <User className="w-6 h-6" />
      <Settings className="w-6 h-6" />
    </div>
  );
  ```

  ## Guidelines
  1. **Consistency**: Use consistent icon sizes within similar contexts
  2. **Accessibility**: Include aria-labels for icon buttons
  3. **Color**: Icons should inherit text color by default
  4. **Touch Targets**: Ensure sufficient padding for touch interactions

  ## Custom Icons
  ### Adding Custom Icons
  ```tsx
  const CustomIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* SVG path data */}
    </svg>
  );
  ```

  ## Implementation Examples
  ### Icon Button
  ```tsx
  const IconButton = ({ icon: Icon, label }) => (
    <button
      className="p-2 rounded-full hover:bg-gray-100"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
  ```