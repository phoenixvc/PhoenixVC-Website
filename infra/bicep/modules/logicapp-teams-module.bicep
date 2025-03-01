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
          "@@type": "MessageCard",
          "@@context": "http://schema.org/extensions",
          "text": "@{triggerBody()?['message']}",
          "summary": "@{coalesce(triggerBody()?['title'], 'Deployment Notification')}",
          "themeColor": "@{if(empty(triggerBody()?['color']), '0076D7', replace(triggerBody()?['color'], '#', ''))}",
          "sections": [
            {
              "activityTitle": "@{coalesce(triggerBody()?['title'], 'Deployment Notification')}",
              "activitySubtitle": "The PhoenixVC Website deployment to the **@{toUpper(triggerBody()?['environment'])}** environment has completed successfully. Please review the deployment and take any necessary actions.",
              "facts": [
                {
                  "name": "Status",
                  "value": "@{triggerBody()?['environment']} Deployment Complete"
                },
                {
                  "name": "Environment",
                  "value": "@{triggerBody()?['environment']}"
                },
                {
                  "name": "Location",
                  "value": "@{triggerBody()?['locationCode']}"
                },
                {
                  "name": "Resource Group",
                  "value": "@{triggerBody()?['resourceGroup']}"
                },
                {
                  "name": "Branch",
                  "value": "@{triggerBody()?['branch']}"
                }
              ],
              "markdown": true
            }
          ],
          "potentialAction": [
            {
              "@@type": "OpenUri",
              "name": "View Deployment",
              "targets": [
                {
                  "os": "default",
                  "uri": "@{triggerBody()?['deploymentUrl']}"
                }
              ]
            },
            {
              "@@type": "OpenUri",
              "name": "Approve Production",
              "targets": [
                {
                  "os": "default",
                  "uri": "@{coalesce(triggerBody()?['approvalUrl'], '#')}"
                }
              ]
            },
            {
              "@@type": "OpenUri",
              "name": "Rollback Deployment",
              "targets": [
                {
                  "os": "default",
                  "uri": "@{coalesce(triggerBody()?['rollbackUrl'], '#')}"
                }
              ]
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
