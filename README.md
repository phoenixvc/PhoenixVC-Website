# Phoenix VC - Modernized  
**Empowering innovation through strategic investments and visionary partnerships**

Phoenix VC is a premier venture capital firm dedicated to identifying and investing in transformative technologies. With a rich heritage and a commitment to excellence, our modernized website leverages cutting-edge cloud technologies—including Azure Static Web Apps, Tailwind CSS, and Bicep templates—to deliver a seamless digital experience. Our mission remains focused on driving innovation and fostering growth in tomorrow’s leading industries.

## Prerequisites

Before getting started, ensure you have the following installed on your development machine:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- *(Optional)* [Python 3](https://www.python.org/downloads/) (required for running the custom file tree script)

## Project Structure

```
/my-project
├── .github
│   └── workflows
│       └── deploy.yml         # GitHub Actions workflow for deployment
├── infra
│   └── bicep
│       ├── main.bicep         # Bicep template for Azure resources
│       └── parameters.json    # Parameters file for the Bicep template
├── scripts
│   ├── deploy.sh              # Deployment script for local testing
│   └── git_tree.py            # Python script to generate a tree view of non-ignored files
├── src
│   ├── css
│   │   └── styles.css         # Custom CSS for the web app
│   └── index.html             # Main HTML file for the web app
├── staticwebapp.config.json   # Azure Static Web App configuration (routes, headers)
├── LICENSE                  # Proprietary license file
└── README.md                # This file
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
   Create a Service Principal using the Azure CLI and store the resulting JSON in GitHub Secrets as `AZURE_CREDENTIALS`. (See the "Setting Up Azure Credentials" section below for details.)
5. **Customize Infrastructure Parameters (Optional):**  
   Edit `infra/bicep/parameters.json` if necessary to suit your environment.
6. **Deploy the Application:**  
   - Push your changes to the `main` branch to trigger the GitHub Actions workflow, **or**
   - Run the local deployment script:
     ```bash
     ./scripts/deploy.sh
     ```

## Current Projects and Goals

- **Current Projects:**  
  Visit the [Current Projects](https://your-website.com/current-projects) page to see what we're actively working on.
- **Our Goals:**  
  Learn more about our vision and strategic objectives on our [Goals](https://your-website.com/goals) page.

*Note: Replace the placeholder URLs with the actual links to your website's pages.*

## Setting Up Azure Credentials

To enable automated deployments via GitHub Actions:

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

## Optional Enhancements

For more details on the underlying technologies, please refer to:
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Contributing

For detailed guidelines on branch naming, commit message conventions, code formatting, linting, and other project policies, please see our [CONTRIBUTING.md](CONTRIBUTING.md) file.

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
This command pipes Git’s file list into our custom Python script (`scripts/git_tree.py`), which outputs a hierarchical, tree-like structure using conventional symbols (e.g., `├──`, `└──`). This is especially useful when providing an AI or a team member with a clear overview of the repository structure.

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

For detailed instructions on how to deploy the project—both locally using our deployment script and via our CI/CD pipeline through GitHub Actions—please refer to our [DEPLOYMENT.md](DEPLOYMENT.md) guide.

## License

This project is proprietary and confidential. See the [LICENSE](LICENSE) file for details. All rights reserved.
