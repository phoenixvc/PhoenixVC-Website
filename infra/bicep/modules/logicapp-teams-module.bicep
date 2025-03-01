@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

//
// Inline definition for the Logic App (workflow)
// This definition is fully hardcoded and does not use any placeholder replacement.
// It defines a manual HTTP trigger that now also accepts an encoded token, and an action
// that posts an Adaptive Card to a Teams webhook. The Adaptive Card includes a hidden field
// for the token (encodedToken).
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
            "title": { "type": "string" },
            "color": { "type": "string" },
            "deploymentUrl": { "type": "string" },
            "approvalUrl": { "type": "string" },
            "rollbackUrl": { "type": "string" },
            "teamsLogicAppUrl": { "type": "string" },
            "githubLogicAppUrl": { "type": "string" },
            "encodedToken": { "type": "string" },
            "encodedTeamsToken": { "type": "string" }
          },
          "required": [
            "teamsWebhookUrl",
            "locationCode",
            "resourceGroup",
            "environment",
            "branch",
            "message",
            "deploymentUrl",
            "encodedToken",
            "encodedTeamsToken"
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
              "text": "@{triggerBody()?['title']}",
              "weight": "Bolder",
              "size": "Large",
              "color": "@{triggerBody()?['color']}"
            },
            {
              "type": "TextBlock",
              "text": "@{triggerBody()?['message']}",
              "wrap": true
            },
            {
              "type": "FactSet",
              "facts": [
                {
                  "title": "Environment",
                  "value": "@{triggerBody()?['environment']}"
                },
                {
                  "title": "Location",
                  "value": "@{triggerBody()?['locationCode']}"
                },
                {
                  "title": "Resource Group",
                  "value": "@{triggerBody()?['resourceGroup']}"
                },
                {
                  "title": "Site URL",
                  "value": "@{triggerBody()?['deploymentUrl']}"
                }
              ]
            },
            {
              "type": "TextBlock",
              "text": "@{concat('The deployment to ', triggerBody()?['environment'], ' has completed successfully. Please review the details above and take any necessary actions.')}",
              "wrap": true
            }
          ],
          "actions": [
            {
              "type": "Action.OpenUrl",
              "title": "View Site",
              "url": "@{triggerBody()?['deploymentUrl']}"
            },
            {
              "type": "Action.OpenUrl",
              "title": "Approve Production Deployment",
              "url": "@{uriComponent(triggerBody()?['approvalUrl'])}"
            },
            {
              "type": "Action.OpenUrl",
              "title": "Rollback Deployment",
              "url": "@{triggerBody()?['rollbackUrl']}"
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
