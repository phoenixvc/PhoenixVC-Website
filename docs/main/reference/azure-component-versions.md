# Azure Component Versions Reference
**Last Updated:** 2025-02-14

## Production Environment Components

### Compute Services
| Service | Version | Status | EOL Date |
|---------|---------|--------|----------|
| App Service Plan | P2v3 | Active | N/A |
| Functions Runtime | ~4 | Active | 2026-12 |
| Container Apps | 1.0 | Active | N/A |

### Database Services
| Service | Version | Status | EOL Date |
|---------|---------|--------|----------|
| Azure SQL | 12.0.2000.8 | Active | N/A |
| Cosmos DB | 2023-11-15 | Active | N/A |
| Redis Cache | 6.0 | Active | 2025-12 |

### Networking
| Service | Version | Status | EOL Date |
|---------|---------|--------|----------|
| Application Gateway | v2 | Active | N/A |
| Azure Front Door | 2023-11-01 | Active | N/A |
| VNet | 2023-09-01 | Active | N/A |

### Security Services
| Service | Version | Status | EOL Date |
|---------|---------|--------|----------|
| Key Vault | 7.4 | Active | N/A |
| Azure AD | 2.0 | Active | N/A |
| Defender for Cloud | 2024-01 | Active | N/A |

## API Versions Reference

### Resource Management
```json
{
  "Microsoft.Web/sites": "2023-01-01",
  "Microsoft.Sql/servers": "2023-05-01-preview",
  "Microsoft.Network/virtualNetworks": "2023-09-01",
  "Microsoft.KeyVault/vaults": "2023-07-01"
}
```

### Deployment Dependencies
```json
{
  "minimum": {
    "azureCLI": "2.53.0",
    "terraform": "1.6.0",
    "bicep": "0.20.4"
  },
  "recommended": {
    "azureCLI": "2.54.0",
    "terraform": "1.7.0",
    "bicep": "0.21.1"
  }
}
```

## Version Control Policy
- Major version updates: Quarterly review
- Security patches: Immediate assessment
- Breaking changes: 30-day notice required