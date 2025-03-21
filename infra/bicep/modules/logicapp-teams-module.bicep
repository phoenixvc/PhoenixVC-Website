@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

@description('URL for the approval Logic App that will be called when approval is requested')
param approvalLogicAppUrl string = ''

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
            "approvalLogicAppUrl": { "type": "string" },
            "deploymentId": { "type": "string" },
            "artifactId": { "type": "string" },
            "runId": { "type": "string" },
            "rollbackUrl": { "type": "string" },
            "version": { "type": "string" },
            "author": { "type": "string" },
            "repository": { "type": "string" },
            "pr_description": { "type": "string" },
            "deploymentId": { "type": "string" },
            "artifactId": { "type": "string" },
            "runId": { "type": "string" }
          },
          "required": [
            "teamsWebhookUrl",
            "locationCode",
            "resourceGroup",
            "environment",
            "branch",
            "message",
            "deploymentUrl",
            "approvalLogicAppUrl",
            "deploymentId",
            "artifactId",
            "runId"
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
          "text": "Deployment Notification",
          "summary": "@{coalesce(triggerBody()?['title'], 'Deployment Notification')}",
          "themeColor": "@{if(empty(triggerBody()?['color']), '0076D7', replace(triggerBody()?['color'], '#', ''))}",
          "sections": [
            {
              "activityTitle": "@{coalesce(triggerBody()?['title'], 'Deployment Notification')}",
              "activitySubtitle": "The PhoenixVC Website deployment to the **@{toUpper(triggerBody()?['environment'])}** environment has completed successfully. Please review the deployment and take any necessary actions.",
              "facts": [
                {
                  "name": "Status",
                  "value": "Deployment Complete"
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
                },
                {
                  "name": "Version",
                  "value": "@{triggerBody()?['version']}"
                },
                {
                  "name": "Author",
                  "value": "@{triggerBody()?['author']}"
                },
                {
                  "name": "Repository",
                  "value": "@{triggerBody()?['repository']}"
                },
                {
                  "name": "PR Description",
                  "value": "@{triggerBody()?['pr_description']}"
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
              "@@type": "ActionCard",
              "name": "Approve Production Deployment",
              "inputs": [
                {
                  "@@type": "TextInput",
                  "id": "comment",
                  "title": "Comment",
                  "isMultiline": false,
                  "isRequired": false
                }
              ],
              "actions": [
                {
                  "@@type": "HttpPOST",
                  "name": "Approve",
                  "target": "@{coalesce(triggerBody()?['approvalUrl'], '')}",
                  "body": {
                    "deploymentId": "@{coalesce(triggerBody()?['deploymentId'], '')}",
                    "artifactId": "@{coalesce(triggerBody()?['artifactId'], '')}",
                    "runId": "@{coalesce(triggerBody()?['runId'], '')}",
                    "approver": "@{inputs('comment')}",
                    "teamsWebhookUrl": "@{triggerBody()?['teamsWebhookUrl']}"
                  }
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
    },
    "Return_Response": {
      "type": "Response",
      "kind": "Http",
      "inputs": {
        "statusCode": 200,
        "body": {
          "message": "Teams notification sent successfully"
        },
        "headers": {
          "Content-Type": "application/json"
        }
      },
      "runAfter": {
        "Post_to_Teams": ["Succeeded"]
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
output logicAppUrl string = '${logicApp.properties.accessEndpoint}triggers/manual/invoke?api-version=2020-05-01-preview'
