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

// Load the logic app definition file as a text string.
var logicAppDefinitionText = loadTextContent(logicAppDefinitionFile)

// Load the adaptive card file as text.
var adaptiveCardText = loadTextContent(adaptiveCardFile)

// Convert the adaptive card text to JSON and then back to a string
// to ensure proper escaping of quotes and special characters.
var adaptiveCardEscaped = string(json(adaptiveCardText))

// Replace the placeholder "PLACEHOLDER_ADAPTIVE_CARD" in the logic app definition text.
var finalLogicAppDefinitionText = replace(logicAppDefinitionText, 'PLACEHOLDER_ADAPTIVE_CARD', adaptiveCardEscaped)

// Convert the final logic app definition text into a JSON object.
var finalLogicAppDefinition = json(finalLogicAppDefinitionText)

resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: finalLogicAppDefinition
    // If required, add "kind": "Stateful" (for standard Logic Apps) here.
  }
}

output logicAppId string = logicApp.id
output logicAppNameOut string = logicApp.name
