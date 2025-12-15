📄 /docs/infrastructure/docker-workflow.md

# Docker Workflow {: #docker-workflow}

This document outlines more advanced or alternative Docker configurations for our project, beyond the local development setup described in [development-setup.md](./development/development-setup.md).

## Local vs. Production Compose Files {: #local-vs-production-compose-files}

- **Local Development:**
  - Uses `docker-compose.yml` at the repository root, which typically includes services like PostgreSQL, Redis (if needed), etc.
  - Environment variables and ports are aligned for local usage.

- **Production/Staging:**
  - May use a separate `docker-compose.prod.yml` or a specialized infrastructure IaC (see [bicep-templates.md](./bicep-templates.md)).
  - Contains different scaling, environment variables, or networking rules.

## Environment Variables {: #environment-variables}

When running Docker in production/staging:

- Some environment variables (like `API_URL`, `DB_HOST`, `DB_PASSWORD`) will differ.
- Use `.env.production` or similar approach to store production secrets.

## Customizing Ports {: #customizing-ports}

If you need to change ports (for example, 5432 -> 5433 for PostgreSQL), edit the `ports` section in your compose file:

```yaml
services:
  db:
    image: postgres:14
    ports:
      - '5433:5432'
```

And ensure your application’s `.env` or environment variable references the new port.

## Advanced Docker Features {: #advanced-docker-features}

1. **Docker Compose Overrides:**
   - You can create an override file (e.g., `docker-compose.override.yml`) for local testing or debugging.
2. **Build Args:**
   - Pass custom build args if you need different environment files at build time.
3. **Volume Management:**
   - If you need persistent data (beyond local development), configure named volumes or mount external storage.

## Additional Resources {: #additional-resources}

- [Development Setup](./development/development-setup.md)
- [Infrastructure Docs](./README.md)
- [Bicep Templates](./bicep-templates.md)
- [Azure Deployment Guide](./deployment/deployment.md)
