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
            "approvalUrl": { "type": "string" }
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
    "Initialize_Error_Variable": {
      "type": "InitializeVariable",
      "inputs": {
        "variables": [
          {
            "name": "ErrorMessage",
            "type": "string",
            "value": ""
          }
        ]
      },
      "runAfter": {}
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
              "@type": "MessageCard",
              "@context": "http://schema.org/extensions",
              "summary": "@{coalesce(triggerBody()?['title'], 'Deployment Notification')}",
              "themeColor": "@{if(empty(triggerBody()?['color']), '0076D7', replace(triggerBody()?['color'], '#', ''))}",
              "title": "@{coalesce(triggerBody()?['title'], 'Deployment Notification')}",
              "text": "The PhoenixVC Website deployment to the **@{toUpper(triggerBody()?['environment'])}** environment has completed successfully. Please review the deployment and take any necessary actions.",
              "sections": [
                {
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
                      "value": "@{coalesce(triggerBody()?['version'], 'N/A')}"
                    },
                    {
                      "name": "Author",
                      "value": "@{coalesce(triggerBody()?['author'], 'N/A')}"
                    },
                    {
                      "name": "Repository",
                      "value": "@{coalesce(triggerBody()?['repository'], 'N/A')}"
                    },
                    {
                      "name": "PR Description",
                      "value": "@{coalesce(triggerBody()?['pr_description'], 'N/A')}"
}
                  ]
                }
              ],
              "potentialAction": [
                {
                  "@type": "OpenUri",
                  "name": "View Deployment",
                  "targets": [
                    {
                      "os": "default",
                      "uri": "@{triggerBody()?['deploymentUrl']}"
                    }
                  ]
                },
                {
                  "@type": "ActionCard",
                  "name": "Approve Production Deployment",
                  "inputs": [
                    {
                      "@type": "TextInput",
                      "id": "comment",
                      "title": "Comment",
                      "isMultiline": false,
                      "isRequired": false
                    }
                  ],
                  "actions": [
                    {
                      "@type": "HttpPOST",
                      "name": "Approve",
                      "target": "@{coalesce(triggerBody()?['approvalUrl'], '')}",
                      "body": {
                        "deploymentId": "@{coalesce(triggerBody()?['deploymentId'], '')}",
                        "artifactId": "@{coalesce(triggerBody()?['artifactId'], '')}",
                        "runId": "@{coalesce(triggerBody()?['runId'], '')}",
                        "approver": "{{comment.value}}",
                        "teamsWebhookUrl": "@{triggerBody()?['teamsWebhookUrl']}"
                      }
                    }
                  ]
                },
                {
                  "@type": "OpenUri",
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
      "runAfter": {
        "Initialize_Error_Variable": ["Succeeded"]
      }
      },
    "Check_for_Errors": {
      "type": "If",
      "actions": {
              "Set_Error_Message": {
                "type": "SetVariable",
                "inputs": {
                  "name": "ErrorMessage",
            "value": "@{actions('Post_to_Teams')['error']['message']}"
                },
                "runAfter": {}
              }
            },
      "else": {
        "actions": {
          "Set_Success_Message": {
            "type": "SetVariable",
            "inputs": {
              "name": "ErrorMessage",
              "value": ""
            },
            "runAfter": {}
          }
        }
            },
      "expression": {
        "and": [
          {
            "equals": [
              "@actions('Post_to_Teams')['status']",
              "Failed"
            ]
          }
      ]
    },
      "runAfter": {
        "Post_to_Teams": ["Succeeded", "Failed", "TimedOut", "Skipped"]
      }
        },
    "Return_Response": {
      "type": "Response",
      "kind": "Http",
      "inputs": {
        "statusCode": 200,
        "body": {
          "message": "Teams notification processing complete",
          "error": "@variables('ErrorMessage')"
        },
        "headers": {
          "Content-Type": "application/json"
      }
      },
      "runAfter": {
        "Check_for_Errors": ["Succeeded"]
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
