#!/bin/bash
set -eo pipefail

# Feature Configuration
ENVIRONMENT="${ENVIRONMENT:-staging}"
# Expected values: "euw" for West Europe, "saf" for South Africa
LOCATION_CODE="${LOCATION_CODE:-saf}"
DEPLOY_REGION="westeurope"
ENABLE_POLICY_CHECKS="${ENABLE_POLICY_CHECKS:-true}"
ENABLE_MONITORING="${ENABLE_MONITORING:-false}"
ENABLE_COST_CHECKS="${ENABLE_COST_CHECKS:-false}"
POLICY_ENFORCEMENT_MODE="${POLICY_ENFORCEMENT_MODE:-enforce}"

# Check that jq is installed
if ! command -v jq > /dev/null; then
  echo "jq is not installed. Please install jq to run this script."
  exit 1
fi

# Determine deployment region based on LOCATION_CODE
if [ "$LOCATION_CODE" = "euw" ]; then
  DEPLOY_REGION="westeurope"
elif [ "$LOCATION_CODE" = "saf" ]; then
  DEPLOY_REGION="southafricanorth"
else
  echo "⚠️ Unknown LOCATION_CODE '$LOCATION_CODE', defaulting DEPLOY_REGION to 'westeurope'."
  DEPLOY_REGION="westeurope"
fi

# Path Configuration
BICEP_FILE="./infra/bicep/main.bicep"
PARAMETERS_FILE="./infra/bicep/parameters-${ENVIRONMENT}.json"
RESOURCE_GROUP="${ENVIRONMENT}-${LOCATION_CODE}-rg-phoenixvc-website"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Cleanup
trap 'rm -f temp_*_check.json' EXIT

# Policy Functions
policy_precheck() {
  [ "$ENABLE_POLICY_CHECKS" = "true" ] || return 0

  echo "🔒 Running Pre-Deployment Policy Check..."

  # Trigger a policy scan (non-blocking)
  az policy state trigger-scan --subscription "$(az account show --query id -o tsv)" --no-wait

  # Optionally wait a few seconds for the scan to complete
  sleep 10

  # Retrieve non-compliant policies for this resource group as JSON
  local non_compliant_json
  non_compliant_json=$(az policy state list --all --query "[?complianceState=='NonCompliant' && resourceGroup=='$RESOURCE_GROUP']" -o json)

  local violation_count
  violation_count=$(echo "$non_compliant_json" | jq 'length')

  if [ "$violation_count" -gt 0 ]; then
    echo "❌ Pre-Deployment Policy Violations: $violation_count violation(s) found:" >&2
    echo "$non_compliant_json" | jq -r '.[] | "- " + (.policyAssignmentName // "Unknown") + ": " + (.policyDefinitionName // "Unknown")'
    exit 1
  else
    echo "✅ No Pre-Deployment Policy Violations detected."
  fi
}

# Monitoring Setup
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

# Emergency Handling
handle_emergency() {
  if [[ "$*" == *"--emergency-override"* ]]; then
    echo "⚠️ EMERGENCY OVERRIDE: Disabling policy enforcement"
    export ENABLE_POLICY_CHECKS="false"
    export POLICY_ENFORCEMENT_MODE="disabled"
    PARAMETERS_FILE="./infra/bicep/emergency-parameters.json"
  fi
}

# Check if Resource Group exists and is not in a 'Deleting' state
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

# Main Deployment Flow
main() {
  handle_emergency "$@"

  echo "🚀 Starting ${ENVIRONMENT} deployment (Features: Policy=${ENABLE_POLICY_CHECKS}, Monitoring=${ENABLE_MONITORING})"

  # Pre-Flight Checks
  policy_precheck

  # Check resource group status before deployment
  check_resource_group

  # Bicep Deployment (Removed unsupported policyEnforcement parameter)
  az deployment sub create \
    --name "PhoenixVC-${ENVIRONMENT}-${TIMESTAMP}" \
    --location "$DEPLOY_REGION" \
    --template-file "$BICEP_FILE" \
    --parameters @"$PARAMETERS_FILE" \
    --parameters \
      environment="$ENVIRONMENT" \
      locCode="$LOCATION_CODE" \
    --query properties.outputs

  # Post-Deployment
  echo "✅ Deployment completed. Running validations..."
  if [ "$(az group exists --name "$RESOURCE_GROUP")" != "true" ]; then
    echo "❌ Resource Group missing!" >&2
    exit 1
  fi

  setup_monitoring

  # Cost Checks
  if [ "$ENABLE_COST_CHECKS" = "true" ]; then
    echo "💰 Cost Baseline Analysis:"
    az consumption budget list --query "[?name=='${RESOURCE_GROUP}-budget-website']" -o table
  fi

  echo "🛡️ Deployment Health Check Complete"
}

# Help Documentation
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

# Execution
if [[ "$*" == *"--help"* ]]; then
  show_help
  exit 0
fi

main "$@"
