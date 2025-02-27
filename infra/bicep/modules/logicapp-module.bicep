@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

//
// Inline definition for the Logic App (workflow)
// This definition is fully hardcoded and does not use any placeholder replacement.
// It defines a manual HTTP trigger and an action that posts an adaptive card to a Teams webhook.
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
    "Post_to_Teams": {
      "type": "Http",
      "inputs": {
        "method": "POST",
        "uri": "@{triggerBody()?['teamsWebhookUrl']}",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.2",
          "body": [
            {
              "type": "TextBlock",
              "text": "Deployment Notification",
              "weight": "Bolder",
              "size": "Large"
            },
            {
              "type": "FactSet",
              "facts": [
                { "title": "Environment:", "value": "staging" },
                { "title": "Branch:", "value": "staging" },
                { "title": "Resource Group:", "value": "staging-euw-rg-phoenixvc-website" },
                { "title": "Location Code:", "value": "euw" }
              ]
            },
            {
              "type": "TextBlock",
              "text": "Deployment has completed successfully.",
              "wrap": true
            }
          ],
          "actions": [
            {
              "type": "Action.OpenUrl",
              "title": "View Site",
              "url": "https://example.com"
            }
          ]
        }
      },
      "runAfter": {}
    }
  },
  "outputs": {}
}
'''

//
// Convert the inline string into a JSON object.
// This will error out with a clear message if the JSON is not valid.
//
var finalLogicAppDefinition = json(logicAppDefinitionText)

//
// Deploy the Logic App resource using the final JSON definition.
//
resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: finalLogicAppDefinition
    // Optionally add a "kind" property if needed (e.g., kind: 'Stateful')
  }
}

output logicAppId string = logicApp.id
output logicAppName string = logicApp.name
