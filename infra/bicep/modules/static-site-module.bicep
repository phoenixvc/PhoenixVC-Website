param staticSiteName string
param repositoryUrl string
param branch string
param appLocation string
param apiLocation string
param outputLocation string
param environment string

resource staticSite 'Microsoft.Web/staticSites@2021-03-01' = {
  name: staticSiteName
  location: resourceGroup().location
  kind: 'static'
  sku: {
    name: (environment == 'prod') ? 'Standard' : 'Free'
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: (environment == 'prod') ? 'main' : branch
    buildProperties: {
      appLocation: appLocation
      apiLocation: apiLocation
      outputLocation: outputLocation
    }
  }
}
