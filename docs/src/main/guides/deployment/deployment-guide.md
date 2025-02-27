# PhoenixVC Deployment Guide {: #phoenixvc-deployment-guide}
📄 `/docs/deployment/deployment-guide.md`
**Version:** 1.0.0
**Last Updated:** 2025-02-14

> This document provides a concise, step-by-step process for deploying PhoenixVC infrastructure. Use this guide if you prefer a bullet-style overview separate from the detailed configuration in configuration.md.

## Step-by-Step Deployment {: #step-by-step-deployment}
1. **Review Prerequisites**
   Ensure all required software and permissions are in place.
   Refer to [prerequisites.md](./prerequisites.md) for system requirements and the validation script.

2. **Set Up Environment Variables**
   Copy the example environment file and modify it according to your target environment:
   ```bash
   cp .env.example .env
   # Edit .env with your values (e.g., production or staging settings)
   ```

3. **Validate Configuration**
   Run the validation script to confirm that your environment is properly configured:
   ```bash
   ./scripts/validate-env.sh
   az deployment group validate \
     --resource-group $RESOURCE_GROUP \
     --template-file main.bicep \
     --parameters @parameters-prod.json
   ```

4. **Run the Deployment**
   Execute the main deployment script:
   ```bash
   ./scripts/deploy.sh --environment prod
   ```

5. **Post-Deployment Verification**
   After deployment, verify that the resources have been correctly provisioned:
   - Check the Azure portal for the new resource group and resources.
   - Run health checks (see [operations.md](./operations.md) for details):
     ```bash
     ./scripts/health-check.sh --environment prod
     ```
   - Review logs and monitor dashboards.

## Troubleshooting {: #troubleshooting}
If any step fails, refer to [troubleshooting.md](./troubleshooting.md) for guidance on common issues and rollback procedures.

## Additional References {: #additional-references}
- Detailed environment configuration can be found in [configuration.md](./configuration.md).
- For routine operational tasks, see [operations.md](./operations.md).

## Version History {: #version-history}
| Version | Date       | Changes                             |
|---------|------------|-------------------------------------|
| 1.0.0   | 2025-02-14 | Initial release of the deployment guide |
