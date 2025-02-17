---
layout: default
title: "Frequently Asked Questions"
---

# Frequently Asked Questions (FAQ) for Phoenix VC - Modernized

This FAQ provides answers to common questions about the Phoenix VC project, including deployment, authentication, and regional availability.

## Q1: What does "No subscriptions were found" mean when I run `az login`?
**A:** This error indicates that Azure CLI did not detect any active subscriptions associated with your account. Ensure you are logged in with an account that has an active Azure subscription. Verify your subscriptions with:
```bash
az account list --output table
```
Then set your desired subscription:
```bash
az account set --subscription <subscription-id>
```

## Q2: How do I create a Service Principal for deployment?
**A:** To create a Service Principal for GitHub Actions, run:
```bash
az ad sp create-for-rbac --name "github-actions-deploy" --role contributor --scopes "/subscriptions/<your-subscription-id>" --sdk-auth
```
Replace `<your-subscription-id>` with your actual subscription ID. Copy the resulting JSON and store it as the `AZURE_CREDENTIALS` secret in your GitHub repository.

## Q3: Which regions support Azure Static Web Apps?
**A:** The managed backend for Azure Static Web Apps is supported in regions such as westus2, centralus, eastus2, westeurope, and eastasia. For regions not supported (e.g., South Africa North), you can deploy your own Azure Functions app using the BYOF (Bring Your Own Functions App) model.

## Q4: How can I ensure my app is deployed to a specific Azure region?
**A:** Specify the region in your deployment configuration. For example, if deploying in West Europe, use "euw" in your resource names (e.g., `prod-euw-swa-phoenixvc`). For BYOF deployments, ensure you deploy your Azure Functions in the desired region.

## Q5: How do I check and set my Azure subscription using the CLI?
**A:** List your subscriptions with:
```bash
az account list --output table
```
Then set your subscription:
```bash
az account set --subscription <subscription-id>
```
Replace `<subscription-id>` with your actual subscription ID.

## Q6: What local development alternatives are available if I don’t use GitHub Codespaces?
**A:** You can use:
- A local Linux VM (e.g., via VirtualBox)
- Docker containers for a consistent environment
- Windows Subsystem for Linux (WSL) on Windows

For more details, please refer to our [Development Setup Guide](docs/development/development-setup.md).

---

If you have additional questions or need further assistance, please contact our support team at [support@phoenixvc.za](mailto:support@phoenixvc.za).
