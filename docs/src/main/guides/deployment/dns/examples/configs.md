# DNS Configuration Examples: Configs
**File Path:** 📄 `/docs/dns/examples/configs.md`
**Version:** 1.0.0
**Last Updated:** 2025-02-18
**Authored By:** Jurie Smit (assisted by Claude-3 Sonnet)
**Status:** 🟢 Active
**Tags:** `#dns` `#configuration` `#examples` `#yaml`

## Basic Configuration Examples

### Standard Website Setup
```yaml
zone:
  name: example.com
  environment: staging

records:
  - name: "@"
    type: A
    ttl: 3600
    value: "${AZURE_STATIC_IP}"

  - name: www
    type: CNAME
    ttl: 3600
    value: "@"

  - name: staging
    type: CNAME
    ttl: 3600
    value: "staging.azurewebsites.net"
```

### Microsoft 365 Integration
```yaml
zone:
  name: example.com
  environment: staging

records:
  - name: "@"
    type: MX
    ttl: 3600
    priority: 0
    value: "example-com.mail.protection.outlook.com"

  - name: "@"
    type: TXT
    ttl: 3600
    value: "v=spf1 include:spf.protection.outlook.com -all"

  - name: "autodiscover"
    type: CNAME
    ttl: 3600
    value: "autodiscover.outlook.com"
```

### Security Configuration
```yaml
zone:
  name: example.com
  environment: staging

records:
  - name: "@"
    type: CAA
    ttl: 3600
    flags: 0
    tag: "issue"
    value: "letsencrypt.org"

  - name: "_dmarc"
    type: TXT
    ttl: 3600
    value: "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"

  dnssec:
    enabled: true
    algorithm: "RSASHA256"
    keyType: "KSK"
```

## Advanced Configurations

### Multi-Region Setup
```yaml
zone:
  name: example.com
  environment: staging

records:
  - name: "eu"
    type: A
    ttl: 300
    value: "${EU_STATIC_IP}"
    geolocation: "EU"

  - name: "us"
    type: A
    ttl: 300
    value: "${US_STATIC_IP}"
    geolocation: "NA"

  - name: "@"
    type: A
    ttl: 300
    value: "${DEFAULT_IP}"
```

### Service Discovery
```yaml
zone:
  name: example.com
  environment: staging

records:
  - name: "_service._tcp"
    type: SRV
    ttl: 3600
    priority: 10
    weight: 60
    port: 5060
    target: "sip.example.com"

  - name: "api"
    type: CNAME
    ttl: 60
    value: "api.${AZURE_REGION}.cloudapp.azure.com"
```

## Environment-Specific Examples

### Development Environment
```yaml
zone:
  name: example.com
  environment: dev

records:
  - name: "dev"
    type: A
    ttl: 300
    value: "${DEV_IP}"

  - name: "*.dev"
    type: CNAME
    ttl: 300
    value: "dev"
```

### Staging Environment
```yaml
zone:
  name: example.com
  environment: staging

records:
  - name: "@"
    type: A
    ttl: 3600
    value: "${STAGING_IP}"

  monitoring:
    enabled: true
    endpoints:
      - name: "status"
        type: CNAME
        ttl: 300
        value: "status.example.com"
```

## Usage Guidelines

1. Replace placeholder values (e.g., `${VARIABLE}`) with actual values.
2. Adjust TTL values as required.
3. Test configurations in the **staging** environment before production deployment.
4. Document any custom modifications.
5. Keep security records up to date.
