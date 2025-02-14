# PhoenixVC DNS Configuration Script Documentation
**Version 3.0.0** | [View Script](#) | [Changelog](#version-history)

## Purpose
Automated DNS management for Azure Static Web Apps with:
- Multi-mode operation (CI/CD vs interactive)
- Atomic rollbacks
- Component isolation
- Compliance-ready auditing

## Prerequisites
```bash
Azure CLI 2.58.0+
jq 1.6+
Bash 5.0+
```

## Installation
```bash
curl -O https://phoenixvc.tech/scripts/configure-dns.sh
chmod +x configure-dns.sh
mkdir -p .env dns_backups
```

## Configuration
Required `.env` structure:
```ini
LOC_CODE=za # Location code
SWA_NAME=phoenixvc-prod # Static Web App name
AZURE_SUB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Usage Examples
**Basic Deployment**
```bash
./configure-dns.sh -a -c "cname,apex"
```

**Interactive Mode**
```bash
./configure-dns.sh -i
```

**Force Overwrite**
```bash
./configure-dns.sh -a -f -c all
```

**Partial Rollback**
```bash
./configure-dns.sh -r ./dns_backups/phoenixvc.tech-20250214-1423.json -c txt
```

## Rollback Procedures
```mermaid
sequenceDiagram
  participant User
  participant Script
  participant AzureDNS
  
  User->>Script: Execute with -r
  Script->>AzureDNS: Import backup JSON
  AzureDNS-->>Script: Status
  Script-->>User: Rollback report
```

## Safety Features
1. Pre-flight checks
2. Immutable backups
3. Component isolation
4. Force flag requirement for overwrites
5. Azure resource validation

## TODO & Future Enhancements
```markdown
- [ ] Azure Policy Integration
  - DNS naming conventions
  - TTL enforcement (max 300s)
  - Record type restrictions
  
- [ ] Monitoring Hooks
  - Azure Monitor alerts
  - Slack/Teams notifications
  
- [ ] Cost Sanity Checks
  - DNS query volume estimates
  - Zone file size monitoring
  
- [ ] Cross-Cloud Support
  - AWS Route53 compatibility
  - GCP Cloud DNS adapters
  
- [ ] Terraform State Integration
  - Plan/drift detection
  - State locking
  
- [ ] AI-assisted Troubleshooting
  - Error pattern recognition
  - Auto-remediation suggestions
```

## Troubleshooting

| Error | Solution |
|---|---|
| `Missing .env file` | Create .env from template |
| `Record already exists` | Use `-f` or specify components |
| `Permission denied` | Run `az login` |
| `Invalid hostname` | Verify SWA provisioning |

## Version History
| Version | Changes |
|---|---|
| 3.0.0 | Rollback system, component isolation |
| 2.1.0 | Interactive/Auto modes |
| 1.1.0 | Initial release |

*Contributions welcome - see our [GitHub repo](https://github.com/PhoenixVC/azure-dns-toolkit)*