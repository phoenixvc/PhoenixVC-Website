targetScope = 'subscription'

// Core parameters
param environment string = 'staging'
param locCode string = 'euw'
param location string = 'westeurope'

// Static site parameters
param repositoryUrl string = 'https://github.com/JustAGhosT/PhoenixVC-Modernized'
param branch string = 'main'
param appLocation string = '/'
param apiLocation string = ''
param outputLocation string = 'build'

// Budget parameters
param deployBudget bool = false

// Key Vault parameters
param deployKeyVault bool = true
param keyVaultName string = '${environment}-${locCode}-kv-phoenixvc-website'
param keyVaultSku string = 'standard'
param keyVaultAccessPolicies array = []
param enabledForDeployment bool = false
param enabledForDiskEncryption bool = false
param enabledForTemplateDeployment bool = true
param softDeleteRetentionInDays int = 90
param enableRbacAuthorization bool = false

// Resource naming variables
var resourceGroupName = '${environment}-${locCode}-rg-phoenixvc-website'
var staticSiteName = '${environment}-${locCode}-swa-phoenixvc-website'
var budgetName = '${environment}-${locCode}-rg-phoenixvc-budget'

// Branch logic - force 'main' branch for production environment
var effectiveBranch = (environment == 'prod') ? 'main' : branch

// Common tags
var commonTags = {
  Environment: environment
  Project: 'PhoenixVC'
}

// Resource Group Deployment
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
  tags: commonTags
}

// Static Site Module (Resource Group scope)
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

// Budget Module (Subscription scope)
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

// Key Vault Module (Resource Group scope)
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

// Outputs
output staticSiteName string = staticSite.outputs.staticSiteName
output staticSiteUrl string = staticSite.outputs.staticSiteUrl
output keyVaultName string = deployKeyVault ? keyVaultModule.outputs.keyVaultName : 'No Key Vault deployed'
output keyVaultUri string = deployKeyVault ? keyVaultModule.outputs.keyVaultUri : 'N/A'
output budgetName string = deployBudget ? budget.outputs.budgetName : 'No budget deployed'
output budgetAmount string = deployBudget ? string(budget.outputs.budgetAmount) : 'N/A'
