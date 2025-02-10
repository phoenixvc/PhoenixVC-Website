# Phoenix VC - Modernized  
**Empowering innovation through modern cloud deployment**

Phoenix VC is a modern Azure Static Web App project that leverages Tailwind CSS, Bicep templates, and GitHub Actions for a streamlined CI/CD process. This proprietary project follows best practices for cloud deployment, security, and cost management.

## Prerequisites

Before getting started, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- A GitHub account
- *(Optional)* [Python 3](https://www.python.org/downloads/) (for running the `git_tree.py` script)

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

1. **Clone the repository:**  
   ```bash
   git clone https://github.com/JustAGhosT/PhoenixVC-Modernized.git
   ```
2. **Configure GitHub Secrets:**  
   Add your Azure credentials to the repository secrets (e.g., `AZURE_CREDENTIALS`).
3. **Customize Parameters:**  
   Adjust values in `infra/bicep/parameters.json` if needed.
4. **Deploy:**  
   - Push changes to the `main` branch to trigger the GitHub Actions workflow, **or**
   - Run the local deployment script:
     ```bash
     ./scripts/deploy.sh
     ```

## Optional Enhancements

For more information about the underlying technologies, please refer to:
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Contributing

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our commit message conventions, branching strategy, coding guidelines, and other project policies.

## License

This project is proprietary and confidential. See the [LICENSE](LICENSE) file for details. All rights reserved.