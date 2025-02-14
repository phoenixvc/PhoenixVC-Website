#!/bin/bash
# SPDX-License-Identifier: MIT
# Version: 2.0.0-phoenixvc

set -eo pipefail
exec 3>&1 1> >(tee -a "/var/log/spn-manager/rotation-$(date +%Y%m%d).log") 2>&1

validate_dependencies() {
  declare -a deps=("az" "jq" "openssl")
  for dep in "${deps[@]}"; do
    if ! command -v "$dep" >/dev/null; then
      echo "Missing critical dependency: $dep" >&2
      exit 1
    fi
  done
}

rotate_credentials() {
  local app_id="$1"
  local new_pwd=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9!@#$%^&*()_+-=')
  local keyvault_name="phoenixvc-${ENVIRONMENT:-prod}-secrets"
  local expiry_date=$(date -d "+364 days" +%Y-%m-%dT%H:%M:%SZ)
  
  echo "Starting rotation for App ID: $app_id"
  az ad sp credential reset \
    --id "$app_id" \
    --password "$new_pwd" \
    --years 1
  
  az keyvault secret set \
    --vault-name "$keyvault_name" \
    --name "$app_id" \
    --value "$new_pwd" \
    --expires "$expiry_date"

  echo "[$(date +%FT%T%z)] Rotated SPN: $app_id" >> audit/spn-audit.log
  audit/spn-analyzer.sh --validate
}

main() {
  validate_dependencies
  if [ -z "$1" ]; then
    echo "Usage: $0 <app-id> [environment]"
    exit 1
  fi
  
  rotate_credentials "$1"
  echo "Rotation complete. New secret stored in Key Vault"
}

main "$@"