# Teams Webhook Testing Tools

This directory contains tools for testing Microsoft Teams webhooks.

## Files

- `teams-payload.json` - Sample payload for testing Teams webhook
- `test-teams-webhook.ps1` - PowerShell script for testing
- `test-teams-webhook.sh` - Bash script for testing (Unix/Linux/macOS)

## Usage

### Using npm scripts (recommended)

The easiest way to run the tests is using the npm scripts defined in the root package.json:

```bash
# For Windows users
npm run test:teamswebhook

# For Unix/Linux/macOS users
npm run test:teamswebhook:bash
```

### PowerShell (Windows)

```powershell
# Using the default payload file in the current directory
.\test-teams-webhook.ps1

# Specifying a custom payload file
.\test-teams-webhook.ps1 -PayloadFile "path\to\custom-payload.json"

# Specifying a webhook URL directly (overrides URL in payload)
.\test-teams-webhook.ps1 -WebhookUrl "https://your-webhook-url"
```

### Bash (Unix/Linux/macOS)

```bash
# Make the script executable
chmod +x test-teams-webhook.sh

# Using the default payload file in the current directory
./test-teams-webhook.sh

# Specifying a custom payload file
./test-teams-webhook.sh --payload path/to/custom-payload.json

# Specifying a webhook URL directly (overrides URL in payload)
./test-teams-webhook.sh --url "https://your-webhook-url"
```

## Troubleshooting

If you encounter errors:

1. Verify that the webhook URL is valid and active
2. Check that your JSON payload is properly formatted
3. Ensure you have network connectivity to the Microsoft Teams service
4. For bash script users, ensure you have `curl` installed
5. For advanced JSON parsing in bash, install `jq` for better results
