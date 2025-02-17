# **📖 PhoenixVC DNS Configuration Script Documentation** {: #-phoenixvc-dns-configuration-script-documentation}
**Version 3.2.2** | [View Script](#) | [Installation](#installation) | [Usage](#usage)

## 📋 Table of Contents {: #-table-of-contents}
- [Purpose](#-purpose)
- [Prerequisites](#️-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [CI/CD Integration](#-cicd-integration)
- [Usage](#-quickstart-guide)
- [Security](#-security)
- [Monitoring](#-monitoring)
- [Troubleshooting](#️-troubleshooting-guide)
- [Recovery Procedures](#-recovery-procedures)
- [Future Enhancements](#-future-enhancements)
- [Azure DNS vs. External DNS Providers](#azure-dns-vs-external-dns-providers)
- [Changing GoDaddy Nameservers](#changing-godaddy-nameservers)
- [Version History](#-version-history)

## **🌟 Purpose** {: #-purpose}
This script automates **DNS management for Azure Static Web Apps**, including:
- **Automated CI/CD integration** (GitHub Actions, Azure DevOps)
- **Rollback support** for DNS changes
- **Component-based isolation** (CNAME, TXT, APEX)
- **Auditable logs** for compliance tracking
- **Multi-environment support** (Production, Staging, Development)

## **🛠️ Prerequisites** {: #-prerequisites}
### Required Software {: #required-software}
```bash
Azure CLI 2.58.0+
jq 1.6+
Bash 5.0+
dig command-line tool
```

### Required Permissions {: #required-permissions}
- Azure subscription with DNS zone access
- Resource Group contributor access
- Static Web Apps configuration permissions

## **🚀 Quickstart Guide** {: #-quickstart-guide}
Follow these steps to configure DNS for your main domain, www subdomain, and docs subdomain.

### 1. Basic Domain Setup (15 minutes) {: #1-basic-domain-setup-15-minutes}
```bash
# Download and setup {: #download-and-setup}
curl -O https://phoenixvc.tech/scripts/deployment/configure-dns.sh
chmod +x configure-dns.sh

# Configure main domain (apex) to point to Azure Static Web App {: #configure-main-domain-apex-to-point-to-azure-static-web-app}
az network dns record-set cname set-record \
  -g YourResourceGroup \
  -z phoenixvc.tech \
  -n @ \
  -c your-swa-name.azurestaticapps.net

# Configure www subdomain to point to Azure Static Web App {: #configure-www-subdomain-to-point-to-azure-static-web-app}
az network dns record-set cname set-record \
  -g YourResourceGroup \
  -z phoenixvc.tech \
  -n www \
  -c your-swa-name.azurestaticapps.net
```

### 2. Docs Subdomain Setup (10 minutes) {: #2-docs-subdomain-setup-10-minutes}
```bash
# Add GitHub Pages A records for docs subdomain {: #add-github-pages-a-records-for-docs-subdomain}
az network dns record-set a add-record \
  -g YourResourceGroup \
  -z phoenixvc.tech \
  -n docs \
  -a 185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153
```

### Expected DNS Records {: #expected-dns-records}
```yaml
# Final DNS Configuration {: #final-dns-configuration}
Apex (@):
  - Type: A
  - Values: (Auto-fetched from your Static Web App if EXPECTED_APEX_IPS is not manually defined)
  - TTL: 3600

www:
  - Type: CNAME
  - Value: your-swa-name.azurestaticapps.net
  - TTL: 3600

docs:
  - Type: A
  - Values: [185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153]
  - TTL: 3600
```

### Additional Required Records {: #additional-required-records}
```bash
# Add TXT record for Azure custom domain verification {: #add-txt-record-for-azure-custom-domain-verification}
az network dns record-set txt add-record \
  -g YourResourceGroup \
  -z phoenixvc.tech \
  -n asuid \
  -v "YOUR_AZURE_VERIFICATION_ID"

# Add TXT record for GitHub Pages verification (if needed) {: #add-txt-record-for-github-pages-verification-if-needed}
az network dns record-set txt add-record \
  -g YourResourceGroup \
  -z phoenixvc.tech \
  -n @ \
  -v "github-pages-verification=your-code"
```

### Important New Feature: Automatic Apex IP Retrieval {: #important-new-feature-automatic-apex-ip-retrieval}
If you do not manually set the environment variable `EXPECTED_APEX_IPS`, the script will automatically fetch the A records (IP addresses) from your Static Web App's default hostname (`$SWA_NAME.azurestaticapps.net`). These IPs are then used to configure and verify the apex domain, ensuring your DNS records are accurate without additional manual input.

## **📥 Installation** {: #-installation}
### Local Development Setup {: #local-development-setup}
```bash
# Download the script {: #download-the-script}
curl -O https://phoenixvc.tech/scripts/deployment/configure-dns.sh
chmod +x configure-dns.sh

# Create required directories {: #create-required-directories}
mkdir -p .env dns_backups
```

### Directory Structure {: #directory-structure}
```
.
├── configure-dns.sh
├── .env
├── dns_backups/
│   └── backup-{date}.json
└── .dns-config.json
```

## **⚙️ Configuration** {: #-configuration}
### Environment Configuration {: #environment-configuration}
Create an `.env` file for local execution:
```ini
LOCATION_CODE=za  # Location code (e.g., euw, saf)
SWA_NAME=phoenixvc-prod
AZURE_SUBSCRIPTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
RESOURCE_GROUP=prod-${LOCATION_CODE}-rg-phoenixvc-website
```

### DNS Configuration File (.dns-config.json) {: #dns-configuration-file-dns-configjson}
```json
{
  "domain": "phoenixvc.tech",
  "environments": {
    "production": {
      "ttl": 3600,
      "records": {
        "apex": {
          "type": "A",
          "values": []   // Leave empty to auto-fetch from SWA hostname
        },
        "www": {
          "type": "CNAME",
          "value": "phoenixvc-prod.azurestaticapps.net"
        }
      }
    }
  }
}
```

## **🚀 CI/CD Integration** {: #-cicd-integration}
### GitHub Actions Example {: #github-actions-example}
```yaml
name: DNS Configuration
on:
  workflow_dispatch:
  push:
    branches: [main]
    paths: ['dns/**']

jobs:
  configure_dns:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - name: Configure DNS
        run: ./configure-dns.sh --apply --components "cname,apex"
        env:
          AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          SWA_NAME: phoenixvc-prod
          RESOURCE_GROUP: prod-euw-rg-phoenixvc-website
```

### Azure DevOps Pipeline {: #azure-devops-pipeline}
```yaml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - dns/**

steps:
- task: AzureCLI@2
  inputs:
    azureSubscription: 'Your-Azure-Connection'
    scriptType: 'bash'
    scriptPath: './configure-dns.sh'
    arguments: '--apply --components "cname,apex"'
```

## **🔒 Security** {: #-security}
### Safety Features {: #safety-features}
1. **Pre-flight validation checks**
2. **Immutable backups** before every change
3. **Component-level isolation**
4. **Forced overwrites require explicit `--force` flag**
5. **Automatic rollback on failure**

### Access Control {: #access-control}
```bash
# Minimum required role assignments {: #minimum-required-role-assignments}
az role assignment create \
    --role "DNS Zone Contributor" \
    --assignee-object-id $USER_OR_SP_ID \
    --scope $DNS_ZONE_ID
```

## **📊 Monitoring** {: #-monitoring}
### Health Checks {: #health-checks}
```bash
# Verify DNS configuration {: #verify-dns-configuration}
./configure-dns.sh --verify

# Check propagation {: #check-propagation}
for ns in 8.8.8.8 1.1.1.1; do
    dig @$ns phoenixvc.tech
done
```

### Logging {: #logging}
```bash
# Enable detailed logging {: #enable-detailed-logging}
export DNS_LOG_LEVEL=DEBUG
export DNS_LOG_FILE=/var/log/dns-config.log
```

## **🔄 Recovery Procedures** {: #-recovery-procedures}
```mermaid
sequenceDiagram
    participant User
    participant Script
    participant AzureDNS
    participant Backup
    
    User->>Script: Execute with --rollback
    Script->>Backup: Load latest backup
    Script->>AzureDNS: Apply backup configuration
    AzureDNS-->>Script: Confirmation
    Script-->>User: Success/Failure report
```

### Rollback Commands {: #rollback-commands}
```bash
# List available backups {: #list-available-backups}
ls -l dns_backups/

# Restore specific backup {: #restore-specific-backup}
./configure-dns.sh --rollback --backup-file dns_backups/backup-20240215.json
```

## **🛠️ Troubleshooting Guide** {: #-troubleshooting-guide}
| Error                   | Solution                                      | Prevention                      |
|-------------------------|-----------------------------------------------|---------------------------------|
| `Missing .env file`      | Create .env with required variables            | Use CI/CD secrets               |
| `Record already exists`  | Use --force flag                               | Check existing records first    |
| `Permission denied`      | Check Azure role assignments                   | Use managed identities          |
| `Invalid hostname`       | Verify SWA deployment                          | Add pre-flight checks           |

## **📌 Future Enhancements** {: #-future-enhancements}
```markdown
- [ ] **Azure Policy Integration**
  - DNS naming conventions
  - TTL enforcement
  - Record type restrictions
  
- [ ] **Monitoring Enhancements**
  - Azure Monitor integration
  - Slack/Teams notifications
  - Cost analysis
  
- [ ] **Multi-Cloud Support**
  - AWS Route53
  - GCP Cloud DNS
  
- [ ] **Infrastructure as Code**
  - Terraform integration
  - Pulumi support
  
- [ ] **AI/ML Features**
  - Intelligent error detection
  - Auto-remediation
  - Performance optimization
```

## **Azure DNS vs. External DNS Providers** {: #azure-dns-vs-external-dns-providers}
If you create an **Azure DNS zone** for your domain, you must also **update your domain’s nameservers** at your registrar to point to Azure’s nameservers (e.g., `ns1-01.azure-dns.com`, `ns2-01.azure-dns.net`, etc.).
Otherwise, **the zone in Azure won’t be used**, and your domain will continue to resolve via your existing DNS provider.

### Common Scenario: GoDaddy Domain, Amazon IP Addresses {: #common-scenario-godaddy-domain-amazon-ip-addresses}
It’s entirely possible for a domain registered at **GoDaddy** to resolve to **Amazon** IP addresses if you’ve updated your domain’s nameservers to point to an external provider (such as Amazon’s Route53 or CloudFront). In this case, even if you create an Azure DNS zone, it will remain inactive until you change the nameservers at GoDaddy to Azure’s.

**Key Points**:
1. **Domain Registrar** – The service where you registered your domain (e.g., GoDaddy, Namecheap) controls which nameservers your domain uses.
2. **Azure DNS** – If you want to host DNS in Azure, you must switch your domain’s nameservers to Azure.
3. **External DNS** – If your domain points to an external provider (like Amazon or Cloudflare), any Azure DNS zone you create is effectively inactive until you change nameservers.

## **Changing GoDaddy Nameservers** {: #changing-godaddy-nameservers}
To switch your domain to use Azure DNS, follow these steps:

1. **Retrieve Azure Nameservers**:
   - In the Azure Portal, navigate to **DNS zones** and select your zone (e.g., `phoenixvc.tech`).
   - The Azure DNS nameservers typically are:
     - `ns1-01.azure-dns.com`
     - `ns2-01.azure-dns.net`
     - `ns3-01.azure-dns.org`
     - `ns4-01.azure-dns.info`
   - Note these values for later use.

2. **Log in to GoDaddy**:
   - Visit [GoDaddy's website](https://www.godaddy.com) and sign in to your account.

3. **Access Domain Settings**:
   - Navigate to your **My Products** page.
   - Locate your domain (e.g., `phoenixvc.tech`) and click **DNS** or **Manage DNS**.

4. **Update Nameservers**:
   - In the **Nameservers** section, click **Change**.
   - Select **Custom** nameservers.
   - Enter the Azure nameservers you retrieved:
     - `ns1-01.azure-dns.com`
     - `ns2-01.azure-dns.net`
     - `ns3-01.azure-dns.org`
     - `ns4-01.azure-dns.info`
   - Save your changes.

5. **Wait for Propagation**:
   - DNS changes can take up to 48 hours to propagate globally.
   - Use tools like `nslookup` or `dig` to verify that the new nameservers are in effect.

## **📜 Version History** {: #-version-history}
| Version | Date       | Changes                                                             |
|---------|------------|---------------------------------------------------------------------|
| 3.2.2   | 2024-03-XX | Added definitions for missing functions; automated apex IP retrieval; updated docs accordingly. |
| 3.2.0   | 2024-02-15 | Added AI-assisted troubleshooting, Enhanced backup system           |
| 3.1.0   | 2024-01-20 | Improved CI/CD compatibility, Structured error handling             |
| 3.0.0   | 2023-12-15 | Initial rollback system, Component isolation                        |
| 2.1.0   | 2023-11-01 | Added interactive & auto modes                                      |
| 1.0.0   | 2023-10-01 | Initial release                                                     |
