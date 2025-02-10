# Deployment Guide for Phoenix VC - Modernized

This document provides instructions for deploying the Phoenix VC project to Azure Static Web Apps. It covers both local deployment for testing and the CI/CD process via GitHub Actions.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Deployment](#local-deployment)
- [Automated Deployment (CI/CD)](#automated-deployment-cicd)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## Prerequisites

Before deploying, ensure that you have:

- **Node.js** (v14 or higher)
- **Git** installed
- **Azure CLI** installed and configured
- Access to the GitHub repository and appropriate permissions
- Your Azure credentials stored as a GitHub Secret (named `AZURE_CREDENTIALS`)
- *(Optional)* Python 3 installed (for running the custom file tree script, if needed)

---

## Local Deployment

For local testing and deployment, you can use the provided deployment script.

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

   Ensure you have created a Service Principal in Azure and stored the JSON output in your GitHub Secrets as `AZURE_CREDENTIALS`. For local deployments, you can also set an environment variable with your credentials if necessary.

4. **Run the Deployment Script:**

   The local deployment script is located at `scripts/deploy.sh`. To deploy, run:

   ```bash
   ./scripts/deploy.sh
   ```

   This script:
   - Creates the resource group (if it doesn’t exist) using our naming convention (e.g., `prod-za-rg-phoenixvc`).
   - Deploys the Bicep template (`infra/bicep/main.bicep`) with the parameters from `infra/bicep/parameters.json`.

---

## Automated Deployment (CI/CD)

Our project uses GitHub Actions to automate deployments to Azure.

- **Workflow File:**  
  The workflow is defined in `.github/workflows/deploy.yml`.
  
- **Process:**
  1. When you push changes to the `main` branch, the workflow is triggered.
  2. The workflow logs into Azure using the credentials stored in the GitHub Secret `AZURE_CREDENTIALS`.
  3. It then creates (or ensures the existence of) the resource group and deploys the infrastructure using the Bicep template and parameters.

No additional manual steps are required for CI/CD deployments once the repository is configured correctly.

---

## Troubleshooting

- **Deployment Failures:**  
  Check the logs in the GitHub Actions console for error messages. Common issues include misconfigured parameters, invalid Azure credentials, or network issues.
  
- **Azure CLI Errors:**  
  Run `az login` locally to ensure your Azure CLI is configured correctly.
  
- **Service Principal Issues:**  
  Verify that the Service Principal has the appropriate role (`contributor`) and that its scope is correctly set to your subscription.

---

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

By following this guide, you should be able to deploy and manage the Phoenix VC project effectively. For any further questions or issues, please consult the [CONTRIBUTING.md](CONTRIBUTING.md) or contact the team.
