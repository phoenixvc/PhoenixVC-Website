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

// Load file contents as text strings.
var logicAppDefinitionText = loadTextContent(logicAppDefinitionFile)
var adaptiveCardText = loadTextContent(adaptiveCardFile)

// Convert the adaptive card text to JSON and then back to a string
// to ensure that all quotes and special characters are properly escaped.
var adaptiveCardEscaped = string(json(adaptiveCardText))

// Replace the placeholder in the logic app definition with the escaped adaptive card string.
var finalLogicAppDefinitionText = replace(logicAppDefinitionText, 'PLACEHOLDER_ADAPTIVE_CARD', adaptiveCardEscaped)

// **Debug output:** Log the final definition text so you can verify its JSON validity.
output finalLogicAppDefinitionTextOutput string = finalLogicAppDefinitionText

// Convert the final text into a JSON object.
var finalLogicAppDefinition = json(finalLogicAppDefinitionText)

resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: finalLogicAppDefinition
    // If required, add a "kind": "Stateful" property here.
  }
}

output logicAppId string = logicApp.id
output logicAppNameOut string = logicApp.name
