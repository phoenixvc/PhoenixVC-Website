# Phoenix VC - Website

**Version:** 2.0.0 (Enhanced) | **Status:** Production
**Maintainer:** Hans Jurgens Smit

> Empowering innovation through strategic investments and visionary partnerships

[![Build Status](https://img.shields.io/github/actions/workflow/status/phoenixvc/PhoenixVC-Website/deploy.yml?branch=main)](https://github.com/phoenixvc/PhoenixVC-Website/actions)
[![Version](https://img.shields.io/badge/version-v2.0.0-blue)](https://github.com/phoenixvc/PhoenixVC-Website/releases)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

## 🌐 Deployments

| Environment | URL | Status |
|-------------|-----|--------|
| **Production** | [phoenixvc.tech](https://phoenixvc.tech) | ![Production](https://img.shields.io/badge/status-live-success) |
| **Staging** | [staging-euw-swa-phoenixvc-website.azurestaticapps.net](https://staging-euw-swa-phoenixvc-website.azurestaticapps.net) | ![Staging](https://img.shields.io/badge/status-active-blue) |
| **Documentation** | [docs.phoenixvc.tech](https://docs.phoenixvc.tech) | ![Docs](https://img.shields.io/badge/status-live-success) |

---

## 📋 Table of Contents

- [Project Overview](#1-project-overview)
- [Implemented Improvements](#2-implemented-improvements-phase-3-pocs)
- [Technology Stack](#3-technology-stack)
- [Design System & Visual Identity](#4-design-system--visual-identity)
- [Getting Started](#5-getting-started)
- [Development Scripts](#6-development-scripts)
- [Future Development & Known Issues](#7-future-development--known-issues)
- [Project Structure](#8-project-structure)
- [Deployment Architecture](#9-deployment-architecture)
- [Contributing](#10-contributing)
- [Security](#11-security)
- [Support & Contact](#12-support--contact)
- [License](#13-license)

---

## 1. Project Overview

Phoenix VC is a premier, proprietary venture capital firm dedicated to identifying and investing in transformative technologies. This project is the official corporate website, built with a modern, scalable, and performant technology stack.

### 1.1. Project Purpose & Business Goals
- **Empower Innovation:** Showcase the firm's strategic investments and visionary partnerships.
- **Seamless Digital Experience:** Provide a modern and intuitive user experience that reflects the firm's commitment to cutting-edge technology.
- **Global Communication:** Effectively communicate the firm's brand, mission, and portfolio to a global audience of entrepreneurs, partners, and investors.

### 1.2. Target Audience
- **Entrepreneurs & Startups:** Seeking funding and partnership opportunities.
- **Potential Business Partners:** Exploring strategic collaborations.
- **Investors & LPs:** Accessing information on fund performance and portfolio companies.

## 2. Implemented Improvements (Phase 3 POCs)

This version of the repository includes several proof-of-concept enhancements that have significantly improved the codebase's quality, performance, and accessibility.

- **Foundational Refactoring:**
  - **Centralized Theme Management:** Eliminated prop drilling by refactoring all components to use a centralized `useTheme` hook.
  - **Reusable Button Component:** Created a shared `Button` component within the design system to ensure visual consistency.
  - **Centralized Animations:** Consolidated all `framer-motion` animations into a single, reusable file.
- **Critical Bug Fixes:**
  - **Accessibility:** Implemented focus trapping in modals, converted non-semantic elements to buttons, and fixed `key` prop issues.
  - **React Best Practices:** Refactored scrolling logic to use a `useScrollTo` hook, removing direct DOM manipulation.
- **Performance & UI Enhancements:**
  - **Code Splitting:** Implemented `React.lazy` for all major homepage sections to improve initial load times.
  - **Component Memoization:** Optimized rendering performance by wrapping components in `React.memo` and using `useCallback`.
  - **Enhanced UI States:** Added a skeleton loader for the hero section and implemented global `:focus-visible` styles for improved accessibility.
- **New Features (POCs):**
  - **Team & Advisors Section:** Added a new, lazy-loaded section to the homepage.
  - **News & Insights Blog:** Created a new `/blog` page with a placeholder component.
  - **Interactive Portfolio:** Built a new `/portfolio` page with a filterable UI stub.
- **CI/CD Enhancements:**
  - **Automated Checks:** Added a GitHub Actions workflow to run linting and formatting checks on all pull requests.

## 3. Technology Stack

This project uses a modern, robust technology stack:

| Category      | Technology                               |
|---------------|------------------------------------------|
| **Frontend**  | React, TypeScript, Vite, Tailwind CSS    |
| **UI**        | Radix UI, Framer Motion, Lucide React    |
| **Backend**   | Node.js, Azure Functions, TypeScript     |
| **Tooling**   | npm Workspaces, ESLint, Prettier, Husky  |
| **Deployment**| Azure Static Web Apps, Bicep             |

## 4. Design System & Visual Identity

The project features a sophisticated, multi-theme design system.

- **Color System:** A multi-theme system with light and dark modes for themes like "Classic," "Ocean," and "Phoenix."
- **Typography:** The primary font is 'Outfit', with a responsive typographic scale for headings.
- **Spacing & Radius:** Consistent spacing and border-radius tokens are used for a cohesive look and feel.

## 5. Getting Started

### 5.1. Prerequisites
- **Node.js:** `v18.x` or higher
- **Azure CLI:** `v2.58.0` or higher
- **Git:** `v2.40.0` or higher

### 5.2. Installation & Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/phoenixvc/PhoenixVC-Website.git
   cd PhoenixVC-Website
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run web
   ```
The application will be available at `http://localhost:5173`.

## 6. Development Scripts

| Command         | Description                             |
|-----------------|-----------------------------------------|
| `npm run web`   | Start the web application dev server    |
| `npm run build` | Build the production bundle             |
| `npm run lint`  | Lint the codebase                       |
| `npm run test`  | Run the test suite                      |
| `npm run format`| Format the code with Prettier           |

## 7. Future Development & Known Issues

- **Storybook:** The installation of Storybook for the design system failed due to a timeout. This should be revisited to provide a proper component library.
- **Production Hardening:** The POCs implemented in Phase 3 require further work for production readiness, as noted by the `// TODO` comments in the code. This includes adding comprehensive tests, handling edge cases, and further performance optimization.

## 8. Project Structure

```
PhoenixVC-Website/
├── apps/
│   ├── web/              # Main website application
│   ├── design-system/    # Shared design system components
│   └── api/              # Azure Functions API
├── docs/                 # MkDocs documentation
├── infra/
│   └── bicep/           # Azure infrastructure as code
├── scripts/             # Deployment and utility scripts
└── packages/            # Shared packages
```

## 9. Deployment Architecture

This project uses Azure Static Web Apps with a multi-environment deployment strategy:

- **Staging Environment**: Automatically deployed from `main` branch PRs
  - Azure Resource Group: `staging-euw-rg-phoenixvc-website`
  - Static Web App: `staging-euw-swa-phoenixvc-website`
  
- **Production Environment**: Manually promoted from staging deployments
  - Azure Resource Group: `prod-euw-rg-phoenixvc-website`
  - Static Web App: `prod-euw-swa-phoenixvc-website`
  - Custom Domain: `phoenixvc.tech`

- **Documentation**: Separate deployment from MkDocs build
  - Custom Domain: `docs.phoenixvc.tech`

## 10. Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository and create a feature branch
2. Follow the existing code style and conventions
3. Run linting and formatting before committing: `npm run lint:fix && npm run format`
4. Write clear, descriptive commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
5. Submit a pull request with a clear description of your changes

For more details, refer to the [contributing guide](docs/src/main/meta/contributing.md).

## 11. Security

### Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@phoenixvc.tech**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

You should receive a response within 48 hours. For more information, see our [Security Policy](docs/src/main/policies/SECURITY.md).

### Security Features

- Azure Key Vault integration for secrets management
- HTTPS enforcement on all deployments
- Azure Static Web Apps built-in authentication
- Regular dependency updates via Dependabot
- Automated security scanning via GitHub Advanced Security

## 12. Support & Contact

- **Website**: [phoenixvc.tech](https://phoenixvc.tech)
- **Documentation**: [docs.phoenixvc.tech](https://docs.phoenixvc.tech)
- **Email**: eben@phoenixvc.tech
- **Issues**: [GitHub Issues](https://github.com/phoenixvc/PhoenixVC-Website/issues)

## 13. License

**PROPRIETARY SOFTWARE**
© 2024-2025 Phoenix VC. All Rights Reserved.

This software and associated documentation files are proprietary to Phoenix VC. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without express written permission from Phoenix VC.
