#!/bin/bash
set -eo pipefail  # Stop script on errors

# ────────────────────────────────────────────────────────────
# ✅ HELPER FUNCTIONS
# ────────────────────────────────────────────────────────────

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

warn() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" >&2
  exit 1
}

# Retry function for transient Azure errors
retry() {
  local retries=3
  local count=0
  local delay=5
  while [ "$count" -lt "$retries" ]; do
    "$@" && return 0
    count=$((count + 1))
    warn "Retrying in $delay seconds... ($count/$retries)"
    sleep $delay
  done
  error "Max retries reached for command: $*"
}

# ────────────────────────────────────────────────────────────
# ✅ ENVIRONMENT SETUP
# ────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || error "❌ Failed to switch to script directory: $SCRIPT_DIR"
log "📍 Script directory: $SCRIPT_DIR"

# Detect CI/CD mode
if [[ -n "$GITHUB_ACTIONS" || -n "$CI" || -n "$AZURE_PIPELINES" ]]; then
    CI_MODE=true
    log "🔄 Running in CI/CD mode."
else
    CI_MODE=false
    log "💻 Running in local interactive mode."
fi

# Load .env file for local execution
if [ -f "$SCRIPT_DIR/.env" ]; then
    log "🔍 Loading .env file..."
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
else
    warn "⚠️ .env file not found, using CI/CD environment variables."
fi

# Ensure Azure authentication
if [[ "$CI_MODE" == "true" ]]; then
    log "🔑 Using pre-configured CI/CD authentication."
else
    log "🔐 Checking Azure authentication..."
    if ! az account show &>/dev/null; then
        error "Azure authentication required. Run 'az login' manually."
    fi
fi

# Ensure required environment variables are set
REQUIRED_VARS=("AZURE_SUBSCRIPTION_ID" "SWA_NAME" "RESOURCE_GROUP")
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        error "❌ Required environment variable '$var' is missing."
    fi
done

log "🌍 Configuring DNS for Static Web App: $SWA_NAME in Resource Group: $RESOURCE_GROUP"

# ────────────────────────────────────────────────────────────
# ✅ BACKUP EXISTING DNS CONFIGURATION
# ────────────────────────────────────────────────────────────

BACKUP_FILE="./dns_backups/${RESOURCE_GROUP}-$(date +'%Y%m%d-%H%M%S').json"
mkdir -p ./dns_backups
log "📦 Creating backup of current DNS settings..."
retry az network dns zone export --resource-group "$RESOURCE_GROUP" --name "phoenixvc.tech" --file-name "$BACKUP_FILE"

# ────────────────────────────────────────────────────────────
# ✅ CONFIGURE DNS
# ────────────────────────────────────────────────────────────

log "🔧 Updating DNS records..."
retry az network dns record-set cname set-record \
  --resource-group "$RESOURCE_GROUP" \
  --zone-name "phoenixvc.tech" \
  --record-set-name "www" \
  --cname "$SWA_NAME.azurestaticapps.net"

log "✅ DNS successfully configured for www.phoenixvc.tech -> $SWA_NAME.azurestaticapps.net"

# ────────────────────────────────────────────────────────────
# ✅ VERIFY CHANGES
# ────────────────────────────────────────────────────────────

log "🔎 Verifying DNS records..."
if az network dns record-set cname show --resource-group "$RESOURCE_GROUP" --zone-name "phoenixvc.tech" --name "www" &>/dev/null; then
  log "✅ DNS record verified!"
else
  error "❌ DNS verification failed. Rolling back changes..."
  retry az network dns zone import --resource-group "$RESOURCE_GROUP" --file-name "$BACKUP_FILE"
  error "⚠️ Rollback completed. Please check your configuration."
fi

# ────────────────────────────────────────────────────────────
# ✅ FINAL SUMMARY
# ────────────────────────────────────────────────────────────

log "🎉 DNS configuration completed successfully!"
