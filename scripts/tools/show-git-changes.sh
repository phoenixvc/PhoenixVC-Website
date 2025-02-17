#!/bin/bash

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Default comparison branch is main
COMPARE_BRANCH=${1:-main}

# Create a timestamped output file
OUTPUT_FILE="git_changes_$(date +%Y%m%d_%H%M%S).txt"

# Function to execute a command, output to terminal and file
run_and_log() {
  echo -e "$1" | tee -a "$OUTPUT_FILE"
  eval "$2" | tee -a "$OUTPUT_FILE"
  echo -e "\n" | tee -a "$OUTPUT_FILE"
}

# Clear the output file if it exists
> "$OUTPUT_FILE"

run_and_log "${BLUE}=== Summary of Changes ===${NC}\n" "git diff --staged '$COMPARE_BRANCH' --stat"
run_and_log "${BLUE}=== File Tree Structure ===${NC}\n" "git diff --name-only --staged '$COMPARE_BRANCH' | python3 scripts/git_tree.py"
run_and_log "${BLUE}=== Detailed Changes ===${NC}\n" "git diff --staged '$COMPARE_BRANCH' --color"
run_and_log "${GREEN}=== Status ===${NC}" "git status -s"

echo -e "${GREEN}All output has been saved to: ${OUTPUT_FILE}${NC}"
echo "Link to output file: file://$(pwd)/${OUTPUT_FILE}"