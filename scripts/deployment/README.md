# Deployment Scripts

This directory contains scripts for deploying and managing the PhoenixVC Website infrastructure on Azure.

## Scripts

### `deploy.sh`

Main deployment script for deploying infrastructure resources using Bicep templates.

**Usage:**
```bash
ENVIRONMENT=staging ./scripts/deployment/deploy.sh
ENVIRONMENT=production ./scripts/deployment/deploy.sh
```

**Environment Variables:**
- `ENVIRONMENT` - Deployment environment (staging/production)
- `LOCATION_CODE` - Azure region code (euw/saf)
- `ENABLE_POLICY_CHECKS` - Enable Azure Policy compliance checks (true/false)
- `ENABLE_MONITORING` - Enable monitoring configuration (true/false)
- `ENABLE_COST_CHECKS` - Enable cost analysis (true/false)
- `GITHUB_TOKEN` - Required when deployLogicApp is true

### `remove-prohibited-appsettings.sh`

Removes prohibited app settings from Azure Static Web Apps that cause deployment failures with Managed Functions.

**Usage:**
```bash
./scripts/deployment/remove-prohibited-appsettings.sh [environment] [location_code]
./scripts/deployment/remove-prohibited-appsettings.sh staging euw
./scripts/deployment/remove-prohibited-appsettings.sh production euw
```

**What it does:**
- Scans for and removes the following prohibited app settings:
  - `FUNCTIONS_WORKER_RUNTIME`
  - `FUNCTIONS_INPROC_NET8_ENABLED`
  - `AzureWebJobsStorage`
  - `SCM_DO_BUILD_DURING_DEPLOYMENT`
- Preserves allowed settings like `APPINSIGHTS_INSTRUMENTATIONKEY`

**When to use:**
- After Azure Portal configuration changes
- When deployment fails with "AppSetting with name(s) ... are not allowed" errors
- As part of infrastructure hygiene/maintenance

### `create-service-principal.sh`

Creates an Azure service principal for CI/CD authentication.

**Usage:**
```bash
./scripts/deployment/create-service-principal.sh
```

## Azure Static Web Apps - App Settings Guidelines

### Prohibited Settings for Managed Functions

When using Azure Static Web Apps with **Managed Functions**, the following app settings are **NOT allowed** and will cause deployment failures:

❌ **Prohibited Settings:**
- `FUNCTIONS_WORKER_RUNTIME` - Managed by Azure automatically
- `FUNCTIONS_INPROC_NET8_ENABLED` - Managed by Azure automatically
- `AzureWebJobsStorage` - Managed by Azure automatically for managed functions
- `SCM_DO_BUILD_DURING_DEPLOYMENT` - Conflicts with Static Web Apps build process

✅ **Allowed Settings:**
- `APPINSIGHTS_INSTRUMENTATIONKEY` - Application Insights instrumentation key
- Custom application-specific settings
- Environment-specific configuration values

### Important Notes

1. **Managed vs. Bring Your Own Functions:**
   - Managed Functions: Azure handles runtime, storage, and configuration automatically
   - Bring Your Own Functions: You have full control but need to manage these settings yourself

2. **Configuration Location:**
   - Repository: Use `staticwebapp.config.json` for routing and headers
   - Azure Portal: Only for app settings that cannot be in source control (secrets, environment-specific values)
   - Bicep/IaC: Infrastructure configuration should be in version control

3. **Best Practices:**
   - Store configuration in `staticwebapp.config.json` when possible
   - Use Azure Key Vault for secrets
   - Keep app settings minimal and document their purpose
   - Run `remove-prohibited-appsettings.sh` after manual Portal changes

## Troubleshooting

### Deployment Fails with "AppSetting not allowed" Error

If you see errors like:
```
AppSetting with name(s) 'FUNCTIONS_WORKER_RUNTIME' are not allowed.
```

**Solution:**
```bash
# Run the cleanup script
./scripts/deployment/remove-prohibited-appsettings.sh staging euw

# Or manually via Azure CLI
az staticwebapp appsettings delete \
  --name staging-euw-swa-phoenixvc-website \
  --resource-group staging-euw-rg-phoenixvc-website \
  --setting-names FUNCTIONS_WORKER_RUNTIME FUNCTIONS_INPROC_NET8_ENABLED AzureWebJobsStorage SCM_DO_BUILD_DURING_DEPLOYMENT \
  --yes
```

### Checking Current App Settings

```bash
az staticwebapp appsettings list \
  --name staging-euw-swa-phoenixvc-website \
  --resource-group staging-euw-rg-phoenixvc-website \
  --output table
```

## References

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Managed Functions vs Bring Your Own Functions](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own)
- [Static Web Apps Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
