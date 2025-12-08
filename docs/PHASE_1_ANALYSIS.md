# Phase 1: Technology Stack & Best-Practices Baseline

**Date:** 2025-05-23
**Analyzer:** Jules (AI Software Engineer)
**Scope:** Phase 1a (Technology Context) & Phase 1b (Best-Practices Benchmark)

## 1. Technology Stack Overview

### 1.1 Frontend
- **Framework:** React 18.2 (Functional Components, Hooks)
- **Language:** TypeScript 5.3
- **Build Tool:** Vite 5.1
- **Styling:** Tailwind CSS 3.4 (Utility-first) + `tailwindcss-animate`
- **Component Primitives:** Radix UI (Headless UI components)
- **Icons:** Lucide React
- **Animations:** Framer Motion 12.4
- **Routing:** React Router DOM 7.2
- **State Management:** React Context (implied, no Redux/Zustand found)
- **Forms:** React Hook Form

### 1.2 Backend
- **Framework:** Azure Functions v4 (Serverless)
- **Runtime:** Node.js (Version implied by `@types/node` and engines)
- **Language:** TypeScript 4.x (Note: version mismatch with frontend)
- **Email Service:** Nodemailer + `@azure/communication-email`

### 1.3 Data & Storage
- **Database:** None explicitly configured in code (Static site pattern).
- **CMS:** None explicitly integrated (Content appears hardcoded or config-driven).

### 1.4 Tooling & Dev Experience
- **Monorepo Manager:** npm workspaces (`apps/web`, `apps/api`)
- **Linting:** ESLint 9.x (Configured for React & TypeScript)
- **Formatting:** Prettier 3.x
- **Git Hooks:** Husky + Commitlint (Conventional Commits)
- **Infrastructure as Code:** Azure Bicep (`infra/bicep/`)

### 1.5 Testing & QA
- **Unit/Integration:** No standard framework (Vitest/Jest) found in `package.json` dependencies.
- **End-to-End:** No E2E framework (Playwright/Cypress) configured.
- **Scripts:** `test` script in root is missing or minimal. `tests/teams-webhook` suggests some custom PowerShell testing for ops alerts.

### 1.6 Deployments & Ops
- **Platform:** Azure Static Web Apps (SWA)
- **CI/CD:** GitHub Actions (`.github/workflows/`)
  - `production_deployment.yml`: Deploys to Azure SWA.
  - `ci.yml`: Runs linting/checks.
- **Environment Management:** `parameters-production.json` / `parameters-staging.json` in Bicep.

---

## 2. Best-Practices Benchmark

The following standards will be used as the baseline for assessing the project in subsequent phases.

### 2.1 Architecture & Patterns
- **React:**
  - Use Functional Components and Hooks exclusively.
  - Custom hooks for reusable logic (e.g., `useTheme`).
  - Composition over inheritance.
  - Strict separation of concerns (Container/Presentational pattern or Feature-based folders).
- **Monorepo:**
  - Shared UI library in `packages/ui` (currently missing, code is in `apps/web/src/components`).
  - Strict boundary between apps and shared packages.
- **Serverless:**
  - Functions should be stateless and idempotent.
  - Cold start mitigation (bundling, minimizing dependencies).

### 2.2 Security (OWASP & Framework Specifics)
- **Dependencies:** Regular `npm audit` checks.
- **Secrets:** No secrets in code; use Azure Key Vault or App Settings.
- **Input Validation:** Zod or similar for API input validation (Frontend & Backend).
- **XSS Prevention:** React handles most, but verify `dangerouslySetInnerHTML` usage.
- **Headers:** Content Security Policy (CSP), HSTS, X-Frame-Options configured in Azure SWA static config (`staticwebapp.config.json` - to be verified).

### 2.3 Performance
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1.
- **Bundle Size:** Route-based code splitting (`React.lazy`).
- **Assets:** WebP/AVIF images, explicit width/height.
- **Rendering:** Static Generation (SSG) where possible (Vite builds static assets).

### 2.4 Accessibility (WCAG 2.1 AA)
- **Semantic HTML:** Correct use of `<header>`, `<nav>`, `<main>`, `<button>`.
- **Keyboard Nav:** Focus visible styles, logical tab order.
- **Screen Readers:** `aria-label`, `aria-expanded`, `role` attributes where needed (Radix UI helps here).
- **Contrast:** Minimum 4.5:1 ratio for text.

### 2.5 Testing Strategy
- **Unit:** 80% coverage on utility functions and complex logic (Vitest recommended for Vite).
- **Component:** Testing Library for critical UI components.
- **E2E:** Playwright for critical user flows (Contact Form, Navigation).
- **Linting:** Strict ESLint rules (no `any`, exhaustive deps).

### 2.6 DevOps & Git
- **Commits:** Conventional Commits (`feat:`, `fix:`) enforced.
- **PRs:** Semantic PR titles, automated lint/build checks before merge.
- **IaC:** Bicep templates must match the deployed state.
