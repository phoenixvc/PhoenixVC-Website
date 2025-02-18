# DNS Management Quick Start Guide
**File Path:** 📄 `/docs/dns/quick-start/README.md`
**Version:** 3.3.0
**Last Updated:** 2025-02-18
**Authored By:** Jurie Smit (assisted by Claude-3 Sonnet)
**Status:** 🟢 Active
**Tags:** `#dns` `#quickstart` `#azure` `#setup`

| 📚 Documentation       | 🛠️ Setup         | 🔍 Resources                          |
|------------------------|------------------|---------------------------------------|
| [Full Guide](../guide/README.md) | [Configuration](../config/README.md) | [Azure DNS](https://docs.microsoft.com/azure/dns/) |
| [Operations](../operations/README.md) | [Security](../security/README.md) | [Best Practices](../best-practices/README.md) |
| [Monitoring](../monitoring/README.md) | [Backup](../backup/README.md) | [Support](../support/README.md)       |

---

## Overview

This Quick Start Guide provides rapid setup instructions for PhoenixVC's DNS Management System on Azure. It is designed for new users to quickly configure and verify DNS settings for Azure Static Web Apps.

---

## Prerequisites

### Required Tools
```bash
# Verify required tools are installed
az --version      # Azure CLI >= 2.58.0
jq --version      # jq >= 1.6
bash --version    # Bash >= 5.0
dig -v            # DNS lookup utility
```

### Azure Permissions
- **DNS Zone Contributor** role
- **Network Contributor** role
- Access to the target resource group

---

## Quick Setup Steps

### 1. Tool Installation
```bash
# Download configuration scripts
curl -O https://phoenixvc.tech/scripts/dns/configure-dns.sh
curl -O https://phoenixvc.tech/scripts/dns/dns-record-fetcher.sh

# Make scripts executable
chmod +x configure-dns.sh dns-record-fetcher.sh
```

### 2. Environment Configuration
```bash
# Copy and edit the environment file
cp .env.example .env

# Open .env in your preferred editor and update settings:
#   - LOCATION_CODE (e.g., za)
#   - SWA_NAME (e.g., phoenixvc-prod)
#   - DNS_ZONE_NAME (e.g., phoenixvc.tech)
#   - ENVIRONMENT (e.g., prod)
vim .env
```

### 3. Basic DNS Setup
```bash
# Apply the base configuration for all DNS records
./configure-dns.sh --apply --all --ENVIRONMENT prod

# Verify the DNS configuration
./dns-record-fetcher.sh --domain phoenixvc.tech --verify
```

---

## Common Operations

### Website Configuration
```bash
# Configure the main domain and the www subdomain
./configure-dns.sh --apply --components "apex,www" --ENVIRONMENT prod

# Verify the configuration
./configure-dns.sh --verify --components "apex,www"
```

### Email Configuration
```bash
# Set up Microsoft 365 email records
./configure-dns.sh --apply --components email \
  --mx-server "phoenixvc-tech.mail.protection.outlook.com"
```

### Security Setup
```bash
# Enable DNSSEC and configure CAA records for enhanced security
./configure-dns.sh --apply --components security \
  --enable-dnssec \
  --caa-issuer "letsencrypt.org"
```

### Monitoring
```bash
# Enable monitoring for DNS performance and alerts
./configure-dns.sh --enable-monitoring \
  --metrics "all" \
  --alert-email "dns-admin@phoenixvc.tech"
```

---

## Troubleshooting

### Verifying DNS Records
```bash
# Fetch and display all DNS records for verification
./dns-record-fetcher.sh --domain phoenixvc.tech --type ALL --verify
```

### Checking DNS Propagation
```bash
# Monitor DNS propagation across various resolvers
./dns-record-fetcher.sh --check-propagation --domain phoenixvc.tech --resolvers "1.1.1.1,8.8.8.8"
```

---

## Further Reading

- [DNS Configuration Guide](../configuration/README.md) – Detailed instructions for DNS setup.
- [DNS Operations Guide](../operations/README.md) – Day-to-day management and maintenance.
- [Best Practices](../best-practices/README.md) – Recommended procedures for security and performance.

---

## Support

For assistance, contact:
- **Primary Support:** dns-admin@phoenixvc.tech
- **Emergency:** on-call@phoenixvc.tech
- **Issue Tracking:** [GitHub Issues](https://github.com/phoenixvc/dns-ops/issues)
