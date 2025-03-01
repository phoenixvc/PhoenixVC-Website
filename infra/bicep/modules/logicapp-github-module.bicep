@description('Name of the Logic App')
param logicAppName string

@description('Location for the Logic App')
param location string = resourceGroup().location

@description('Tags for the Logic App')
param tags object = {}

//
// Inline definition for the new Logic App (workflow)
// This Logic App receives the Teams adaptive card response along with an encoded GitHub token,
// then invokes the GitHub workflow dispatch endpoint after decoding the token.
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
            "gitRepository": { "type": "string" },
            "workflowId": { "type": "string" },
            "ref": { "type": "string" },
            "inputs": { "type": "object" },
            "cardResponse": { "type": "string" },
            "encodedGitHubToken": { "type": "string" }
          },
          "required": [
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
    "Invoke_GitHub_Workflow": {
      "type": "Http",
      "inputs": {
        "method": "POST",
        "uri": "https://api.github.com/repos/@{triggerBody()?['gitRepository']}/actions/workflows/@{triggerBody()?['workflowId']}/dispatches",
        "headers": {
          "Accept": "application/vnd.github.v3+json",
          "Authorization": "Bearer @{base64ToString(triggerBody()?['encodedGitHubToken'])}"
        },
        "body": {
          "ref": "@{triggerBody()?['ref']}",
          "inputs": "@{triggerBody()?['inputs']}"
        }
      },
      "runAfter": {}
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
    // Optionally add a "kind" property if needed (e.g., kind: 'Stateful')
  }
}

output logicAppId string = logicApp.id
output logicAppName string = logicApp.name
