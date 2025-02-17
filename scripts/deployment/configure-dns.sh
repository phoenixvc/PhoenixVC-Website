#!/bin/bash
set -eo pipefail

# ────────────────────────────────────────────────────────────
# ✅ VERSION AND CONFIG
# ────────────────────────────────────────────────────────────
VERSION="3.2.2"
# Updated configuration file path
CONFIG_FILE="./scripts/deployment/.dns-config.sh"

# Expected Azure nameservers (adjust if needed)
EXPECTED_AZURE_NS="ns1-01.azure-dns.com ns2-01.azure-dns.net ns3-01.azure-dns.org ns4-01.azure-dns.info"

# Global flag: if nameservers do not match Azure's, skip public DNS verification.
SKIP_PUBLIC_VERIFICATION=0

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
    DOMAIN                   DNS zone name (e.g., phoenixvc.tech)
    EXPECTED_APEX_IPS        (Optional) Space-delimited list of expected apex A record IPs
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

# Validate DNS record using dig (public verification)
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

# Create backup using az CLI
create_backup() {
    local backup_file=$1
    log "Creating DNS backup to $backup_file..."
    mkdir -p "$(dirname "$backup_file")"
    retry az network dns zone export --resource-group "$RESOURCE_GROUP" --name "$DOMAIN" --file-name "$backup_file" || error "Backup failed"
    log "Backup created successfully"
}

# Restore backup using az CLI
restore_backup() {
    local backup_file=$1
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
    fi
    log "Restoring DNS configuration from $backup_file..."
    retry az network dns zone import --resource-group "$RESOURCE_GROUP" --name "$DOMAIN" --file-name "$backup_file" || error "Restore failed"
    log "Restore completed successfully"
}

# Ensure DNS zone exists (create if missing)
ensure_dns_zone_exists() {
    info "Checking if DNS zone '$DOMAIN' exists in resource group '$RESOURCE_GROUP'..."
    if ! az network dns zone show --resource-group "$RESOURCE_GROUP" --name "$DOMAIN" >/dev/null 2>&1; then
        warn "DNS zone $DOMAIN not found in $RESOURCE_GROUP. Creating..."
        az network dns zone create --resource-group "$RESOURCE_GROUP" --name "$DOMAIN" || error "Failed to create DNS zone"
        log "DNS zone $DOMAIN created in $RESOURCE_GROUP"
    else
        log "DNS zone $DOMAIN already exists in $RESOURCE_GROUP"
    fi
}

# ────────────────────────────────────────────────────────────
# NEW: Verify records directly in Azure using az CLI
verify_azure_records() {
    info "Verifying DNS records in Azure DNS zone..."
    # Verify apex A record
    local apex_record
    apex_record=$(az network dns record-set a list --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --query "[?name=='@']" -o tsv)
    if [[ -n "$apex_record" ]]; then
        info "Apex record in Azure: $apex_record"
    else
        warn "No apex A record found in Azure DNS zone."
    fi

    # Verify www CNAME record
    local www_record
    www_record=$(az network dns record-set cname show --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "www" --query "cname" -o tsv)
    if [[ -n "$www_record" ]]; then
        info "www record in Azure: $www_record"
    else
        warn "No www CNAME record found in Azure DNS zone."
    fi

    # Verify docs A records
    local docs_record
    docs_record=$(az network dns record-set a list --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --query "[?name=='docs']" -o tsv)
    if [[ -n "$docs_record" ]]; then
        info "docs record in Azure: $docs_record"
    else
        warn "No docs A record found in Azure DNS zone."
    fi

    info "Azure DNS records verification completed."
}

# ────────────────────────────────────────────────────────────
# NEW: Detect External DNS Provider from NS records
detect_external_provider() {
    local ns_list
    ns_list=$(dig +short NS "$DOMAIN" | tr '\n' ' ' | xargs)
    local provider="Unknown"
    if echo "$ns_list" | grep -qi "godaddy"; then
        provider="GoDaddy"
    elif echo "$ns_list" | grep -qi "cloudflare"; then
        provider="Cloudflare"
    elif echo "$ns_list" | grep -qi "amazonaws" || echo "$ns_list" | grep -qi "route53"; then
        provider="Amazon (Route53)"
    elif echo "$ns_list" | grep -qi "azure-dns"; then
        provider="Azure DNS"
    fi
    echo "$provider"
}

# ────────────────────────────────────────────────────────────
# NEW: Check if nameservers are updated to Azure and warn if not
check_nameservers() {
    info "Checking current public nameservers for $DOMAIN..."
    local current_ns
    current_ns=$(dig +short NS "$DOMAIN" | tr '\n' ' ' | xargs)
    info "Current nameservers: $current_ns"
    local detected_provider
    detected_provider=$(detect_external_provider)
    local missing=0
    for ns in $EXPECTED_AZURE_NS; do
        if [[ "$current_ns" != *"$ns"* ]]; then
            missing=1
        fi
    done
    if [[ $missing -eq 1 ]]; then
        warn "***********************************************************************"
        warn "WARNING: The nameservers for $DOMAIN do not match the expected Azure nameservers."
        warn "Expected Azure nameservers: $EXPECTED_AZURE_NS"
        warn "Public nameservers currently in use: $current_ns"
        warn "Detected external DNS provider: $detected_provider"
        warn "Your domain is still being served by an external provider. Changes in Azure DNS"
        warn "will not be effective until you update the nameservers at your registrar (e.g., GoDaddy)."
        warn "***********************************************************************"
        SKIP_PUBLIC_VERIFICATION=1
    else
        log "Nameserver check passed. Domain $DOMAIN is using Azure DNS nameservers."
        SKIP_PUBLIC_VERIFICATION=0
    fi
}

# ────────────────────────────────────────────────────────────
# DNS RECORD CONFIGURATION FUNCTIONS
# ────────────────────────────────────────────────────────────

configure_apex() {
    info "Configuring apex domain..."
    if [ -n "$EXPECTED_APEX_IPS" ]; then
      for ip in $EXPECTED_APEX_IPS; do
        retry az network dns record-set a add-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "@" --ipv4-address "$ip" || error "Failed to configure apex A record for IP $ip"
      done
      log "Apex domain configured with A records: $EXPECTED_APEX_IPS"
    else
      warn "No EXPECTED_APEX_IPS provided and auto-fetch failed. Skipping apex configuration."
    fi
}

configure_www() {
    info "Configuring www subdomain..."
    retry az network dns record-set cname set-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "www" --cname "$SWA_NAME.azurestaticapps.net" --ttl 3600 || error "Failed to configure www subdomain"
    log "www subdomain configured."
}

configure_docs() {
    info "Configuring docs subdomain..."
    retry az network dns record-set a add-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "docs" --ipv4-address "185.199.108.153" || error "Failed to add docs A record (185.199.108.153)"
    retry az network dns record-set a add-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "docs" --ipv4-address "185.199.109.153" || error "Failed to add docs A record (185.199.109.153)"
    retry az network dns record-set a add-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "docs" --ipv4-address "185.199.110.153" || error "Failed to add docs A record (185.199.110.153)"
    retry az network dns record-set a add-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "docs" --ipv4-address "185.199.111.153" || error "Failed to add docs A record (185.199.111.153)"
    log "Docs subdomain configured."
}

verify_configuration() {
    info "Starting DNS verification..."
    if [[ "$SKIP_PUBLIC_VERIFICATION" -eq 1 ]]; then
        warn "Skipping public DNS record verification because domain is still served externally."
        info "Verifying Azure DNS records directly..."
        verify_azure_records
    else
        # Verify apex domain A record
        local apex_ips
        apex_ips=$(dig +short "$DOMAIN" A | tr '\n' ' ' | xargs)
        info "Public A records for $DOMAIN: $apex_ips"
        if [ -n "$EXPECTED_APEX_IPS" ]; then
            local found_count=0
            for ip in $EXPECTED_APEX_IPS; do
                if [[ "$apex_ips" == *"$ip"* ]]; then
                    found_count=$((found_count+1))
                fi
            done
            if [[ $found_count -eq 0 ]]; then
                error "Public apex A record verification failed. Expected one of: $EXPECTED_APEX_IPS, got: $apex_ips"
            fi
        else
            warn "No EXPECTED_APEX_IPS defined; skipping apex verification."
        fi

        # Verify www subdomain CNAME record
        local www_value
        www_value=$(dig +short "www.$DOMAIN" CNAME | tr '\n' ' ' | xargs)
        info "Public www CNAME record for www.$DOMAIN: $www_value"
        if [[ "$www_value" != *"$SWA_NAME.azurestaticapps.net"* ]]; then
            warn "Public www CNAME record is incorrect. Expected to contain $SWA_NAME.azurestaticapps.net. Attempting to update..."
            configure_www
            www_value=$(dig +short "www.$DOMAIN" CNAME | tr '\n' ' ' | xargs)
            info "Re-checked public www CNAME record: $www_value"
            if [[ "$www_value" != *"$SWA_NAME.azurestaticapps.net"* ]]; then
                error "Failed to auto-correct public www CNAME record. Expected to contain $SWA_NAME.azurestaticapps.net"
            fi
        fi

        # Verify docs subdomain A record(s)
        local docs_ips
        docs_ips=$(dig +short "docs.$DOMAIN" A | tr '\n' ' ' | xargs)
        info "Public docs A records for docs.$DOMAIN: $docs_ips"
        local expected_docs_ips=("185.199.108.153" "185.199.109.153" "185.199.110.153" "185.199.111.153")
        local docs_found=0
        for ip in "${expected_docs_ips[@]}"; do
            if [[ "$docs_ips" == *"$ip"* ]]; then
                docs_found=$((docs_found+1))
            fi
        done
        if [[ $docs_found -eq 0 ]]; then
            error "Public docs A record verification failed. Expected one of: ${expected_docs_ips[*]}, got: $docs_ips"
        fi
    fi
    info "DNS configuration verified successfully."
}

# ────────────────────────────────────────────────────────────
# NEW: Verify records directly in Azure DNS
verify_azure_records() {
    info "Verifying DNS records in Azure DNS zone..."
    # Verify apex A record
    local apex_record
    apex_record=$(az network dns record-set a list --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --query "[?name=='@']" -o tsv)
    if [[ -n "$apex_record" ]]; then
        info "Azure apex record: $apex_record"
    else
        warn "No apex A record found in Azure DNS zone."
    fi

    # Verify www CNAME record
    local www_record
    www_record=$(az network dns record-set cname show --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "www" --query "cname" -o tsv)
    if [[ -n "$www_record" ]]; then
        info "Azure www record: $www_record"
    else
        warn "No www CNAME record found in Azure DNS zone."
    fi

    # Verify docs A records
    local docs_record
    docs_record=$(az network dns record-set a list --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --query "[?name=='docs']" -o tsv)
    if [[ -n "$docs_record" ]]; then
        info "Azure docs record: $docs_record"
    else
        warn "No docs A record found in Azure DNS zone."
    fi
    info "Azure DNS records verification completed."
}

# ────────────────────────────────────────────────────────────
# ✅ MAIN SCRIPT
# ────────────────────────────────────────────────────────────

main() {
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

    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
    fi

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

    [[ -z "$AZURE_SUBSCRIPTION_ID" ]] && error "AZURE_SUBSCRIPTION_ID is required"
    [[ -z "$SWA_NAME" ]] && error "SWA_NAME is required"
    [[ -z "$RESOURCE_GROUP" ]] && error "RESOURCE_GROUP is required"
    [[ -z "$DOMAIN" ]] && error "DOMAIN is required in the configuration file"

    if [[ -z "$EXPECTED_APEX_IPS" ]]; then
        info "Fetching expected apex IPs from $SWA_NAME.azurestaticapps.net..."
        EXPECTED_APEX_IPS=$(dig +short "$SWA_NAME.azurestaticapps.net" A | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | tr '\n' ' ')
        if [[ -z "$EXPECTED_APEX_IPS" ]]; then
            warn "Unable to fetch expected apex IPs from $SWA_NAME.azurestaticapps.net. Apex verification will be skipped."
        else
            info "Expected apex IPs: $EXPECTED_APEX_IPS"
        fi
    fi

    check_nameservers

    if [[ "$BACKUP_ONLY" == "true" ]]; then
        create_backup "./dns_backups/backup-$(date +%Y%m%d-%H%M%S).json"
        exit 0
    fi

    if [[ -n "$RESTORE_FILE" ]]; then
        restore_backup "$RESTORE_FILE"
        exit 0
    fi

    ensure_dns_zone_exists

    BACKUP_FILE="./dns_backups/${RESOURCE_GROUP}-$(date +'%Y%m%d-%H%M%S').json"
    create_backup "$BACKUP_FILE"

    if [[ "$CONFIGURE_WWW" == "true" ]]; then
        configure_www
    fi

    if [[ "$CONFIGURE_APEX" == "true" ]]; then
        configure_apex
    fi

    if [[ "$CONFIGURE_DOCS" == "true" ]]; then
        configure_docs
    fi

    if [[ "$VERIFY_ONLY" == "true" ]] || [[ "$CONFIGURE_WWW$CONFIGURE_APEX$CONFIGURE_DOCS" != "false" ]]; then
        verify_configuration
    fi

    log "DNS configuration completed successfully!"
    info "Changes may take up to 24 hours to propagate fully"
    info "Backup saved to: $BACKUP_FILE"
}

main "$@"
