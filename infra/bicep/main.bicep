targetScope = 'subscription'

// ─────────────────────────────────────────────────────────────────────────────
// Core parameters
// ─────────────────────────────────────────────────────────────────────────────
param environment string = 'staging'
param locCode string = 'euw'
param location string = 'westeurope'

// Static site parameters
param repositoryUrl string = 'https://github.com/phoenixvc/PhoenixVC-Website'
param branch string = 'main'
param appLocation string = '/'
param apiLocation string = ''
param outputLocation string = 'build'

// ─────────────────────────────────────────────────────────────────────────────
// Budget parameters
// ─────────────────────────────────────────────────────────────────────────────
param deployBudget bool = false

// ─────────────────────────────────────────────────────────────────────────────
// Key Vault parameters
// ─────────────────────────────────────────────────────────────────────────────
param deployKeyVault bool = true
param keyVaultName string = '${environment}-${locCode}-kv-phoenixvc'
param keyVaultSku string = 'standard'
param keyVaultAccessPolicies array = []
param enabledForDeployment bool = false
param enabledForDiskEncryption bool = false
param enabledForTemplateDeployment bool = true
param softDeleteRetentionInDays int = 90
param enableRbacAuthorization bool = false

// ─────────────────────────────────────────────────────────────────────────────
// Logic App parameters
// ─────────────────────────────────────────────────────────────────────────────
@description('Whether to deploy the Logic App')
param deployLogicApp bool = false

@description('Name of the Logic App (deployment notification)')
param logicAppName string = '${environment}-${locCode}-la-phoenixvc'

@description('Name of the GitHub workflow invoking Logic App')
param logicAppGitHubName string = '${environment}-${locCode}-la-github'

@description('GitHub Personal Access Token for workflow dispatch')
@minLength(1)
param githubToken string

// ─────────────────────────────────────────────────────────────────────────────
// Resource naming variables
// ─────────────────────────────────────────────────────────────────────────────
var resourceGroupName = '${environment}-${locCode}-rg-phoenixvc-website'
var staticSiteName = '${environment}-${locCode}-swa-phoenixvc-website'
var budgetName = '${environment}-${locCode}-rg-phoenixvc-budget'

// Force 'main' branch for production environment
var effectiveBranch = (environment == 'prod') ? 'main' : branch

// Common tags
var commonTags = {
  Environment: environment
  Project: 'PhoenixVC'
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource Group Deployment
// ─────────────────────────────────────────────────────────────────────────────
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
  tags: commonTags
}

// ─────────────────────────────────────────────────────────────────────────────
// Static Site Module (Resource Group scope)
// ─────────────────────────────────────────────────────────────────────────────
module staticSite './modules/static-site-module.bicep' = {
  name: 'staticSiteDeployment'
  scope: rg
  params: {
    staticSiteName: staticSiteName
    repositoryUrl: repositoryUrl
    branch: effectiveBranch
    appLocation: appLocation
    apiLocation: apiLocation
    outputLocation: outputLocation
    environment: environment
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget Module (Subscription scope)
// ─────────────────────────────────────────────────────────────────────────────
module budget './modules/budget-module.bicep' = if (deployBudget) {
  name: 'budgetDeployment'
  params: {
    budgetName: budgetName
    amount: (environment == 'prod') ? 50 : 5
    contactEmails: [
      'devops@phoenixvc.com'
      'finance@phoenixvc.com'
    ]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Key Vault Module (Resource Group scope)
// ─────────────────────────────────────────────────────────────────────────────
module keyVaultModule './modules/keyvault-module.bicep' = if (deployKeyVault) {
  name: 'keyVaultDeployment'
  scope: rg
  params: {
    keyVaultName: keyVaultName
    location: location
    skuName: keyVaultSku
    accessPolicies: keyVaultAccessPolicies
    enabledForDeployment: enabledForDeployment
    enabledForDiskEncryption: enabledForDiskEncryption
    enabledForTemplateDeployment: enabledForTemplateDeployment
    softDeleteRetentionInDays: softDeleteRetentionInDays
    enableRbacAuthorization: enableRbacAuthorization
    tags: commonTags
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Logic App Module (Resource Group scope) - Deployment Notification Logic App
// ─────────────────────────────────────────────────────────────────────────────
module logicAppModule './modules/logicapp-teams-module.bicep' = if (deployLogicApp) {
  name: 'logicAppDeployment'
  scope: rg
  params: {
    logicAppName: logicAppName
    location: location
    tags: commonTags
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// New Logic App Module (Resource Group scope) - GitHub Workflow Invoker
// This Logic App receives the Teams Adaptive Card response along with an encoded GitHub token,
// then invokes a GitHub workflow dispatch endpoint.
// ─────────────────────────────────────────────────────────────────────────────
module logicAppGitHubModule './modules/logicapp-github-module.bicep' = if (deployLogicApp) {
  name: 'logicAppGitHubDeployment'
  scope: rg
  params: {
    logicAppName: logicAppGitHubName
    location: location
    tags: commonTags
    githubToken: githubToken
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Outputs
// ─────────────────────────────────────────────────────────────────────────────
output staticSiteName string = staticSite.outputs.staticSiteName
output staticSiteUrl string = staticSite.outputs.staticSiteUrl
output keyVaultName string = deployKeyVault ? keyVaultModule.outputs.keyVaultName : 'No Key Vault deployed'
output keyVaultUri string = deployKeyVault ? keyVaultModule.outputs.keyVaultUri : 'N/A'
output budgetName string = deployBudget ? budget.outputs.budgetName : 'No budget deployed'
output budgetAmount string = deployBudget ? string(budget.outputs.budgetAmount) : 'N/A'

// Optionally output logic app details if deployed
output logicAppName string = deployLogicApp ? logicAppModule.outputs.logicAppName : 'Logic App not deployed'
output logicAppId string = deployLogicApp ? logicAppModule.outputs.logicAppId : 'N/A'

// Output new GitHub-invoker logic app details if deployed
output logicAppGitHubName string = deployLogicApp ? logicAppGitHubModule.outputs.logicAppName : 'Logic App GitHub Invoker not deployed'
output logicAppGitHubId string = deployLogicApp ? logicAppGitHubModule.outputs.logicAppId : 'N/A'
