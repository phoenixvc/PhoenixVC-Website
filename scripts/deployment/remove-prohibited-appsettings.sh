#!/bin/bash
set -eo pipefail

# ------------------------------------------------------------------------------
# Remove Prohibited App Settings from Azure Static Web Apps
# ------------------------------------------------------------------------------
# This script removes app settings that are not allowed in Azure Static Web Apps
# with Managed Functions. These settings cause deployment failures.
#
# Prohibited settings for Managed Functions:
# - FUNCTIONS_WORKER_RUNTIME
# - FUNCTIONS_INPROC_NET8_ENABLED
# - AzureWebJobsStorage
# - SCM_DO_BUILD_DURING_DEPLOYMENT
#
# Note: APPINSIGHTS_INSTRUMENTATIONKEY is allowed and should not be removed.
# ------------------------------------------------------------------------------

# Parse command line arguments
ENVIRONMENT="${1:-staging}"
LOCATION_CODE="${2:-euw}"

# Compute resource names based on convention
RESOURCE_GROUP="${ENVIRONMENT}-${LOCATION_CODE}-rg-phoenixvc-website"
STATIC_WEB_APP_NAME="${ENVIRONMENT}-${LOCATION_CODE}-swa-phoenixvc-website"

# List of prohibited app settings
PROHIBITED_SETTINGS=(
  "FUNCTIONS_WORKER_RUNTIME"
  "FUNCTIONS_INPROC_NET8_ENABLED"
  "AzureWebJobsStorage"
  "SCM_DO_BUILD_DURING_DEPLOYMENT"
)

echo "==============================================="
echo "Remove Prohibited App Settings Script"
echo "==============================================="
echo "Environment: $ENVIRONMENT"
echo "Location Code: $LOCATION_CODE"
echo "Resource Group: $RESOURCE_GROUP"
echo "Static Web App: $STATIC_WEB_APP_NAME"
echo "==============================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  echo "❌ Azure CLI is not installed. Please install it first."
  exit 1
fi

# Check if the resource group exists
echo "🔍 Checking if resource group exists..."
if ! az group exists --name "$RESOURCE_GROUP" | grep -q "true"; then
  echo "❌ Resource group '$RESOURCE_GROUP' does not exist."
  exit 1
fi

echo "✅ Resource group exists."

# Check if the static web app exists
echo "🔍 Checking if Static Web App exists..."
if ! az staticwebapp show --name "$STATIC_WEB_APP_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  echo "❌ Static Web App '$STATIC_WEB_APP_NAME' does not exist in resource group '$RESOURCE_GROUP'."
  exit 1
fi

echo "✅ Static Web App exists."

# Get current app settings
echo "🔍 Fetching current app settings..."
CURRENT_SETTINGS=$(az staticwebapp appsettings list \
  --name "$STATIC_WEB_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --output json 2>/dev/null || echo "{}")

if [ "$CURRENT_SETTINGS" = "{}" ] || [ -z "$CURRENT_SETTINGS" ]; then
  echo "ℹ️ No app settings found or unable to retrieve them."
  echo "This might mean:"
  echo "  1. There are no app settings configured"
  echo "  2. App settings are managed through a different method"
  echo "  3. Insufficient permissions to view app settings"
else
  echo "Current app settings:"
  echo "$CURRENT_SETTINGS" | jq -r 'to_entries | .[] | "  - \(.key) = \(.value)"'
fi

echo ""
echo "==============================================="
echo "Removing Prohibited App Settings"
echo "==============================================="

# Track if any settings were found
SETTINGS_FOUND=0
SETTINGS_REMOVED=0

# Check and remove each prohibited setting
for SETTING in "${PROHIBITED_SETTINGS[@]}"; do
  echo ""
  echo "Checking for: $SETTING"
  
  # Check if the setting exists
  SETTING_VALUE=$(echo "$CURRENT_SETTINGS" | jq -r --arg key "$SETTING" '.[$key] // empty')
  
  if [ -n "$SETTING_VALUE" ]; then
    SETTINGS_FOUND=$((SETTINGS_FOUND + 1))
    echo "⚠️ Found prohibited setting: $SETTING"
    echo "   Value: $SETTING_VALUE"
    
    # Attempt to remove the setting
    echo "🗑️ Removing $SETTING..."
    if az staticwebapp appsettings delete \
      --name "$STATIC_WEB_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --setting-names "$SETTING" \
      --yes &>/dev/null; then
      echo "✅ Successfully removed: $SETTING"
      SETTINGS_REMOVED=$((SETTINGS_REMOVED + 1))
    else
      echo "⚠️ Failed to remove: $SETTING"
      echo "   This may require manual removal via Azure Portal or higher permissions."
    fi
  else
    echo "✅ Not found (OK)"
  fi
done

echo ""
echo "==============================================="
echo "Summary"
echo "==============================================="
echo "Prohibited settings found: $SETTINGS_FOUND"
echo "Settings successfully removed: $SETTINGS_REMOVED"

if [ $SETTINGS_FOUND -eq 0 ]; then
  echo "✅ No prohibited app settings found. Configuration is clean."
elif [ $SETTINGS_REMOVED -eq $SETTINGS_FOUND ]; then
  echo "✅ All prohibited app settings have been removed."
else
  echo "⚠️ Some settings could not be removed automatically."
  echo "   Please verify and remove them manually via Azure Portal:"
  echo "   https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/staticSites/$STATIC_WEB_APP_NAME/configuration"
fi

echo ""
echo "🔍 Fetching updated app settings..."
UPDATED_SETTINGS=$(az staticwebapp appsettings list \
  --name "$STATIC_WEB_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --output json 2>/dev/null || echo "{}")

if [ "$UPDATED_SETTINGS" != "{}" ] && [ -n "$UPDATED_SETTINGS" ]; then
  echo "Remaining app settings:"
  echo "$UPDATED_SETTINGS" | jq -r 'to_entries | .[] | "  - \(.key)"'
else
  echo "No app settings configured (or unable to retrieve)."
fi

echo ""
echo "==============================================="
echo "Script completed"
echo "==============================================="
