#!/bin/bash

# Script: azure-dns-record-fetcher.sh
# Description: Comprehensive Azure DNS record fetching script with detailed output.
#              Supports detailed and table output with logging, configurable column widths,
#              and an interactive mode for display preference.
# Author: Jurie Smit (improved by ChatGPT)
# Version: 1.2.5

########################################
# Default Variables
########################################
RESOURCE_GROUP="prod-euw-rg-phoenixvc-website"
DNS_ZONE="phoenixvc.tech"
DISPLAY_MODE=""            # Mode: table, detailed, or both (default: interactive)
OUTPUT_FILE=""             # Path to output file (if provided, output is written there)
MAX_WIDTH=64               # Maximum width for long values in table

# Verbosity level (0 = silent, 1 = verbose)
VERBOSE=0

# Column width parameters for the comprehensive table
COL_WIDTH_TYPE=10
COL_WIDTH_NAME=22
COL_WIDTH_VALUE=70
COL_WIDTH_TTL=8
COL_WIDTH_STATE=20

# Global variable to store temporary directory for JSON cache
TEMP_DIR=""

########################################
# Color definitions
########################################
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'  # No Color

########################################
# Field label variables for detailed view (in yellow)
########################################
FIELD_RSN="${YELLOW}Record Set Name:${NC}"
FIELD_FQDN="${YELLOW}FQDN:${NC}"
FIELD_TTL="${YELLOW}TTL:${NC}"
FIELD_IPS="${YELLOW}IP Addresses:${NC}"
FIELD_ALIAS="${YELLOW}Alias:${NC}"
FIELD_MAIL="${YELLOW}Mail Servers:${NC}"
FIELD_TEXT="${YELLOW}Text Values:${NC}"
FIELD_NS="${YELLOW}Nameservers:${NC}"
FIELD_HOST="${YELLOW}Host:${NC}"
FIELD_EMAIL="${YELLOW}Email:${NC}"
FIELD_SERIAL="${YELLOW}Serial Number:${NC}"
FIELD_REFRESH="${YELLOW}Refresh Time:${NC}"
FIELD_RETRY="${YELLOW}Retry Time:${NC}"
FIELD_EXPIRE="${YELLOW}Expire Time:${NC}"
FIELD_MINTTL="${YELLOW}Minimum TTL:${NC}"
FIELD_PS="${YELLOW}Provisioning State:${NC}"
FIELD_RID="${YELLOW}Resource ID:${NC}"

########################################
# Separator for detailed view
########################################
SEPARATOR="------------------------------------------------------------"

########################################
# Function: cleanup
# Description: Remove temporary directory on exit.
########################################
cleanup() {
    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        log "Cleaned up temporary directory: $TEMP_DIR"
    fi
}
trap cleanup EXIT

########################################
# Function: usage
# Description: Display usage/help message.
########################################
usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Fetch DNS records from Azure DNS zones with detailed information.

Options:
    -g, --resource-group    Azure resource group name (default: $RESOURCE_GROUP)
    -z, --dns-zone          DNS zone name (default: $DNS_ZONE)
    -m, --mode              Display mode: table, detailed, or both (default: interactive)
    -o, --output            Write output to file (default: stdout)
    -v, --verbose           Increase verbosity (logging)
    -h, --help              Display this help message

Example:
    $(basename "$0") -g my-resource-group -z example.com -m table -o output.txt -v
EOF
    exit 1
}

########################################
# Function: error
# Description: Display an error message and exit.
########################################
error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    cleanup
    exit 1
}

########################################
# Function: debug
# Description: Print debug messages if DEBUG is enabled.
########################################
debug() {
    if [ "${DEBUG:-0}" -eq 1 ]; then
        echo -e "${BLUE}[DEBUG]${NC} $1" >&2
    fi
}

########################################
# Function: log
# Description: Log messages if VERBOSE is enabled.
########################################
log() {
    if [ "$VERBOSE" -ge 1 ]; then
        echo -e "${BLUE}[LOG]${NC} $1"
    fi
}

########################################
# Function: check_prerequisites
# Description: Ensure Azure CLI and jq are installed and user is logged in.
########################################
check_prerequisites() {
    command -v az >/dev/null 2>&1 || error "Azure CLI is not installed. Please install it first."
    command -v jq >/dev/null 2>&1 || error "jq is not installed. Please install it first."
    az account show >/dev/null 2>&1 || error "Not logged into Azure. Please run 'az login' first."
}

########################################
# Function: validate_parameters
# Description: Validate that the resource group and DNS zone exist.
########################################
validate_parameters() {
    az group show -n "$RESOURCE_GROUP" >/dev/null 2>&1 || error "Resource group '$RESOURCE_GROUP' not found"
    az network dns zone show -g "$RESOURCE_GROUP" -n "$DNS_ZONE" >/dev/null 2>&1 || \
        error "DNS zone '$DNS_ZONE' not found in resource group '$RESOURCE_GROUP'"
}

########################################
# Function: check_az_version
# Description: Verify minimum Azure CLI version.
########################################
check_az_version() {
    local min_version="2.0.0"
    local current_version
    current_version=$(az version --query '"azure-cli"' -o tsv)
    if ! python3 -c "from packaging import version; exit(0 if version.parse('$current_version') >= version.parse('$min_version') else 1)"; then
        error "Azure CLI version $current_version is too old. Minimum required version is $min_version"
    fi
}

########################################
# Function: output
# Description: Output text either to stdout or to a file.
########################################
output() {
    if [ -n "$OUTPUT_FILE" ]; then
        echo -e "$1" >> "$OUTPUT_FILE" || error "Failed to write to output file"
    else
        echo -e "$1" || true
    fi
}

########################################
# Function: wrap_value
# Description: Truncate long values to MAX_WIDTH characters.
########################################
wrap_value() {
    local value="$1"
    local len
    if [ -z "$value" ]; then
        len=0
    else
        len=$(expr length "$value")
    fi
    if [ "$len" -gt "$MAX_WIDTH" ]; then
        echo "${value:0:$(( MAX_WIDTH - 3 ))}..."
    else
        echo "$value"
    fi
}

########################################
# Function: run_az_command
# Description: Run an Azure CLI command and handle errors.
########################################
run_az_command() {
    local result
    if ! result=$(az "$@" 2>&1); then
        error "Azure CLI command failed: $result"
    fi
    echo "$result"
}

########################################
# Function: show_progress
# Description: Display a progress message.
########################################
show_progress() {
    local message="$1"
    output "\n${BLUE}[INFO]${NC} $message..."
}

########################################
# Function: cache_records
# Description: Cache JSON responses for each record type to reduce API calls.
########################################
cache_records() {
    show_progress "Creating temporary directory"
    TEMP_DIR=$(mktemp -d)
    debug "Created temporary directory: $TEMP_DIR"
    A_JSON="${TEMP_DIR}/a_records.json"
    CNAME_JSON="${TEMP_DIR}/cname_records.json"
    MX_JSON="${TEMP_DIR}/mx_records.json"
    TXT_JSON="${TEMP_DIR}/txt_records.json"
    NS_JSON="${TEMP_DIR}/ns_records.json"
    SOA_JSON="${TEMP_DIR}/soa_record.json"

    log "Caching A records..."
    run_az_command network dns record-set a list -g "$RESOURCE_GROUP" -z "$DNS_ZONE" -o json > "$A_JSON"
    log "Caching CNAME records..."
    run_az_command network dns record-set cname list -g "$RESOURCE_GROUP" -z "$DNS_ZONE" -o json > "$CNAME_JSON"
    log "Caching MX records..."
    run_az_command network dns record-set mx list -g "$RESOURCE_GROUP" -z "$DNS_ZONE" -o json > "$MX_JSON"
    log "Caching TXT records..."
    run_az_command network dns record-set txt list -g "$RESOURCE_GROUP" -z "$DNS_ZONE" -o json > "$TXT_JSON"
    log "Caching NS records..."
    run_az_command network dns record-set ns list -g "$RESOURCE_GROUP" -z "$DNS_ZONE" -o json > "$NS_JSON"
    log "Caching SOA record..."
    run_az_command network dns record-set soa show -g "$RESOURCE_GROUP" -z "$DNS_ZONE" -o json > "$SOA_JSON"
}

########################################
# Functions for Detailed Record Output
# Each detailed record output includes colored field labels and ends with a separator and a blank line.
########################################

get_a_records() {
    local records
    records=$(jq -r --arg rsn "$FIELD_RSN" --arg fqdn "$FIELD_FQDN" --arg ttl "$FIELD_TTL" --arg ips "$FIELD_IPS" --arg ps "$FIELD_PS" --arg rid "$FIELD_RID" '
      .[] |
      $rsn + " " + .name + "\n" +
      $fqdn + " " + .fqdn + "\n" +
      $ttl + " " + (.TTL|tostring) + " seconds" + "\n" +
      $ips + "\n" + (if (.ARecords | length) > 0 then (.ARecords | map("  - " + .ipv4Address) | join("\n")) else "  No IP addresses" end) + "\n" +
      $ps + " " + .provisioningState + "\n" +
      $rid + " " + .id + "\n" + "$SEPARATOR" + "\n\n"
    ' "$A_JSON")
    output "$records"
}

get_cname_records() {
    local records
    records=$(jq -r --arg rsn "$FIELD_RSN" --arg fqdn "$FIELD_FQDN" --arg ttl "$FIELD_TTL" --arg alias "$FIELD_ALIAS" --arg ps "$FIELD_PS" --arg rid "$FIELD_RID" '
      .[] |
      $rsn + " " + .name + "\n" +
      $fqdn + " " + .fqdn + "\n" +
      $ttl + " " + (.TTL|tostring) + " seconds" + "\n" +
      $alias + " " + (if .CNAMERecord.cname then .CNAMERecord.cname else "No Target" end) + "\n" +
      $ps + " " + .provisioningState + "\n" +
      $rid + " " + .id + "\n" + "$SEPARATOR" + "\n\n"
    ' "$CNAME_JSON")
    output "$records"
}

get_mx_records() {
    local records
    records=$(jq -r --arg rsn "$FIELD_RSN" --arg fqdn "$FIELD_FQDN" --arg ttl "$FIELD_TTL" --arg mail "$FIELD_MAIL" --arg ps "$FIELD_PS" --arg rid "$FIELD_RID" '
      .[] |
      $rsn + " " + .name + "\n" +
      $fqdn + " " + .fqdn + "\n" +
      $ttl + " " + (.TTL|tostring) + " seconds" + "\n" +
      $mail + ": " + (if .MXRecords and (.MXRecords | length) > 0 then (.MXRecords | map("  - Priority: " + (.preference|tostring) + ", Exchange: " + .exchange) | join("\n")) else "  No MX records" end) + "\n" +
      $ps + " " + .provisioningState + "\n" +
      $rid + " " + .id + "\n" + "$SEPARATOR" + "\n\n"
    ' "$MX_JSON")
    output "$records"
}

get_txt_records() {
    local records
    records=$(jq -r --arg rsn "$FIELD_RSN" --arg fqdn "$FIELD_FQDN" --arg ttl "$FIELD_TTL" --arg text "$FIELD_TEXT" --arg ps "$FIELD_PS" --arg rid "$FIELD_RID" '
      .[] |
      $rsn + " " + .name + "\n" +
      $fqdn + " " + .fqdn + "\n" +
      $ttl + " " + (.TTL|tostring) + " seconds" + "\n" +
      $text + ": " + (if .TXTRecords and (.TXTRecords | length) > 0 then (.TXTRecords | map("  - " + (.value | join(" "))) | join("\n")) else "  No TXT records" end) + "\n" +
      $ps + " " + .provisioningState + "\n" +
      $rid + " " + .id + "\n" + "$SEPARATOR" + "\n\n"
    ' "$TXT_JSON")
    output "$records"
}

get_ns_records() {
    local records
    records=$(jq -r --arg rsn "$FIELD_RSN" --arg fqdn "$FIELD_FQDN" --arg ttl "$FIELD_TTL" --arg ns "$FIELD_NS" --arg ps "$FIELD_PS" --arg rid "$FIELD_RID" '
      .[] |
      $rsn + " " + .name + "\n" +
      $fqdn + " " + .fqdn + "\n" +
      $ttl + " " + (.TTL|tostring) + " seconds" + "\n" +
      $ns + ": " + (if .NSRecords and (.NSRecords | length) > 0 then (.NSRecords | map("  - " + .nsdname) | join("\n")) else "  No NS records" end) + "\n" +
      $ps + " " + .provisioningState + "\n" +
      $rid + " " + .id + "\n" + "$SEPARATOR" + "\n\n"
    ' "$NS_JSON")
    output "$records"
}

get_soa_record() {
    local records
    records=$(jq -r --arg rsn "$FIELD_RSN" --arg fqdn "$FIELD_FQDN" --arg ttl "$FIELD_TTL" --arg host "$FIELD_HOST" --arg email "$FIELD_EMAIL" --arg serial "$FIELD_SERIAL" --arg refresh "$FIELD_REFRESH" --arg retry "$FIELD_RETRY" --arg expire "$FIELD_EXPIRE" --arg minttl "$FIELD_MINTTL" --arg ps "$FIELD_PS" --arg rid "$FIELD_RID" '
      . |
      $rsn + " " + .name + "\n" +
      $fqdn + " " + .fqdn + "\n" +
      $ttl + " " + (.TTL|tostring) + " seconds" + "\n" +
      $host + " " + .SOARecord.host + "\n" +
      $email + " " + .SOARecord.email + "\n" +
      $serial + " " + (.SOARecord.serialNumber|tostring) + "\n" +
      $refresh + " " + (.SOARecord.refreshTime|tostring) + " seconds" + "\n" +
      $retry + " " + (.SOARecord.retryTime|tostring) + " seconds" + "\n" +
      $expire + " " + (.SOARecord.expireTime|tostring) + " seconds" + "\n" +
      $minttl + " " + (.SOARecord.minimumTTL|tostring) + " seconds" + "\n" +
      $ps + " " + .provisioningState + "\n" +
      $rid + " " + .id + "\n" + "$SEPARATOR" + "\n\n"
    ' "$SOA_JSON")
    output "$records"
}

########################################
# Function: show_comprehensive_overview
# Description: Display a summary table of DNS records with configurable column widths.
########################################
show_comprehensive_overview() {
    output "\n${BLUE}=== Comprehensive DNS Record Overview ===${NC}"

    # Print table header with configurable column widths
    header=$(printf "%-${COL_WIDTH_TYPE}s %-${COL_WIDTH_NAME}s %-${COL_WIDTH_VALUE}s %-${COL_WIDTH_TTL}s %-${COL_WIDTH_STATE}s" \
        "Type" "Name" "Value/Target" "TTL" "State")
    output "$header"
    separator=$(printf '=%.0s' {1..130})
    output "$separator"

    # Process A records: join multiple IP addresses
    jq -r '.[] | select(.ARecords != null) | ["A", .name, (.ARecords | map(.ipv4Address) | join(", ")), .TTL, .provisioningState] | @tsv' "$A_JSON" | \
    while IFS=$'\t' read -r type name value ttl state; do
        line=$(printf "%-${COL_WIDTH_TYPE}s %-${COL_WIDTH_NAME}s %-${COL_WIDTH_VALUE}s %-${COL_WIDTH_TTL}s %-${COL_WIDTH_STATE}s" \
            "$type" "$name" "$(wrap_value "$value")" "$ttl" "$state")
        output "$line"
    done

    # Process CNAME records (single value)
    jq -r '.[] | select(.CNAMERecord != null) | ["CNAME", .name, .CNAMERecord.cname, .TTL, .provisioningState] | @tsv' "$CNAME_JSON" | \
    while IFS=$'\t' read -r type name value ttl state; do
        line=$(printf "%-${COL_WIDTH_TYPE}s %-${COL_WIDTH_NAME}s %-${COL_WIDTH_VALUE}s %-${COL_WIDTH_TTL}s %-${COL_WIDTH_STATE}s" \
            "$type" "$name" "$(wrap_value "$value")" "$ttl" "$state")
        output "$line"
    done

    # Process MX records: join multiple MX values
    jq -r '.[] | select(.MXRecords != null) | ["MX", .name, (.MXRecords | map((.preference|tostring) + " " + .exchange) | join(", ")), .TTL, .provisioningState] | @tsv' "$MX_JSON" | \
    while IFS=$'\t' read -r type name value ttl state; do
        line=$(printf "%-${COL_WIDTH_TYPE}s %-${COL_WIDTH_NAME}s %-${COL_WIDTH_VALUE}s %-${COL_WIDTH_TTL}s %-${COL_WIDTH_STATE}s" \
            "$type" "$name" "$(wrap_value "$value")" "$ttl" "$state")
        output "$line"
    done

    # Process TXT records: join multiple TXT values
    jq -r '.[] | select(.TXTRecords != null) | ["TXT", .name, (.TXTRecords | map(.value | join(" ")) | join(", ")), .TTL, .provisioningState] | @tsv' "$TXT_JSON" | \
    while IFS=$'\t' read -r type name value ttl state; do
        line=$(printf "%-${COL_WIDTH_TYPE}s %-${COL_WIDTH_NAME}s %-${COL_WIDTH_VALUE}s %-${COL_WIDTH_TTL}s %-${COL_WIDTH_STATE}s" \
            "$type" "$name" "$(wrap_value "$value")" "$ttl" "$state")
        output "$line"
    done

    # Process NS records: join multiple nameservers
    jq -r '.[] | select(.NSRecords != null) | ["NS", .name, (.NSRecords | map(.nsdname) | join(", ")), .TTL, .provisioningState] | @tsv' "$NS_JSON" | \
    while IFS=$'\t' read -r type name value ttl state; do
        line=$(printf "%-${COL_WIDTH_TYPE}s %-${COL_WIDTH_NAME}s %-${COL_WIDTH_VALUE}s %-${COL_WIDTH_TTL}s %-${COL_WIDTH_STATE}s" \
            "$type" "$name" "$(wrap_value "$value")" "$ttl" "$state")
        output "$line"
    done

    # Process SOA record: include additional fields in the Value/Target column
    jq -r '. | select(.SOARecord != null) | ["SOA", .name, (.SOARecord.host + " " + .SOARecord.email + " S/N:" + (.SOARecord.serialNumber|tostring) + " Refresh:" + (.SOARecord.refreshTime|tostring) + " Retry:" + (.SOARecord.retryTime|tostring) + " Expire:" + (.SOARecord.expireTime|tostring) + " MintTL:" + (.SOARecord.minimumTTL|tostring)), .TTL, .provisioningState] | @tsv' "$SOA_JSON" | \
    while IFS=$'\t' read -r type name value ttl state; do
        line=$(printf "%-${COL_WIDTH_TYPE}s %-${COL_WIDTH_NAME}s %-${COL_WIDTH_VALUE}s %-${COL_WIDTH_TTL}s %-${COL_WIDTH_STATE}s" \
            "$type" "$name" "$(wrap_value "$value")" "$ttl" "$state")
        output "$line"
    done
}

########################################
# Function: get_display_preference
# Description: Prompt user for the display preference if not provided via CLI.
########################################
get_display_preference() {
    # Write the prompt and options directly to /dev/tty to ensure they're visible.
    {
        echo -e "${BLUE}How would you like to view the DNS records?${NC}"
        echo "1) Comprehensive overview (table format)"
        echo "2) Detailed view of each record type"
        echo "3) Both views"
    } > /dev/tty

    while true; do
        read -r -p "Enter your choice (1-3): " choice < /dev/tty
        case $choice in
            1|2|3)
                echo "$choice"
                return
                ;;
            *)
                echo -e "${RED}Invalid choice. Please enter 1, 2, or 3.${NC}" > /dev/tty
                ;;
        esac
    done
}

########################################
# Main: Parse Command Line Arguments
########################################
while [[ $# -gt 0 ]]; do
    case $1 in
        -g|--resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        -z|--dns-zone)
            DNS_ZONE="$2"
            shift 2
            ;;
        -m|--mode)
            DISPLAY_MODE="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_FILE="$2"
            # Overwrite output file if it exists
            > "$OUTPUT_FILE"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -d|--debug)
            DEBUG=1
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            error "Unknown parameter: $1"
            ;;
    esac
done

########################################
# Main Execution Block
########################################
check_prerequisites
check_az_version
validate_parameters
show_progress "Initializing"
cache_records

# Optionally, cache available records summary for later use
available_records=$(az network dns record-set list \
    -g "$RESOURCE_GROUP" \
    -z "$DNS_ZONE" \
    --query "[].{Type:type, Name:name, TTL:TTL, ProvisioningState:provisioningState}" \
    -o table 2>/dev/null)
output "\n${BLUE}=== Available Record Sets ===${NC}"
output "$available_records"

# Determine display preference (interactive if not provided via CLI)
if [ -z "$DISPLAY_MODE" ]; then
    display_preference=$(get_display_preference)
else
    case "$DISPLAY_MODE" in
        table|1) display_preference=1 ;;
        detailed|2) display_preference=2 ;;
        both|3) display_preference=3 ;;
        *) error "Invalid display mode. Use: table, detailed, or both" ;;
    esac
fi

case $display_preference in
    1)
        show_comprehensive_overview
        ;;
    2)
        output "\n${BLUE}=== Detailed Record View ===${NC}\n"
        get_a_records
        get_cname_records
        get_mx_records
        get_txt_records
        get_ns_records
        get_soa_record
        ;;
    3)
        output "\n${BLUE}=== Detailed Record View ===${NC}\n"
        get_a_records
        get_cname_records
        get_mx_records
        get_txt_records
        get_ns_records
        get_soa_record
        output "\n${BLUE}=== Comprehensive Table View ===${NC}\n"
        show_comprehensive_overview
        ;;
esac

output "\n${GREEN}DNS record fetching complete.${NC}"
