# Frequently Asked Questions (FAQ) for Phoenix VC {: #frequently-asked-questions-faq-for-phoenix-vc}
This FAQ provides answers to common questions about the Phoenix VC project, covering general information, development, deployment, authentication, and regional availability.

## General Questions {: #general-questions}
### What is Phoenix VC? {: #what-is-phoenix-vc}
Phoenix VC is a comprehensive infrastructure and design system solution that provides enterprise-grade deployment capabilities, a robust design system, and development tools for modern web applications.

### How do I get started? {: #how-do-i-get-started}
1. Review our [Development Setup](/src/main/guides/development/development-setup.md)
2. Check the [Design System](/src/main/design/components/index.md)
3. Follow our [Deployment Guide](/src/main/guides/deployment/deployment-guide.md)

## Development & Environment Setup {: #development--environment-setup}
### What development environment do you recommend? {: #what-development-environment-do-you-recommend}
We recommend using our [Dev Containers](/src/main/guides/development/dev-containers.md) for the most consistent experience. Alternative options include:
- A local Linux VM (e.g., via VirtualBox)
- Docker containers for a consistent environment
- Windows Subsystem for Linux (WSL) on Windows

### How do I contribute to the project? {: #how-do-i-contribute-to-the-project}
See our [Contributing Guidelines](/src/main/design/guidelines/contributing.md) for detailed information.

## Azure Configuration & Deployment {: #azure-configuration--deployment}
### What does "No subscriptions were found" mean when I run `az login`? {: #what-does-no-subscriptions-were-found-mean-when-i-run-az-login}
**A:** This error indicates that Azure CLI did not detect any active subscriptions associated with your account. Verify your subscriptions with:
```bash
az account list --output table
```
Then set your desired subscription:
```bash
az account set --subscription <subscription-id>
```

### How do I create a Service Principal for deployment? {: #how-do-i-create-a-service-principal-for-deployment}
**A:** To create a Service Principal for GitHub Actions, run:
```bash
az ad sp create-for-rbac --name "github-actions-deploy" --role contributor --scopes "/subscriptions/<your-subscription-id>" --sdk-auth
```
Replace `<your-subscription-id>` with your actual subscription ID. Store the resulting JSON as the `AZURE_CREDENTIALS` secret in your GitHub repository.

### Which regions support Azure Static Web Apps? {: #which-regions-support-azure-static-web-apps}
**A:** The managed backend for Azure Static Web Apps is supported in regions including:
- westus2
- centralus
- eastus2
- westeurope
- eastasia

For unsupported regions (e.g., South Africa North), use the BYOF (Bring Your Own Functions App) model.

### How can I ensure my app is deployed to a specific Azure region? {: #how-can-i-ensure-my-app-is-deployed-to-a-specific-azure-region}
**A:** Specify the region in your deployment configuration. For example, for West Europe, use "euw" in resource names (e.g., `prod-euw-swa-phoenixvc`). For BYOF deployments, deploy Azure Functions in your desired region.

## Design System {: #design-system}
### How do I use the design system components? {: #how-do-i-use-the-design-system-components}
Start with our [Design System Installation Guide](/src/main/design/getting-started/installation.md) and review our [Usage Guidelines](/src/main/design/getting-started/usage.md).

### Where can I find design tokens? {: #where-can-i-find-design-tokens}
All design tokens are documented in:
- [Colors](/src/design/tokens/colors.md)
- [Typography](/src/design/tokens/typography.md)
- [Spacing](/src/design/tokens/spacing.md)

## Security & Compliance {: #security--compliance}
### How do I report a security vulnerability? {: #how-do-i-report-a-security-vulnerability}
Review our [Security Policy](/src/main/policies/SECURITY.md) for reporting procedures.

### What compliance standards do you follow? {: #what-compliance-standards-do-you-follow}
See our [Compliance Framework](/src/main/policies/compliance/policy-framework.md) for details.

## Support & Troubleshooting {: #support--troubleshooting}
### How do I get help? {: #how-do-i-get-help}
1. Check this FAQ first
2. Search the [documentation](/src/main/search.md)
3. Review the [Documentation Map](/src/main/meta/documentation-map.md)
4. [Contact Support](/src/main/mailto:support@phoenixvc.za)

### What do I do if I encounter deployment issues? {: #what-do-i-do-if-i-encounter-deployment-issues}
Check our [Troubleshooting Guide](/src/main/guides/deployment/troubleshooting.md) for common issues and solutions.

### How do I request a new feature? {: #how-do-i-request-a-new-feature}
Submit feature requests through our [GitHub repository](https://github.com/JustAGhosT/PhoenixVC-Modernized/issues).

---

If you have additional questions or need further assistance, please contact our support team at [support@phoenixvc.za](/src/main/mailto:support@phoenixvc.za).