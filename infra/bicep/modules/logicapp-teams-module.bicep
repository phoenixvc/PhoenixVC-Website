@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

var logicAppDefinitionText = '''
{
  // Previous schema and trigger setup remain the same...
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
          "themeColor": "@{if(empty(triggerBody()?['color']), '0076D7', replace(triggerBody()?['color'], '#', ''))}",
          "summary": "@{coalesce(triggerBody()?['title'], 'Deployment Notification')}",
          "sections": [
            {
              "activityTitle": "@{coalesce(triggerBody()?['title'], 'Deployment Complete')}",
              "text": "The deployment to the **@{toUpper(triggerBody()?['environment'])}** environment has completed successfully. Please review the deployment and take any necessary actions.",
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
            }
          ]
        }
      },
      "runAfter": {}
    }
  }
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
