#!/bin/bash
set -eo pipefail

###
# 1) Resolve and log deployment parameters
###

# Environment variables or defaults
ENVIRONMENT="${ENVIRONMENT:-staging}"
LOCATION_CODE="${LOCATION_CODE:-saf}"
ENABLE_POLICY_CHECKS="${ENABLE_POLICY_CHECKS:-true}"
ENABLE_MONITORING="${ENABLE_MONITORING:-false}"
ENABLE_COST_CHECKS="${ENABLE_COST_CHECKS:-false}"
POLICY_ENFORCEMENT_MODE="${POLICY_ENFORCEMENT_MODE:-enforce}"

# Override paths if provided; otherwise, use defaults
BICEP_FILE="${BICEP_FILE:-./infra/bicep/main.bicep}"
PARAMETERS_FILE="${PARAMETERS_FILE:-./infra/bicep/parameters-${ENVIRONMENT}.json}"

# Determine DEPLOY_REGION from LOCATION_CODE
if [ "$LOCATION_CODE" = "euw" ]; then
  DEPLOY_REGION="westeurope"
elif [ "$LOCATION_CODE" = "saf" ]; then
  DEPLOY_REGION="southafricanorth"
else
  echo "⚠️ Unknown LOCATION_CODE '$LOCATION_CODE', defaulting DEPLOY_REGION to 'westeurope'."
  DEPLOY_REGION="westeurope"
fi

# Compute resource group name
RESOURCE_GROUP="${ENVIRONMENT}-${LOCATION_CODE}-rg-phoenixvc-website"

# Check that jq is installed
if ! command -v jq > /dev/null; then
  echo "jq is not installed. Please install jq to run this script."
  exit 1
fi

# Log key deployment parameters
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

if [ -f "$PARAMETERS_FILE" ]; then
  echo "Full Parameters File Content:"
  cat "$PARAMETERS_FILE"
  echo "---------------------------------"
  deployKeyVaultVal=$(jq -r '.parameters.deployKeyVault.value // "not-set"' < "$PARAMETERS_FILE")
  deployLogicAppVal=$(jq -r '.parameters.deployLogicApp.value // "not-set"' < "$PARAMETERS_FILE")
  deployBudgetVal=$(jq -r '.parameters.deployBudget.value // "not-set"' < "$PARAMETERS_FILE")
  keyVaultSkuVal=$(jq -r '.parameters.keyVaultSku.value // "not-set"' < "$PARAMETERS_FILE")
  enableRbacAuthorizationVal=$(jq -r '.parameters.enableRbacAuthorization.value // "not-set"' < "$PARAMETERS_FILE")
else
  deployKeyVaultVal="N/A"
  deployLogicAppVal="N/A"
  deployBudgetVal="N/A"
  keyVaultSkuVal="N/A"
  enableRbacAuthorizationVal="N/A"
fi

echo "Parsed Parameter - deployKeyVault: $deployKeyVaultVal"
echo "Parsed Parameter - deployLogicApp: $deployLogicAppVal"
echo "Parsed Parameter - deployBudget: $deployBudgetVal"
echo "Parsed Parameter - keyVaultSku: $keyVaultSkuVal"
echo "Parsed Parameter - enableRbacAuthorization: $enableRbacAuthorizationVal"

# Timestamp for naming
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

###
# 2) Define helper functions
###

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

###
# 3) Main deployment flow
###
main() {
  handle_emergency "$@"

  echo "🚀 Starting ${ENVIRONMENT} deployment (Features: Policy=${ENABLE_POLICY_CHECKS}, Monitoring=${ENABLE_MONITORING})"

  # Pre-Flight Checks
  policy_precheck

  # Check resource group status before deployment
  check_resource_group

  echo "📄 Using parameter file: $PARAMETERS_FILE"
  cat "$PARAMETERS_FILE" || { echo "❌ Could not read parameters file: $PARAMETERS_FILE"; exit 1; }

  # Bicep Deployment (overrides provided by the parameter file will be applied)
  az deployment sub create \
    --name "PhoenixVC-${ENVIRONMENT}-${TIMESTAMP}" \
    --location "$DEPLOY_REGION" \
    --template-file "$BICEP_FILE" \
    --parameters @"$PARAMETERS_FILE" \
    --parameters environment="$ENVIRONMENT" locCode="$LOCATION_CODE" \
    --query properties.outputs

  # Post-Deployment validations
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
