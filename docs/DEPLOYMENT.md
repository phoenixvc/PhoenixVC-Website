# Deployment Guide for Phoenix VC - Modernized

This document outlines how to deploy the Phoenix VC project to Azure Static Web Apps, covering both local deployment and our automated CI/CD process via GitHub Actions.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Service Principal Creation](#service-principal-creation)
- [Local Deployment](#local-deployment)
- [Automated Deployment (CI/CD)](#automated-deployment-cicd)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)
- [FAQ](#faq)

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

1. **Log in to Azure:**  
   Before proceeding, make sure you are logged into Azure:
   ```bash
   az login --use-device-code
   ```
   Follow the prompts to complete authentication.

2. **Set the Subscription:**  
   Ensure your Azure CLI is set to the correct subscription by running:
   ```bash
   az account set --subscription 22f9eb18-6553-4b7d-9451-47d0195085fe
   ```

3. **Create the Service Principal:**  
   Run the following command:
   ```bash
   az ad sp create-for-rbac --name "http://github-actions-deploy.phoenixvc.tech" --role contributor --scopes /subscriptions/22f9eb18-6553-4b7d-9451-47d0195085fe --sdk-auth
   ```
   This command outputs a JSON object containing your Azure credentials (e.g., `clientId`, `clientSecret`, `tenantId`, and `subscriptionId`).

   **Important:**  
   If you receive an error such as:
   ```
   The client 'xxx@phoenixvc.tech' with object id '...' does not have authorization to perform action 'Microsoft.Authorization/roleAssignments/write' over scope '...' or the scope is invalid.
   ```
   it indicates that your account does not have the required permissions to create role assignments. In that case, please contact your administrator to grant you the necessary permissions (e.g., Owner or User Access Administrator) or ask an admin to create the Service Principal for you.

4. **Store in GitHub Secrets:**  
   Copy the output JSON and add it to your GitHub repository's secrets as `AZURE_CREDENTIALS`.  
   You can add secrets by navigating to [GitHub Secrets](https://github.com/JustAGhosT/PhoenixVC-Modernized/settings/secrets/actions).

*Note:* Ensure you replace any placeholders with your actual values to avoid errors.

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

For common deployment issues, please refer to our [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) file, which covers error resolution steps (including issues related to Service Principal creation, Azure login errors, and more).

---

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## FAQ

For answers to common questions about deployment, authentication, and regional availability for Azure Static Web Apps, please refer to our [FAQ](docs/FAQ.md) document.