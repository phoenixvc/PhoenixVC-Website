# Contributing to Phoenix VC - Modernized

Thank you for considering contributing to our project! Please review the guidelines below before submitting pull requests.

## Branching Strategy

- **Feature Branches:**  
  Create branches for new features. Branch names should follow the pattern:  
  `feature/<short-description>`  
  Always base your branch off of the latest `main` branch.

- **Bugfix Branches:**  
  For fixes, use the pattern:  
  `bugfix/<issue-number>-<short-description>`

- **Release Branches:**  
  If applicable, use release branches (e.g., `release/v1.0.0`).

- **Pull Requests:**  
  All feature, bugfix, or release branches should be merged into `main` via a pull request.

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification and include emojis for clarity. For example:

- **✨ feat:** for new features  
  _Example:_ `✨ feat: add login functionality 🚀`
- **🐛 fix:** for bug fixes  
  _Example:_ `🐛 fix: resolve header alignment issue`
- **📝 docs:** for documentation updates  
  _Example:_ `📝 docs: update README with deployment instructions`
- **🚀 chore:** for dependency updates or maintenance  
  _Example:_ `🚀 chore: upgrade Tailwind CSS to v2.2.19`

We enforce these commit message standards automatically using [Commitlint](https://commitlint.js.org/) with [Husky](https://typicode.github.io/husky/). To set this up:

1. **Install Dependencies:**  
   Run `npm install` at the repository root.
2. **Initialize Husky:**  
   Run `npm run prepare` to set up the Git hooks.
3. **Commit Linting:**  
   When you commit changes, Husky will trigger Commitlint. If your commit message doesn't follow the guidelines, the commit will be rejected.

## Code Formatting and Linting

We use a set of scripts defined in our `package.json` to maintain code quality and consistency:

- **Prettier (Code Formatting):**  
  Run:
  ```bash
  npm run format
  ```
  This script formats all JavaScript, CSS, HTML, and Markdown files under the `src` directory.

- **Stylelint (CSS Linting):**  
  Run:
  ```bash
  npm run lint:css
  ```
  This script checks the CSS files in `src/css`.

- **ESLint (JavaScript/HTML Linting):**  
  Run:
  ```bash
  npm run lint
  ```
  This script checks files in the `src` directory.

## Pull Request Process

- Open a pull request against the `main` branch.
- Ensure your code is well-tested and passes all linting/formatting checks.
- Use descriptive commit messages that follow the guidelines above.
- Request reviews from team members before merging.

## Code Style Guidelines

Our guidelines ensure consistency, readability, and maintainability across the project. Key points include:

- **Indentation:**  
  Use **4 spaces** per indentation level throughout all files; avoid mixing tabs and spaces.
- **Readability & Modularity:**  
  Write clean, modular code. Break complex logic into smaller functions or components and include inline comments for non-obvious sections.
- **Naming Conventions:**  
  - **Files & Directories:** Use **kebab-case** (e.g., `my-component.js`, `styles.css`).
  - **Variables & Functions:** Use **camelCase**.
  - **Classes & Components:** Use **PascalCase**.
- **Documentation:**  
  Provide meaningful inline comments and external documentation where needed.
- **Testing:**  
  Ensure your changes do not break existing functionality by writing and running appropriate tests.
- **Consistency:**  
  Follow the established coding standards and formatting rules (e.g., ESLint, Stylelint, and Prettier configurations).

For a comprehensive overview of our coding standards, please refer to our full guidelines in [docs/CODE_STYLE_GUIDELINES.md](docs/CODE_STYLE_GUIDELINES.md).

## Setting Up Azure Credentials

To enable automated deployments via GitHub Actions:

1. **Create a Service Principal:**  
   Run the following command in the Azure CLI (replace `<your-subscription-id>` with your subscription ID):
   ```bash
   az ad sp create-for-rbac --name "github-actions-deploy" --role contributor --scopes /subscriptions/<your-subscription-id> --sdk-auth
   ```
   This outputs a JSON object with your Azure credentials.
2. **Store in GitHub Secrets:**  
   Copy the JSON output and add it to your GitHub repository's secrets as `AZURE_CREDENTIALS`.
3. **Reference in Workflow:**  
   The GitHub Actions workflow (in `.github/workflows/deploy.yml`) uses this secret to authenticate with Azure.

## Local Development Environments

Our project is primarily developed within GitHub Codespaces, which provides a ready-to-use, Linux-based virtual workspace. You can access your Codespace via the web at:

[https://potential-winner-6wqvgqv7vgcx6rp.github.dev/](https://potential-winner-6wqvgqv7vgcx6rp.github.dev/)

For a richer development experience, you can also connect to your Codespace using Visual Studio Code:
1. Install the [GitHub Codespaces extension for VS Code](https://marketplace.visualstudio.com/items?itemName=GitHub.codespaces).
2. Sign in with your GitHub account.
3. Open your active Codespace via the **Remote Explorer**.

If you prefer not to use the GitHub Codespace virtual environment, consider these local development alternatives:
- **Local Linux VM:**  
  Set up a virtual machine (e.g., using VirtualBox) running Ubuntu and follow the Linux prerequisites.
- **Docker Containers:**  
  Create a Docker environment for your project to ensure consistency in development.
- **WSL (Windows Subsystem for Linux):**  
  Use WSL on Windows to run a Linux environment directly on your machine.

## Additional Tools

We use Husky and Commitlint to enforce commit message conventions. If you prefer using an alternative Git hook framework or additional linting tools, please discuss with the team before integrating them.

## Deployment Information

For detailed deployment instructions (both local and CI/CD), please see our [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) file.

## Troubleshooting

For help resolving common issues (e.g., Azure login errors, deployment failures), please refer to our [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) file.

## Repository Structure and File Listing

We maintain a clean project structure using a `.gitignore` file to prevent unnecessary files (e.g., `node_modules`, build outputs, and IDE-specific files) from being committed. The contents of our `.gitignore` can be viewed at the repository root.

Our `package.json` includes scripts for linting and formatting:
- **Stylelint (CSS Linting):**
  - **Script:** `"lint:css": "stylelint \"src/css/**/*.css\""`
  - **Usage:** Run `npm run lint:css`
- **ESLint (JavaScript/HTML Linting):**
  - **Script:** `"lint": "eslint src"`
  - **Usage:** Run `npm run lint`
- **Prettier (Code Formatting):**
  - **Script:** `"format": "prettier --write \"src/**/*.{js,css,html,md}\""`
  - **Usage:** Run `npm run format`

To view a tree of the repository that **only includes files not ignored by `.gitignore`**, run:
```bash
git ls-files --cached --others --exclude-standard | python3 scripts/git_tree.py
```
This pipes Git’s file list into our custom Python script (`scripts/git_tree.py`), which outputs a hierarchical, tree-like structure using conventional symbols (e.g., `├──`, `└──`). This is especially useful when providing an AI or a team member with a clear overview of the repository structure.

Alternatively, for a complete flat list (excluding ignored files), run:
```bash
git ls-files --cached --others --exclude-standard
```
Or, for a complete tree-like listing (ensure `tree` is installed):
```bash
tree -a
```
*Note: The tree command is included so that you or automated systems (like AI tools) can quickly review the full file structure of the repository.*

## Additional Documentation

For more detailed documentation, please refer to the files in the `docs/` folder:
- [DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- [Additional guides as needed...]

---

We appreciate your contributions and are here to help if you have any questions!