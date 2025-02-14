📄 /docs/INFRASTRUCTURE.md

# Infrastructure Documentation

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Azure Resources](#azure-resources)
- [Infrastructure as Code](#infrastructure-as-code)
- [Environment Management](#environment-management)
- [Security and Compliance](#security-and-compliance)

## Architecture Overview

### System Architecture
```mermaid
graph TD
    A[Client] --> B[Azure Static Web App]
    B --> C[Azure Functions API]
    C --> D[Azure SQL Database]
    C --> E[Azure Storage]
    B --> F[Azure CDN]
```

### Key Components
- **Frontend**: React SPA hosted on Azure Static Web Apps
- **API**: Azure Functions with Node.js
- **Database**: Azure SQL Database
- **Storage**: Azure Blob Storage
- **CDN**: Azure CDN for static assets

## Azure Resources

### Resource Naming Convention

Pattern: `env_loc_resourcetype_projname[optionalidentifier]`

#### Examples
```plaintext
# Static Web Apps
prod-euw-swa-phoenixvc
dev-saf-swa-phoenixvc

# Resource Groups
prod-euw-rg-phoenixvc
dev-saf-rg-phoenixvc

# SQL Databases
prod-euw-sql-phoenixvc
dev-saf-sql-phoenixvc
```

### Resource Configuration

#### Static Web App
```bicep
resource staticWebApp 'Microsoft.Web/staticSites@2021-03-01' = {
  name: '${env}-${loc}-swa-${projName}'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    // Configuration details
  }
}
```

#### SQL Database
```bicep
resource sqlServer 'Microsoft.Sql/servers@2021-11-01' = {
  name: '${env}-${loc}-sql-${projName}'
  location: location
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
  }
}
```

## Infrastructure as Code

### Directory Structure
```plaintext
infrastructure/
├── bicep/
│   ├── main.bicep
│   ├── modules/
│   │   ├── staticWebApp.bicep
│   │   ├── database.bicep
│   │   └── storage.bicep
│   └── parameters/
│       ├── prod.parameters.json
│       └── dev.parameters.json
├── scripts/
│   ├── deploy.sh
│   └── cleanup.sh
└── terraform/
    ├── main.tf
    └── variables.tf
```

### Deployment Scripts

#### Azure CLI
```bash
# Deploy infrastructure
az deployment group create \
  --resource-group ${ENV}-${LOC}-rg-${PROJ_NAME} \
  --template-file ./bicep/main.bicep \
  --parameters @./bicep/parameters/${ENV}.parameters.json
```

#### Terraform
```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="environments/${ENV}.tfvars"

# Apply changes
terraform apply -var-file="environments/${ENV}.tfvars"
```

## Environment Management

### Environment Types
- **Development (dev)**
  - For development and testing
  - Reduced resources and costs
  - More permissive security

- **User Acceptance Testing (uat)**
  - Mirror of production
  - For client testing
  - Temporary resources

- **Production (prod)**
  - Live environment
  - High availability
  - Strict security

### Configuration Management

#### Environment Variables
```json
{
  "dev": {
    "apiUrl": "https://dev-api.phoenixvc.com",
    "storageAccount": "devphoenixvcstorage",
    "allowedOrigins": ["http://localhost:3000"]
  },
  "prod": {
    "apiUrl": "https://api.phoenixvc.com",
    "storageAccount": "prodphoenixvcstorage",
    "allowedOrigins": ["https://phoenixvc.com"]
  }
}
```

## Security and Compliance

### Network Security

#### Virtual Network Configuration
```bicep
resource vnet 'Microsoft.Network/virtualNetworks@2021-05-01' = {
  name: '${env}-${loc}-vnet-${projName}'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: 'api-subnet'
        properties: {
          addressPrefix: '10.0.1.0/24'
          serviceEndpoints: [
            {
              service: 'Microsoft.Sql'
            }
          ]
        }
      }
    ]
  }
}
```

### Access Control

#### Role Assignments
```bicep
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(resourceGroup().id, principalId, roleDefinitionId)
  properties: {
    roleDefinitionId: roleDefinitionId
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
```

### Monitoring and Logging

#### Application Insights
```bicep
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${env}-${loc}-ai-${projName}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 90
    IngestionMode: 'ApplicationInsights'
  }
}
```

### Backup and Recovery

#### Database Backup
```bicep
resource sqlDatabase 'Microsoft.Sql/servers/databases@2021-11-01' = {
  name: '${sqlServer.name}/${databaseName}'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    createMode: 'Default'
    backupStorageRedundancy: 'Geo'
  }
}
```

## Disaster Recovery

### Recovery Procedures
1. **Database Failure**
 ```bash
 # Restore from geo-redundant backup
 az sql db restore \
   --resource-group ${ENV}-${LOC}-rg-${PROJ_NAME} \
   --server ${ENV}-${LOC}-sql-${PROJ_NAME} \
   --name ${DATABASE_NAME} \
   --restore-point-in-time ${TIMESTAMP}
 ```

2. **Region Failure**
 ```bash
 # Failover to secondary region
 az network traffic-manager profile update \
   --resource-group ${ENV}-${LOC}-rg-${PROJ_NAME} \
   --name ${TRAFFIC_MANAGER_PROFILE} \
   --routing-method Priority
 ```

## Cost Management

### Resource Tags
```json
{
  "Environment": "Production",
  "Project": "PhoenixVC",
  "CostCenter": "IT-001",
  "Owner": "team@phoenixvc.com"
}
```

### Budget Alerts
```bicep
resource budget 'Microsoft.Consumption/budgets@2021-10-01' = {
  name: '${env}-${loc}-budget-${projName}'
  properties: {
    amount: 1000
    category: 'Cost'
    timeGrain: 'Monthly'
    notifications: {
      actual_80_percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: ['team@phoenixvc.com']
      }
    }
  }
}
```