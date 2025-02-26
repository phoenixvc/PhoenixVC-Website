# DNS Troubleshooting Guide
**File Path:** 📄 `/docs/dns/troubleshooting.md`
**Version:** 3.3.0
**Last Updated:** 2025-02-18
**Authored By:** Jurie Smit (assisted by Claude-3 Sonnet)
**Status:** 🟢 Active
**Tags:** `#dns` `#troubleshooting` `#microsoft365` `#security` `#performance`

| 📚 Documentation         | 🛠️ Tools               | 🔍 Resources                                |
|--------------------------|------------------------|---------------------------------------------|
| [Technical Guide](./technical.md) | [DNS Scripts](../tools/README.md) | [Azure DNS Status](https://status.azure.com) |
| [Security Guide](./security.md)     | [Validation Tools](../tools/configure-dns.md) | [M365 Status](https://status.office365.com)    |
| [Best Practices](../guides/best-practices.md) | [Monitoring](../reference/technical.md) | [Support Portal](../../../../README.md)         |

---

## Common Issues Index

1. [Microsoft 365 Integration Issues](#microsoft-365-integration-issues)
2. [DNS Propagation Issues](#dns-propagation-issues)
3. [Record Configuration Problems](#record-configuration-problems)
4. [Security and Validation Errors](#security-and-validation-errors)
5. [Performance Issues](#performance-issues)

---

## Microsoft 365 Integration Issues

### "Possible Service Issues" in Admin Center

#### Symptoms
- Microsoft 365 admin center displays "Error" or "Possible service issues".
- DNS records appear correct, yet verification fails.
- Service verification failures occur despite proper record setup.

#### Common Causes
1. **DNS Propagation Delay**
   - Verification can take 24–48 hours.
   - Microsoft's systems require time to detect changes.

2. **TTL Mismatches**
```yaml
Expected TTL: 3600 seconds (1 hour)
Common Issues:
  - Non-standard TTL values
  - Inconsistent TTL across related records
```

3. **Missing or Incomplete Records**
```yaml
Required Records:
  MX:
    - Priority: 0
    - Target: domain-name.mail.protection.outlook.com

  TXT (SPF):
    - Content: "v=spf1 include:spf.protection.outlook.com -all"

  CNAME:
    - autodiscover
    - enterpriseenrollment (if using device management)
    - enterpriseregistration (if using device management)
```

#### Resolution Steps
```bash
# Verify current records
./dns-record-fetcher.sh --domain yourdomain.com --type ALL

# Check TTL values
./dns-record-fetcher.sh --domain yourdomain.com --check-ttl

# Force Microsoft 365 record verification
./configure-dns.sh --verify-m365 --force
```

---

## Enterprise Mobility & Security Issues

#### Required Configuration
```yaml
CNAMEs:
  enterpriseenrollment:
    - Target: enterpriseenrollment-s.manage.microsoft.com
    - TTL: 3600

  enterpriseregistration:
    - Target: enterpriseregistration.windows.net
    - TTL: 3600
```

#### Optional Records (for Teams/Skype)
```yaml
Teams/Skype Records:
  - sip.yourdomain.com
  - lyncdiscover.yourdomain.com
  - _sip._tls.yourdomain.com
  - _sipfederationtls._tcp.yourdomain.com
```

---

## DNS Propagation Issues

### Checking Propagation Status
```bash
# Monitor propagation across different DNS servers
./dns-record-fetcher.sh --check-propagation \
  --domain yourdomain.com \
  --resolvers "1.1.1.1,8.8.8.8,9.9.9.9"
```

### Troubleshooting Steps
1. **Verify NS Records**
   ```bash
   dig NS yourdomain.com
   ```

2. **Check SOA Record**
   ```bash
   dig SOA yourdomain.com
   ```

3. **Monitor Changes Continuously**
   ```bash
   ./dns-record-fetcher.sh --watch \
     --domain yourdomain.com \
     --interval 300
   ```

---

## Record Configuration Problems

### Validation Tools
```bash
# Run full DNS validation
./configure-dns.sh --validate --strict

# Validate specific records (e.g., MX, SPF, DKIM)
./configure-dns.sh --validate --components "mx,spf,dkim"
```

### Common Misconfigurations
```yaml
Issues:
  - Incorrect MX priority values
  - Malformed SPF records
  - Invalid CNAME chains
  - Conflicting records
```

---

## Security and Validation Errors

### DNSSEC Issues
```bash
# Verify DNSSEC configuration
./configure-dns.sh --verify-dnssec

# Check the DNSSEC chain of trust
dig +dnssec yourdomain.com
```

### SPF/DKIM/DMARC Verification
```bash
# Validate email security records
./configure-dns.sh --verify-email-security

# Check DMARC policy correctness
./dns-record-fetcher.sh --check-dmarc yourdomain.com
```

---

## Performance Issues

### Monitoring Tools
```bash
# Test DNS response times
./dns-record-fetcher.sh --performance-test --domain yourdomain.com

# Monitor DNS latency
./configure-dns.sh --monitor-performance --interval 60
```

### Resolution Steps
1. Optimize TTL settings.
2. Verify the health of the Azure DNS zone.
3. Monitor resolver performance.
4. Review the total record count and complexity.

---

## Quick Reference

### Microsoft 365 Verification Checklist
- [ ] MX record correctly points to Microsoft 365.
- [ ] SPF record includes Microsoft 365.
- [ ] Autodiscover CNAME is present.
- [ ] TTL values are set to 3600.
- [ ] Enterprise mobility records (if applicable) are configured.
- [ ] Teams/Skype records (if required) are in place.

### Common Commands
```bash
# Force Microsoft 365 verification
./configure-dns.sh --verify-m365 --force

# Check record propagation status
./dns-record-fetcher.sh --check-propagation

# Validate all DNS records strictly
./configure-dns.sh --validate --strict
```

---

## Support Resources

### Microsoft 365 Support
- [Microsoft 365 Admin Center](https://admin.microsoft.com)
- [Microsoft DNS Troubleshooter](https://aka.ms/dns-troubleshooter)
- Support: support@microsoft.com

### Internal Support
- DNS Team: dns-admin@phoenixvc.tech
- Emergency Contact: on-call@phoenixvc.tech
- [Issue Tracker](https://github.com/phoenixvc/dns-ops/issues)
