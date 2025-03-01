#!/bin/bash
set -eo pipefail

# ------------------------------------------------------------------------------
# Error handler: On error, fetch and print detailed deployment operations and error info
# ------------------------------------------------------------------------------
onError() {
  echo "❌ Deployment failed. Error code: $?" >&2
  echo "Last command: $BASH_COMMAND" >&2

  echo "Fetching detailed deployment operations..."
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
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

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
echo "GITHUB_TOKEN: $GITHUB_TOKEN"
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

  echo "📄 Using parameter file: $PARAMETERS_FILE"
  if ! cat "$PARAMETERS_FILE"; then
    echo "❌ Could not read parameters file: $PARAMETERS_FILE"
    exit 1
  fi

  # Timestamp for naming the deployment.
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)

  echo "🚀 Deploying resources..."
  deployment_params=(
    --name "PhoenixVC-${ENVIRONMENT}-${TIMESTAMP}"
    --location "$DEPLOY_REGION"
    --template-file "$BICEP_FILE"
    --parameters @"$PARAMETERS_FILE"
    --parameters environment="$ENVIRONMENT" locCode="$LOCATION_CODE"
  )

  if [ "$deployLogicAppVal" = "true" ]; then
    if [ -z "$GITHUB_TOKEN" ]; then
      echo "Debug: deployLogicApp is true"
      echo "Debug: GITHUB_TOKEN length: ${#GITHUB_TOKEN}"
      echo "❌ GITHUB_TOKEN is required when deployLogicApp is true" >&2
      exit 1
    fi
    if [[ ! $GITHUB_TOKEN =~ ^gh[ps]_[A-Za-z0-9_]{36,255}$ ]]; then
        echo "⚠️ Warning: GITHUB_TOKEN format doesn't match expected pattern" >&2
    fi
    deployment_params+=(--parameters githubToken="$GITHUB_TOKEN")
  fi

  if ! az deployment sub create "${deployment_params[@]}" --query properties.outputs; then
      echo "❌ Deployment failed"
      exit 1
  fi

  # First try to get URL from deployment outputs (original behavior)
  staticSiteUrl=$(az deployment sub show --name "PhoenixVC-${ENVIRONMENT}-${TIMESTAMP}" \
    --query "properties.outputs.staticSiteUrl.value" -o tsv)

  # If no URL from deployment, but resource group exists, try to get existing URL
  if [ -z "$staticSiteUrl" ] && az group exists --name "$RESOURCE_GROUP" | grep -q "true"; then
    swa_name="${ENVIRONMENT}-${LOCATION_CODE}-swa-phoenixvc-website"
    staticSiteUrl=$(az staticwebapp show \
      --name "$swa_name" \
      --resource-group "$RESOURCE_GROUP" \
      --query "defaultHostname" \
      --output tsv 2>/dev/null)

    if [ -n "$staticSiteUrl" ]; then
      staticSiteUrl="https://$staticSiteUrl"
    fi
  fi

  # Output the URL (whether from deployment or existing resource)
  if [ -n "$staticSiteUrl" ]; then
    echo "staticSiteUrl=${staticSiteUrl}" >> "$GITHUB_OUTPUT"
  else
    echo "staticSiteUrl=" >> "$GITHUB_OUTPUT"
  fi

  if [ "$deployLogicAppVal" = "true" ]; then
    # Get URLs for both Logic Apps
    teams_logic_app_name="${ENVIRONMENT}-${LOCATION_CODE}-la-phoenixvc"
    github_logic_app_name="${ENVIRONMENT}-${LOCATION_CODE}-la-github"

    # Get Teams notification Logic App URL
    teamsLogicAppUrl=$(az logic workflow list-callback-url \
      --name "$teams_logic_app_name" \
      --resource-group "$RESOURCE_GROUP" \
      --query "value" -o tsv 2>/dev/null)

    if [ -n "$teamsLogicAppUrl" ]; then
      echo "teamsLogicAppUrl=${teamsLogicAppUrl}" >> "$GITHUB_OUTPUT"
    else
      echo "teamsLogicAppUrl=" >> "$GITHUB_OUTPUT"
    fi

    githubLogicAppUrl=$(az logic workflow list-callback-url \
      --name "$github_logic_app_name" \
      --resource-group "$RESOURCE_GROUP" \
      --query "value" -o tsv 2>/dev/null)

    if [ -n "$githubLogicAppUrl" ]; then
      echo "githubLogicAppUrl=${githubLogicAppUrl}" >> "$GITHUB_OUTPUT"
    else
      echo "githubLogicAppUrl=" >> "$GITHUB_OUTPUT"
    fi
  fi

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
  echo "  GITHUB_TOKEN                 - Required when deployLogicApp is true"
  echo -e "\nEmergency Features:"
  echo "  --emergency-override         - Bypass policy checks (audit logs still enabled)"
}

if [[ "$*" == *"--help"* ]]; then
  show_help
  exit 0
fi

main "$@"
