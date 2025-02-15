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
log "📍 Script directory: $SCRIPT_DIR"

# Load .env file or fallback to CI/CD environment variables
if [ -f "$SCRIPT_DIR/.env" ]; then
    log "🔍 Loading .env file..."
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
else
    warn "⚠️ .env file not found, using CI/CD environment variables."
fi

# Ensure Azure is authenticated
if ! az account show &>/dev/null; then
  error "You are not logged into Azure. Run 'az login' first."
fi

# Ensure AZURE_SUB_ID is set
if [ -z "$AZURE_SUB_ID" ]; then
    warn "⚠️ AZURE_SUB_ID not set, fetching dynamically..."
    AZURE_SUB_ID=$(az account show --query id -o tsv) || error "Failed to fetch Azure Subscription ID"
    export AZURE_SUB_ID
fi

# Ensure SWA_NAME is set
if [ -z "$SWA_NAME" ]; then
    warn "⚠️ SWA_NAME not set, attempting auto-detection..."
    SWA_NAME=$(az staticwebapp list --query "[0].name" -o tsv) || error "Failed to detect Static Web App"
    export SWA_NAME
fi

# Ensure RESOURCE_GROUP is set
if [ -z "$RESOURCE_GROUP" ]; then
    warn "⚠️ RESOURCE_GROUP not set, inferring from environment..."
    RESOURCE_GROUP="prod-${LOCATION_CODE}-rg-phoenixvc-website"
fi

# Validate required variables
if [[ -z "$SWA_NAME" || -z "$AZURE_SUB_ID" || -z "$RESOURCE_GROUP" ]]; then
  error "Missing required environment variables! Please check your configuration."
fi

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
