targetScope = 'subscription'

param environment string = 'staging'
param locCode string = 'euw'
param location string = 'westeurope'
param repositoryUrl string = 'https://github.com/JustAGhosT/PhoenixVC-Modernized'
param branch string = 'main'
param appLocation string = '/'
param apiLocation string = ''
param outputLocation string = 'build'
param deployBudget bool = false

var resourceGroupName = '${environment}-${locCode}-rg-phoenixvc-website'
var staticSiteName = '${environment}-${locCode}-swa-phoenixvc-website'
var budgetName = '${environment}-${locCode}-rg-phoenixvc-budget'

// Resource Group Deployment
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
  tags: {
    Environment: environment
    Project: 'PhoenixVC'
  }
}

// Static Site Module (Resource Group scope)
module staticSite './modules/static-site-module.bicep' = {
  name: 'staticSiteDeployment'
  scope: rg
  params: {
    staticSiteName: staticSiteName
    repositoryUrl: repositoryUrl
    branch: branch
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
