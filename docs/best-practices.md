# Engineering Best Practices

This document outlines the engineering standards and best practices for the Phoenix VC website project. It serves as a guide for maintaining code quality, security, performance, and a consistent development workflow.

## 1. Coding Conventions

### TypeScript & React

-   **Component Definition**: Use functional components with React Hooks.
-   **Typing**: Use TypeScript for all new code. Avoid `any` wherever possible. Define clear types and interfaces for props, API responses, and state.
-   **File Naming**: Use PascalCase for component files (e.g., `UserProfile.tsx`) and camelCase for non-component files (e.g., `apiClient.ts`).
-   **Imports**: Organize imports in the following order: external libraries, absolute internal paths, relative internal paths.
-   **ESLint & Prettier**: All code must pass ESLint checks and be formatted with Prettier before merging. Adhere to the configurations defined in the root of the project.

### Styling (Tailwind CSS)

-   **Utility-First**: Leverage Tailwind's utility classes directly in the markup. Avoid writing custom CSS for layout and styling unless absolutely necessary.
-   **Theming**: Use the CSS variables defined in `apps/web/src/theme/theme.css` for all color, spacing, and font-related styles to ensure consistency with the multi-theme system. Do not use hardcoded hex values.
-   **Component Abstraction**: For complex, reusable UI elements, create dedicated React components that encapsulate the Tailwind classes.

## 2. Architectural Principles

-   **Component Structure**: Components should be small, focused, and follow the Single Responsibility Principle. Place complex components in their own directory (e.g., `components/ContactForm/`).
-   **Separation of Concerns**:
    -   **UI Components**: Should be primarily concerned with rendering and user interaction.
    -   **Hooks**: Encapsulate reusable logic (e.g., data fetching, state management).
    -   **API Logic**: Isolate all API communication in dedicated service modules or hooks. Components should not directly make `fetch` calls.
-   **State Management**: For local component state, use `useState` and `useReducer`. For global or shared state, use React Context or a lightweight state management library if the need arises. Avoid prop-drilling.
-   **Environment Variables**: Use environment variables (`.env`) for all secrets, API keys, and environment-specific configurations. Do not commit secrets to the repository.

## 3. Security Guidelines

-   **Input Validation**: All user input, both on the client-side (forms) and server-side (Azure Functions), must be strictly validated.
-   **Cross-Site Scripting (XSS)**: React inherently protects against XSS by escaping content. Do not use `dangerouslySetInnerHTML` without a thorough security review.
-   **Secrets Management**: All secrets for the Azure Function App should be managed through Azure Key Vault or Function App application settings. Do not store secrets in the code.
-   **Dependencies**: Regularly audit dependencies for known vulnerabilities using a tool like `npm audit`.

## 4. Performance & Accessibility

### Performance

-   **Bundle Size**: Be mindful of the production bundle size. Use code-splitting for large pages or components.
-   **Rendering**: Avoid unnecessary re-renders by using `React.memo` for expensive components and memoizing complex calculations with `useMemo` and `useCallback`.
-   **Image Optimization**: Compress and appropriately size all image assets. Use modern formats like WebP where possible.

### Accessibility (WCAG 2.1 AA)

-   **Semantic HTML**: Use semantic HTML elements (`<nav>`, `<main>`, `<button>`) to ensure proper document structure.
-   **Keyboard Navigation**: All interactive elements must be focusable and operable via the keyboard.
-   **ARIA Roles**: Use ARIA attributes to enhance accessibility for screen readers, especially for custom components built with Radix UI.
-   **Color Contrast**: Ensure all text meets WCAG AA contrast ratios against its background, respecting the project's multi-theme system.

## 5. Testing

-   **Unit Tests**: All critical business logic, utility functions, and complex hooks should have unit tests.
-   **Component Tests**: Components with complex logic or state should be tested to verify their behavior.
-   **End-to-End (E2E) Tests**: Critical user flows (e.g., the contact form submission) should be covered by E2E tests.

## 6. Documentation

-   **Component Props**: All component props should be documented using TSDoc comments.
-   **Complex Logic**: Any complex algorithms, business logic, or non-obvious code should be accompanied by clear comments explaining its purpose and implementation.
-   **READMEs**: Each package (`web`, `api`, `design-system`) should have a `README.md` that explains its purpose, how to run it, and any specific development guidelines.
