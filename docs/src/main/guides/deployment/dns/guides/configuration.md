# DNS Configuration Guide
| [⬅️ Previous](../setup/prerequisites.md) | [📋 Guide](./guide.md) | [⬆️ Parent](..) | [➡️ Next](../deployment.md) |

**File Path:** 📄 `/docs/dns/configuration.md`
**Version:** 3.2.2
**Last Updated:** 2025-02-18
**Authored By:** Jurie Smit
**AI Assistance:** Claude-3 Sonnet (2024-04)
**Status:** 🟢 Approved
**Tags:** `#dns` `#configuration` `#azure` `#networking`

---

## Overview

This guide provides detailed instructions for configuring DNS for PhoenixVC’s Azure Static Web Apps. It covers environment setup, DNS record management, security features, and integration with CI/CD pipelines.

---

## Quick Start

```bash
# 1. Install prerequisites
./install-prerequisites.sh

# 2. Configure environment
cp .env.example .env
vim .env  # Update with your subscription ID, resource group, DNS zone, etc.

# 3. Apply DNS configuration
./configure-dns.sh --apply --all --ENVIRONMENT prod

# 4. Verify configuration
./dns-record-fetcher.sh --domain phoenixvc.tech --verify
```

---

## Table of Contents
- [DNS Configuration Guide](#dns-configuration-guide)
  - [Overview](#overview)
  - [Quick Start](#quick-start)
  - [Table of Contents](#table-of-contents)
  - [Environment Setup](#environment-setup)
  - [DNS Record Management](#dns-record-management)
    - [Example Configuration File](#example-configuration-file)
    - [Key Considerations](#key-considerations)
  - [Security Features](#security-features)
    - [Enabling DNSSEC](#enabling-dnssec)
    - [Configuring CAA Records](#configuring-caa-records)
  - [Email Configuration](#email-configuration)
    - [Setting Up Email Records](#setting-up-email-records)
  - [Monitoring and Verification](#monitoring-and-verification)
    - [Enabling Monitoring](#enabling-monitoring)
    - [Verification Commands](#verification-commands)
  - [Common Tasks](#common-tasks)
  - [Additional Resources](#additional-resources)
  - [Support](#support)

---

## Environment Setup

- Copy the example environment file and update it:
  ```bash
  cp .env.example .env
  vim .env
  ```
- Key settings include:
  - `LOCATION_CODE` (e.g., `za`)
  - `SWA_NAME` (e.g., `phoenixvc-prod`)
  - `DNS_ZONE_NAME` (e.g., `phoenixvc.tech`)
  - `ENVIRONMENT` (e.g., `prod`)

---

## DNS Record Management

DNS records are defined in a YAML configuration file.

### Example Configuration File
```yaml
# config/prod/dns-records.yaml
zone:
  name: phoenixvc.tech
  environment: prod

records:
  - name: "@"
    type: A
    ttl: 3600
    value: 4.153.215.143

  - name: www
    type: CNAME
    ttl: 3600
    value: prod-euw-swa-phoenixvc-website.azurestaticapps.net
```

### Key Considerations
- **Redundancy:** Use multiple A records for load balancing if needed.
- **TTL Management:** Choose TTL values based on the criticality of the record.
- **DNSSEC:** Ensure proper configuration if DNSSEC is enabled.

---

## Security Features

### Enabling DNSSEC
```bash
# Enable DNSSEC for the zone
az network dns zone update \
  --name phoenixvc.tech \
  --resource-group prod-za-rg-phoenixvc-website \
  --zone-signing-key-algorithm "RSASHA256" \
  --key-signing-key-algorithm "RSASHA512"
```

### Configuring CAA Records
```bash
# Example command to configure a CAA record (if supported by your tool)
./configure-dns.sh --apply --components security --caa-issuer "letsencrypt.org"
```

---

## Email Configuration

### Setting Up Email Records
```bash
# Configure MX and TXT (SPF) records for Microsoft 365 email routing
./configure-dns.sh --apply --components email \
  --mx-server "phoenixvc-tech.mail.protection.outlook.com"
```

- **Ensure** your SPF record is set to:
  ```yaml
  spf_record: "v=spf1 include:spf.protection.outlook.com -all"
  ```

---

## Monitoring and Verification

### Enabling Monitoring
```bash
# Enable monitoring with Azure Monitor integration
./configure-dns.sh --enable-monitoring \
  --metrics "all" \
  --alert-email "dns-admin@phoenixvc.tech"
```

### Verification Commands
```bash
# Verify DNS configuration
./configure-dns.sh --verify

# Check DNS propagation
./dns-record-fetcher.sh --check-propagation --domain phoenixvc.tech
```

---

## Common Tasks

- **Show Current Configuration:**
  ```bash
  ./configure-dns.sh --show-config
  ```

- **Plan Changes (Dry Run):**
  ```bash
  ./configure-dns.sh --plan --components all
  ```

- **Backup and Restore:**
  ```bash
  ./configure-dns.sh --backup --tag "pre-change"
  ./configure-dns.sh --restore --backup-tag "pre-change"
  ```

---

## Additional Resources

- [DNS Fundamentals Guide](../fundamentals/README.md)
- [DNS Operations Guide](../operations/README.md)
- [Security Guidelines](../reference/security.md)
- [Troubleshooting Guide](../troubleshooting/README.md)

---

## Support

For issues and assistance:
- **Primary Support:** dns-admin@phoenixvc.tech
- **Emergency Contact:** on-call@phoenixvc.tech
- **Issue Tracker:** [GitHub Issues](https://github.com/phoenixvc/dns-ops/issues)

---
