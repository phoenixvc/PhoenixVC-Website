# Frequently Asked Questions (FAQ) for Phoenix VC - Modernized

This FAQ provides answers to common issues and questions encountered during the development and deployment of the Phoenix VC project. For additional details on Azure Static Web Apps, please refer to the [official FAQ](https://learn.microsoft.com/en-us/azure/static-web-apps/faq).

---

## Q1: What does the error "No subscriptions were found" mean when I run `az login`?

**A:** This error means that after logging in, Azure CLI could not detect any active subscriptions linked to your account. To resolve this, ensure that:
- You are logging in with an account that has an active Azure subscription.
- Run `az account list --output table` to check your available subscriptions.
- If multiple subscriptions exist, set the desired one as default using:
  ```bash
  az account set --subscription <subscription-id>
  ```
For more details, see the [Azure CLI Troubleshooting documentation](https://docs.microsoft.com/en-us/cli/azure/troubleshooting).

---

## Q2: How do I correctly create a Service Principal for deployment?

**A:** To create a Service Principal that GitHub Actions can use for authentication, follow these steps:
1. **Log in to Azure:**
   ```bash
   az login --use-device-code
   ```
2. **Set the correct subscription:**
   ```bash
   az account set --subscription 22f9eb18-6553-4b7d-9451-47d0195085fe
   ```
3. **Create the Service Principal:**
   ```bash
   az ad sp create-for-rbac --name "http://github-actions-deploy.phoenixvc.tech" --role contributor --scopes /subscriptions/22f9eb18-6553-4b7d-9451-47d0195085fe --sdk-auth
   ```
   Replace any placeholders with your actual subscription ID. If you encounter authorization errors, contact an administrator for the necessary privileges.

For more detailed instructions, see our [Deployment Guide](../DEPLOYMENT.md).

---

## Q3: What are the supported regions for deploying Azure Static Web Apps?

**A:** The managed backend for Azure Static Web Apps is supported in the following regions:
- **westus2**
- **centralus**
- **eastus2**
- **westeurope**
- **eastasia**

---

## Q4: How do I ensure my app is deployed to a specific Azure region?

**A:** When creating your app, you select a region for the managed Azure Functions backend. For example, if deploying in West Europe, use the region identifier "euw" in your resource names (e.g., `prod-euw-swa-phoenixvc`).  
If you need to deploy your backend in a region not natively supported (e.g., South Africa North), you must use the "Bring Your Own Functions App" feature. See the [Functions: Bring Your Own Functions App documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own) for details.

---

## Q5: Can I deploy my Azure Static Web App to South Africa North?

**A:** Managed Azure Static Web Apps do not currently support South Africa North for the managed backend. If you require your backend in South Africa North, you must deploy your own Azure Functions app using the "Bring Your Own Functions App" feature. Refer to the answer above for details.

---

## Q6: How do I check and set my subscription ID?

**A:** To check your current subscription ID, run:
```bash
az account list --output table
```
To set your subscription, use:
```bash
az account set --subscription <subscription-id>
```
Replace `<subscription-id>` with your actual subscription ID (e.g., `22f9eb18-6553-4b7d-9451-47d0195085fe`).

---

## Q7: What local development alternatives do I have if I prefer not to use GitHub Codespaces?

**A:** While our primary development environment is GitHub Codespaces (a Linux-based virtual workspace), you can also develop locally using:
- **Local Linux VM:** Set up a virtual machine (e.g., using VirtualBox) running Ubuntu.
- **Docker Containers:** Containerize the project for a consistent environment.
- **WSL (Windows Subsystem for Linux):** Run a Linux environment on Windows.
For more details, refer to our [Local Development Alternatives](../CONTRIBUTING.md#local-development-alternatives) section in the CONTRIBUTING guidelines.

---

## Q8: Where can I find more detailed documentation?

**A:** For further information on deployment, troubleshooting, and coding standards, please refer to:
- [DEPLOYMENT.md](../DEPLOYMENT.md)
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- [CODE_STYLE_GUIDELINES.md](../docs/CODE_STYLE_GUIDELINES.md)
- [Azure Static Web Apps Overview](https://learn.microsoft.com/en-us/azure/static-web-apps/overview)
- [Azure Static Web Apps FAQ](https://learn.microsoft.com/en-us/azure/static-web-apps/faq)

---

*If you have additional questions or encounter issues not covered in this FAQ, please contact internal support or reach out via our project's communication channels.*
