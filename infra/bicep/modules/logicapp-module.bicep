@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

//
// Inline definition for the Logic App (workflow)
// Note: The "references" property has been removed because it causes deserialization issues.
// Replace "PLACEHOLDER_ADAPTIVE_CARD" with the adaptive card JSON.
//
var logicAppDefinitionText = '''
{
  "$schema": "https://schema.management.azure.com/schemas/2016-06-01/workflowdefinition.json",
  "contentVersion": "1.0.0.0",
  "parameters": {},
  "triggers": {
    "manual": {
      "type": "Request",
      "kind": "Http",
      "inputs": {
        "schema": {
          "type": "object",
          "properties": {
            "teamsWebhookUrl": { "type": "string" },
            "locationCode": { "type": "string" },
            "resourceGroup": { "type": "string" },
            "environment": { "type": "string" },
            "branch": { "type": "string" },
            "message": { "type": "string" },
            "deploymentUrl": { "type": "string" },
            "approvalUrl": { "type": "string" },
            "rollbackUrl": { "type": "string" }
          },
          "required": [
            "teamsWebhookUrl",
            "locationCode",
            "resourceGroup",
            "environment",
            "branch",
            "message",
            "deploymentUrl"
          ]
        }
      }
    }
  },
  "actions": {
    "Compose_AdaptiveCard": {
      "type": "Compose",
      "inputs": "PLACEHOLDER_ADAPTIVE_CARD"
    },
    "Post_to_Teams": {
      "type": "Http",
      "inputs": {
        "method": "POST",
        "uri": "@{triggerBody()?['teamsWebhookUrl']}",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": "@{json(outputs('Compose_AdaptiveCard'))}"
      },
      "runAfter": {
        "Compose_AdaptiveCard": [
          "Succeeded"
        ]
      }
    }
  },
  "outputs": {}
}
'''

//
// Inline Adaptive Card JSON definition
//
var adaptiveCardDefinitionText = '''
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.2",
  "body": [
    {
      "type": "TextBlock",
      "text": "{{title}}",
      "weight": "Bolder",
      "size": "Large"
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Environment:", "value": "{{environment}}" },
        { "title": "Branch:", "value": "{{branch}}" },
        { "title": "Resource Group:", "value": "{{resourceGroup}}" },
        { "title": "Location Code:", "value": "{{locationCode}}" }
      ]
    },
    {
      "type": "TextBlock",
      "text": "{{message}}",
      "wrap": true
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "{{actions[0].title}}",
      "url": "{{actions[0].url}}",
      "tooltip": "{{actions[0].description}}"
    },
    {
      "type": "Action.OpenUrl",
      "title": "{{actions[1].title}}",
      "url": "{{actions[1].url}}",
      "tooltip": "{{actions[1].description}}"
    }
  ]
}
'''

//
// To ensure proper escaping, convert the adaptive card text to JSON and then back to a string.
//
var adaptiveCardEscaped = string(json(adaptiveCardDefinitionText))

//
// Replace the placeholder in the logic app definition with the escaped adaptive card JSON string.
// The output is the complete logic app definition text that should be valid JSON.
//
var finalLogicAppDefinitionText = replace(logicAppDefinitionText, 'PLACEHOLDER_ADAPTIVE_CARD', adaptiveCardEscaped)

//
// (Optional) Output the final definition text for debugging purposes.
// Copy this output and validate it with an online JSON validator if needed.
//
output finalLogicAppDefinitionTextOutput string = finalLogicAppDefinitionText

//
// Convert the final logic app definition text to a JSON object.
// If the text is not valid JSON, this function will error out with a clear message.
//
var finalLogicAppDefinition = json(finalLogicAppDefinitionText)

//
// Deploy the Logic App resource
//
resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: finalLogicAppDefinition
    // Optionally, add "kind": "Stateful" if your workflow requires it.
  }
}

output logicAppId string = logicApp.id
output logicAppNameOut string = logicApp.name
