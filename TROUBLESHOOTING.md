# Troubleshooting Guide

This document provides troubleshooting steps for common issues encountered during the deployment of the Phoenix VC project. If you run into errors, please refer to the relevant section below.

---

## Issue: Azure Login Failed with Error:  
**"Using auth-type: SERVICE_PRINCIPAL. Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied. Double check if the 'auth-type' is correct. Refer to https://github.com/Azure/login#readme for more information."**

### Error Description

When attempting to deploy the project (either via GitHub Actions or locally), you might see an error indicating that the login failed due to missing values required for a Service Principal authentication.

### Possible Causes

- **Incomplete Azure Credentials:**  
  The `AZURE_CREDENTIALS` secret may be missing required keys such as `clientId` and `tenantId`.

- **Service Principal Misconfiguration:**  
  The Service Principal might not have been created correctly, or the values were not copied accurately.

- **Workflow Configuration Issues:**  
  The GitHub Actions workflow might be referencing the secret incorrectly.

### Troubleshooting Steps

1. **Verify Service Principal Creation:**

   Ensure you have created the Service Principal with all required parameters. In the Azure CLI, run:
   ```bash
   az ad sp create-for-rbac --name "github-actions-deploy" --role contributor --scopes /subscriptions/<your-subscription-id> --sdk-auth
   ```
   The output JSON should include keys such as:
   - `clientId`
   - `clientSecret`
   - `tenantId`
   - `subscriptionId`

2. **Check the AZURE_CREDENTIALS Secret in GitHub:**

   - Navigate to your repository’s **Settings > Secrets**.
   - Verify that the secret named `AZURE_CREDENTIALS` contains the complete JSON output from the Service Principal creation.
   - The JSON should have at least the following structure:
     ```json
     {
       "clientId": "your-client-id",
       "clientSecret": "your-client-secret",
       "tenantId": "your-tenant-id",
       "subscriptionId": "your-subscription-id"
     }
     ```

3. **Review Your GitHub Actions Workflow:**

   - Open the workflow file located at `.github/workflows/deploy.yml`.
   - Ensure that it correctly references the `AZURE_CREDENTIALS` secret.
   - Double-check for typos in the secret name or any misconfiguration in the action parameters.

4. **Test Locally with Azure CLI:**

   Confirm that your Service Principal credentials are valid by attempting to log in locally:
   ```bash
   az login --service-principal -u <clientId> -p <clientSecret> --tenant <tenantId>
   ```
   If the login is successful, it confirms that the credentials are correct.

5. **Consult Documentation:**

   For additional configuration details and troubleshooting tips, refer to the [Azure/login GitHub Action documentation](https://github.com/Azure/login#readme).

### Additional Help

If you continue to experience issues after following these steps:
- Review the GitHub Actions logs for additional context and error details.
- Reach out via your internal support channels or contact your system administrator for further assistance.
- Update this guide with any new resolutions that work for your specific environment.

---

*Note: This troubleshooting guide covers common issues related to Azure Service Principal authentication during deployment. As new issues arise or configurations change, please update this document accordingly.*
