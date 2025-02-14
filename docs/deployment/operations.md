# Operational Procedures Guide
📄 `/docs/deployment/operations.md`  
**Version:** 1.4.0  
**Last Updated:** 2025-02-14

> This guide outlines the day-to-day operational procedures for managing PhoenixVC infrastructure. It covers routine maintenance tasks, health checks, backup procedures, and emergency operations.

## Overview
This document describes the operational tasks required to ensure smooth functioning of the deployed infrastructure. It includes procedures for regular health checks, backup operations, and handling emergency situations.

## Routine Operations

### 1. Health Checks
Run the health check script to monitor the status of key components:
```bash
./scripts/health-check.sh --environment prod --components "webapp,api,database"
```

### 2. Backup Procedures

#### Automated Backups
Verify backup status with the following command:
```bash
az backup job list --vault-name $VAULT_NAME --resource-group $RESOURCE_GROUP --output table
```
To trigger a manual backup:
```bash
az backup protection backup-now --item-name $ITEM_NAME --vault-name $VAULT_NAME --resource-group $RESOURCE_GROUP --container-name $CONTAINER_NAME
```

#### Backup Schedule
| Backup Type         | Frequency | Retention  |
|---------------------|-----------|------------|
| Full                | Weekly    | 12 weeks   |
| Differential        | Daily     | 30 days    |
| Transaction Logs    | Hourly    | 7 days     |

### 3. Security Operations
Rotate service principal credentials and run security scans:
```bash
./scripts/rotate-credentials.sh --service-principal $SP_NAME --notify-team true
./scripts/security-scan.sh --scope full --report-format json
```

### 4. Access Review
List role assignments and review Key Vault access:
```bash
az role assignment list --resource-group $RESOURCE_GROUP --output table
az keyvault list-deleted --resource-group $RESOURCE_GROUP
```

## Maintenance Procedures

### 1. Planned Maintenance
Initiate a maintenance window, perform updates, and then conclude the window:
```bash
./scripts/maintenance.sh start --notification true --window-duration 120
# Execute update commands or swap deployment slots as needed, e.g.:
az webapp deployment slot swap --name $APP_NAME --resource-group $RESOURCE_GROUP --slot staging --target-slot production
./scripts/maintenance.sh end --verification true
```

### 2. Emergency Procedures
#### Quick Recovery
Rollback to the last known good state:
```bash
./scripts/emergency-rollback.sh --version $LAST_GOOD_VERSION --skip-validation true
```
Scale resources in emergency:
```bash
az webapp scale --name $APP_NAME --resource-group $RESOURCE_GROUP --plan-size P2V2
```

#### Incident Response
Activate incident response and collect diagnostics:
```bash
./scripts/incident-response.sh --severity high --notify-team true
az webapp log download --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## Monitoring and Alerts

### 1. Alert Configuration
The following JSON outlines the alert rules for high CPU usage:
```json
{
  "alertRules": [
    {
      "name": "high-cpu-usage",
      "threshold": 80,
      "window": "PT5M",
      "action": {
        "type": "email",
        "recipients": ["ops@phoenixvc.tech"]
      }
    }
  ]
}
```

### 2. Performance Monitoring
To check performance metrics:
```bash
az monitor metrics list --resource $RESOURCE_ID --metric "CpuPercentage" --interval PT1H
```
For log queries:
```bash
az monitor log-analytics query --workspace-name $WORKSPACE --query "requests | where timestamp > ago(1h)"
```

## Compliance and Auditing
Generate audit reports and review policy compliance:
```bash
./scripts/audit-report.sh --period monthly --format pdf --include-security true
az policy state summarize --resource-group $RESOURCE_GROUP
```
Verify compliance status:
```bash
./scripts/compliance-check.sh --framework iso27001 --generate-report true
az security assessment list --resource-group $RESOURCE_GROUP
```

## Version History

| Version | Date       | Changes                         |
|---------|------------|----------------------------------|
| 1.4.0   | 2025-02-14 | Added emergency procedures and updated monitoring configuration |
| 1.3.0   | 2025-02-14 | Enhanced routine and security tasks |
| 1.2.0   | 2025-02-14 | Added compliance auditing procedures |
| 1.1.0   | 2025-02-14 | Included backup procedures and access review |
| 1.0.0   | 2025-02-14 | Initial release                  |
