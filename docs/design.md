# Design System & Visual Identity

This document outlines the reverse-engineered design system for the Phoenix VC website, based on an analysis of the existing UI implementation and style definitions.

## 1. Visual Aesthetic & Moodboard

The project's visual identity is modern, clean, and professional, befitting a venture capital firm. It employs a multi-theme system that allows for user-selectable appearances, ranging from a classic, professional look to more vibrant, thematic styles.

- **Aesthetic:** Corporate, minimalist, and tech-forward.
- **Color Scheme:** The system is built on a robust set of CSS variables that define multiple themes. The default "Classic" theme uses a muted, professional palette.
- **Typography:** The primary font is "Outfit," a modern sans-serif that provides excellent readability.
- **UI Components:** The UI likely consists of standard components such as cards, buttons, and popovers, styled with a consistent shadow and border radius (`0.5rem`).

## 2. Color Palette & Theming

The project utilizes a sophisticated multi-theme system built with CSS variables. A base "Classic" theme is defined, with both light and dark modes, and is supplemented by several alternative themes.

### Core Design Tokens (Classic Theme - Light Mode)

| Token          | HSL Value             | Near Hex    | Description                            |
| :------------- | :-------------------- | :---------- | :------------------------------------- |
| `--background` | `210 20% 98%`         | `#f5f7fa`   | Main page background color             |
| `--foreground` | `210 20% 15%`         | `#262a2f`   | Default text color                     |
| `--primary`    | `222.2 47.4% 11.2%`   | `#111827`   | Primary UI elements (e.g., links)      |
| `--secondary`  | `210 40% 96.1%`       | `#f1f5f9`   | Secondary UI elements, backgrounds     |
| `--accent`     | `210 40% 96.1%`       | `#f1f5f9`   | Accent color, often for highlights     |
| `--card`       | `0 0% 100%`           | `#ffffff`   | Background color for card components   |
| `--border`     | `220 15% 85%`         | `#d4d8e0`   | Default border color                   |
| `--destructive`| `0 84.2% 60.2%`       | `#f43f5e`   | Destructive actions (e.g., delete)     |

### Available Themes

The application supports the following thematic variations, each with a light and dark mode:

- **Classic:** The default, professional theme.
- **Ocean:** A blue-toned theme.
- **Lavender:** A purple-toned theme.
- **Phoenix:** A theme with orange and dark gray accents, likely the brand's primary theme.
- **Forest:** A green-toned theme.
- **Cloud:** A minimalist, grayscale theme.

## 3. Typography

- **Primary Font Family:** `Outfit`, a sans-serif font.
- **Font Smoothing:** Antialiased for a smoother appearance on screens.

### Typographic Scale (from `theme.css`)

| Element | Base Size | MD Size | LG Size | Font Weight |
| :------ | :-------- | :------ | :------ | :---------- |
| `h1`    | `2.25rem` | `3rem`  | `3.75rem` | `bold`      |
| `h2`    | `1.875rem`| `2.25rem`| `3rem`  | `bold`      |
| `h3`    | `1.5rem`  | `1.875rem`|`2.25rem`| `bold`      |
| `a`     | Inherit   | Inherit | Inherit | Inherit     |
| `body`  | Inherit   | Inherit | Inherit | Inherit     |

## 4. Spacing & Layout

- **Border Radius:** A consistent `--radius` of `0.5rem` is used for components, giving them moderately rounded corners.
- **Shadows:** A standard `--shadow` (`0 0 15px rgba(0, 0, 0, 0.1)`) is used for elevation, creating a soft, modern look.

## 5. UI Components (Inferred)

Based on the CSS, the following components are part of the design system:

- **Cards:** Defined with `--card` and `--card-foreground` variables.
- **Popovers:** Similar to cards, with their own set of variables.
- **Inputs:** Styled with `--input` for the background.
- **Buttons:** Not explicitly defined but can be inferred from the use of `primary`, `secondary`, and `destructive` colors for actions.
