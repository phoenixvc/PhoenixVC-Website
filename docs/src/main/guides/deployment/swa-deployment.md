# Azure Static Web Apps Deployment

## What is Azure Static Web Apps?

Azure Static Web Apps is a service that automatically builds and deploys full stack web apps to Azure from a GitHub or Azure DevOps repository. It's designed specifically for modern web app development practices, offering a streamlined approach to hosting static content while providing integrated API capabilities through Azure Functions. [[1]](#__1)

The service follows a JAMstack architecture (JavaScript, APIs, and Markup), which separates the frontend UI from backend data and services. This architectural approach offers improved performance, higher security, and better scalability compared to traditional web hosting models. [[2]](#__2)

## Key Features and Capabilities

### Integrated Hosting and API Support

- **Static content hosting** for HTML, CSS, JavaScript, and images
- **Serverless API integration** via Azure Functions, eliminating the need for a full back-end server [[1]](#__1)
- **Support for popular frameworks** including Angular, React, Svelte, Vue, and static site generators like Gatsby and Hugo [[3]](#__3)
- **Built-in authentication** with providers like Azure Active Directory, GitHub, and social identity providers [[1]](#__1)

### Performance and Global Reach

- **Global CDN distribution** by default, ensuring content is delivered from locations closest to users
- **Free SSL certificates** that auto-renew, providing secure connections without manual management
- **Custom domains** support for professional branding
- **Globally distributed content** for production applications with enterprise-grade performance [[4]](#__4)

### Developer Experience

- **Streamlined workflows** with built-in CI/CD through GitHub Actions or Azure DevOps
- **Staging environments** for testing changes before production
- **Preview environments** automatically created for pull requests [[1]](#__1)
- **Local development tools** through Static Web Apps CLI (SWA CLI) that emulate the production environment [[5]](#__5)

### Security and Access Control

- **Route-based authorization** for securing parts of your application
- **Role-based access control** for managing permissions
- **Private endpoints** for secure network integration
- **Custom authentication** options for application-specific security requirements [[1]](#__1)

### Pricing and Scalability

- **Free tier** that includes:
  - 100GB bandwidth per month
  - 2 custom domains
  - 3 staging environments
  - Integration with Azure Functions for backend APIs
- **Standard tier** for production needs with additional scale and enterprise features [[6]](#__6)

## Architecture and Integration

Azure Static Web Apps follows a modern architecture pattern that separates:

1. **Static frontend assets** - delivered through a global CDN
2. **API endpoints** - hosted in a serverless environment
3. **Authentication and authorization** - managed through built-in services [[1]](#__1)

This architecture enables several key benefits:

- **Reduced complexity** by eliminating the need to manage web servers
- **Improved security posture** with fewer attack vectors
- **Better performance** through global distribution and edge caching
- **Cost efficiency** by only paying for what you use with serverless backends [[7]](#__7)

### Backend Integration Options

Azure Static Web Apps offers flexible options for API integration:

1. **Built-in Azure Functions** - tightly integrated serverless functions
2. **Custom API routes** - connect to other backend services
3. **Network isolated backends** - for enterprise scenarios requiring additional security [[8]](#__8)

## Deployment Strategy

### SWA CLI-First Deployment Approach

Based on our deployment logs analysis, we've updated our deployment strategy to prioritize the SWA CLI method, which has proven more reliable in our environment:

1. **Primary Method: SWA CLI Deployment**
   - Uses the `swa deploy` command from the Static Web Apps CLI
   - Simple, purpose-built tool specifically for Azure Static Web Apps
   - Requires minimal setup and dependencies
   - Well-documented and officially supported by Microsoft [[7]](#__7)

2. **Azure CLI Method (Optional)**
   - Can be used as an alternative when specific Azure CLI features are needed
   - Requires proper installation of the `staticwebapps` extension
   - More complex but offers additional Azure ecosystem integration
   - Better suited for advanced deployment scenarios [[9]](#__9)

This approach ensures maximum deployment reliability by using the most straightforward and purpose-built tool for the job.

### Configuration File Handling

Our deployment process includes critical steps to fix the `staticwebapp.config.json` file:

```bash
sed -i 's/"serve":/"rewrite":/g' "$CONFIG_PATH"
sed -i 's/,"statusCode": 200//g' "$CONFIG_PATH"
```

This addresses a common issue where SPA routing configurations might use outdated syntax. The action:

1. Replaces `"serve":` with `"rewrite":` to match current Azure SWA requirements
2. Removes the `"statusCode": 200` property which is no longer needed in the rewrite syntax
3. Ensures the configuration file exists in both the `.config` directory and root as a fallback [[6]](#__6)

### Environment-Specific Deployments

Our deployment process supports environment-specific deployments through the `--env` flag for SWA CLI. This allows for:

- Deploying to production, staging, or custom environments
- Managing environment-specific configurations
- Supporting branch-based deployment strategies [[4]](#__4)

## Why We Chose Azure Static Web Apps

### 1. Simplified DevOps Foundation

While Azure Static Web Apps provides built-in CI/CD capabilities through GitHub Actions or Azure DevOps, we've implemented an extended DevOps pipeline that builds upon this foundation. Our custom pipeline includes additional steps for:

- Advanced testing stages
- Security scanning
- Artifact validation
- Multi-environment deployments
- Performance benchmarking
- Configuration management

> **Note:** Although Azure Static Web Apps offers simplified built-in deployment options, we leverage the SWA CLI within our comprehensive DevOps pipeline for greater control and customization of the deployment process.

### 2. Cost Efficiency

The service offers a generous free tier that includes:
- 100GB bandwidth per month
- 2 custom domains
- 3 staging environments
- Integration with Azure Functions for backend APIs

For our production needs, the Standard tier provides additional scale at a reasonable cost. [[6]](#__6)

### 3. Integrated Backend Capabilities

The built-in API support through Azure Functions allows us to create serverless APIs alongside our static content, all within the same project and deployment pipeline. [[1]](#__1)

### 4. Security Features

Azure Static Web Apps provides:
- Free SSL certificates
- Easy authentication integration
- Role-based access control
- Custom authorization rules [[1]](#__1)

### 5. Global Distribution

Our application is automatically distributed across a global CDN, ensuring fast load times for users regardless of their location. [[4]](#__4)

## Common Use Cases

Azure Static Web Apps is particularly well-suited for:

1. **Single Page Applications (SPAs)** built with frameworks like React, Angular, or Vue
2. **Progressive Web Apps (PWAs)** that require reliable performance and offline capabilities
3. **Documentation sites** and corporate websites that need global distribution
4. **E-commerce storefronts** with dynamic product catalogs
5. **Marketing sites** that need fast loading times and global reach
6. **Web applications with serverless backends** that benefit from scale-to-zero capabilities [[2]](#__2)

## Our Updated Deployment Implementation

### GitHub Action for Deployment

Based on our deployment logs analysis, we've updated our GitHub Action to prioritize the SWA CLI method and improve error handling:

```yaml
name: "SWA Deploy"
description: "Deploy site via SWA CLI from a downloaded artifact with improved reliability."
inputs:
  artifact-name:
    description: "The name of the artifact to download"
    required: true
  app-name:
    description: "The SWA app name"
    required: true
  resource-group:
    description: "The resource group for the SWA app"
    required: true
  env:
    description: "The deployment environment (e.g. staging, prod)"
    required: true
  artifact-path:
    description: "Local path to download the artifact to"
    required: false
    default: "./build-artifact"
runs:
  using: "composite"
  steps:
    - name: Checkout Repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Download Web App Artifact
      uses: actions/download-artifact@v4
      with:
        name: ${{ inputs.artifact-name }}
        path: ${{ inputs.artifact-path }}

    - name: Fix staticwebapp.config.json
      shell: bash
      run: |
        CONFIG_PATH="${{ inputs.artifact-path }}/.config/staticwebapp.config.json"

        if [ -f "$CONFIG_PATH" ]; then
          echo "Updating $CONFIG_PATH to use 'rewrite' instead of 'serve'..."
          sed -i 's/"serve":/"rewrite":/g' "$CONFIG_PATH"
          sed -i 's/,"statusCode": 200//g' "$CONFIG_PATH"
          echo "Configuration updated successfully."
          cat "$CONFIG_PATH"

          # Copy to root if it doesn't exist there (as a fallback)
          ROOT_CONFIG="${{ inputs.artifact-path }}/staticwebapp.config.json"
          if [ ! -f "$ROOT_CONFIG" ]; then
            echo "Copying config to root location as well..."
            cp "$CONFIG_PATH" "$ROOT_CONFIG"
          fi
        else
          echo "Warning: Config file not found at $CONFIG_PATH"
        fi

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install SWA CLI
      shell: bash
      run: |
        echo "Installing SWA CLI..."
        npm install --no-fund --no-audit --loglevel=error -g @azure/static-web-apps-cli

    - name: Deploy Site via SWA CLI
      shell: bash
      run: |
        echo "Deploying to ${{ inputs.env }} environment using SWA CLI..."
        swa deploy ${{ inputs.artifact-path }} \
          --deployment-token ${{ env.AZURE_STATIC_WEB_APPS_API_TOKEN }} \
          --env ${{ inputs.env }}
      env:
        AZURE_STATIC_WEB_APPS_API_TOKEN: ${{ env.AZURE_STATIC_WEB_APPS_API_TOKEN }}
```

### Advantages of Our Updated Approach

1. **Simplified Deployment Process**
   - Focuses on the purpose-built SWA CLI tool
   - Eliminates dependency on Azure CLI extensions
   - Reduces the number of potential failure points
   - Provides a more straightforward deployment flow [[7]](#__7)

2. **Improved Node.js Setup**
   - Uses the official Node.js setup action
   - Ensures consistent Node.js version
   - Better compatibility with the SWA CLI [[5]](#__5)

3. **Optimized NPM Installation**
   - Uses `--no-fund` and `--no-audit` flags to reduce noise
   - Sets appropriate log level to focus on important messages
   - Improves CI/CD pipeline readability [[5]](#__5)

4. **Configuration Management**
   - Maintains the configuration file handling from our previous approach
   - Ensures proper routing for single-page applications
   - Maintains compatibility with Azure Static Web Apps requirements [[6]](#__6)

5. **Environment Flexibility**
   - Continues to support multiple environments (production, staging, etc.)
   - Works with branch-based deployment strategies
   - Enables advanced CI/CD workflows [[9]](#__9)

### Best Practices and Considerations

1. **Security**
   - The action uses environment variables for sensitive tokens
   - Consider using OpenID Connect (OIDC) for improved security instead of long-lived tokens [[8]](#__8)

2. **Performance**
   - For large sites, consider using incremental deployments for faster updates [[1]](#__1)
   - The `fetch-depth: 0` ensures all history is available if needed for deployment

3. **Troubleshooting**
   - The SWA CLI provides detailed logs for troubleshooting
   - The action outputs the configuration file content for verification

4. **Custom Domains**
   - Custom domains can be configured via the Azure Portal or using the Azure CLI:
     ```bash
     az staticwebapp hostname add --name $APP_NAME --resource-group $RESOURCE_GROUP --hostname $CUSTOM_DOMAIN
     ```
   - This can be added as a post-deployment step if needed [[2]](#__2)

## Why SWA CLI for Deployment

### 1. Purpose-Built for Azure Static Web Apps

The SWA CLI is specifically designed to streamline the development and deployment workflow for Azure Static Web Apps. It provides a seamless experience for:

- Local development with the same runtime as production
- Authentication emulation
- API integration
- Simplified deployment process [[5]](#__5)

### 2. Simplified Deployment Process

The SWA CLI offers a straightforward deployment command that handles all the complexities of deploying to Azure Static Web Apps:

```bash
swa deploy <artifact-path> --deployment-token <token> --env <environment>
```

This single command manages the entire deployment process, including:
- Content uploading
- Configuration application
- Environment-specific deployments
- Route configuration [[5]](#__5)

### 3. Environment Management

The SWA CLI supports environment-specific deployments through the `--env` parameter, allowing us to maintain separate staging, production, and other environments with the same codebase.

### 4. Seamless Integration with Complex Pipelines

The SWA CLI integrates perfectly with our extended DevOps pipeline. It allows us to:
- Deploy from build artifacts
- Use deployment tokens securely
- Maintain consistent deployment processes across environments
- Fit within our broader deployment strategy

### 5. Configuration Management

The SWA CLI respects the `staticwebapp.config.json` configuration file, ensuring that our routing rules, authentication settings, and other configurations are properly applied during deployment.

## Key SWA CLI Features

The Static Web Apps CLI offers several important capabilities:

- **Serve static app assets** or proxy to your app dev server
- **Serve API requests** or proxy to APIs in Azure Functions Core Tools
- **Emulate authentication** and authorization
- **Emulate Static Web Apps configuration** including routes and auth rules
- **Deploy to Azure Static Web Apps** [[5]](#__5)

## Documentation

For more information about Azure Static Web Apps:
- [Azure Static Web Apps Overview](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Quickstart Guide](https://learn.microsoft.com/en-us/azure/static-web-apps/getting-started)
- [Configuration Reference](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)

For more information about the Azure Static Web Apps CLI:
- [SWA CLI Introduction](https://azure.github.io/static-web-apps-cli/docs/intro)
- [Deployment Commands](https://azure.github.io/static-web-apps-cli/docs/cli/swa-deploy)
- [Configuration Options](https://azure.github.io/static-web-apps-cli/docs/cli/swa-config)

## Usage in Our Workflow

Our comprehensive DevOps pipeline incorporates the SWA CLI as one component in a larger deployment strategy that includes:

1. Multiple build stages
2. Extensive testing
3. Security validation
4. Configuration management
5. Multi-environment deployment
6. Performance monitoring

The SWA CLI is used specifically for the Azure Static Web Apps deployment step, providing a reliable and consistent method for deploying our application to the Azure platform while maintaining the flexibility to customize the deployment process as needed.

## Sources

[[1]](#__1): https://learn.microsoft.com
[[4]](#__4): https://github.com/Azure/static-web-apps/discussions/787
[[9]](#__9): https://johnnyreilly.com/playwright-github-actions-and-azure-static-web-apps-staging-environments
[[6]](#__6): https://github.com/Azure/static-web-apps/discussions/1093
[[7]](#__7): https://learn.microsoft.com/en-us/answers/questions/1286519/can-we-publish-deploy-a-code-to
