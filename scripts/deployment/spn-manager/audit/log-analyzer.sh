#!/bin/bash
# SPN Audit Analyzer v2.2
# Combines rotation analysis with credential validation

set -euo pipefail
CRED_DIR="/var/spn-credentials"
LOG_FILE="$(dirname "$0")/spn-audit.log"
EXIT_CODE=0

analyze_rotations() {
  echo "=== Rotation Frequency Analysis ==="
  [ -f "$LOG_FILE" ] || { echo "Error: Audit log missing"; return 1; }
  
  awk -F'[][]' '{print $2}' "$LOG_FILE" | \
    cut -d'T' -f1 | \
    uniq -c | \
    awk '{printf "Date: %s - Rotations: %d\n", $2, $1}'
}

detect_anomalies() {
  echo -e "\n=== Anomaly Detection ==="
  if grep -q -E 'Warning|Error|Failed' "$LOG_FILE"; then
    grep --color=always -E 'Warning|Error|Failed' "$LOG_FILE"
    EXIT_CODE=1
  else
    echo "No critical issues found in audit logs"
  fi
}

validate_credentials() {
  echo -e "\n=== Credential Validation ==="
  [ -d "$CRED_DIR" ] || { echo "Error: Credential directory missing"; return 1; }
  
  find "${CRED_DIR}" -name "*.json" -print0 | while IFS= read -r -d $'\0' file
  do
    if ! stored_hash=$(jq -r '.sha256' "$file" 2>/dev/null); then
      echo "ERROR: Invalid JSON format in $file"
      EXIT_CODE=1
      continue
    fi
    
    computed_hash=$(openssl dgst -sha256 "$file" | awk '{print $2}')
    
    if [ "$stored_hash" != "$computed_hash" ]; then
      echo "CRITICAL: Hash mismatch for ${file}"
      echo "  Stored: ${stored_hash:0:12}..."
      echo "  Actual: ${computed_hash:0:12}..."
      EXIT_CODE=1
    else
      echo "Validated: ${file##*/}"
    fi
  done
}

show_help() {
  cat <<EOF
Usage: ${0##*/} [OPTION]

Options:
  -f, --full     Full audit (rotation analysis + validation)
  --validate     Only validate credentials
  -h, --help     Show this help
EOF
}

main() {
  cd "$(dirname "$0")"
  
  case "${1:-}" in
    -f|--full)
      analyze_rotations
      detect_anomalies
      validate_credentials
      ;;
    --validate)
      validate_credentials
      ;;
    -h|--help)
      show_help
      ;;
    *)
      analyze_rotations
      detect_anomalies
      ;;
  esac
  
  exit $EXIT_CODE
}

main "$@"