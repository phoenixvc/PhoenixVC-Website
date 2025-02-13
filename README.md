# Phoenix VC - Website  
**Empowering innovation through strategic investments and visionary partnerships**

[![Build Status](https://img.shields.io/github/workflow/status/JustAGhosT/PhoenixVC-Modernized/Deploy%20Azure%20Static%20Web%20App)](https://github.com/JustAGhosT/PhoenixVC-Modernized/actions)
[![Version](https://img.shields.io/badge/version-v1.0.0-blue)](https://github.com/JustAGhosT/PhoenixVC-Modernized/releases)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

Phoenix VC is a premier, proprietary venture capital firm dedicated to identifying and investing in transformative technologies. Our modernized website leverages cutting-edge cloud technologies—including Azure Static Web Apps, Tailwind CSS, and Bicep templates—to deliver a seamless digital experience. Our mission is focused on driving innovation and fostering growth in tomorrow’s leading industries.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Current Projects and Goals](#current-projects-and-goals)
- [Setting Up Azure Credentials](#setting-up-azure-credentials)
- [Optional Enhancements](#optional-enhancements)
- [Contributing](#contributing)
- [Repository Structure and File Listing](#repository-structure-and-file-listing)
- [Deployment](#deployment)
- [FAQ](#faq)
- [Support](#support)
- [License](#license)

## Prerequisites

Before getting started, ensure you have the following installed on your development machine:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- *(Optional)* [Python 3](https://www.python.org/downloads/) (for running the custom file tree script)

## Project Structure

```
/my-project
├── .github
│   └── workflows
│       └── deploy.yml         # GitHub Actions workflow for deployment
├── docs                       # Documentation (Contributing, Deployment, Troubleshooting, FAQ, Code Style Guidelines)
├── infra
│   └── bicep
│       ├── main.bicep         # Bicep template for Azure resources (including budget)
│       └── parameters.json    # Parameters file for the Bicep template
├── scripts
│   ├── deploy.sh              # Deployment script for local testing
│   └── git_tree.py            # Python script to generate a tree view of non-ignored files
├── src
│   ├── css
│   │   └── styles.css         # Custom CSS for the web app
│   └── index.html             # Main HTML file for the web app
├── staticwebapp.config.json   # Azure Static Web App configuration (routes, headers)
├── LICENSE                    # Proprietary license file
└── README.md                  # This file (project overview)
```

## Getting Started

1. **Clone the Repository:**  
   Open your terminal and run:
   ```bash
   git clone https://github.com/JustAGhosT/PhoenixVC-Modernized.git
   cd PhoenixVC-Modernized
   ```
2. **Install Dependencies:**  
   Run:
   ```bash
   npm install
   ```
   This installs all project dependencies, including tools for linting, formatting, and Git hook management.
3. **Initialize Git Hooks:**  
   Set up Husky for commit message linting by running:
   ```bash
   npm run prepare
   ```
4. **Configure Azure Credentials:**  
   Create a Service Principal using the Azure CLI and store the resulting JSON in GitHub Secrets as `AZURE_CREDENTIALS`. (For detailed instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).)
5. **Customize Infrastructure Parameters (Optional):**  
   Edit `infra/bicep/parameters.json` if necessary to suit your environment.
6. **Submit Your Changes:**  
   **Do not commit directly to the `main` branch.** Create a new branch for your changes and open a pull request for review.
7. **Deploy the Application:**  
   Once your pull request is merged, the GitHub Actions workflow will trigger a deployment automatically. Alternatively, for local testing, run:
   ```bash
   ./scripts/deploy.sh
   ```

## Usage

Once deployed, access the Phoenix VC website at [https://phoenixvc.tech](https://phoenixvc.tech) to explore our investment projects and learn more about our strategic goals.

## Current Projects and Goals

- **Current Projects:**  
  Visit the [Current Projects](https://phoenixvc.tech/current-projects) page to see what we're actively working on.
- **Our Goals:**  
  Learn more about our vision and strategic objectives on the [Goals](https://phoenixvc.tech/goals) page.

*Note: Replace these placeholder URLs with the actual links when available.*

## Setting Up Azure Credentials

To enable automated deployments via GitHub Actions:

1. **Create a Service Principal:**  
   Run the following command in the Azure CLI (replace `<your-subscription-id>` with your subscription ID):
   ```bash
   az ad sp create-for-rbac --name "http://github-actions-deploy.phoenixvc.tech" --role contributor --scopes /subscriptions/<your-subscription-id> --sdk-auth
   ```
   This command outputs a JSON object containing your Azure credentials.
2. **Store in GitHub Secrets:**  
   Copy the output JSON and add it to your GitHub repository's secrets as `AZURE_CREDENTIALS`.
3. **Reference in Workflow:**  
   The GitHub Actions workflow (located in `.github/workflows/deploy.yml`) uses this secret to authenticate with Azure during deployment.

## Optional Enhancements

For more details on the underlying technologies, please refer to:
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Contributing

For detailed guidelines on branch naming, commit message conventions, code formatting, linting, and other project policies, please see our [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) file.

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
This pipes Git’s file list into our custom Python script (`scripts/git_tree.py`), which outputs a hierarchical, tree-like structure using conventional symbols (e.g., `├──`, `└──`). This is especially useful when providing an AI or team member with a clear overview of the repository structure.

Alternatively, for a complete flat list (excluding ignored files), run:
```bash
git ls-files --cached --others --exclude-standard
```
Or, for a complete tree-like listing (ensure `tree` is installed):
```bash
tree -a
```
*Note: The tree command is included so that you or automated systems (like AI tools) can quickly review the full file structure of the repository.*

## Deployment

For detailed instructions on how to deploy the project—both locally using our deployment script and via our CI/CD pipeline through GitHub Actions—please refer to our [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) guide.

## FAQ

For answers to common questions about deployment, authentication, and regional availability for Azure Static Web Apps, please refer to our [docs/FAQ.md](docs/FAQ.md) document.

## Support

For support or questions about this project, please contact [support@phoenixvc.com](mailto:support@phoenixvc.com).

## License

This project is proprietary and confidential. See the [LICENSE](LICENSE) file for details. All rights reserved.
