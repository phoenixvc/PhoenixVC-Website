#!/bin/bash
set -eo pipefail

# ------------------------------------------------------------------------------
# Error handler: On error, fetch and print detailed deployment operations and error info.
# ------------------------------------------------------------------------------
onError() {
  echo "❌ Deployment failed. Fetching detailed deployment operations..."
  DEPLOYMENT_NAME="PhoenixVC-${ENVIRONMENT}-${TIMESTAMP}"
  echo "Deployment Operations:"
  az deployment sub operation list --name "$DEPLOYMENT_NAME" --query "[].{Operation:operationName, Status:provisioningState, Target:target}" -o table
  echo "Detailed Deployment Error:"
  az deployment sub show --name "$DEPLOYMENT_NAME" --query properties.error -o json
}
trap onError ERR

# ------------------------------------------------------------------------------
# 1) Resolve and log deployment parameters
# ------------------------------------------------------------------------------
# Use environment variables (if set) or defaults.
ENVIRONMENT="${ENVIRONMENT:-staging}"
LOCATION_CODE="${LOCATION_CODE:-saf}"
# For now, disable policy checks:
ENABLE_POLICY_CHECKS="${ENABLE_POLICY_CHECKS:-false}"
ENABLE_MONITORING="${ENABLE_MONITORING:-false}"
ENABLE_COST_CHECKS="${ENABLE_COST_CHECKS:-false}"
POLICY_ENFORCEMENT_MODE="${POLICY_ENFORCEMENT_MODE:-enforce}"

# Override file paths if provided; otherwise, use defaults.
BICEP_FILE="${BICEP_FILE:-./infra/bicep/main.bicep}"
PARAMETERS_FILE="${PARAMETERS_FILE:-./infra/bicep/parameters-${ENVIRONMENT}.json}"

# Determine DEPLOY_REGION from LOCATION_CODE.
if [ "$LOCATION_CODE" = "euw" ]; then
  DEPLOY_REGION="westeurope"
elif [ "$LOCATION_CODE" = "saf" ]; then
  DEPLOY_REGION="southafricanorth"
else
  echo "⚠️ Unknown LOCATION_CODE '$LOCATION_CODE', defaulting DEPLOY_REGION to 'westeurope'."
  DEPLOY_REGION="westeurope"
fi

# Compute resource group name.
RESOURCE_GROUP="${ENVIRONMENT}-${LOCATION_CODE}-rg-phoenixvc-website"

# Check that jq is installed.
if ! command -v jq > /dev/null; then
  echo "jq is not installed. Please install jq to run this script."
  exit 1
fi

# Log key deployment parameters.
echo "===== Deployment Parameters ====="
echo "ENVIRONMENT: $ENVIRONMENT"
echo "LOCATION_CODE: $LOCATION_CODE"
echo "DEPLOY_REGION: $DEPLOY_REGION"
echo "RESOURCE_GROUP: $RESOURCE_GROUP"
echo "BICEP_FILE: $BICEP_FILE"
echo "PARAMETERS_FILE: $PARAMETERS_FILE"
echo "ENABLE_POLICY_CHECKS: $ENABLE_POLICY_CHECKS"
echo "ENABLE_MONITORING: $ENABLE_MONITORING"
echo "ENABLE_COST_CHECKS: $ENABLE_COST_CHECKS"
echo "POLICY_ENFORCEMENT_MODE: $POLICY_ENFORCEMENT_MODE"
echo "================================="

# If the parameters file exists, parse override values.
if [ -f "$PARAMETERS_FILE" ]; then
  echo "Full Parameters File Content:"
  cat "$PARAMETERS_FILE"
  echo "---------------------------------"

  # For debugging, output the raw value (without tostring conversion) for each.
  deployKeyVaultRaw=$(jq -r '.parameters.deployKeyVault.value' < "$PARAMETERS_FILE")
  deployLogicAppRaw=$(jq -r '.parameters.deployLogicApp.value' < "$PARAMETERS_FILE")
  deployBudgetRaw=$(jq -r '.parameters.deployBudget.value' < "$PARAMETERS_FILE")
  keyVaultSkuRaw=$(jq -r '.parameters.keyVaultSku.value' < "$PARAMETERS_FILE")
  enableRbacAuthorizationRaw=$(jq -r '.parameters.enableRbacAuthorization.value' < "$PARAMETERS_FILE")

  # Use default "not-set" if the value is null.
  deployKeyVaultVal=${deployKeyVaultRaw:-"not-set"}
  deployLogicAppVal=${deployLogicAppRaw:-"not-set"}
  deployBudgetVal=${deployBudgetRaw:-"not-set"}
  keyVaultSkuVal=${keyVaultSkuRaw:-"not-set"}
  enableRbacAuthorizationVal=${enableRbacAuthorizationRaw:-"not-set"}
else
  deployKeyVaultVal="N/A"
  deployLogicAppVal="N/A"
  deployBudgetVal="N/A"
  keyVaultSkuVal="N/A"
  enableRbacAuthorizationVal="N/A"
fi

echo "Override Values from Parameters File:"
echo "  deployKeyVault: $deployKeyVaultVal"
echo "  deployLogicApp: $deployLogicAppVal"
echo "  deployBudget: $deployBudgetVal"
echo "  keyVaultSku: $keyVaultSkuVal"
echo "  enableRbacAuthorization: $enableRbacAuthorizationVal"
echo "---------------------------------"

# ------------------------------------------------------------------------------
# 2) Define helper functions
# ------------------------------------------------------------------------------
# (Policy check is skipped if ENABLE_POLICY_CHECKS is false.)
policy_precheck() {
  [ "$ENABLE_POLICY_CHECKS" = "true" ] || return 0

  echo "🔒 Running Pre-Deployment Policy Check..."
  az policy state trigger-scan --subscription "$(az account show --query id -o tsv)" --no-wait
  echo "Waiting for policy scan results..."
  sleep 20

  local non_compliant_json
  non_compliant_json=$(az policy state list --all --query "[?complianceState=='NonCompliant' && resourceGroup=='$RESOURCE_GROUP']" -o json)
  local violation_count
  violation_count=$(echo "$non_compliant_json" | jq 'length')

  if [ "$violation_count" -gt 0 ]; then
    echo "❌ Pre-Deployment Policy Violations: $violation_count violation(s) found:" >&2
    echo "$non_compliant_json" | jq -r '
      group_by(.policyDefinitionId)[] |
      "Policy Definition: " + (. [0].policyDefinitionName // "Unknown") +
      " (" + (. [0].policyDefinitionId // "N/A") + ") - Violations: " + (length | tostring) + "\n" +
      (map(
         "  - Resource: " + (.resourceId // "Unknown") +
         " | Assignment: " + (.policyAssignmentName // "Unknown") +
         " | Assignment ID: " + (.policyAssignmentId // "N/A")
       ) | join("\n"))
    '
    echo ""
    echo "🔍 Fetching detailed policy definitions for each violation:"
    for policyId in $(echo "$non_compliant_json" | jq -r '.[].policyDefinitionId' | sort | uniq); do
      local policyName="${policyId##*/}"
      echo "Policy ID: $policyId"
      echo "Details:"
      az policy definition show --name "$policyName" --query "{displayName: displayName, description: description}" -o json | jq .
      echo "------------------------"
    done
    exit 1
  else
    echo "✅ No Pre-Deployment Policy Violations detected."
  fi
}

setup_monitoring() {
  [ "$ENABLE_MONITORING" = "true" ] || return 0

  echo "📈 Configuring Monitoring..."
  if [ "$POLICY_ENFORCEMENT_MODE" = "enforce" ]; then
    az monitor activity-log alert create \
      --name "${RESOURCE_GROUP}-policy-violation" \
      --resource-group "$RESOURCE_GROUP" \
      --condition category='Policy' \
      --action email="security@phoenixvc.com" \
      --description "Policy violation alerts for Phoenix VC"
  else
    echo "Policy enforcement is not set to 'enforce'. Skipping monitoring configuration."
  fi
}

handle_emergency() {
  if [[ "$*" == *"--emergency-override"* ]]; then
    echo "⚠️ EMERGENCY OVERRIDE: Disabling policy enforcement"
    export ENABLE_POLICY_CHECKS="false"
    export POLICY_ENFORCEMENT_MODE="disabled"
    PARAMETERS_FILE="./infra/bicep/emergency-parameters.json"
  fi
}

check_resource_group() {
  echo "🔍 Checking resource group '$RESOURCE_GROUP'..."
  if az group exists --name "$RESOURCE_GROUP" | grep -q "true"; then
    local state
    state=$(az group show --name "$RESOURCE_GROUP" --query "properties.provisioningState" -o tsv)
    if [ "$state" = "Deleting" ]; then
      echo "❌ Resource group '$RESOURCE_GROUP' is currently being deleted. Aborting deployment." >&2
      exit 1
    else
      echo "✅ Resource group exists and is in state: $state"
    fi
  else
    echo "ℹ️ Resource group '$RESOURCE_GROUP' does not exist. It will be created."
  fi
}

get_static_web_app_url() {
  local rg_name="$1"
  local env="$2"
  local loc_code="$3"

  local swa_name="${env}-${loc_code}-swa-phoenixvc-website"

  echo "🔍 Looking up Static Web App URL for $swa_name..."

  # Try to get the URL from the existing Static Web App
  local url
  url=$(az staticwebapp show \
    --name "$swa_name" \
    --resource-group "$rg_name" \
    --query "defaultHostname" \
    --output tsv 2>/dev/null)

  if [ -n "$url" ]; then
    echo "https://$url"
    return 0
  fi

  return 1
}

# ------------------------------------------------------------------------------
# 3) Main deployment flow
# ------------------------------------------------------------------------------
main() {
  handle_emergency "$@"

  echo "🚀 Starting ${ENVIRONMENT} deployment (Features: Policy=${ENABLE_POLICY_CHECKS}, Monitoring=${ENABLE_MONITORING})"

  # Run policy precheck if enabled.
  if [ "$ENABLE_POLICY_CHECKS" = "true" ]; then
    policy_precheck
  else
    echo "🔒 Pre-Deployment Policy Check skipped (disabled)."
  fi

  # Check resource group status.
  check_resource_group

  local existing_url
  if az group exists --name "$RESOURCE_GROUP" | grep -q "true"; then
    existing_url=$(get_static_web_app_url "$RESOURCE_GROUP" "$ENVIRONMENT" "$LOCATION_CODE")
    if [ -n "$existing_url" ]; then
      echo "📡 Found existing Static Web App URL: $existing_url"
      echo "staticSiteUrl=$existing_url" >> "$GITHUB_OUTPUT"
    fi
  fi

  echo "📄 Using parameter file: $PARAMETERS_FILE"
  if ! cat "$PARAMETERS_FILE"; then
    echo "❌ Could not read parameters file: $PARAMETERS_FILE"
    exit 1
  fi

  # Timestamp for naming the deployment.
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)

  echo "🚀 Deploying resources..."
  az deployment sub create \
    --name "PhoenixVC-${ENVIRONMENT}-${TIMESTAMP}" \
    --location "$DEPLOY_REGION" \
    --template-file "$BICEP_FILE" \
    --parameters @"$PARAMETERS_FILE" \
    --parameters environment="$ENVIRONMENT" locCode="$LOCATION_CODE" \
    --query properties.outputs

  local deployment_url
  deployment_url=$(az deployment sub show --name "PhoenixVC-${ENVIRONMENT}-${TIMESTAMP}" \
    --query "properties.outputs.staticSiteUrl.value" -o tsv)

  # Retrieve the static site URL from the deployment outputs
  if [ -n "$deployment_url" ]; then
    echo "📡 Got URL from deployment: $deployment_url"
    echo "staticSiteUrl=$deployment_url" >> "$GITHUB_OUTPUT"
  elif [ -n "$existing_url" ]; then
    echo "📡 Using existing URL: $existing_url"
    # Note: Already written to GITHUB_OUTPUT above
  else
    # Final attempt to get URL
    final_url=$(get_static_web_app_url "$RESOURCE_GROUP" "$ENVIRONMENT" "$LOCATION_CODE")
    if [ -n "$final_url" ]; then
      echo "📡 Retrieved URL after deployment: $final_url"
      echo "staticSiteUrl=$final_url" >> "$GITHUB_OUTPUT"
    else
      echo "⚠️ Could not determine Static Web App URL"
      echo "staticSiteUrl=" >> "$GITHUB_OUTPUT"
    fi
  fi

  # # Retrieve the HTTP trigger URL for the Logic App.
  # # Note: This command requires that the Logic App has a manual trigger configured.
  # logicAppUrl=$(az logic workflow list-callback-url --name "$logicAppName" --resource-group "$RESOURCE_GROUP" --query "value" -o tsv)
  # if [ -n "$logicAppUrl" ]; then
  #   echo "logicAppUrl=$logicAppUrl" >> "$GITHUB_OUTPUT"
  # else
  #   echo "logicAppUrl=" >> "$GITHUB_OUTPUT"
  # fi

  # # Define variables
  # subscriptionId="<Your-Subscription-ID>"
  # resourceGroupName="<Your-Resource-Group-Name>"
  # logicAppName="<Your-Logic-App-Name>"
  # workflowName="<Your-Workflow-Name>"
  # triggerName="<Your-Trigger-Name>"

  # # Construct the REST API URL
  # url="https://management.azure.com/subscriptions/$subscriptionId/resourceGroups/$resourceGroupName/providers/Microsoft.Web/sites/$logicAppName/hostruntime/runtime/webhooks/workflow/api/management/workflows/$workflowName/triggers/$triggerName/listCallbackUrl?api-version=2018-11-01"

  # # Retrieve the callback URL using az rest
  # response=$(az rest --method POST --uri "$url")

  # # Extract the callback URL from the response
  # logicAppUrl=$(echo $response | jq -r '.value')

  # # Output the result
  # if [ -n "$logicAppUrl" ]; then
  #   echo "logicAppUrl=$logicAppUrl" >> "$GITHUB_OUTPUT"
  # else
  #   echo "logicAppUrl=" >> "$GITHUB_OUTPUT"
  # fi

  # Post-deployment validations.
  echo "✅ Deployment completed. Running validations..."
  if [ "$(az group exists --name "$RESOURCE_GROUP")" != "true" ]; then
    echo "❌ Resource Group missing!" >&2
    exit 1
  fi

  setup_monitoring

  if [ "$ENABLE_COST_CHECKS" = "true" ]; then
    echo "💰 Cost Baseline Analysis:"
    az consumption budget list --query "[?name=='${RESOURCE_GROUP}-budget-website']" -o table
  fi

  echo "🛡️ Deployment Health Check Complete"
}

show_help() {
  echo -e "Usage: ENVIRONMENT=staging ./deploy.sh [--emergency-override]"
  echo -e "\nFeature Flags (set as env vars):"
  echo "  ENABLE_POLICY_CHECKS=false   - Disable policy compliance checks"
  echo "  ENABLE_MONITORING=true       - Force enable monitoring"
  echo "  ENABLE_COST_CHECKS=false     - Disable cost analysis"
  echo "  POLICY_ENFORCEMENT_MODE=audit - Policy audit mode"
  echo -e "\nEmergency Features:"
  echo "  --emergency-override         - Bypass policy checks (audit logs still enabled)"
}

if [[ "$*" == *"--help"* ]]; then
  show_help
  exit 0
fi

main "$@"
