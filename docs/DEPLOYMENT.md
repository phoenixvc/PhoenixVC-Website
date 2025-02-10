# Deployment Guide for Phoenix VC - Modernized

This document outlines how to deploy the Phoenix VC project to Azure Static Web Apps, covering both local deployment and our automated CI/CD process via GitHub Actions.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Service Principal Creation](#service-principal-creation)
- [Local Deployment](#local-deployment)
- [Automated Deployment (CI/CD)](#automated-deployment-cicd)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## Prerequisites

Before deploying, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- *(Optional)* [Python 3](https://www.python.org/downloads/) (for running the `git_tree.py` script)

---

## Service Principal Creation

To enable deployment, you need to create an Azure Service Principal that GitHub Actions will use for authentication.

1. **Create the Service Principal:**  
   Open your terminal and run the following command. **Replace `<your-subscription-id>` with your actual Azure Subscription ID (without angle brackets).** For example:
   ```bash
   az ad sp create-for-rbac --name "github-actions-deploy" --role contributor --scopes /subscriptions/12345678-1234-1234-1234-123456789abc --sdk-auth
   ```
   This command outputs a JSON object containing your Azure credentials (e.g., `clientId`, `clientSecret`, `tenantId`, and `subscriptionId`).

2. **Store in GitHub Secrets:**  
   Copy the output JSON and add it to your GitHub repository's secrets as `AZURE_CREDENTIALS`.

*Note:* Do not leave `<your-subscription-id>` in the command. Replacing it with your actual subscription ID prevents errors such as:
```
bash: your-subscription-id: No such file or directory
```

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
   Follow the instructions in the [Service Principal Creation](#service-principal-creation) section above.
4. **Run the Deployment Script:**
   ```bash
   ./scripts/deploy.sh
   ```
   This script creates the resource group (e.g., `prod-za-rg-phoenixvc`) and deploys the Bicep template (`infra/bicep/main.bicep`) using parameters from `infra/bicep/parameters.json`.

---

## Automated Deployment (CI/CD)

Our GitHub Actions workflow is defined in `.github/workflows/deploy.yml`. When changes are pushed to the `main` branch:
- The workflow logs into Azure using the `AZURE_CREDENTIALS` secret.
- It creates (or verifies) the resource group and deploys the Bicep template.

No additional manual steps are required for automated deployments.

---

## Troubleshooting

For common deployment issues, please refer to our [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) file, which covers error resolution steps (including issues related to Service Principal creation and Azure login).

---

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
