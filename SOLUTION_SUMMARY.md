# Solution Summary: Removing Prohibited Azure Static Web App Settings

## Problem Statement

Your Azure Static Web App deployments were failing because prohibited app settings were configured. These settings conflict with Managed Functions and cause deployment failures:

- `FUNCTIONS_WORKER_RUNTIME`
- `FUNCTIONS_INPROC_NET8_ENABLED`
- `AzureWebJobsStorage`
- `SCM_DO_BUILD_DURING_DEPLOYMENT`

## What Was Done

### 1. Created Cleanup Script
**File:** `scripts/deployment/remove-prohibited-appsettings.sh`

A comprehensive bash script that:
- Automatically detects and removes prohibited app settings
- Works for any environment (staging/production) and location (euw/saf)
- Provides detailed logging and verification
- Safe to run multiple times (idempotent)

**Usage:**
```bash
./scripts/deployment/remove-prohibited-appsettings.sh staging euw
./scripts/deployment/remove-prohibited-appsettings.sh production euw
```

### 2. Created GitHub Actions Workflow
**File:** `.github/workflows/cleanup-appsettings.yml`

An automated workflow that:
- Can be triggered manually from GitHub Actions UI
- Supports dry-run mode to check before removing
- Works with both staging and production environments
- Provides detailed summary in the workflow logs

**How to use:**
1. Go to Actions → "Cleanup Prohibited App Settings"
2. Click "Run workflow"
3. Select environment and dry_run mode
4. Review results

### 3. Updated Documentation

**Updated Files:**
- `scripts/deployment/README.md` - Complete deployment scripts reference
- `docs/src/main/guides/deployment/troubleshooting.md` - Added SWA001 error code and troubleshooting section
- `AZURE_APPSETTINGS_FIX.md` - Quick reference guide (new file)

**What's documented:**
- Why these settings are prohibited
- How to remove them (3 different methods)
- How to prevent this issue in the future
- Best practices for Static Web Apps configuration

## What You Need to Do

### Immediate Action Required

**You must run the cleanup to remove these prohibited settings:**

#### Option A: Run Script Locally (Recommended if you have Azure CLI access)

```bash
# Ensure you're logged into Azure
az login

# Set the correct subscription
az account set --subscription <your-subscription-id>

# Run cleanup for staging
./scripts/deployment/remove-prohibited-appsettings.sh staging euw

# Run cleanup for production (if needed)
./scripts/deployment/remove-prohibited-appsettings.sh production euw
```

#### Option B: Use GitHub Actions Workflow

1. Go to: https://github.com/phoenixvc/PhoenixVC-Website/actions/workflows/cleanup-appsettings.yml
2. Click "Run workflow"
3. First run with `dry_run=true` to see what will be removed
4. Then run with `dry_run=false` to actually remove the settings
5. Repeat for both staging and production environments

### Verification

After running the cleanup, verify the settings are gone:

```bash
az staticwebapp appsettings list \
  --name staging-euw-swa-phoenixvc-website \
  --resource-group staging-euw-rg-phoenixvc-website
```

The output should either be empty or only contain allowed settings like `APPINSIGHTS_INSTRUMENTATIONKEY`.

### Prevention

To prevent this issue from happening again:

1. **Never add these settings** through Azure Portal
2. **Use `staticwebapp.config.json`** for routing, headers, and platform config (already in `.config/`)
3. **Run monthly audits** using the cleanup workflow with dry_run=true
4. **Educate team members** about prohibited settings (share `AZURE_APPSETTINGS_FIX.md`)

## Files Changed in This PR

### New Files
- `.github/workflows/cleanup-appsettings.yml` - Automated cleanup workflow
- `scripts/deployment/remove-prohibited-appsettings.sh` - Cleanup script
- `AZURE_APPSETTINGS_FIX.md` - Quick reference guide
- `SOLUTION_SUMMARY.md` - This file

### Updated Files
- `scripts/deployment/README.md` - Added documentation for new script
- `docs/src/main/guides/deployment/troubleshooting.md` - Added SWA001 error section

## Technical Details

### Why These Settings Are Prohibited

Azure Static Web Apps with Managed Functions:
- Automatically configures the Function runtime
- Automatically manages Azure Storage for Functions
- Has its own build system that conflicts with SCM build settings

When you manually add these settings, they override the managed configuration and cause conflicts.

### What Settings ARE Allowed

You CAN configure:
- `APPINSIGHTS_INSTRUMENTATIONKEY` - Application Insights key
- Custom environment variables for your application code
- Any application-specific settings your code needs

### Managed vs. Bring Your Own Functions

- **Managed Functions** (what you're using): Azure handles everything, don't add runtime settings
- **Bring Your Own Functions**: You deploy a separate Function App and can configure these settings

## Testing

The solution has been validated for:
- ✅ Shell script syntax
- ✅ YAML workflow syntax
- ✅ Documentation accuracy
- ⚠️  Actual Azure execution (requires Azure credentials)

**Note:** The actual removal of app settings needs to be tested in your Azure environment.

## Next Steps

1. **Run the cleanup** (use Option A or B above)
2. **Verify settings are removed** using the az CLI command
3. **Test a deployment** to ensure it now succeeds
4. **Share the quick reference** (`AZURE_APPSETTINGS_FIX.md`) with your team
5. **Schedule monthly audits** using the GitHub workflow

## Need Help?

- Quick reference: [AZURE_APPSETTINGS_FIX.md](./AZURE_APPSETTINGS_FIX.md)
- Detailed guide: [scripts/deployment/README.md](./scripts/deployment/README.md)
- Troubleshooting: [docs/src/main/guides/deployment/troubleshooting.md](./docs/src/main/guides/deployment/troubleshooting.md#prohibited-app-settings-error-swa001)

## References

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Managed Functions Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own)
- [Static Web Apps Configuration Reference](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
