📄 /docs/development/code-style.md

# Code Style Guide

This guide ensures consistent, maintainable, and readable code across our project. By following these guidelines and using our automated linting/pre-commit hooks, you’ll help keep our codebase robust and uniform.

> **Note:** For broader naming conventions (including documentation file names and Azure resource naming), please see [../naming-conventions.md](../naming-conventions.md). This document focuses on language-specific and framework-specific coding practices.

## Table of Contents

- [General Principles](#general-principles)
- [Project Structure](#project-structure)
- [Language-Specific Guidelines](#language-specific-guidelines)
- [Linting and Formatting](#linting-and-formatting)
- [Testing Guidelines](#testing-guidelines)
- [Documentation in Code](#documentation-in-code)
- [Additional Resources](#additional-resources)

---

## General Principles

1. **Readability Above All**  
   - Write code that is easy to understand for others (and future you).  
   - Use meaningful variable names and short, focused functions.

2. **Single Responsibility**  
   - Keep components and functions small and singular in purpose.  
   - Split large modules or files into logical parts.

3. **Consistency**  
   - Stick to one style rule across the entire codebase (e.g., function naming, bracket placement).  
   - Use the same patterns for similar problems.

4. **Avoid Duplication**  
   - Use utility functions and shared components where possible.

---

## Project Structure

Below is a simplified representation of our `src/` folder. The structure may vary depending on the framework (React, Node.js, etc.), but the principles remain consistent:

```plaintext
📁 src/
├── 📁 components/
│   ├── 📁 common/
│   ├── 📁 features/
│   └── 📁 layouts/
├── 📁 hooks/
├── 📁 services/
├── 📁 store/
├── 📁 types/
├── 📁 utils/
└── 📁 pages/
```

> **Key Points:**  
> - Group related code in feature or domain-based directories.  
> - Name files consistently in **kebab-case** (e.g., `user-profile.tsx`).

---

## Language-Specific Guidelines

### JavaScript / TypeScript

- **Variable and Function Names:** Use **camelCase** for variables and functions (e.g., `fetchData`, `userName`).  
- **Classes and Interfaces:** Use **PascalCase** (e.g., `UserProfile`, `ApiService`, `UserProps`).  
- **Constants:** Use **UPPER_SNAKE_CASE** (e.g., `MAX_RETRY_COUNT`).  
- **Import Order:**  
  1. Node or core modules  
  2. Third-party libraries  
  3. Local utilities, services, or hooks  
  4. Styles (if applicable)

```typescript
import fs from 'fs';
import React from 'react';
import { fetchData } from '@/services/api';
import './Component.scss';
```

- **Type Assertions:** Prefer using `as Type` and type guards over angle-bracket assertions in TypeScript.

### React

- **Components:**  
  - Use **PascalCase** for component file names and component definitions (e.g., `UserCard.tsx`).  
  - Keep components small and focused.  
  - Default exports for single major components in a file; named exports for additional helpers.

- **Hooks:**  
  - Use `use` prefix (e.g., `useUserData`) to clearly identify custom hooks.  
  - Keep side effects minimal and avoid deep nesting in hooks.

- **Styles:**  
  - For CSS/SCSS modules, use **kebab-case** for filenames (e.g., `user-card.module.scss`).  
  - Adhere to BEM or a consistent naming convention for class selectors.

### Node.js / Express

- **Controllers:** Keep logic minimal; delegate heavy lifting to services.  
- **Services:** Encapsulate business logic or external API calls.  
- **Routes:** Use RESTful endpoints (e.g., `GET /api/users`, `POST /api/users`).  
- **Error Handling:** Centralize error handling and use consistent error responses.

### Additional Languages / Frameworks

- If you are using other frameworks (e.g., Angular, Vue) or other languages (e.g., Python for scripts), maintain similar principles:
  - Clear structure  
  - Consistent naming  
  - Appropriate partitioning of logic  

---

## Linting and Formatting

Our project uses ESLint and Prettier to maintain consistent code quality and formatting.

### ESLint Configuration (Snippet)
```javascript
// .eslintrc.js (example)
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'eslint:recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    // Add or override rules here
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

### Prettier Configuration (Snippet)
```jsonc
// .prettierrc (example)
{
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": true
}
```

> **Tip:** The project’s pre-commit hooks (set up via Husky) automatically run lint checks and commit message checks (via commitlint). Please fix all lint errors before pushing.

---

## Testing Guidelines

- **Testing Frameworks:** (e.g., Jest, React Testing Library, Mocha)  
  - Organize tests either alongside the code (`__tests__` folder) or in a separate `tests/` directory.  
  - Name test files clearly (e.g., `Component.test.tsx`).

- **Unit Tests:** Test small pieces of logic (functions, components).  
- **Integration Tests:** Test interactions among multiple components/services.  
- **Coverage:** Aim for high coverage but focus on meaningful tests.  
- **Mocking/Stubbing:** Use mocks for external services or complex dependencies.

```typescript
import { render, screen } from '@testing-library/react';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('displays user name', () => {
    render(<UserCard user={{ name: 'Alice' }} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
```

> **TODO:** Add guidelines for E2E testing with Cypress, Playwright, or other frameworks.

---

## Documentation in Code

- **JSDoc/TSDoc:**  
  Use inline documentation for complex logic, helper utilities, or public APIs.  
  ```typescript
  /**
   * Fetches user data from the server.
   * @param userId - Unique user ID
   * @returns Promise resolving to user data
   */
  async function fetchUserData(userId: string): Promise<User> {
    // ...
  }
  ```
- **Comments:**  
  Keep comments short, relevant, and avoid restating obvious logic.  
- **External Docs Link:**  
  If your function references a complex domain concept, consider linking to relevant domain documentation.

---

## Additional Resources

- [Naming Conventions](../naming-conventions.md)
- [Contributing Guidelines](../contributing.md)
- [Development Setup Guide](./development-setup.md)
- [GitHub Issue Tracker](https://github.com/your-organization/phoenixvc-modernized/issues)

---
