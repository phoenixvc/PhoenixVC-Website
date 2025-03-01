@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

// TODO: SECURITY IMPROVEMENT NEEDED
// Current setup uses a plain parameter for GitHub token. This should be replaced with KeyVault integration:
// 1. Create Azure KeyVault
// 2. Store GitHub token as a secret
// 3. Configure Logic App managed identity
// 4. Grant Logic App access to KeyVault
// 5. Update Logic App to reference token from KeyVault using:
//    reference: {
//      keyVault: { id: keyVaultId }
//      secretName: 'githubToken'
//    }
@secure()
param githubToken string

//
// Inline definition for the new Logic App (workflow)
// This Logic App receives the Teams adaptive card response along with an encoded GitHub token,
// then invokes the GitHub workflow dispatch endpoint after decoding the token.
//
var logicAppDefinitionText = '''
{
  "$schema": "https://schema.management.azure.com/schemas/2016-06-01/workflowdefinition.json",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "githubToken": {
      "type": "SecureString"
    }
  },
  "triggers": {
    "manual": {
      "type": "Request",
      "kind": "Http",
      "inputs": {
        "schema": {
          "type": "object",
          "properties": {
            "gitRepository": { "type": "string" },
            "workflowId": { "type": "string" },
            "ref": { "type": "string" },
            "inputs": { "type": "object" },
            "cardResponse": { "type": "string" },
            "encodedGitHubToken": { "type": "string" },
            "deploymentId": { "type": "string" },
            "artifactId": { "type": "string" },
            "runId": { "type": "string" },
            "environment": { "type": "string" },
            "approver": { "type": "string" },
            "teamsWebhookUrl": { "type": "string" }
          },
          "required": [
            "deploymentId",
            "artifactId",
            "runId",
            "teamsWebhookUrl",
            "gitRepository",
            "workflowId",
            "ref",
            "cardResponse",
            "encodedGitHubToken"
          ]
        }
      }
    }
  },
  "actions": {
    "Validate_Input": {
      "type": "Compose",
      "inputs": "@triggerBody()",
      "runAfter": {}
    },
    "Trigger_Production_Deployment": {
      "type": "Http",
      "inputs": {
        "method": "POST",
        "uri": "https://api.github.com/repos/@{triggerBody()?['gitRepository']}/actions/workflows/@{triggerBody()?['workflowId']}/dispatches",
        "uri": "https://api.github.com/repos/JustAGhosT/PhoenixVC-Modernized/actions/workflows/deploy-production.yml/dispatches",
        "headers": {
          "Authorization": "Bearer @{parameters('githubToken')}",
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        "body": {
          "ref": "main",
          "inputs": {
            "deploymentId": "@{triggerBody()?['deploymentId']}",
            "artifactId": "@{triggerBody()?['artifactId']}",
            "runId": "@{triggerBody()?['runId']}",
            "token": "@{base64(parameters('githubToken'))}"
          }
        }
      },
      "runAfter": {
        "Validate_Input": ["Succeeded"]
      }
    },
    "Send_Teams_Confirmation": {
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
          "themeColor": "0076D7",
          "summary": "Production Deployment Initiated",
          "sections": [
            {
              "activityTitle": "Production Deployment Started",
              "text": "The production deployment has been initiated based on approval from **@{triggerBody()?['approver']}**",
              "facts": [
                {
                  "name": "Deployment ID",
                  "value": "@{triggerBody()?['deploymentId']}"
                },
                {
                  "name": "Artifact ID",
                  "value": "@{triggerBody()?['artifactId']}"
                },
                {
                  "name": "Run ID",
                  "value": "@{triggerBody()?['runId']}"
                },
                {
                  "name": "Approved By",
                  "value": "@{triggerBody()?['approver']}"
                }
              ],
              "markdown": true
            }
          ]
        }
      },
      "runAfter": {
        "Trigger_Production_Deployment": ["Succeeded"]
      }
    },
    "Handle_Error": {
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
          "themeColor": "FF0000",
          "summary": "Production Deployment Error",
          "sections": [
            {
              "activityTitle": "⚠️ Production Deployment Failed",
              "text": "There was an error initiating the production deployment. Please check the logs and try again.",
              "facts": [
                {
                  "name": "Error Details",
                  "value": "@{actions('Trigger_Production_Deployment').outputs.body}"
                }
              ],
              "markdown": true
            }
          ]
        }
      },
      "runAfter": {
        "Trigger_Production_Deployment": ["Failed"]
      }
    }
  },
  "outputs": {}
}
'''

//
// Convert the inline string into a JSON object. This will error out with a clear message if the JSON is not valid.
//
var finalLogicAppDefinition = json(logicAppDefinitionText)

//
// Deploy the new Logic App resource using the final JSON definition.
//
resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  tags: tags
  properties: {
    state: 'Enabled'
    definition: finalLogicAppDefinition
    parameters: {
      githubToken: {
        value: githubToken
      }
    }
  }
}

output logicAppId string = logicApp.id
output logicAppName string = logicApp.name
