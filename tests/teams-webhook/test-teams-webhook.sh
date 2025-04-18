#!/bin/bash

# Default values
PAYLOAD_FILE="./teams-payload.json"
WEBHOOK_URL=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --payload|-p)
      PAYLOAD_FILE="$2"
      shift 2
      ;;
    --url|-u)
      WEBHOOK_URL="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [--payload|-p PAYLOAD_FILE] [--url|-u WEBHOOK_URL]"
      exit 0
      ;;
    *)
      echo "Unknown parameter: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Display script banner
echo "===================================="
echo "   Teams Webhook Testing Script     "
echo "===================================="
echo ""

# Check if payload file exists
if [ ! -f "$PAYLOAD_FILE" ]; then
  echo "Error: Payload file not found: $PAYLOAD_FILE"
  exit 1
fi

echo "Payload loaded successfully from: $PAYLOAD_FILE"

# Extract webhook URL from payload if not provided
if [ -z "$WEBHOOK_URL" ]; then
  # Check if jq is installed
  if command -v jq &> /dev/null; then
    WEBHOOK_URL=$(jq -r '.teamsWebhookUrl' "$PAYLOAD_FILE")
  else
    # Fallback to grep/sed if jq is not available
    WEBHOOK_URL=$(grep -o '"teamsWebhookUrl": *"[^"]*"' "$PAYLOAD_FILE" | sed 's/"teamsWebhookUrl": *"\(.*\)"/\1/')
  fi

  if [ -z "$WEBHOOK_URL" ] || [ "$WEBHOOK_URL" == "null" ]; then
    echo "Error: No webhook URL found in payload and none provided as parameter"
    exit 1
  fi

  echo "Using webhook URL from payload file"
fi

# Display webhook URL (partially masked for security)
if [ ${#WEBHOOK_URL} -gt 60 ]; then
  MASKED_URL="${WEBHOOK_URL:0:30}...${WEBHOOK_URL: -30}"
else
  MASKED_URL="$WEBHOOK_URL"
fi
echo "Sending request to webhook: $MASKED_URL"

# Send the request
echo "Sending webhook request..."

# Option 1: Simple test message
SIMPLE_TEST=false
if [ "$SIMPLE_TEST" = true ]; then
  SIMPLE_PAYLOAD='{"text":"Simple test message from bash script"}'
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d "$SIMPLE_PAYLOAD" "$WEBHOOK_URL")

  if [ "$RESPONSE" -eq 200 ]; then
    echo "Simple test message sent successfully!"
  else
    echo "Error: Received HTTP status code $RESPONSE"
    exit 1
  fi
# Option 2: Full payload from file
else
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d @"$PAYLOAD_FILE" "$WEBHOOK_URL")

  if [ "$RESPONSE" -eq 200 ]; then
    echo "Full payload sent successfully!"
  else
    echo "Error: Received HTTP status code $RESPONSE"
    # Try to get more detailed error information
    ERROR_DETAILS=$(curl -s -H "Content-Type: application/json" -d @"$PAYLOAD_FILE" "$WEBHOOK_URL")
    echo "Error details: $ERROR_DETAILS"
    exit 1
  fi
fi

echo ""
echo "===================================="
echo "   Test Completed Successfully      "
echo "===================================="
