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

We also enforce these commit message standards automatically using [Commitlint](https://commitlint.js.org/) with [Husky](https://typicode.github.io/husky/). To set this up:

1. **Install Dependencies:**  
   Run `npm install` at the root of the repository.
2. **Initialize Husky:**  
   Run `npm run prepare` to set up the Git hooks.
3. **Commit Linting:**  
   When you commit changes, Husky will trigger Commitlint. If your commit message doesn't follow the Conventional Commits standard, the commit will be rejected.

## Code Formatting and Linting

We use a set of scripts defined in our `package.json` to maintain code quality and consistency:

- **Prettier (Code Formatting):**  
  Run the following command to format your code:
  ```bash
  npm run format
  ```
  This script uses Prettier to format all JavaScript, CSS, HTML, and Markdown files under the `src` directory.

- **Stylelint (CSS Linting):**  
  To lint CSS files, run:
  ```bash
  npm run lint:css
  ```
  This script uses Stylelint to check the CSS files located in `src/css`.

- **ESLint (JavaScript/HTML Linting):**  
  To lint JavaScript and HTML files, run:
  ```bash
  npm run lint
  ```
  This script uses ESLint to check files in the `src` directory.

## Pull Request Process

- Open a pull request against the `main` branch.
- Ensure your code is well-tested and passes all linting/formatting checks.
- Use descriptive commit messages that follow the guidelines above.
- Request reviews from team members before merging.

## Code Style Guidelines

- **Indentation:**  
  Use **4 spaces** for indentation in all project files.
- **Readability:**  
  Write clean, modular code and document non-obvious sections.
- **File Naming:**  
  Follow standard naming conventions (e.g., kebab-case for filenames).
- **Testing:**  
  Ensure your changes do not break existing functionality.

## Setting Up Azure Credentials

To enable automated deployments via GitHub Actions, you need to set up Azure credentials:

1. **Create a Service Principal:**  
   Run the following command in the Azure CLI (replace `<your-subscription-id>` with your subscription ID):
   ```bash
   az ad sp create-for-rbac --name "github-actions-deploy" --role contributor --scopes /subscriptions/<your-subscription-id> --sdk-auth
   ```
   This command outputs a JSON object containing your Azure credentials.

2. **Store in GitHub Secrets:**  
   Copy the JSON output and add it to your GitHub repository's secrets with the name `AZURE_CREDENTIALS`.

3. **Reference in Workflow:**  
   The GitHub Actions workflow (located in `.github/workflows/deploy.yml`) uses this secret to authenticate with Azure during deployment.

## Repository Structure and File Listing

We maintain a clean project structure using a `.gitignore` file to prevent unnecessary files (such as `node_modules`, build outputs, and IDE-specific files) from being committed. The contents of our `.gitignore` can be viewed at the repository root.

In our `package.json`, we include scripts for linting and formatting to help maintain code quality. For example:

- To lint CSS files, we use Stylelint:
  - **Script:** `"lint:css": "stylelint \"src/css/**/*.css\""`
  - **Usage:** Run `npm run lint:css`
- To lint JavaScript and HTML files, we use ESLint:
  - **Script:** `"lint": "eslint src"`
  - **Usage:** Run `npm run lint`
- To format code consistently, we use Prettier:
  - **Script:** `"format": "prettier --write \"src/**/*.{js,css,html,md}\""`
  - **Usage:** Run `npm run format`

To see a tree of the repository that **only includes files not ignored by `.gitignore`**, you can run:
```bash
git ls-files --cached --others --exclude-standard | python3 scripts/git_tree.py
```
This command does the following:
- **`git ls-files --cached --others --exclude-standard`** lists all files that are tracked or untracked but not ignored by `.gitignore`.
- **Piping the output to `python3 scripts/git_tree.py`** processes that flat list into a hierarchical tree-like structure using conventional symbols (e.g., `├──`, `└──`), which is especially useful when providing an AI or a team member with a clear overview of the repository structure.

Alternatively, to list every file in the repository (excluding ignored ones) in a flat list, you can run:
```bash
git ls-files --cached --others --exclude-standard
```
Or, for a complete tree-like listing (ensure `tree` is installed on your system):
```bash
tree -a
```
*Note: The tree command is included so that you or automated systems (like AI tools) can quickly review the full file structure of the repository.*

## Additional Tools

We use Husky and Commitlint to ensure commit messages follow our conventions. If you prefer using an alternative Git hook framework or additional linting tools, please discuss with the team before integrating them.

We appreciate your contributions and are here to help if you have any questions!