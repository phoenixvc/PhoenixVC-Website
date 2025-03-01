#!/bin/bash
set -eo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo -e "${BLUE}=== Comprehensive Deployment Analysis ===${NC}\n"

# Deployment Script Analysis
echo -e "${GREEN}1. Deployment Changes Analysis${NC}"
git diff main..."$CURRENT_BRANCH" -- scripts/deployment/deploy.sh
git diff --name-status main..."$CURRENT_BRANCH" -- '**/deploy*.sh' '**/parameters*.json' '**/main.bicep' 'infra/**' 'scripts/**'
git ls-files -u | grep -E 'deploy|parameters|bicep|infra|scripts' || echo "No merge conflicts found"

# JSON Analysis
echo -e "\n${GREEN}2. JSON Configuration Analysis${NC}"
for f in parameters.*.json; do
    if [ -f "$f" ]; then
        echo -e "\n${BLUE}Analyzing $f:${NC}"
        echo "Content:"
        cat "$f"
        echo -e "\nValidating JSON:"
        jq '.' "$f" >/dev/null 2>&1 && echo "✓ Valid JSON" || echo "✗ Invalid JSON"
        echo -e "\nParsing deployment parameters:"
        jq -r '.parameters | to_entries | .[] | select(.key | test("deploy|vault|app|budget|sku|rbac")) | .key + ": " + (.value.value|tostring)' "$f" 2>/dev/null || echo "Failed to parse parameters"
    fi
done

# GitHub Actions Analysis
echo -e "\n${GREEN}3. GitHub Actions Analysis${NC}"
echo -e "${BLUE}Workflow Changes:${NC}"
git --no-pager diff main..."$CURRENT_BRANCH" -- .github/workflows/

echo -e "\n${BLUE}Current Workflows:${NC}"
find .github/workflows -type f -name "*.yml" -o -name "*.yaml" | while read -r file; do
    echo -e "\n=== $file ==="
    cat "$file"
    echo -e "\nValidating YAML:"
    python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>&1 || echo "YAML syntax error in $file"
done

# Environment and Configuration Analysis
echo -e "\n${GREEN}4. Environment and Configuration Analysis${NC}"
echo -e "${BLUE}Environment Variables:${NC}"
env | grep -i "deploy\|json\|parameters"

echo -e "\n${BLUE}Secrets Usage in Workflows:${NC}"
grep -r "\${{" .github/workflows/

echo -e "\n${BLUE}Parameter Handling:${NC}"
grep -r "parameters.*json" .github/workflows/ -B 2 -A 2

# Infrastructure Analysis
echo -e "\n${GREEN}5. Infrastructure Changes${NC}"
echo -e "${BLUE}Bicep/ARM Template Changes:${NC}"
git --no-pager diff main..."$CURRENT_BRANCH" -- '**/*.bicep' '**/*.json'

# Stash and Branch Analysis
echo -e "\n${GREEN}6. Git State Analysis${NC}"
echo -e "${BLUE}Stashed Changes:${NC}"
git stash list

echo -e "\n${BLUE}Recent Commits Affecting Deployment:${NC}"
git log --oneline -n 5 --grep="deploy\|infra\|azure" main..."$CURRENT_BRANCH"

# Azure CLI Configuration
echo -e "\n${GREEN}7. Azure CLI Configuration${NC}"
az account show 2>/dev/null || echo "Not logged into Azure CLI"
az config get defaults.location 2>/dev/null || echo "No default location set"

# Additional Checks
echo -e "\n${GREEN}8. Additional Security Checks${NC}"
echo -e "${BLUE}Checking for hardcoded secrets:${NC}"
git --no-pager diff main..."$CURRENT_BRANCH" | grep -i "key\|secret\|password\|token" || echo "No obvious secrets found"

echo -e "\n${BLUE}Checking for common deployment issues:${NC}"
grep -r "force-push\|--force\|az deployment\|az group deployment" .github/workflows/

# Summary
echo -e "\n${GREEN}=== Analysis Summary ===${NC}"
echo "Branch: $CURRENT_BRANCH"
echo "Modified deployment files: $(git diff --name-only main..."$CURRENT_BRANCH" | grep -E 'deploy|parameters|bicep|infra|scripts' | wc -l)"
echo "Modified workflow files: $(git diff --name-only main..."$CURRENT_BRANCH" -- .github/workflows/ | wc -l)"

echo -e "\n${BLUE}Analysis complete! Check above for any warnings or errors.${NC}"
