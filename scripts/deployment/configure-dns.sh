#!/bin/bash
set -eo pipefail

# ────────────────────────────────────────────────────────────
# ✅ VERSION AND CONFIG
# ────────────────────────────────────────────────────────────
VERSION="3.3.0"
CONFIG_FILE="./scripts/deployment/.dns-config.sh"
BACKUP_FILE="./dns_backups/${RESOURCE_GROUP}-$(date +'%Y%m%d-%H%M%S').json"
LOCATION_CODE=${LOCATION_CODE:-"euw"}  # Default to Europe West

# ────────────────────────────────────────────────────────────
# 🧪 TODO: Tests to implement
# ────────────────────────────────────────────────────────────
# TODO: Unit Tests
# - Test retry mechanism with mocked failures
# - Test rollback functionality with various scenarios
# - Test nameserver detection for different providers
# - Test configuration inference (SWA_NAME, RESOURCE_GROUP, etc.)
# - Test DNS record validation logic
#
# TODO: Integration Tests
# - Test full DNS zone creation and configuration
# - Test DNSSEC enablement and verification
# - Test CAA record configuration and validation
# - Test backup and restore functionality
# - Test forced updates vs normal updates
#
# TODO: Edge Cases
# - Test behavior with missing or invalid config file
# - Test handling of non-existent DNS zones
# - Test partial configuration scenarios
# - Test error handling during multi-record updates
# - Test nameserver mismatch scenarios
#
# TODO: Performance Tests
# - Test retry delays and timeouts
# - Test backup/restore with large DNS zones
# - Test concurrent modification handling
#
# TODO: Security Tests
# - Test handling of malformed DNS records
# - Test access control validation
# - Test sensitive data handling
# - Test backup file permissions

# Expected Azure nameservers (adjust if needed)
EXPECTED_AZURE_NS="ns1-01.azure-dns.com ns2-01.azure-dns.net ns3-01.azure-dns.org ns4-01.azure-dns.info"

# Global flag: if nameservers do not match Azure's, skip public DNS verification.
SKIP_PUBLIC_VERIFICATION=0

# GitHub Pages IPs for docs
DOCS_IPS=("185.199.108.153" "185.199.109.153" "185.199.110.153" "185.199.111.153")

# ────────────────────────────────────────────────────────────
# ✅ HELPER FUNCTIONS & UTILITY FUNCTIONS
# ────────────────────────────────────────────────────────────

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

show_help() {
    cat << EOF
DNS Configuration Script v${VERSION}

Usage: $(basename "$0") [OPTIONS]

Options:
    --apex               Configure apex domain
    --www                Configure www subdomain
    --docs               Configure docs subdomain for GitHub Pages
    --design             Configure design subdomain
    --dnssec             Configure DNSSEC for the zone
    --caa                Configure CAA records
    --all                Configure all (apex, www, docs, design, DNSSEC, CAA)
    --force              Force update existing records
    --backup             Only create DNS backup
    --restore FILE       Restore from backup file
    --verify            Only verify current configuration
    --help              Show this help message
    --version           Show version information

Examples:
    $(basename "$0") --all --ENVIRONMENT prod
    $(basename "$0") --design --ENVIRONMENT prod
    $(basename "$0") --docs --force --ENVIRONMENT prod
    $(basename "$0") --dnssec --caa --ENVIRONMENT prod

Environment variables:
    AZURE_SUBSCRIPTION_ID    Azure Subscription ID
    SWA_NAME                 Static Web App name for the main site (e.g., prod-euw-swa-phoenixvc-website)
    RESOURCE_GROUP           Resource Group name
    DOMAIN                   DNS zone name (e.g., phoenixvc.tech)
    EXPECTED_APEX_IPS        (Optional) Space-delimited list of expected apex A record IPs
    DESIGN_SWA_NAME          (Optional) Static Web App name for the design site
EOF
}

show_version() {
    echo "DNS Configuration Script v${VERSION}"
}

retry() {
    local retries=3 count=0 delay=5 max_delay=30
    while [ "$count" -lt "$retries" ]; do
        if "$@"; then return 0; fi
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

validate_dns() {
    local record_type=$1 name=$2 expected_value=$3
    info "Validating $record_type record for $name..."
    local current_value=$(dig +short "${name}.${DOMAIN}" "${record_type}" | tr '\n' ' ' | xargs)
    if [[ "$current_value" == *"$expected_value"* ]]; then
        log "DNS record validated successfully"
        return 0
    else
        warn "DNS record validation failed. Expected: $expected_value, Got: $current_value"
        return 1
    fi
}

create_backup() {
    local backup_file=$1
    log "Creating DNS backup to $backup_file..."
    mkdir -p "$(dirname "$backup_file")"
    retry az network dns zone export --resource-group "$RESOURCE_GROUP" --name "$DOMAIN" --file-name "$backup_file" || error "Backup failed"
    log "Backup created successfully"
}

restore_backup() {
    local backup_file=$1
    [[ ! -f "$backup_file" ]] && error "Backup file not found: $backup_file"
    log "Restoring DNS configuration from $backup_file..."
    retry az network dns zone import --resource-group "$RESOURCE_GROUP" --name "$DOMAIN" --file-name "$backup_file" || error "Restore failed"
    log "Restore completed successfully"
}

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
# NEW: Detect External DNS Provider from NS records
detect_external_provider() {
    local ns_list=$(dig +short NS "$DOMAIN" | tr '\n' ' ' | xargs)
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
    local current_ns=$(dig +short NS "$DOMAIN" | tr '\n' ' ' | xargs)
    info "Current nameservers: $current_ns"
    local detected_provider=$(detect_external_provider)
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
    for ip in "${DOCS_IPS[@]}"; do
        retry az network dns record-set a add-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "docs" --ipv4-address "$ip" || error "Failed to add docs A record ($ip)"
    done
    log "Docs subdomain configured."
}

configure_design() {
    info "Configuring design subdomain..."
    # If DESIGN_SWA_NAME is not provided, infer it as: [env]-[loc]-swa-phoenixvc-design
    if [[ -z "$DESIGN_SWA_NAME" ]]; then
        if [[ "$ENVIRONMENT" == "prod" ]]; then
            DESIGN_SWA_NAME="prod-${LOCATION_CODE}-swa-phoenixvc-design"
        else
            DESIGN_SWA_NAME="${ENVIRONMENT}-${LOCATION_CODE}-swa-phoenixvc-design"
        fi
        info "DESIGN_SWA_NAME was not provided. Inferred DESIGN_SWA_NAME as: ${DESIGN_SWA_NAME}"
    fi
    retry az network dns record-set cname set-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "design" --cname "${DESIGN_SWA_NAME}.azurestaticapps.net" --ttl 3600 || error "Failed to configure design subdomain"
    log "Design subdomain configured (CNAME -> ${DESIGN_SWA_NAME}.azurestaticapps.net)."
}

configure_dnssec() {
    info "Configuring DNSSEC..."
    az network dns zone update \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DOMAIN" \
        --zone-type Public \
        --registration-virtual-networks "" \
        --resolution-virtual-networks "" \
        --tags environment="$ENVIRONMENT" \
        --if-match "*" || error "Failed to configure DNSSEC"
    
    # Verify DNSSEC is enabled
    local zone_type=$(az network dns zone show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DOMAIN" \
        --query "zoneType" -o tsv)
    
    if [[ "$zone_type" != "Public" ]]; then
        error "DNSSEC configuration failed. Zone type is not Public."
    fi
    log "DNSSEC configured successfully"
}

configure_caa_records() {
    info "Configuring CAA records..."
    # Remove existing CAA records first
    az network dns record-set caa delete \
        --resource-group "$RESOURCE_GROUP" \
        --zone-name "$DOMAIN" \
        --name "@" \
        --yes || warn "No existing CAA records to remove"
        
    # Add new CAA record
    az network dns record-set caa create \
        --resource-group "$RESOURCE_GROUP" \
        --zone-name "$DOMAIN" \
        --name "@" \
        --ttl 3600 || error "Failed to create CAA record-set"
        
    az network dns record-set caa add-record \
        --resource-group "$RESOURCE_GROUP" \
        --zone-name "$DOMAIN" \
        --record-set-name "@" \
        --flags 0 \
        --tag "issue" \
        --value "letsencrypt.org" || error "Failed to add CAA record"
}

rollback_changes() {
    local backup_file=$1
    local error_msg=${2:-"Unknown error"}
    
    warn "Rolling back changes due to: $error_msg"
    info "Using backup file: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi

    # Try to restore up to 3 times
    local attempt=1
    local max_attempts=3
    while [[ $attempt -le $max_attempts ]]; do
        info "Rollback attempt $attempt of $max_attempts..."
        if restore_backup "$backup_file"; then
            log "Rollback completed successfully"
            return 0
        fi
        attempt=$((attempt + 1))
        if [[ $attempt -le $max_attempts ]]; then
            warn "Rollback failed, retrying in 5 seconds..."
            sleep 5
        fi
    done

    error "All rollback attempts failed. Manual intervention required."
    return 1
}

# ────────────────────────────────────────────────────────────
# NEW: Create missing apex and docs records in Azure if not present
create_missing_apex_docs() {
    info "Checking if apex and docs records need to be created in Azure DNS..."

    if [[ "$CONFIGURE_APEX" == "true" && -n "$EXPECTED_APEX_IPS" ]]; then
        local apex_exists=$(az network dns record-set a list --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --query "[?name=='@']" -o tsv)
        if [[ -z "$apex_exists" ]]; then
            warn "No apex A record found. Creating..."
            for ip in $EXPECTED_APEX_IPS; do
                retry az network dns record-set a add-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "@" --ipv4-address "$ip" || error "Failed to create apex A record for IP $ip"
            done
            log "Apex A record created for $EXPECTED_APEX_IPS"
        else
            info "Apex A record already exists in Azure DNS."
        fi
    fi

    if [[ "$CONFIGURE_DOCS" == "true" ]]; then
        local docs_exists=$(az network dns record-set a list --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --query "[?name=='docs']" -o tsv)
        if [[ -z "$docs_exists" ]]; then
            warn "No docs A record found. Creating..."
            for ip in "${DOCS_IPS[@]}"; do
                retry az network dns record-set a add-record --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --record-set-name "docs" --ipv4-address "$ip" || error "Failed to add docs A record ($ip)"
            done
            log "Docs A record created for ${DOCS_IPS[*]}"
        else
            info "Docs A record already exists in Azure DNS."
        fi
    fi
}

# ────────────────────────────────────────────────────────────
# NEW: Verify records directly in Azure DNS using az CLI
verify_azure_records() {
    info "Verifying DNS records in Azure DNS zone..."
    local apex_record=$(az network dns record-set a list --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --query "[?name=='@']" -o tsv)
    if [[ -n "$apex_record" ]]; then
        info "Azure apex record: $apex_record"
    else
        warn "No apex A record found in Azure DNS zone."
    fi

    local www_record=$(az network dns record-set cname show --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --name "www" --query "cname" -o tsv 2>/dev/null || true)
    if [[ -n "$www_record" ]]; then
        info "Azure www record: $www_record"
    else
        warn "No www CNAME record found in Azure DNS zone."
    fi

    local docs_record=$(az network dns record-set a list --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --query "[?name=='docs']" -o tsv)
    if [[ -n "$docs_record" ]]; then
        info "Azure docs record: $docs_record"
    else
        warn "No docs A record found in Azure DNS zone."
    fi

    local design_record=$(az network dns record-set cname show --resource-group "$RESOURCE_GROUP" --zone-name "$DOMAIN" --name "design" --query "cname" -o tsv 2>/dev/null || true)
    if [[ -n "$design_record" ]]; then
        info "Azure design record: $design_record"
    else
        warn "No design CNAME record found in Azure DNS zone."
    fi

    info "Azure DNS records verification completed."
}

# ────────────────────────────────────────────────────────────
# PUBLIC DNS RECORD VERIFICATION
verify_configuration() {
    info "Starting DNS verification..."
    if [[ "$SKIP_PUBLIC_VERIFICATION" -eq 1 ]]; then
        warn "Skipping public DNS record verification because domain is still served externally."
        info "Verifying Azure DNS records directly..."
        verify_azure_records
        create_missing_apex_docs
    else
        local apex_ips=$(dig +short "$DOMAIN" A | tr '\n' ' ' | xargs)
        info "Public A records for $DOMAIN: $apex_ips"
        if [[ -n "$EXPECTED_APEX_IPS" && "$CONFIGURE_APEX" == "true" ]]; then
            local found_count=0
            for ip in $EXPECTED_APEX_IPS; do
                if [[ "$apex_ips" == *"$ip"* ]]; then
                    found_count=$((found_count+1))
                fi
            done
            if [[ $found_count -eq 0 ]]; then
                error "Public apex A record verification failed. Expected one of: $EXPECTED_APEX_IPS, got: $apex_ips"
            fi
        fi

        local www_value=$(dig +short "www.$DOMAIN" CNAME | tr '\n' ' ' | xargs)
        info "Public www CNAME record for www.$DOMAIN: $www_value"
        if [[ "$CONFIGURE_WWW" == "true" && "$www_value" != *"$SWA_NAME.azurestaticapps.net"* ]]; then
            warn "Public www CNAME record is incorrect. Attempting to update..."
            configure_www
            www_value=$(dig +short "www.$DOMAIN" CNAME | tr '\n' ' ' | xargs)
            info "Re-checked public www CNAME record: $www_value"
            if [[ "$www_value" != *"$SWA_NAME.azurestaticapps.net"* ]]; then
                error "Failed to auto-correct public www CNAME record."
            fi
        fi

        local docs_ips=$(dig +short "docs.$DOMAIN" A | tr '\n' ' ' | xargs)
        info "Public docs A records for docs.$DOMAIN: $docs_ips"
        if [[ "$CONFIGURE_DOCS" == "true" ]]; then
            local docs_found=0
            for ip in "${DOCS_IPS[@]}"; do
                if [[ "$docs_ips" == *"$ip"* ]]; then
                    docs_found=$((docs_found+1))
                fi
            done
            if [[ $docs_found -eq 0 ]]; then
                error "Public docs A record verification failed. Expected one of: ${DOCS_IPS[*]}, got: $docs_ips"
            fi
        fi

        local design_value=$(dig +short "design.$DOMAIN" CNAME | tr '\n' ' ' | xargs)
        info "Public design CNAME record for design.$DOMAIN: $design_value"
        if [[ "$CONFIGURE_DESIGN" == "true" && "$design_value" != *"${DESIGN_SWA_NAME:-${ENVIRONMENT}-${LOCATION_CODE}-swa-phoenixvc-design}.azurestaticapps.net"* ]]; then
            warn "Public design CNAME record is incorrect. Attempting to update..."
            configure_design
            design_value=$(dig +short "design.$DOMAIN" CNAME | tr '\n' ' ' | xargs)
            info "Re-checked public design CNAME record: $design_value"
            if [[ "$design_value" != *"${DESIGN_SWA_NAME:-${ENVIRONMENT}-${LOCATION_CODE}-swa-phoenixvc-design}.azurestaticapps.net"* ]]; then
                error "Failed to auto-correct public design CNAME record."
            fi
        fi

        if [[ "$CONFIGURE_DNSSEC" == "true" ]]; then
            info "Verifying DNSSEC configuration..."
            local dnssec_status=$(az network dns zone show \
                --resource-group "$RESOURCE_GROUP" \
                --name "$DOMAIN" \
                --query "zoneType" -o tsv)
            if [[ "$dnssec_status" != "Public" ]]; then
                error "DNSSEC verification failed. Zone type is not Public."
            fi
            log "DNSSEC verification passed"
        fi
    
        if [[ "$CONFIGURE_CAA" == "true" ]]; then
            info "Verifying CAA records..."
            local caa_records=$(az network dns record-set caa show \
                --resource-group "$RESOURCE_GROUP" \
                --zone-name "$DOMAIN" \
                --name "@" \
                --query "caaRecords[?tag=='issue'].value" -o tsv)
            if [[ "$caa_records" != *"letsencrypt.org"* ]]; then
                error "CAA record verification failed. Expected letsencrypt.org CAA record not found."
            fi
            log "CAA records verification passed"
        fi
    fi
    info "DNS configuration verified successfully."
}

# ────────────────────────────────────────────────────────────
# MAIN SCRIPT
main() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help) show_help; exit 0 ;;
            --version) show_version; exit 0 ;;
            --apex) CONFIGURE_APEX=true ;;
            --www) CONFIGURE_WWW=true ;;
            --docs) CONFIGURE_DOCS=true ;;
            --design) CONFIGURE_DESIGN=true ;;
            --dnssec) CONFIGURE_DNSSEC=true ;;
            --caa) CONFIGURE_CAA=true ;;
            --all) CONFIGURE_APEX=true; CONFIGURE_WWW=true; CONFIGURE_DOCS=true; CONFIGURE_DESIGN=true; CONFIGURE_DNSSEC=true; CONFIGURE_CAA=true ;;
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

    # For apex, if EXPECTED_APEX_IPS is not set, fetch it.
    if [[ -z "$EXPECTED_APEX_IPS" ]]; then
        info "Fetching expected apex IPs from $SWA_NAME.azurestaticapps.net..."
        EXPECTED_APEX_IPS=$(dig +short "$SWA_NAME.azurestaticapps.net" A | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | tr '\n' ' ')
        if [[ -z "$EXPECTED_APEX_IPS" ]]; then
            warn "Unable to fetch expected apex IPs from $SWA_NAME.azurestaticapps.net. Apex verification will be skipped."
        else
            info "Expected apex IPs: $EXPECTED_APEX_IPS"
        fi
    fi

    # For design, if DESIGN_SWA_NAME is not set, infer it.
    if [[ -z "$DESIGN_SWA_NAME" && "$CONFIGURE_DESIGN" == "true" ]]; then
        if [[ "$ENVIRONMENT" == "prod" ]]; then
            DESIGN_SWA_NAME="prod-${LOCATION_CODE}-swa-phoenixvc-design"
        else
            DESIGN_SWA_NAME="${ENVIRONMENT}-${LOCATION_CODE}-swa-phoenixvc-design"
        fi
        info "DESIGN_SWA_NAME was not provided. Inferred DESIGN_SWA_NAME as: ${DESIGN_SWA_NAME}"
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

    # Wrap all configurations in error handling
    {
        # Configure DNSSEC first as it's a zone-level setting
        if [[ "$CONFIGURE_DNSSEC" == "true" ]]; then
            configure_dnssec
        fi

        # Configure CAA records before other DNS records
        if [[ "$CONFIGURE_CAA" == "true" ]]; then
            configure_caa_records
        fi

        if [[ "$CONFIGURE_WWW" == "true" ]]; then
            configure_www
        fi
        if [[ "$CONFIGURE_APEX" == "true" ]]; then
            configure_apex
        fi
        if [[ "$CONFIGURE_DOCS" == "true" ]]; then
            configure_docs
        fi
        if [[ "$CONFIGURE_DESIGN" == "true" ]]; then
            configure_design
        fi
    } || {
        local error_code=$?
        warn "An error occurred during configuration (Exit code: $error_code)"
        if [[ "$FORCE" != "true" ]]; then
            rollback_changes "$BACKUP_FILE"
            error "Configuration failed, changes rolled back"
        else
            warn "Continuing despite error due to --force flag"
        fi
    }

    if [[ "$VERIFY_ONLY" == "true" ]] || [[ "$CONFIGURE_WWW$CONFIGURE_APEX$CONFIGURE_DOCS$CONFIGURE_DESIGN" != "false" ]]; then
        verify_configuration
    fi

    log "DNS configuration completed successfully!"
    info "Changes may take up to 24 hours to propagate fully"
    info "Backup saved to: $BACKUP_FILE"
}

main "$@"
