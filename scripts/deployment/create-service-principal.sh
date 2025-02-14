#!/bin/bash
# SPDX-License-Identifier: MIT
# Version: 2.1.0-phoenixvc
# Docs: https://phoenixvc.tech/scripts/create-service-principal

set -eo pipefail
exec 3>&1 1> >(tee -a "/var/log/spn-manager/creation-$(date +%Y%m%d).log") 2>&1

readonly ALLOWED_REGIONS=("southafricanorth" "westeurope")
readonly DEFAULT_ROLE="Static Web Apps Contributor"
readonly CREDENTIAL_EXPIRY_DAYS=364
readonly KEYVAULT_NAME="phoenixvc-${ENVIRONMENT:-prod}-secrets"

validate_environment() {
  declare -a deps=("az" "jq" "openssl" "gh")
  for dep in "${deps[@]}"; do
    if ! command -v "$dep" >/dev/null; then
      echo "Missing dependency: $dep" >&2
      exit 1
    fi
  done
  
  local current_region=$(az account show --query "location" -o tsv)
  if ! printf '%s\n' "${ALLOWED_REGIONS[@]}" | grep -qx "$current_region"; then
    echo "Region $current_region not allowed. Permitted: ${ALLOWED_REGIONS[*]}" >&2
    exit 1
  fi
}

rotate_existing_spn() {
  local spn_name="$1"
  echo "Checking for existing SPN: $spn_name"
  
  local existing_app_id=$(az ad app list \
    --display-name "$spn_name" \
    --query "[?contains(servicePrincipalType, 'Application')].appId" \
    -o tsv)
    
  if [[ -n "$existing_app_id" ]]; then
    echo "Found existing SPN (App ID: $existing_app_id)"
    read -p "Rotate SPN? Existing credentials will be invalidated. (y/N) " confirm
    
    if [[ "$confirm" != "y" ]]; then
      echo "Aborting rotation" >&2
      exit 0
    fi
    
    echo "[$(date +%FT%T%z)] Rotating SPN: $existing_app_id" >> audit/spn-audit.log
    az ad sp credential delete --id "$existing_app_id" || true
    az ad app delete --id "$existing_app_id" || true
    sleep 30  # Azure AD propagation delay
  fi
}

create_spn() {
  local spn_name="$1"
  local role="$2"
  local scope="$3"
  
  local output_file="${spn_name}-credentials-$(date +%Y%m%d).json"
  local output=$(az ad sp create-for-rbac \
    --name "$spn_name" \
    --role "$role" \
    --scopes "$scope" \
    --years "$((CREDENTIAL_EXPIRY_DAYS/365))" \
    --output json)

  jq -r '"Client ID: \(.clientId)\nTenant ID: \(.tenantId)\nClient Secret: \(.clientSecret)"' <<< "$output"
  echo "$output" > "$output_file"
  chmod 600 "$output_file"
  
  local expiration_date=$(date -d "+${CREDENTIAL_EXPIRY_DAYS} days" +%Y-%m-%d)
  echo "Credentials expire on: $expiration_date" | tee -a spn-metadata.txt
  
  # Store in Key Vault
  az keyvault secret set \
    --vault-name "$KEYVAULT_NAME" \
    --name "$spn_name" \
    --file "$output_file" \
    --expires "$expiration_date"
}

configure_github_secrets() {
  local spn_name="$1"
  local repo="${2:-PhoenixVC-Modernized}"
  
  jq -r '@sh "ARM_CLIENT_ID=\(.clientId) ARM_TENANT_ID=\(.tenantId) ARM_CLIENT_SECRET=\(.clientSecret)"' \
    "${spn_name}-credentials.json" | xargs gh secret set -R "$repo"
}

generate_verification_hash() {
  local spn_name="$1"
  local hash_file="${spn_name}.sha256"
  
  openssl dgst -sha256 "${spn_name}-credentials.json" | awk '{print $2}' > "$hash_file"
  echo "Verification hash: $(cat $hash_file)"
  
  az keyvault secret set \
    --vault-name "$KEYVAULT_NAME" \
    --name "${spn_name}-hash" \
    --value "$(cat $hash_file)"
}

main() {
  if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Usage: $0 [--rotate] <SPN_NAME> [ROLE] [SCOPE] [REPO]"
    echo "Example: $0 --rotate github-actions-phoenixvc \"Static Web Apps Contributor\" \"/subscriptions/...\" PhoenixVC-Modernized"
    exit 0
  fi

  local rotate=false
  if [[ "$1" == "--rotate" ]]; then
    rotate=true
    shift
  fi
  
  validate_environment
  
  local spn_name="${1:-github-actions-phoenixvc}"
  local role="${2:-$DEFAULT_ROLE}"
  local scope="${3:-/subscriptions/22f9eb18-6553-4b7d-9451-47d0195085fe}"
  local repo="${4:-PhoenixVC-Modernized}"
  
  $rotate && rotate_existing_spn "$spn_name"
  
  create_spn "$spn_name" "$role" "$scope"
  generate_verification_hash "$spn_name"
  configure_github_secrets "$spn_name" "$repo"
}

main "$@"