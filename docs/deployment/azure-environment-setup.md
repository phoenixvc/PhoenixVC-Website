# Azure Environment Setup
📄 `/docs/deployment/azure-environment-setup.md`

**Version:** 0.1.0  
**Last Updated:** 2025-02-14

## Overview
This document provides advanced instructions for setting up an Azure environment for PhoenixVC deployments. It includes guidelines for creating a new subscription, resource groups, and additional configuration such as networking and custom domain settings. If your environment requires only basic setup, consider merging these steps into the [Prerequisites](./prerequisites.md) or [Configuration](./configuration.md) documents.

## Prerequisites
- A valid Azure subscription
- [Azure CLI installed](./prerequisites.md#azure-cli)
- Appropriate permissions to create resource groups and configure networking

## Setup Steps

### 1. Create or Select an Azure Subscription
```bash
# List available subscriptions
az account list --output table

# Set the default subscription (replace <YourSubscriptionID> with your subscription ID)
az account set --subscription "<YourSubscriptionID>"
```

### 2. Create a Resource Group
```bash
# Create a resource group in the desired region (e.g., South Africa North)
az group create --name "phoenixvc-rg" --location "South Africa North"
```

### 3. (Optional) Configure Advanced Networking
- Set up NAT gateways, private endpoints, or custom DNS as required.
- **TODO:** Add detailed instructions for advanced networking configuration.

### 4. (Optional) Create a Service Principal for Deployment
```bash
# Create a service principal with the 'contributor' role (adjust as necessary)
az ad sp create-for-rbac --name "phoenixvc-deployer" --role contributor --scopes "/subscriptions/<YourSubscriptionID>" --sdk-auth
```
For more information, refer to [Service Principals](./service-principals.md).

### 5. Validate the Setup
```bash
# Verify that the resource group exists
az group show --name "phoenixvc-rg"

# (Optional) Verify that the service principal has been assigned the correct roles
az role assignment list --assignee "<SPN_App_ID>"
```

## Next Steps
- Review [Configuration](./configuration.md) to set environment variables based on your new setup.
- Use this document as a reference during automated deployments or DR drills.

## TODO
- [ ] Add detailed instructions for configuring NAT gateways and private endpoints.
- [ ] Document custom domain configuration and DNS settings if required.
- [ ] Include screenshots or links to further documentation on advanced Azure networking.

## Revision History
| Version | Date       | Author    | Changes                    |
|---------|------------|-----------|----------------------------|
| 0.1.0   | 2025-02-14 | HJ Smit   | Initial placeholder draft  |
