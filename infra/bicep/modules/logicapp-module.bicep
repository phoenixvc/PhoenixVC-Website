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

// Load the files as strings
var logicAppDefinitionText = loadTextContent(logicAppDefinitionFile)
var adaptiveCardText = loadTextContent(adaptiveCardFile)

// Convert the adaptive card text to a JSON object and then back to a string.
// This ensures that any quotes or newlines are escaped properly.
var adaptiveCardEscaped = string(json(adaptiveCardText))

// Replace the placeholder in the logic app definition with the escaped adaptive card string.
var finalLogicAppDefinitionText = replace(logicAppDefinitionText, 'PLACEHOLDER_ADAPTIVE_CARD', adaptiveCardEscaped)

// Now convert the final definition text to a JSON object.
var finalLogicAppDefinition = json(finalLogicAppDefinitionText)

resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: finalLogicAppDefinition
    // Optionally add "kind": "Stateful" if required
  }
}

output logicAppId string = logicApp.id
output logicAppNameOut string = logicApp.name
