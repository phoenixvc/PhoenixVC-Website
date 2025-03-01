# GitHub Actions Documentation

This repository contains several custom GitHub Actions that support the deployment and notification infrastructure.

## Available Actions

### 1. Build Vite App
**Location:** `.github/actions/build-vite`

Builds Vite applications with proper configuration and caching.

#### Inputs:
```yaml
inputs:
app-name:
  description: 'Name of the app to build (web/design-system)'
  required: true
node-version:
  description: 'Node.js version'
  required: false
  default: '20'
```

#### Usage:
```yaml
- uses: ./.github/actions/build-vite
with:
  app-name: 'web'
  node-version: '20'
```

### 2. Teams Notification
**Location:** `.github/actions/teams-notification`

Sends deployment notifications to Microsoft Teams using Logic Apps.

#### Key Features:
- Template-based notifications
- Token encoding
- Environment-specific messaging
- Action URLs for approvals/rollbacks

#### Usage:
```yaml
- uses: ./.github/actions/teams-notification
with:
  webhook_url: ${{ secrets.TEAMS_WEBHOOK_URL }}
  title: "Deployment Complete"
  message: "Successfully deployed to production"
  environment: "prod"
  deployment_url: ${{ steps.deploy.outputs.url }}
```

### 3. SWA Deploy
**Location:** `.github/actions/swa-deploy`

Handles Azure Static Web Apps deployment with fallback mechanisms.

#### Features:
- Artifact download and deployment
- Configuration management
- URL output handling

#### Usage:
```yaml
- uses: ./.github/actions/swa-deploy
with:
  artifact-name: web-dist
  app-name: prod-euw-swa-phoenixvc-website
  resource-group: prod-euw-rg-phoenixvc-website
  env: prod
```

### 4. Setup Azure Deployment
**Location:** `.github/actions/setup-azure-deployment`

Prepares the Azure deployment environment.

#### Features:
- Script permission management
- Azure CLI verification
- Subscription setup

#### Usage:
```yaml
- uses: ./.github/actions/setup-azure-deployment
with:
  azure_credentials: ${{ secrets.AZURE_CREDENTIALS }}
  token: ${{ secrets.GITHUB_TOKEN }}
```

### 5. Deploy Azure Resources
**Location:** `.github/actions/deploy-azure-resources`

Manages Azure resource deployment for the application.

#### Features:
- Environment-specific deployment
- Logic App URL retrieval
- Resource validation

#### Usage:
```yaml
- uses: ./.github/actions/deploy-azure-resources
with:
  environment: prod
  azure_subscription_id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
  location_code: euw
```

## Best Practices for Custom Actions

1. **Input Validation**
 - All actions include input validation
 - Default values for optional parameters
 - Clear error messages

2. **Output Handling**
 - Consistent output variable naming
 - Error state propagation
 - URL validation

3. **Security**
 - Token masking in logs
 - Minimal permission scope
 - Secure credential handling

## Testing Actions Locally

```bash
# Set up local testing environment
npm install -g @actions/toolkit

# Test action inputs
act -j build_apps -e event.json

# Validate action metadata
actionlint .github/actions/*/action.yml
```

## Troubleshooting

Common issues and solutions:

1. **Token Permissions**
 ```yaml
 permissions:
   contents: read
   id-token: write
 ```

2. **Path Issues**
 - Use `working-directory` instead of `cd`
 - Verify artifact paths

3. **Azure Authentication**
 - Check credential format
 - Verify subscription access

## Contributing

1. Create a feature branch
2. Test your changes locally
3. Update documentation
4. Submit a pull request

## Additional Resources

- [Custom Actions Documentation](https://docs.github.com/actions/creating-actions)
- [Azure Static Web Apps CLI](https://github.com/Azure/static-web-apps-cli)
- [Teams Webhook Documentation](https://docs.microsoft.com/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)
