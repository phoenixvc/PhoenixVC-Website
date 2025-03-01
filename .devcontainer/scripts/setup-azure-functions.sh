#!/bin/bash
set -e

# Ensure func command is available
export PATH="$PATH:$(npm bin -g)"

# Check if func command exists
if ! command -v func &> /dev/null; then
    echo "Azure Functions Core Tools (func) not found. Installing..."
    npm install -g azure-functions-core-tools@4 --unsafe-perm true
    export PATH="$PATH:$(npm bin -g)"
    az extension add --name logic --yes
fi

echo "Azure Functions and Logic apps setup completed."
