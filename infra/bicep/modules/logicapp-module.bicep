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

// Load file contents as trimmed text.
var logicAppDefinitionText = trim(loadTextContent(logicAppDefinitionFile))
var adaptiveCardText = trim(loadTextContent(adaptiveCardFile))

// Convert the adaptive card text to JSON and then back to a string (to escape quotes correctly)
var adaptiveCardEscaped = string(json(adaptiveCardText))

// Replace the placeholder in the logic app definition with the escaped adaptive card JSON string.
var finalLogicAppDefinitionText = replace(logicAppDefinitionText, 'PLACEHOLDER_ADAPTIVE_CARD', adaptiveCardEscaped)

// For debugging: output the final definition text so you can verify it is valid JSON.
output finalLogicAppDefinitionTextOutput string = finalLogicAppDefinitionText

// Convert the final definition text into a JSON object.
var finalLogicAppDefinition = json(finalLogicAppDefinitionText)

resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: finalLogicAppDefinition
    // If required, add "kind": "Stateful" here.
  }
}

output logicAppId string = logicApp.id
output logicAppNameOut string = logicApp.name
