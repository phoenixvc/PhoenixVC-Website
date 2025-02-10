param staticSiteName string = 'phoenix-vc-static-web'
param location string = resourceGroup().location
param repositoryUrl string = 'https://github.com/JustAGhosT/PhoenixVC-Modernized'
param branch string = 'main'
param appLocation string = '/'
param apiLocation string = ''
param outputLocation string = 'build'

resource staticSite 'Microsoft.Web/staticSites@2021-03-01' = {
  name: staticSiteName
  location: location
  kind: 'static'
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
