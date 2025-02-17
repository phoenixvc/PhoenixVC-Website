#!/bin/bash
set -eo pipefail

# ────────────────────────────────────────────────────────────
# ✅ VERSION AND CONFIG
# ────────────────────────────────────────────────────────────
VERSION="3.2.0"
# Updated configuration file path
CONFIG_FILE="./scripts/deployment/.dns-config.sh"

# ────────────────────────────────────────────────────────────
# ✅ HELPER FUNCTIONS
# ────────────────────────────────────────────────────────────

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
info() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️ $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" >&2; exit 1; }

# Show help
show_help() {
    cat << EOF
DNS Configuration Script v${VERSION}

Usage: $(basename "$0") [OPTIONS]

Options:
    --apex              Configure apex domain
    --www               Configure www subdomain
    --docs              Configure GitHub Pages DNS
    --all               Configure all domains
    --force            Force update existing records
    --backup           Only create DNS backup
    --restore FILE     Restore from backup file
    --verify           Only verify current configuration
    --help             Show this help message
    --version          Show version information

Examples:
    $(basename "$0") --all
    $(basename "$0") --docs --force
    $(basename "$0") --www --apex
    $(basename "$0") --backup
    $(basename "$0") --restore ./dns_backups/backup-20240215.json

Environment variables:
    AZURE_SUBSCRIPTION_ID    Azure Subscription ID
    SWA_NAME                 Static Web App name
    RESOURCE_GROUP           Resource Group name
EOF
}

# Show version
show_version() {
    echo "DNS Configuration Script v${VERSION}"
}

# Retry function with exponential backoff
retry() {
    local retries=3
    local count=0
    local delay=5
    local max_delay=30
    while [ "$count" -lt "$retries" ]; do
        if "$@"; then
            return 0
        fi
        count=$((count + 1))
        if [ "$count" -lt "$retries" ]; then
            delay=$((delay * 2))
            [ "$delay" -gt "$max_delay" ] && delay=$max_delay
            warn "Retrying in $delay seconds... ($count/$retries)"
            sleep $delay
        fi
    done
    return 1
}

# Validate DNS record
validate_dns() {
    local record_type=$1
    local name=$2
    local expected_value=$3

    info "Validating $record_type record for $name..."
    local current_value
    current_value=$(dig +short "${name}.${DOMAIN}" "${record_type}" | tr '\n' ' ' | xargs)

    if [[ "$current_value" == *"$expected_value"* ]]; then
        log "DNS record validated successfully"
        return 0
    else
        warn "DNS record validation failed. Expected: $expected_value, Got: $current_value"
        return 1
    fi
}

# Create backup
create_backup() {
    local backup_file=$1
    log "Creating DNS backup to $backup_file..."
    mkdir -p "$(dirname "$backup_file")"
    retry az network dns zone export \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DOMAIN" \
        --file-name "$backup_file" || error "Backup failed"
    log "Backup created successfully"
}

# Restore from backup
restore_backup() {
    local backup_file=$1
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
    fi

    log "Restoring DNS configuration from $backup_file..."
    retry az network dns zone import \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DOMAIN" \
        --file-name "$backup_file" || error "Restore failed"
    log "Restore completed successfully"
}

# ────────────────────────────────────────────────────────────
# ✅ MAIN SCRIPT
# ────────────────────────────────────────────────────────────

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help) show_help; exit 0 ;;
            --version) show_version; exit 0 ;;
            --apex) CONFIGURE_APEX=true ;;
            --www) CONFIGURE_WWW=true ;;
            --docs) CONFIGURE_DOCS=true ;;
            --all) CONFIGURE_APEX=true; CONFIGURE_WWW=true; CONFIGURE_DOCS=true ;;
            --force) FORCE=true ;;
            --backup) BACKUP_ONLY=true ;;
            --restore) RESTORE_FILE="$2"; shift ;;
            --verify) VERIFY_ONLY=true ;;
            --ENVIRONMENT) ENVIRONMENT="$2"; shift ;;
            *) error "Unknown parameter: $1" ;;
        esac
        shift
    done

    # Load configuration from the shell configuration file
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
    fi

    # Infer SWA_NAME if not already set
    if [[ -z "$SWA_NAME" ]]; then
        if [[ "$ENVIRONMENT" == "prod" ]]; then
            SWA_NAME="prod-${LOCATION_CODE}-swa-phoenixvc-website"
        else
            SWA_NAME="${ENVIRONMENT}-${LOCATION_CODE}-swa-phoenixvc-website"
        fi
        info "SWA_NAME was not provided. Inferred SWA_NAME as: ${SWA_NAME}"
    fi

    if [[ -z "$RESOURCE_GROUP" ]]; then
      if [[ "$ENVIRONMENT" == "prod" ]]; then
        RESOURCE_GROUP="prod-${LOCATION_CODE}-rg-phoenixvc-website"
      else
        RESOURCE_GROUP="${ENVIRONMENT}-${LOCATION_CODE}-rg-phoenixvc-website"
      fi
      info "RESOURCE_GROUP was not provided. Inferred RESOURCE_GROUP as: ${RESOURCE_GROUP}"
    fi

    # Validate environment variables
    [[ -z "$AZURE_SUBSCRIPTION_ID" ]] && error "AZURE_SUBSCRIPTION_ID is required"
    [[ -z "$SWA_NAME" ]] && error "SWA_NAME is required"
    [[ -z "$RESOURCE_GROUP" ]] && error "RESOURCE_GROUP is required"
    [[ -z "$DOMAIN" ]] && error "DOMAIN is required in the configuration file"

    # Handle backup/restore operations
    if [[ "$BACKUP_ONLY" == "true" ]]; then
        create_backup "./dns_backups/backup-$(date +%Y%m%d-%H%M%S).json"
        exit 0
    fi

    if [[ -n "$RESTORE_FILE" ]]; then
        restore_backup "$RESTORE_FILE"
        exit 0
    fi

    # Create backup before changes
    BACKUP_FILE="./dns_backups/${RESOURCE_GROUP}-$(date +'%Y%m%d-%H%M%S').json"
    create_backup "$BACKUP_FILE"

    # Configure DNS records (functions like configure_www, configure_apex, configure_docs should be defined below)
    if [[ "$CONFIGURE_WWW" == "true" ]]; then
        configure_www
    fi

    if [[ "$CONFIGURE_APEX" == "true" ]]; then
        configure_apex
    fi

    if [[ "$CONFIGURE_DOCS" == "true" ]]; then
        configure_docs
    fi

    # Verify configuration
    if [[ "$VERIFY_ONLY" == "true" ]] || [[ "$CONFIGURE_WWW$CONFIGURE_APEX$CONFIGURE_DOCS" != "false" ]]; then
        verify_configuration
    fi

    log "DNS configuration completed successfully!"
    info "Changes may take up to 24 hours to propagate fully"
    info "Backup saved to: $BACKUP_FILE"
}

# Execute main function
main "$@"
