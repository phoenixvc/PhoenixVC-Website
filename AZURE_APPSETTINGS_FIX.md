# Azure Static Web Apps - Prohibited App Settings Resolution

## Problem

Azure Static Web Apps with **Managed Functions** does not allow certain app settings that conflict with the managed infrastructure. If these settings are present, deployments will fail with errors like:

```
AppSetting with name(s) 'FUNCTIONS_WORKER_RUNTIME' are not allowed.
AppSetting with name(s) 'FUNCTIONS_INPROC_NET8_ENABLED' are not allowed.
AppSetting with name(s) 'AzureWebJobsStorage' are not allowed.
AppSetting with name(s) 'SCM_DO_BUILD_DURING_DEPLOYMENT' are not allowed.
```

## Quick Fix

### Option 1: Run the Cleanup Script

```bash
# For staging environment
./scripts/deployment/remove-prohibited-appsettings.sh staging euw

# For production environment
./scripts/deployment/remove-prohibited-appsettings.sh production euw
```

### Option 2: Use GitHub Actions Workflow

1. Go to the **Actions** tab in GitHub
2. Select **"Cleanup Prohibited App Settings"** workflow
3. Click **"Run workflow"**
4. Choose:
   - Environment (staging/production)
   - Location code (euw/saf)
   - Dry run: `true` (to check first) or `false` (to remove)
5. Click **"Run workflow"**

### Option 3: Manual Azure CLI

```bash
# Check what settings exist
az staticwebapp appsettings list \
  --name staging-euw-swa-phoenixvc-website \
  --resource-group staging-euw-rg-phoenixvc-website

# Remove prohibited settings
az staticwebapp appsettings delete \
  --name staging-euw-swa-phoenixvc-website \
  --resource-group staging-euw-rg-phoenixvc-website \
  --setting-names FUNCTIONS_WORKER_RUNTIME FUNCTIONS_INPROC_NET8_ENABLED AzureWebJobsStorage SCM_DO_BUILD_DURING_DEPLOYMENT \
  --yes
```

## Why This Happens

These settings were likely added manually via the Azure Portal or Azure CLI. When using Azure Static Web Apps with Managed Functions:

- ❌ Azure **manages** the function runtime automatically
- ❌ Azure **manages** storage connections automatically  
- ❌ Azure **manages** the build process automatically

Adding these settings manually conflicts with the managed infrastructure.

## Prevention

1. **Never add these settings** via Azure Portal
2. **Use `staticwebapp.config.json`** for routing and headers
3. **Use Key Vault** for secrets
4. **Run monthly audits** using the cleanup workflow with dry_run=true

## Prohibited Settings

The following settings are **NOT allowed** with Managed Functions:

- `FUNCTIONS_WORKER_RUNTIME`
- `FUNCTIONS_INPROC_NET8_ENABLED`
- `AzureWebJobsStorage`
- `SCM_DO_BUILD_DURING_DEPLOYMENT`

## Allowed Settings

These settings **ARE allowed**:

- `APPINSIGHTS_INSTRUMENTATIONKEY`
- Custom application settings
- Environment-specific configuration

## More Information

- [Deployment Scripts README](./scripts/deployment/README.md)
- [Troubleshooting Guide](./docs/src/main/guides/deployment/troubleshooting.md#prohibited-app-settings-error-swa001)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
