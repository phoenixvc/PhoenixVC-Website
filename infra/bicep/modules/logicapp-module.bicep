@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

@description('Logic app definition file location (compile-time literal)')
var logicAppDefinitionFile = './definitions/logicapp-definition.json'

@description('Adaptive card definition file location (compile-time literal)')
var adaptiveCardFile = './definitions/teams-adaptive-card.json'

// Load file contents
var logicAppDefinition = loadTextContent(logicAppDefinitionFile)
var adaptiveCard = loadTextContent(adaptiveCardFile)

// Replace the placeholder with the adaptive card JSON content
var finalLogicAppDefinition = replace(logicAppDefinition, 'PLACEHOLDER_ADAPTIVE_CARD', adaptiveCard)

// Deploy the Logic App
resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: json(finalLogicAppDefinition)
    // Optionally add "kind" property if required, e.g., kind: 'Stateful'
  }
}

// Outputs
output logicAppId string = logicApp.id
output logicAppNameOut string = logicApp.name
