# Deployment Prerequisites
📄 `/docs/deployment/prerequisites.md`  
**Version:** 1.2.0  
**Last Updated:** 2025-02-14

## Required Software

### Core Requirements

| Component     | Version   | Purpose                      | Installation                                        |
|---------------|-----------|------------------------------|-----------------------------------------------------|
| **Azure CLI** | ≥2.58.0   | Azure management             | `curl -sL https://aka.ms/InstallAzureCLIDeb \| sudo bash` |
| **Bicep**     | ≥0.20.0   | Infrastructure as Code       | `az bicep install`                                  |
| **Python**    | ≥3.10     | Deployment scripts           | [python.org](https://www.python.org/downloads/)     |
| **Node.js**   | ≥18.x     | Build tools                  | [nodejs.org](https://nodejs.org/)                   |

### Additional Tools

| Tool   | Version   | Purpose             | Installation               |
|--------|-----------|---------------------|----------------------------|
| **jq** | Latest    | JSON processing     | `sudo apt install jq`      |
| **git**| ≥2.40.0   | Version control     | `sudo apt install git`     |
| **make**| Latest   | Build automation    | `sudo apt install make`    |

## System Requirements

- **CPU:** 2+ cores recommended  
- **RAM:** 4GB minimum  
- **Storage:** 10GB free space

## Network Requirements

- Outbound access to Azure endpoints  
- HTTPS (443) access to GitHub  
- VPN access (if required)

## Permission Requirements

### Azure Permissions

```json
{
  "actions": [
    "Microsoft.Resources/subscriptions/resourceGroups/write",
    "Microsoft.Resources/deployments/*",
    "Microsoft.Network/virtualNetworks/*",
    "Microsoft.Storage/storageAccounts/*"
  ]
}
```

### Repository Access

- Read access to the infrastructure repository  
- Write access for CI/CD configuration

## Validation Script

```bash
#!/bin/bash
# validate-prerequisites.sh

# Check for Azure CLI
if ! command -v az &> /dev/null; then
  echo "Error: Azure CLI not found"
  exit 1
fi

# Check Azure CLI version
az_version=$(az version --query '"azure-cli"' -o tsv)
if [[ $(echo -e "2.58.0\n$az_version" | sort -V | head -n1) != "2.58.0" ]]; then
  echo "Error: Azure CLI version must be ≥2.58.0"
  exit 1
fi

# Additional checks can be added here...
```

## Troubleshooting

### Common Issues

1. **Azure CLI Installation Fails**
   ```bash
   # Clear package cache
   sudo rm -rf /var/lib/apt/lists/*
   sudo apt update
   ```

2. **Bicep Version Mismatch**
   ```bash
   # Force update of Bicep
   az bicep upgrade
   az bicep version
   ```

3. **Permission Errors**
   ```bash
   # List current role assignments
   az role assignment list --assignee $(az account show --query user.name -o tsv)
   ```

## Next Steps

1. Install required software.  
2. Validate permissions.  
3. Run the validation script.  
4. Proceed to [configuration.md](./configuration.md) for environment setup details.

## Version History

| Version | Date       | Changes                        |
|---------|------------|--------------------------------|
| 1.2.0   | 2025-02-14 | Added validation script        |
| 1.1.0   | 2025-01-15 | Updated Azure CLI requirements |
| 1.0.0   | 2024-12-01 | Initial release                |
