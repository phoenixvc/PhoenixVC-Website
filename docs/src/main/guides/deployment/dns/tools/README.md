# DNS Management Tools
**File Path:** 📄 `/docs/dns/tools/README.md`
**Version:** 3.3.0
**Last Updated:** 2025-02-18
**Authored By:** Jurie Smit (assisted by Claude-3 Sonnet)
**Status:** 🟢 Active
**Tags:** `#dns` `#tools` `#scripts` `#automation`

---

## Overview

This document provides an overview of the various tools included in the DNS Management System. These tools support automated DNS configuration, record fetching, backup operations, and troubleshooting. Each tool’s documentation includes installation instructions, configuration options, usage examples, and common scenarios.

---

## Available Tools

- **[DNS Record Fetcher](./record-fetcher.md)**
  Retrieve, validate, and monitor DNS records across multiple providers.

- **[Configuration Script](./configure-dns.md)**
  Automate DNS configuration management, including record creation, updates, and validation.

- **[Backup Tools](./backup-tools.md)**
  Manage DNS configuration backups and perform restoration when necessary.

---

## Tool Usage

Each tool is designed to integrate seamlessly into your DNS management workflow. They support:
- **Automated Operations:** Integration with CI/CD pipelines.
- **Interactive Commands:** For manual management and troubleshooting.
- **Logging & Monitoring:** Ensure changes are tracked and verified.

---

## Quick Links

| Tool                  | Purpose                                        | Documentation Link                  |
|-----------------------|------------------------------------------------|-------------------------------------|
| DNS Record Fetcher    | Retrieve and verify DNS records                | [Record Fetcher](./record-fetcher.md) |
| Configuration Script  | Automate DNS record configuration              | [Configuration Script](./configure-dns.md) |
| Backup Tools          | Backup and recovery operations                 | [Backup Tools](./backup-tools.md)     |

---

## Installation and Setup

### Prerequisites
- **Required Tools:** Azure CLI, jq, bash, and DNS lookup utilities (e.g., dig)
- **Azure Permissions:** DNS Zone Contributor, Network Contributor

### Installation
```bash
# Clone the repository (if not already done)
git clone https://github.com/phoenixvc/dns-ops.git

# Navigate to the tools documentation folder
cd dns-ops/docs/dns/tools

# Download required scripts (if needed)
curl -O https://phoenixvc.tech/scripts/dns/configure-dns.sh
curl -O https://phoenixvc.tech/scripts/dns/dns-record-fetcher.sh
curl -O https://phoenixvc.tech/scripts/dns/dns-backup.sh

# Make scripts executable
chmod +x configure-dns.sh dns-record-fetcher.sh dns-backup.sh
```

---

## Usage Examples

### DNS Record Fetcher
```bash
# Fetch all DNS records for a domain
./dns-record-fetcher.sh --domain phoenixvc.tech --type ALL

# Monitor changes in DNS records continuously
./dns-record-fetcher.sh --watch --domain phoenixvc.tech --interval 300
```

### Configuration Script
```bash
# Apply configuration for all DNS records in production
./configure-dns.sh --apply --all --ENVIRONMENT prod

# Verify the current DNS configuration
./configure-dns.sh --verify
```

### Backup Tools
```bash
# Create a backup of current DNS configurations
./dns-backup.sh --create --tag "pre-change-$(date +%Y%m%d)"

# List available backups
./dns-backup.sh --list

# Restore DNS configuration from a backup
./dns-backup.sh --restore --tag "backup-tag" --verify
```

---

## Additional Resources

- [DNS Management System Documentation](../README.md)
- [Troubleshooting Guide](../reference/troubleshooting.md)
- [Configuration Guide](../guides/configuration.md)

---

## Support

For issues and further assistance:
- **Primary Support:** dns-admin@phoenixvc.tech
- **Emergency:** on-call@phoenixvc.tech
- **Issue Tracker:** [GitHub Issues](https://github.com/phoenixvc/dns-ops/issues)
