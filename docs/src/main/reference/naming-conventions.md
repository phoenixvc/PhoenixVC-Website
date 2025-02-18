📄 /docs/naming-conventions.md

# Naming Conventions {: #naming-conventions}
This document outlines the naming conventions we follow for our project documentation and code. Consistent naming improves clarity, makes files easier to locate, and helps new contributors understand our structure.

> **Note:** Most documentation files and directories (except for standard README files) should use **kebab-case** (all lowercase letters with hyphens separating words).

---

## Documentation File and Directory Names {: #documentation-file-and-directory-names}
- **General Rule:**  
  All documentation files and directories (except for README files) must use **kebab-case**.

- **Examples:**  
  - `changelog.md`
  - `contributing.md`
  - `faq.md`
  - `code-style.md`
  - `development-setup.md`
  - `naming-conventions.md`
  - `deployment/deployment.md`
  - `deployment/prerequisites.md`
  - `deployment/operations.md`
  - `deployment/troubleshooting.md`
  - `infrastructure/architecture.md`
  - `infrastructure/bicep-templates.md`
  - `infrastructure/disaster-recovery.md`
  - `infrastructure/monitoring.md`
  - `infrastructure/security.md`
  - `infrastructure/infrastructure.md`
  - `references/azure-component-versions.md`
  - `references/network-topology.md`

- **Folder Structure Example:**  
  Use the following structure to keep documentation organized:

  ```plaintext
  📁 docs/
  ├── 📄 documentation-map.md
  ├── 📄 changelog.md
  ├── 📄 contributing.md
  ├── 📄 faq.md
  ├── 📄 naming-conventions.md
  ├── 📁 development/
  │   ├── 📄 code-style.md
  │   └── 📄 development-setup.md
  ├── 📁 deployment/
  │   ├── 📄 readme.md
  │   ├── 📄 deployment.md
  │   ├── 📄 prerequisites.md
  │   ├── 📄 operations.md
  │   ├── 📄 troubleshooting.md
  │   └── 📁 adrs/
  │       ├── 📄 adr-001-credential-rotation.md
  │       └── 📄 adr-002-disaster-recovery.md
  ├── 📁 infrastructure/
  │   ├── 📄 readme.md
  │   ├── 📄 architecture.md
  │   ├── 📄 bicep-templates.md
  │   ├── 📄 disaster-recovery.md
  │   ├── 📄 monitoring.md
  │   ├── 📄 security.md
  │   └── 📄 infrastructure.md
  └── 📁 references/
      ├── 📄 azure-component-versions.md
      └── 📄 network-topology.md
  ```

---

## Code Element Naming Conventions {: #code-element-naming-conventions}
- **Source Code Files:**  
  Use **kebab-case** for filenames (e.g., `user-profile.tsx`, `api-service.js`).

- **Variables & Functions:**  
  Use **camelCase** (e.g., `userName`, `fetchData`).

- **Components, Classes & Interfaces:**  
  Use **PascalCase** (e.g., `UserProfile`, `ApiService`, `UserProps`).

- **Constants:**  
  Use **UPPER_SNAKE_CASE** (e.g., `MAX_RETRY_COUNT`).

- **Import Order:**  
  The recommended order in source files is:
  1. React and framework imports
  2. Third-party libraries
  3. Local components
  4. Hooks, services, and utilities
  5. Type definitions
  6. Styles

---

## Branch Naming Conventions {: #branch-naming-conventions}
- **Staging Branches:**  
  Format: `staging/<short-description>`
  *Example:* `staging/feature-user-auth`

- **Feature Branches:**  
  Format: `feature/<short-description>` or `feat/`
  *Example:* `feature/user-authentication`

- **Bugfix Branches:**  
  Format: `bugfix/<issue-number>-<short-description>` or `bug/`
  *Example:* `bugfix/123-fix-login-error`

- **Hotfix Branches:**  
  Format: `hotfix/<issue-number>-<short-description>` or `fix/`
  *Example:* `hotfix/456-critical-ui-fix`

- **Release Branches:**  
  Format: `release/v<major>.<minor>.<patch>`  
  *Example:* `release/v1.2.0`

---

## Commit Message Conventions {: #commit-message-conventions}
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, including emoji prefixes for clarity. Examples include:

- **New Feature:**  
  `✨ feat(auth): implement Azure AD authentication`

- **Bug Fix:**  
  `🐛 fix(api): resolve connection timeout issue`

- **Documentation Update:**  
  `📝 docs: update contributing guidelines`

- **Chore/Maintenance:**  
  `🔧 chore: update dependencies`

---

## Summary {: #summary}
- **Documentation Files & Directories:**  
  Use kebab-case (e.g., `development-setup.md`), except for standard README files.

- **Source Code Files:**  
  Use kebab-case for filenames; variables use camelCase, and components/classes use PascalCase.

- **Branches and Commits:**  
  Follow the conventions above to maintain consistency across the project.

Adhering to these conventions will help keep our project organized, reduce ambiguity, and facilitate collaboration across teams.