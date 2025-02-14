📄 /docs/infrastructure/README.md

# Phoenix VC Infrastructure Documentation

## Overview

This repository contains comprehensive documentation for Phoenix VC's cloud infrastructure, implemented using Infrastructure as Code (IaC) with Azure Bicep and following Azure Well-Architected Framework principles. It covers architecture, deployment templates, security configurations, monitoring setup, and disaster recovery procedures.

## Table of Contents
- [Documentation Structure](#documentation-structure)
- [Quick Start](#quick-start)
- [Environment Management](#environment-management)
- [Resource Organization](#resource-organization)
- [Contributing](#contributing)
- [Support and Maintenance](#support-and-maintenance)
- [Cost Management](#cost-management)
- [Version History](#version-history)

## Documentation Structure

```mermaid
graph TD
  README[README.md] --> ARCH[ARCHITECTURE.md]
  README --> BICEP[BICEP_TEMPLATES.md]
  README --> SEC[SECURITY.md]
  README --> MON[MONITORING.md]
  README --> DR[DISASTER_RECOVERY.md]

  BICEP --> SEC
  BICEP --> MON
  BICEP --> DR
  
  SEC --> MON
  MON --> DR
```

### Core Documents
| Document | Purpose | Primary Audience | Content |
|----------|---------|-----------------|---------|
| 📐 [ARCHITECTURE.md](ARCHITECTURE.md) | System design and components | Architects, Engineers | System architecture, Component relationships, Network design |
| 🏗️ [BICEP_TEMPLATES.md](BICEP_TEMPLATES.md) | IaC deployment templates | DevOps Team | Infrastructure code, Deployment procedures, Configurations |
| 🔒 [SECURITY.md](SECURITY.md) | Security configurations | Security Team | Access control, Network security, Key management |
| 📊 [MONITORING.md](MONITORING.md) | Monitoring setup | Operations Team | Logging, Alerts, Performance metrics |
| 🔄 [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) | DR procedures | Platform Team | Backup, Recovery, Business continuity |

## Quick Start

### Prerequisites
- Azure CLI (latest version)
- Azure subscription with Owner rights
- Git
- Visual Studio Code with Azure extensions

```bash
# Install required tools
az extension add --name azure-devops
az bicep install
az monitor extension add

# Clone the repository
git clone https://github.com/phoenixvc/infrastructure.git
```

### Environment Setup
```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "Phoenix VC Production"

# Create resource group
az group create \
  --name "rg-phoenixvc-prod" \
  --location "eastus2"

# Deploy development environment
./scripts/deploy.ps1 -Environment dev -Location westeurope

# Validate deployment
./scripts/validate.ps1 -Environment dev
```

## Environment Management

| Environment | Purpose | Branch | Deployment Frequency | Access Level |
|-------------|---------|--------|---------------------|--------------|
| Development | Feature testing | dev | On commit | Team |
| UAT | Integration testing | release | On release | Limited |
| Production | Live system | main | Scheduled | Restricted |

### Resource Naming Convention

Pattern: `{env}-{loc}-{resourceType}-phoenixvc[-identifier]`

| Component | Description | Examples |
|-----------|-------------|----------|
| env | Environment identifier | dev, uat, prod |
| loc | Location code | euw (West Europe) |
| resourceType | Azure resource type | swa, func, psql |
| identifier | Optional component identifier | -api, -worker |

### Code Standards
```bicep
// Example of standard Bicep naming convention
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-06-01' = {
  name: '${environment}stphoenixvc${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}
```

## Contributing

### Documentation Standards
- Use markdown for all documentation
- Include diagrams using Mermaid
- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Keep code examples up to date
- Test all procedures before documenting

### Review Process
```mermaid
graph LR
  A[Create Branch] --> B[Make Changes]
  B --> C[Run Tests]
  C --> D[Create PR]
  D --> E[Review]
  E --> F[Merge]
```

## Support and Maintenance

### Contact Information
| Team | Contact | Channel | Response Time |
|------|---------|---------|---------------|
| Platform | platform@phoenixvc.com | #platform-support | 30 min |
| DevOps | devops@phoenixvc.com | #devops-support | 1 hour |
| Security | security@phoenixvc.com | #security-alerts | 15 min |

### Escalation Path
1. Team Lead
2. Department Manager
3. CTO
4. CEO

### Emergency Procedures
- Production issues: Call +1-555-0123
- Security incidents: Call +1-555-0124
- DR activation: Call +1-555-0125

### Useful Links
- [Azure Portal](https://portal.azure.com)
- [Azure DevOps](https://dev.azure.com/phoenixvc)
- [Monitoring Dashboard](https://portal.azure.com/#@phoenixvc.com/dashboard)
- [Azure Status](https://status.azure.com)
- [Azure Updates](https://azure.microsoft.com/updates/)
- [Service Level Agreements](https://azure.microsoft.com/support/legal/sla/)

## Cost Management

### Monitoring and Controls
- [Cost Management Portal](https://portal.azure.com/#blade/Microsoft_Azure_CostManagement)
- [Budget Alerts Configuration](./MONITORING.md#budget-alerts)
- [Resource Optimization Guidelines](./ARCHITECTURE.md#optimization)

### Cost Optimization Best Practices
- Use auto-scaling for dynamic workloads
- Implement resource scheduling for non-production environments
- Regular review of unused resources
- Monitor reserved instance coverage

## Version History

| Version | Date | Description | Author |
|---------|------|-------------|---------|
| 1.0.0 | 2025-02-14 | Initial documentation | Platform Team |
| 1.0.1 | 2025-02-14 | Added cost management section | DevOps Team |

## Documentation Resources
- [Azure Architecture Center](https://learn.microsoft.com/azure/architecture/)
- [Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure Best Practices](https://learn.microsoft.com/azure/architecture/best-practices/)