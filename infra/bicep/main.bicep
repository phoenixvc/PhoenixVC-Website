param staticSiteName string = 'prod-euw-swa-phoenixvc'
param location string = resourceGroup().location
param repositoryUrl string = 'https://github.com/JustAGhosT/PhoenixVC-Modernized'
param branch string = 'main'
param appLocation string = '/'
param apiLocation string = ''
param outputLocation string = 'build'
param deployBudget bool = false

resource staticSite 'Microsoft.Web/staticSites@2021-03-01' = {
  name: staticSiteName
  location: location
  kind: 'static'
  sku: {
    name: 'Standard'
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: appLocation
      apiLocation: apiLocation
      outputLocation: outputLocation
    }
  }
}

resource budget 'Microsoft.Consumption/budgets@2019-10-01' = if (deployBudget) {
  name: 'prod-euw-rg-phoenixvc-budget'
  scope: resourceGroup()
  properties: {
    category: 'Cost'
    amount: 10
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: '2025-01-01T00:00:00Z'
      endDate: '2099-12-31T23:59:59Z'
    }
    notifications: {
      Actual_GreaterThan_66: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 66
        contactEmails: [
          'admin@phoenixvc.com'
        ]
      }
    }
  }
}
