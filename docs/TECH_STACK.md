# Technology Stack

This document provides a comprehensive overview of the technologies, frameworks, and tools used in the Phoenix VC website project.

## 1. Frontend

- **Framework:** [React](https://reactjs.org/) (v18.2.0)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (v5.3.3)
- **Build Tool:** [Vite](https://vitejs.dev/) (v5.1.3)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v3.4.17)
  - **Animation:** [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components:**
  - **Headless UI:** [Radix UI](https://www.radix-ui.com/) (e.g., `@radix-ui/react-dropdown-menu`)
  - **Icons:** [Lucide React](https://lucide.dev/) (v0.475.0)
- **State Management & Logic:**
  - **Routing:** [React Router DOM](https://reactrouter.com/) (v7.2.0)
  - **Forms:** [React Hook Form](https://react-hook-form.com/) (v7.54.2)
  - **Animation:** [Framer Motion](https://www.framer.com/motion/) (v12.4.7)
  - **Utilities:** `clsx`, `tailwind-merge` for class name management.

## 2. Backend

- **Environment:** [Node.js](https://nodejs.org/) (v20.x)
- **Framework:** [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) (v4.6.1)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (v4.0.0)
- **Email Services:**
  - `@azure/communication-email` (v1.0.0)
  - [Nodemailer](https://nodemailer.com/) (v6.10.0)

## 3. Monorepo & Tooling

- **Package Manager:** [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- **Linting:** [ESLint](https://eslint.org/) (v9.21.0)
- **Formatting:** [Prettier](https://prettier.io/) (v3.2.5)
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) (v9.1.7)
- **Commit Linting:** [Commitlint](https://commitlint.js.org/) (v19.0.3)

## 4. Deployment & Infrastructure

- **Hosting:** [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/static-web-apps/)
- **Infrastructure as Code (IaC):** Bicep (as indicated in `README.md`)
- **Version Control:** [Git](https://git-scm.com/)

## 5. Documentation

- **Static Site Generator:** Jekyll (as indicated by the `docs` structure)
- **Python Tooling:** Poetry for managing Python dependencies related to documentation.

This stack represents a modern, robust, and scalable architecture for a corporate web presence.
