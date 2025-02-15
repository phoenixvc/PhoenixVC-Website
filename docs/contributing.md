📄 /docs/contributing.md

# Contributing Guidelines

Thank you for considering contributing to our project! This document outlines the process and guidelines for making contributions to both our codebase and our documentation. By following these guidelines, you'll help us maintain consistency, quality, and clarity across the project.

> **Note:**  
> In addition to our standard guidelines, please be aware that our deployment workflows have been updated:
> - **Branch Triggers:** Only branches following our naming conventions ("main", "feat/*", "feature/*", "bug/*", "fix/*", "bugfix/*") will trigger deployment workflows.
> - **MkDocs Integration:** Our documentation is now built and deployed using MkDocs (with custom styles), replacing the previous Jekyll setup.  
>   - When pushing to `main`, the MkDocs job will build the site and either serve it locally (if the `DOCS_MODE` secret is set to `"serve"`) or deploy it via GitHub Pages.
>   - The generated site (e.g., in `site/deployment`) is excluded from version control.
> When contributing to documentation, please also review the [documentation-roadmap.md](documentation-roadmap.md) and [naming-conventions.md](naming-conventions.md) files to ensure your changes align with our overall guidelines.

## Table of Contents

- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Documentation Contributions](#documentation-contributions)
- [Additional Resources](#additional-resources)

## Getting Started

1. **Fork and Clone**  
   Begin by forking the repository on GitHub and cloning your fork locally. Replace `<your-username>` with your GitHub username:
   ```bash
   git clone https://github.com/<your-username>/phoenixvc-modernized.git
   cd phoenixvc-modernized
   git remote add upstream https://github.com/your-organization/phoenixvc-modernized.git
   ```

2. **Install Dependencies**  
   Install the necessary dependencies and prepare the project:
   ```bash
   npm install
   npm run prepare   # Sets up the git hooks (commitlint, etc.)
   ```

3. **Set Up Your Environment**  
   Copy the example environment file and update it with your values:
   ```bash
   cp .env.example .env
   ```

For more detailed instructions, please refer to [development/development-setup.md](development/development-setup.md).

## Branching Strategy

- **Staging Branches:**  
  For staging deployments, please create branches with the prefix `staging/`.  
  Example: `staging/feature-user-auth`  
  Changes in staging branches will trigger staging deployments through our CI pipeline.

- **Feature Branches:**  
  Create a new branch for each feature.  
  **Format:** `feature/<short-description>` or `feat/*`
  **Example:** `feature/user-authentication`

- **Bugfix Branches:**  
  Create branches for bug fixes.  
  **Format:** `bugfix/<issue-number>-<short-description>`  or `bug/*`
  **Example:** `bugfix/123-fix-login-error`

- **Hotfix Branches:**  
  Use these for urgent fixes in production.  
  **Format:** `hotfix/<issue-number>-<short-description>` or  `fix/*` 
  **Example:** `hotfix/456-critical-ui-fix`

- **Release Branches:**  
  Create a branch when preparing for a new version.  
  **Format:** `release/v<major>.<minor>.<patch>`  
  **Example:** `release/v1.2.0`

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. To help maintain consistency and clarity, please use the following commit types with their corresponding icons:

- ✨ `feat`: New feature  
- 🐛 `fix`: Bug fix  
- 📝 `docs`: Documentation  
- 🎨 `style`: Code style/formatting  
- ♻️ `refactor`: Code refactoring  
- ⚡️ `perf`: Performance improvements  
- ✅ `test`: Testing  
- 🔧 `chore`: Maintenance or other updates

**Examples:**

- **New Feature:**  
  `✨ feat(auth): implement Azure AD authentication`
  
- **Bug Fix:**  
  `🐛 fix(api): resolve connection timeout issue`
  
- **Documentation Update:**  
  `📝 docs: update contributing guidelines`
  
- **Chore/Maintenance:**  
  `🔧 chore: update dependencies`

*Our commit messages are automatically checked by commitlint (see [.github/commitlint.config.js](../../.github/commitlint.config.js)).*

## Pull Request Process

1. **Open a Pull Request:**  
   - Ensure your branch is up-to-date with the latest main branch.
   - Open a PR against the main branch.
   - Use a title in the format: `[Type] Short description (Issue-Number)`  
     _Example:_ `[Feature] Add user authentication (PVC-123)`

2. **PR Description Template:**  
   Our Pull Request Template (located at [.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md)) includes sections for changes, testing, screenshots (if applicable), and a checklist. Please use and fill out that template.

3. **Review Process:**  
   - At least one approval is required before merging.
   - Ensure all automated checks pass.
   - Address any reviewer feedback promptly.

## Code Review Guidelines

- **Reviewers:**  
  - Verify that the code adheres to the [code-style.md](development/code-style.md) guidelines.
  - Ensure tests are updated or added as needed.
  - Evaluate the impact on performance, security, and readability.

- **Authors:**  
  - Respond to feedback promptly.
  - Make focused changes and avoid unrelated commits.
  - Update relevant documentation if changes affect the project's setup or usage.

## Documentation Contributions

For contributions focused specifically on documentation:
- Review the [documentation-roadmap.md](documentation-roadmap.md) for planned updates.
- Follow the naming conventions outlined in [naming-conventions.md](naming-conventions.md).
- Ensure any documentation changes are accompanied by updates to the version history (if applicable).
- Consider submitting your documentation changes as a separate PR if they affect multiple files, to maintain clarity.

## Additional Resources

- [Code Style Guide](development/code-style.md)
- [Development Setup Guide](development/development-setup.md)
- [Naming Conventions](naming-conventions.md)
- [Documentation Roadmap](documentation-roadmap.md)
- [GitHub Issue Tracker](https://github.com/your-organization/phoenixvc-modernized/issues)

We appreciate your contributions and are here to help. If you have any questions or need further guidance, please reach out via our project's communication channels.

Happy coding!
