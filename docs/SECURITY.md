📄 /docs/infrastructure/SECURITY.md

# Security Configuration

## Overview

This document outlines the security measures, configurations, and best practices implemented in the Phoenix VC infrastructure. It covers access control, network security, encryption, and compliance requirements.

## Table of Contents
- [Identity and Access Management](#identity-and-access-management)
- [Network Security](#network-security)
- [Data Protection](#data-protection)
- [Compliance](#compliance)
- [Security Monitoring](#security-monitoring)
- [Incident Response](#incident-response)

## Identity and Access Management

### Azure Active Directory Configuration
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

### RBAC Roles Matrix

| Role | Scope | Permissions | Use Case |
|------|-------|-------------|----------|
| Contributor | Resource Group | Create/Manage resources | DevOps Team |
| Reader | Subscription | View resources | Auditors |
| Key Vault Admin | Key Vault | Manage secrets | Security Team |
| Network Contributor | VNet | Manage network | Network Team |

## Network Security

### Network Architecture
```mermaid
graph TD
  subgraph "Public Zone"
    WAF[WAF]
    APIM[API Management]
  end

  subgraph "Private Zone"
    APP[App Service]
    FUNC[Functions]
  end

  subgraph "Data Zone"
    KV[Key Vault]
    SQL[PostgreSQL]
    REDIS[Redis Cache]
  end

  WAF --> APIM
  APIM --> APP
  APIM --> FUNC
  APP --> KV
  APP --> SQL
  FUNC --> REDIS
```

### Network Security Groups
```bicep
resource nsg 'Microsoft.Network/networkSecurityGroups@2021-02-01' = {
  name: '${environment}-nsg-backend'
  location: location
  properties: {
    securityRules: [
      {
        name: 'AllowHttpsInbound'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourceAddressPrefix: 'Internet'
          sourcePortRange: '*'
          destinationAddressPrefix: 'VirtualNetwork'
          destinationPortRange: '443'
        }
      }
    ]
  }
}
```

## Data Protection

### Encryption Configuration
```bicep
resource keyVault 'Microsoft.KeyVault/vaults@2021-06-01-preview' = {
  name: '${environment}-kv-phoenixvc'
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: true
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
      ipRules: []
      virtualNetworkRules: []
    }
    sku: {
      name: 'standard'
      family: 'A'
    }
  }
}
```

### Data Classification

| Data Type | Classification | Storage Location | Encryption |
|-----------|---------------|------------------|------------|
| User Data | Confidential | PostgreSQL | TDE |
| Logs | Internal | Log Analytics | Platform-managed |
| Secrets | Restricted | Key Vault | HSM-backed |
| Cache | Internal | Redis | In-transit |

## Compliance

### Regulatory Requirements
- GDPR Compliance
- ISO 27001
- SOC 2
- PCI DSS (if applicable)

### Audit Configuration
```bicep
resource diagnosticSetting 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${environment}-diag-audit'
  scope: keyVault
  properties: {
    workspaceId: logAnalytics.id
    logs: [
      {
        category: 'AuditEvent'
        enabled: true
        retentionPolicy: {
          days: 365
          enabled: true
        }
      }
    ]
  }
}
```

## Security Monitoring

### Alert Rules
```bicep
resource securityAlert 'Microsoft.Security/alerts@2021-01-01' = {
  name: '${environment}-alert-security'
  properties: {
    description: 'Security violation detected'
    severity: 'High'
    status: 'Active'
    notificationSettings: {
      emails: [
        'security@phoenixvc.com'
      ]
      phone: []
    }
  }
}
```

### Security Center Integration
- Threat Protection
- Vulnerability Assessment
- Security Posture Management

## Incident Response

### Response Procedures

1. **Detection**
   - Automated alerts
   - Manual reports
   - Security Center findings

2. **Analysis**
   - Impact assessment
   - Scope determination
   - Root cause investigation

3. **Containment**
   - Resource isolation
   - Access revocation
   - Traffic blocking

4. **Remediation**
   - Patch application
   - Configuration updates
   - System hardening

### Emergency Contacts

| Role | Contact Method | Response Time |
|------|----------------|---------------|
| Security Lead | security@phoenixvc.com | 15 min |
| DevOps Team | devops@phoenixvc.com | 30 min |
| Management | management@phoenixvc.com | 1 hour |

## Security Maintenance

### Regular Tasks

- Weekly security patches
- Monthly access reviews
- Quarterly penetration testing
- Annual disaster recovery testing

### Security Baselines
```json
{
  "passwordPolicy": {
    "minimumLength": 12,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialCharacters": true,
    "expirationDays": 90
  },
  "mfaPolicy": {
    "enforced": true,
    "gracePeriodsHours": 0,
    "allowedMethods": [
      "authenticator",
      "sms",
      "email"
    ]
  }
}
```