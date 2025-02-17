# Deployment Script Reference {: #deployment-script-reference}
📄 `/docs/deployment/deploy-script-reference.md`

**Version:** 0.1.0  
**Last Updated:** 2025-02-14

> This document provides an overview of the scripts used in the deployment process, including their purpose, usage, and locations. It serves as a quick reference for developers and operators.

## Scripts Overview {: #scripts-overview}
1. **deploy.sh**  
   - **Purpose:** Main deployment script that orchestrates the full deployment process.
   - **Usage:**  
     ```bash
     ./scripts/deploy.sh --environment prod --region westeurope
     ```
   - **Location:** `/scripts/deploy.sh`
   - **Notes:**  
     - Accepts parameters for environment and region.
     - Triggers resource provisioning and configuration based on environment variables.

2. **validate-env.sh**  
   - **Purpose:** Validates that all required environment variables are set and that the system meets prerequisites.
   - **Usage:**  
     ```bash
     ./scripts/validate-env.sh
     ```
   - **Location:** `/scripts/validate-env.sh`
   - **Notes:**  
     - Checks for the installation of Azure CLI, Node.js, and other necessary tools.

3. **health-check.sh**  
   - **Purpose:** Performs routine health checks on deployed services.
   - **Usage:**  
     ```bash
     ./scripts/health-check.sh --environment prod
     ```
   - **Location:** `/scripts/health-check.sh`
   - **Notes:**  
     - Outputs system status and performance metrics.
     - Can be integrated with monitoring dashboards.

4. **rotate-credentials.sh**  
   - **Purpose:** Handles the rotation of service principal credentials.
   - **Usage:**  
     ```bash
     ./scripts/rotate-credentials.sh <SP_NAME>
     ```
   - **Location:** `/scripts/rotate-credentials.sh`
   - **Notes:**  
     - Works in conjunction with ADR 001 for manual credential rotation.
     - Logs rotation events for audit purposes.

5. **emergency-rollback.sh**  
   - **Purpose:** Rolls back to a previous deployment version in case of critical failures.
   - **Usage:**  
     ```bash
     ./scripts/emergency-rollback.sh --version <LAST_GOOD_VERSION>
     ```
   - **Location:** `/scripts/emergency-rollback.sh`
   - **Notes:**  
     - Bypasses validation if necessary.
     - Should be used only in emergency scenarios.

6. **incident-response.sh**  
   - **Purpose:** Activates the incident response process and notifies the operations team.
   - **Usage:**  
     ```bash
     ./scripts/incident-response.sh --severity high --notify-team true
     ```
   - **Location:** `/scripts/incident-response.sh`
   - **Notes:**  
     - Collects diagnostic data.
     - Integrates with internal alerting systems.

## TODO {: #todo}
- [ ] Expand documentation on additional scripts as they are developed.
- [ ] Include example outputs and log file references where applicable.
- [ ] Update usage examples if script parameters change.

## Revision History {: #revision-history}
| Version | Date       | Author    | Changes                    |
|---------|------------|-----------|----------------------------|
| 0.1.0   | 2025-02-14 | HJ Smit   | Initial draft of script reference |
