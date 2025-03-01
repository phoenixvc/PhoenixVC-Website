@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

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
          "type": "message",
          "attachments": [
            {
              "contentType": "application/vnd.microsoft.card.adaptive",
              "content": {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "type": "AdaptiveCard",
                "version": "1.2",
                "body": [
                  {
                    "type": "TextBlock",
                    "text": "@{triggerBody()?['title']}",
                    "weight": "Bolder",
                    "size": "Large",
                    "color": "@{if(empty(triggerBody()?['color']), '#0076D7', triggerBody()?['color'])}"
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
                        "value": "@{toUpper(first(triggerBody()?['environment']))}@{toLower(substring(triggerBody()?['environment'], 1))}"
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
                        "title": "Branch",
                        "value": "@{triggerBody()?['branch']}"
                      },
                      {
                        "title": "Site URL",
                        "value": "@{triggerBody()?['deploymentUrl']}"
                      }
                    ]
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
                    "url": "@{if(empty(triggerBody()?['approvalUrl']), '#', triggerBody()?['approvalUrl'])}",
                    "style": "@{if(empty(triggerBody()?['approvalUrl']), 'default', 'positive')}",
                    "isEnabled": "@{not(empty(triggerBody()?['approvalUrl']))}"
                  },
                  {
                    "type": "Action.OpenUrl",
                    "title": "Rollback Deployment",
                    "url": "@{if(empty(triggerBody()?['rollbackUrl']), '#', triggerBody()?['rollbackUrl'])}",
                    "style": "@{if(empty(triggerBody()?['rollbackUrl']), 'default', 'destructive')}",
                    "isEnabled": "@{not(empty(triggerBody()?['rollbackUrl']))}"
                  }
                ]
              }
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

var finalLogicAppDefinition = json(logicAppDefinitionText)

resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: finalLogicAppDefinition
  }
}

output logicAppId string = logicApp.id
output logicAppName string = logicApp.name
