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
    "Prepare_Card_Actions": {
      "type": "Compose",
      "inputs": {
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "View Site",
            "url": "@{triggerBody()?['deploymentUrl']}"
          }
        ]
      },
      "runAfter": {}
    },
    "Add_Approval_Action_If_Present": {
      "type": "Compose",
      "inputs": {
        "actions": "@{if(not(empty(triggerBody()?['approvalUrl'])),
          union(outputs('Prepare_Card_Actions')?['actions'], array(createObject(
            'type', 'Action.OpenUrl',
            'title', 'Approve Production Deployment',
            'url', uriComponent(triggerBody()?['approvalUrl'])
          ))),
          outputs('Prepare_Card_Actions')?['actions']
        )}"
      },
      "runAfter": {
        "Prepare_Card_Actions": [ "Succeeded" ]
      }
    },
    "Add_Rollback_Action_If_Present": {
      "type": "Compose",
      "inputs": {
        "actions": "@{if(not(empty(triggerBody()?['rollbackUrl'])),
          union(outputs('Add_Approval_Action_If_Present')?['actions'], array(createObject(
            'type', 'Action.OpenUrl',
            'title', 'Rollback Deployment',
            'url', uriComponent(triggerBody()?['rollbackUrl'])
          ))),
          outputs('Add_Approval_Action_If_Present')?['actions']
        )}"
      },
      "runAfter": {
        "Add_Approval_Action_If_Present": [ "Succeeded" ]
      }
    },
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
          "actions": "@{outputs('Add_Rollback_Action_If_Present')?['actions']}"
        }
      },
      "runAfter": {
        "Add_Rollback_Action_If_Present": [ "Succeeded" ]
      }
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
