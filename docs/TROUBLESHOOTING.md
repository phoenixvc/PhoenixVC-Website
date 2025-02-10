# Troubleshooting Guide for Phoenix VC - Modernized (Windows & Linux)

This guide provides steps to resolve common issues encountered during the development and deployment of the Phoenix VC project. It covers verifying prerequisites, resolving Azure authentication errors, addressing general deployment problems, and offers alternatives for local development.

---

## 1. Verify Prerequisites

Ensure all required tools are installed on your machine.

### Windows (Using PowerShell or Git Bash)

**Using Chocolatey (if installed):**
- **Node.js:**  
  Check with:
  ```powershell
  node --version
  ```
  If missing, install:
  ```powershell
  choco install nodejs -y
  ```
- **Git:**  
  Check with:
  ```powershell
  git --version
  ```
  If missing, install:
  ```powershell
  choco install git -y
  ```
- **Azure CLI:**  
  Check with:
  ```powershell
  az --version
  ```
  If missing, install:
  ```powershell
  choco install azure-cli -y
  ```
- **Python 3 (Optional):**  
  Check with:
  ```powershell
  python --version
  ```
  If missing, install:
  ```powershell
  choco install python -y
  ```

*Note: If the `choco` command is not found, Chocolatey is not installed. Install it by opening an elevated PowerShell window and running:*
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Linux (e.g., GitHub Codespace or Local VM)

Run the following commands in your terminal:
- **Update Package List:**
  ```bash
  sudo apt-get update
  ```
- **Node.js:**
  ```bash
  node --version || sudo apt-get install -y nodejs npm
  ```
  *Note: For the latest Node.js version, consider using the NodeSource repository.*
- **Git:**
  ```bash
  git --version || sudo apt-get install -y git
  ```
- **Azure CLI:**
  ```bash
  az --version || curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
  ```
- **Python 3 (Optional):**
  ```bash
  python3 --version || sudo apt-get install -y python3
  ```

---

## 2. Azure Login Issues

If you encounter an error such as:
```
Using auth-type: SERVICE_PRINCIPAL. Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied.
Double check if the 'auth-type' is correct.
Refer to https://github.com/Azure/login#readme for more information.
```

### Steps to Resolve:

1. **Verify Service Principal Creation:**  
   Run (replace `<your-subscription-id>` with your actual subscription ID):
   ```bash
   az ad sp create-for-rbac --name "github-actions-deploy" --role contributor --scopes /subscriptions/<your-subscription-id> --sdk-auth
   ```
   Ensure the output JSON includes `clientId`, `clientSecret`, `tenantId`, and `subscriptionId`.

2. **Check GitHub Secrets:**  
   Verify that the secret `AZURE_CREDENTIALS` in your repository’s **Settings > Secrets** contains the full JSON output.

3. **Review Your Workflow:**  
   Confirm that the GitHub Actions workflow in `.github/workflows/deploy.yml` correctly references `AZURE_CREDENTIALS`.

4. **Test Locally:**  
   Validate your credentials by running:
   ```bash
   az login --service-principal -u <clientId> -p <clientSecret> --tenant <tenantId>
   ```
   A successful login confirms that your credentials are correct.

5. **Consult Documentation:**  
   Refer to the [Azure/login GitHub Action documentation](https://github.com/Azure/login#readme) for further details.

---

## 3. General Deployment Issues

- **Review Logs:**  
  Check GitHub Actions logs or the output of your deployment script (`./scripts/deploy.sh` on Linux or `.\scripts\deploy.sh` on Windows) for error messages.
- **Verify Resource Group Creation:**  
  Ensure the resource group is created by running:
  ```bash
  az group list --output table
  ```
- **Check the Parameter File:**  
  Verify that `infra/bicep/parameters.json` is correctly formatted and contains all required values.
- **Permissions & Network:**  
  Confirm your Azure account has the necessary permissions and that your network connection is stable.

---

## 4. Linting and Build Errors

Run these commands to catch code quality issues before deployment:
- **ESLint:**  
  ```bash
  npm run lint
  ```
- **Stylelint:**  
  ```bash
  npm run lint:css
  ```
- **Prettier:**  
  ```bash
  npm run format
  ```
Address any errors or warnings reported by these tools.

---

## 5. Local Development Alternatives

If you prefer not to use the GitHub Codespace virtual workspace, consider these alternatives:
- **Local Linux VM:**  
  Set up a virtual machine (e.g., using VirtualBox or VMware) running Ubuntu and follow the Linux prerequisites.
- **Docker Containers:**  
  Create a Docker environment for your project to ensure consistency in development.
- **WSL (Windows Subsystem for Linux):**  
  Use WSL on Windows to run a Linux environment directly on your machine.

These alternatives allow you to develop locally while following the same deployment and testing processes.

---

## 6. Additional Resources

- [Azure CLI Troubleshooting](https://docs.microsoft.com/en-us/cli/azure/troubleshooting)
- [GitHub Actions Debugging](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 7. Additional Help

If issues persist after following these steps:
- Review the logs for additional context.
- Contact internal support or your system administrator.
- Update this guide with new solutions as they emerge.

*Note: This guide covers common issues related to tool installations, Azure authentication, deployment, and local development alternatives. Please update it as new issues or solutions arise.*
