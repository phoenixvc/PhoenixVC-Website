# Azure Logic Apps Documentation

This repository utilizes Azure Logic Apps for notification and automation workflows.

## Logic App Components

### 1. Teams Notification Logic App
**Name Pattern:** `[env]-[location]-la-phoenixvc`

Handles Microsoft Teams notifications for deployments.

#### Trigger:
- HTTP Webhook
- JSON payload with deployment information

#### Actions:
1. Parse JSON payload
2. Format adaptive card
3. Send Teams message
4. Handle response

#### Template Structure:
```json
{
"type": "message",
"attachments": [
  {
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "type": "AdaptiveCard",
      "body": [
        {
          "type": "TextBlock",
          "text": "{{title}}",
          "weight": "bolder",
          "size": "large"
        },
        {
          "type": "TextBlock",
          "text": "{{message}}",
          "wrap": true
        }
      ],
      "actions": [
        {
          "type": "Action.OpenUrl",
          "title": "View Deployment",
          "url": "{{deploymentUrl}}"
        }
      ],
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "version": "1.2"
    }
  }
]
}
```

### 2. GitHub Integration Logic App
**Name Pattern:** `[env]-[location]-la-github`

Handles GitHub workflow automation and notifications.

#### Features:
- Workflow dispatch triggers
- Status updates
- Issue management
- PR notifications

#### Configuration:
```json
{
"definition": {
  "triggers": {
    "manual": {
      "type": "Request",
      "kind": "Http",
      "inputs": {
        "schema": {
          "type": "object",
          "properties": {
            "repository": { "type": "string" },
            "workflow": { "type": "string" },
            "ref": { "type": "string" }
          },
          "required": ["repository", "workflow"]
        }
      }
    }
  }
}
}
```

## Security Configuration

### 1. Authentication
- Managed Identity integration
- RBAC role assignments
- API connection security

### 2. Authorization
```json
{
"swagger": {
  "securityDefinitions": {
    "AAD": {
      "type": "oauth2",
      "flow": "application",
      "scopes": {
        "user_impersonation": "impersonate your user account"
      }
    }
  }
}
}
```

## Monitoring and Diagnostics

### 1. Log Analytics Integration
```yaml
diagnosticSettings:
name: LogicAppDiagnostics
workspaceId: /subscriptions/.../workspaces/...
logs:
  - category: WorkflowRuntime
    enabled: true
```

### 2. Alert Configuration
```json
{
"alertRules": [
  {
    "name": "FailedRuns",
    "criteria": {
      "failureCount": 3,
      "windowSize": "PT15M"
    }
  }
]
}
```

## Best Practices

1. **Error Handling**
 - Implement retry policies
 - Configure timeout settings
 - Handle connection failures

2. **Performance Optimization**
 - Use concurrent branches
 - Implement caching
 - Optimize HTTP calls

3. **Maintenance**
 - Regular backup of definitions
 - Version control integration
 - Documentation updates

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**
 ```powershell
 # Test connection
 Test-AzLogicApp -ResourceGroupName "rg-name" -Name "logic-app-name"
 ```

2. **Authentication Failures**
 - Verify managed identity
 - Check RBAC assignments
 - Validate connection strings

3. **Webhook Issues**
 - Confirm URL accessibility
 - Verify payload format
 - Check response codes

## Additional Resources

- [Azure Logic Apps Documentation](https://docs.microsoft.com/azure/logic-apps)
- [Microsoft Teams Connectors](https://docs.microsoft.com/microsoftteams/platform/webhooks-and-connectors)
- [GitHub Actions Integration](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows)
