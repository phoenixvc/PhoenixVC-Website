#!/bin/bash
set -eo pipefail

# Feature Configuration
ENVIRONMENT="${ENVIRONMENT:-prod}"
LOCATION_CODE="${LOCATION_CODE:-za}"
DEPLOY_REGION="South Africa North"
ENABLE_POLICY_CHECKS="${ENABLE_POLICY_CHECKS:-true}"
ENABLE_MONITORING="${ENABLE_MONITORING:-$([ "$ENVIRONMENT" == "prod" ] && echo "true" || echo "false")}"
ENABLE_COST_CHECKS="${ENABLE_COST_CHECKS:-false}"
POLICY_ENFORCEMENT_MODE="${POLICY_ENFORCEMENT_MODE:-enforce}"

# Path Configuration
BICEP_FILE="./infra/bicep/main.bicep"
PARAMETERS_FILE="./infra/bicep/parameters-${ENVIRONMENT}.json"
RESOURCE_GROUP="${ENVIRONMENT}-${LOCATION_CODE}-rg-phoenixvc"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Cleanup
trap 'rm -f temp_*_check.json' EXIT

# Policy Functions
policy_precheck() {
  [ "$ENABLE_POLICY_CHECKS" = "true" ] || return 0
  
  echo "🔒 Running Pre-Deployment Policy Check..."
  az policy state trigger-scan --subscription "$(az account show --query id -o tsv)" --no-wait
  
  local non_compliant
  non_compliant=$(az policy state list --all --query "[?complianceState == 'NonCompliant' && resourceGroup == '$RESOURCE_GROUP']" -o tsv)
  
  [ -z "$non_compliant" ] || { 
    echo "❌ Pre-Deployment Policy Violations:" >&2
    echo "$non_compliant" | awk -F'\t' '{print "- " $1 " (" $2 ")"}'
    return 1
  }
}

# Monitoring Setup
setup_monitoring() {
  [ "$ENABLE_MONITORING" = "true" ] || return 0
  
  echo "📈 Configuring Monitoring..."
  az monitor activity-log alert create \
    --name "${RESOURCE_GROUP}-policy-violation" \
    --resource-group "$RESOURCE_GROUP" \
    --condition category='Policy' \
    --action email="security@phoenixvc.za" \
    --disabled $([ "$POLICY_ENFORCEMENT_MODE" = "enforce" ] && echo "false" || echo "true") \
    --description "DNS policy violation alerts"
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

# Main Deployment Flow
main() {
  handle_emergency "$@"
  
  echo "🚀 Starting ${ENVIRONMENT} deployment (Features: Policy=${ENABLE_POLICY_CHECKS}, Monitoring=${ENABLE_MONITORING})"
  
  # Pre-Flight Checks
  policy_precheck
  
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
    az consumption budget list --query "[?name=='${RESOURCE_GROUP}-budget']" -o table
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
