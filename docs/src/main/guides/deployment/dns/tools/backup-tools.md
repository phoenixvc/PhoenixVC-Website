# Backup Tools
📄 `/docs/dns/backup-tools.md`
**Version:** 3.2.2
**Last Updated:** 2025-02-18

## Overview

This guide covers backup and recovery operations for PhoenixVC's Azure DNS infrastructure. It details procedures for creating backups of DNS configurations, managing backup files, and restoring configurations when needed.

## Quick Reference

### Common Operations
```bash
# Create a backup of the current DNS configuration
./dns-backup.sh --create --tag "pre-change-$(date +%Y%m%d)"

# List available backups
./dns-backup.sh --list

# Restore DNS configuration from a backup
./dns-backup.sh --restore --tag "backup-tag" --verify
```

## Tools and Scripts

### Core Backup Tool
| Tool            | Purpose                                  | Documentation             |
|-----------------|------------------------------------------|---------------------------|
| `dns-backup.sh` | Backup and recovery of DNS configurations| [Backup Guide](backup-guide.md) |

### Installation
```bash
# Clone the backup tools repository
git clone https://github.com/phoenixvc/dns-ops.git
cd dns-ops

# Install dependencies
./install-deps.sh

# Configure environment
cp .env.example .env
vim .env
```

## Standard Operating Procedures

### 1. Backup Management

#### Regular Backups
- **Automated Backup (via Cron):**
  ```bash
  0 0 * * * /usr/local/bin/dns-backup.sh --create --rotate 7
  ```
- **Manual Backup:**
  ```bash
  ./dns-backup.sh --create --tag "manual-$(date +%Y%m%d)"
  ```

#### Recovery Procedure
```bash
# List available backups
./dns-backup.sh --list

# Restore from a specific backup
./dns-backup.sh --restore --tag "backup-tag" --verify
```

## Maintenance and Monitoring

### Routine Tasks
| Task                    | Frequency | Command                          |
|-------------------------|-----------|----------------------------------|
| Configuration Backup    | Daily     | `dns-backup.sh --create`         |
| Backup Verification     | Weekly    | `dns-backup.sh --verify`         |
| Backup Rotation Check   | Monthly   | `dns-backup.sh --rotate-keys`    |

## Troubleshooting

### Common Issues

#### Backup Failures
```bash
# View logs for the backup process
./dns-backup.sh --show-logs --last 50
```

#### Restoration Issues
```bash
# Verify backup integrity
./dns-backup.sh --validate --tag "backup-tag"
```

## Security Considerations

- **Secure Storage:** Ensure backup files are stored securely with proper access controls.
- **Integrity Verification:** Regularly verify backup integrity and conduct restoration drills.
- **Access Management:** Audit and rotate credentials for backup storage periodically.

## Reference

### Documentation
- [Azure DNS Documentation](https://docs.microsoft.com/azure/dns/)
- [DNS Configuration Best Practices](../best-practices/dns.md)
- [Security Guidelines](../security/dns-security.md)

### Support
For issues and support:
- GitHub Issues: [PhoenixVC DNS Configuration](https://github.com/phoenixvc/dns-config/issues)
- Email: dns-support@phoenixvc.tech

## Version History

| Version | Date       | Changes                                                             |
|---------|------------|---------------------------------------------------------------------|
| 3.2.2   | 2025-02-18 | Added automated recovery procedures and backup rotation instructions |
| 3.2.1   | 2025-01-15 | Enhanced backup monitoring integration                              |
| 3.2.0   | 2024-12-20 | Initial backup tools release                                          |
