#!/bin/bash
set -eo pipefail

# Configuration
readonly REQUIRED_CLI="2.58.0"
declare -A EXTENSIONS=(
  ["cost-management"]="1.1.0"
  ["containerapp"]="1.3.0" 
  ["account"]="0.1.5"
)

# Environment setup
export DEBIAN_FRONTEND=noninteractive
LOG_FILE="/var/log/azure-prereqs-$(date +%Y%m%d).log"

main() {
  init_logging
  header "Azure Environment Setup for PhoenixVC Modernization"
  
  check_root
  install_core_dependencies
  manage_azure_cli
  manage_extensions
  verify_environment
  final_checks
}

init_logging() {
  exec > >(tee -a "$LOG_FILE") 2>&1
  echo -e "\n=== Installation started $(date) ===" >> "$LOG_FILE"
}

header() {
  local msg="🚀 $1 🚀"
  local len=${#msg}
  local bar=$(printf '%*s' "$len" | tr ' ' '=')
  echo -e "\n$bar\n$msg\n$bar"
}

check_root() {
  if [[ $EUID -ne 0 ]]; then
    echo "❌ Script must be run as root. Use sudo." | tee -a "$LOG_FILE"
    exit 1
  fi
}

install_core_dependencies() {
  header "Installing Core Dependencies"
  apt-get update -qq
  apt-get install -qq -y \
    jq \
    openssl \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    gnupg >> "$LOG_FILE" 2>&1
}

manage_azure_cli() {
  header "Azure CLI Management"
  local current_version=$(az version --query '"azure-cli"' -o tsv 2>/dev/null || echo "0.0.0")
  
  if version_lt "$current_version" "$REQUIRED_CLI"; then
    echo "🔵 Current CLI: $current_version | Required: $REQUIRED_CLI"
    install_azure_cli
  else
    echo "✅ Azure CLI $current_version meets requirements"
  fi
}

install_azure_cli() {
  echo "🔄 Installing Azure CLI..."
  local install_script="/tmp/azure-cli-install-$(date +%s).sh"
  
  curl -sL https://aka.ms/InstallAzureCLIDeb -o "$install_script"
  verify_script_integrity "$install_script"
  
  bash "$install_script" >> "$LOG_FILE" 2>&1
  rm -f "$install_script"
  
  echo "✅ Azure CLI installed: $(az version --query '"azure-cli"' -o tsv)"
}

verify_script_integrity() {
  local script=$1
  local expected_checksum="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"  # Replace with actual SHA256
  
  if ! sha256sum "$script" | grep -q "$expected_checksum"; then
    echo "❌ Invalid script checksum. Aborting." | tee -a "$LOG_FILE"
    exit 1
  fi
}

manage_extensions() {
  header "Extension Management"
  for ext in "${!EXTENSIONS[@]}"; do
    local required_version="${EXTENSIONS[$ext]}"
    local current_version=$(az extension show --name "$ext" --query version -o tsv 2>/dev/null || echo "not installed")
    
    if version_lt "$current_version" "$required_version"; then
      echo "🔄 $ext: Required $required_version | Found $current_version"
      az extension add --name "$ext" --upgrade --yes >> "$LOG_FILE" 2>&1
      echo "✅ $ext updated to $(az extension show --name "$ext" --query version -o tsv)"
    else
      echo "✅ $ext $current_version meets requirements"
    fi
  done
}

verify_environment() {
  header "Environment Verification"
  echo "📋 Core Components:"
  az version --output json | jq '{"azure-cli": ."azure-cli", "core": ."azure-cli-core"}'
  
  echo -e "\n🔌 Installed Extensions:"
  az extension list --output json | jq '.[] | {name: .name, version: .version}'
}

final_checks() {
  header "Final Validation"
  local current_cli=$(az version --query '"azure-cli"' -o tsv)
  
  if version_lt "$current_cli" "$REQUIRED_CLI"; then
    echo "❌ Critical: Azure CLI $current_cli < required $REQUIRED_CLI"
    exit 1
  fi
  
  echo -e "✅ All checks passed!\n"
  echo -e "🎉 Setup complete! Next steps:\n"
  echo "ENVIRONMENT=prod LOCATION_CODE=za ./deploy.sh"
  echo -e "\n📄 Full log available at: $LOG_FILE"
}

version_lt() { 
  [ "$1" = "$2" ] && return 1 || [  "$1" = "$(echo -e "$1\n$2" | sort -V | head -n1)" ] 
}

main "$@"