# Deployment Guide for Phoenix VC - Modernized

This document outlines how to deploy the Phoenix VC project to Azure Static Web Apps, covering both local deployment and our automated CI/CD process via GitHub Actions.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Deployment](#local-deployment)
- [Automated Deployment (CI/CD)](#automated-deployment-cicd)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## Prerequisites

Before deploying, ensure you have:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- *(Optional)* [Python 3](https://www.python.org/downloads/) (for the `git_tree.py` script)

---

## Local Deployment

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/JustAGhosT/PhoenixVC-Modernized.git
   cd PhoenixVC-Modernized
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Azure Credentials:**
   Create a Service Principal and store its JSON output in GitHub Secrets as `AZURE_CREDENTIALS` (or set as an environment variable for local testing).
4. **Run the Deployment Script:**
   ```bash
   ./scripts/deploy.sh
   ```
   This script creates the resource group (e.g., `prod-za-rg-phoenixvc`) and deploys the Bicep template (`infra/bicep/main.bicep`) using parameters from `infra/bicep/parameters.json`.

---

## Automated Deployment (CI/CD)

- **Workflow File:**  
  Our GitHub Actions workflow is defined in `.github/workflows/deploy.yml`.
- **Process:**
  - Pushing changes to the `main` branch triggers the workflow.
  - The workflow logs into Azure using the `AZURE_CREDENTIALS` secret.
  - It creates (or verifies) the resource group and deploys the Bicep template.
  
No additional steps are required; the process is automated.

---

## Troubleshooting

For common issues during deployment, refer to our [TROUBLESHOOTING.md](TROUBLESHOOTING.md) file.  
For example, if you encounter an Azure login error such as:
```
Login failed with Error: Using auth-type: SERVICE_PRINCIPAL. Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied.
```
follow the troubleshooting steps provided in that document.

---

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---