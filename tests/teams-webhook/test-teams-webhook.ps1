# Test script for Teams webhook
param(
    [Parameter(Mandatory = $false)]
    [string]$PayloadFile = ".\teams-payload.json",

    [Parameter(Mandatory = $false)]
    [string]$WebhookUrl = "",

    [Parameter(Mandatory = $false)]
    [switch]$SimpleTest = $false
)

# Display script banner
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   Teams Webhook Testing Script     " -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$defaultPayloadPath = Join-Path -Path $scriptDir -ChildPath "teams-payload.json"
$simplePayloadPath = Join-Path -Path $scriptDir -ChildPath "simple-payload.json"
$messageCardPayloadPath = Join-Path -Path $scriptDir -ChildPath "messagecard-payload.json"

# If simple test is requested, use the simple payload
if ($SimpleTest) {
    if (Test-Path $simplePayloadPath) {
        Write-Host "Simple test requested, using simple payload file" -ForegroundColor Yellow
        $PayloadFile = $simplePayloadPath
    }
    else {
        Write-Host "Simple payload file not found, creating a default one" -ForegroundColor Yellow
        $simplePayload = @{
            "teamsWebhookUrl" = $WebhookUrl
            "text"            = "Simple test message from PowerShell script"
        } | ConvertTo-Json
        Set-Content -Path $simplePayloadPath -Value $simplePayload
        $PayloadFile = $simplePayloadPath
    }
}
# If the provided payload file doesn't exist, try using the default one in the script directory
elseif (-not (Test-Path $PayloadFile) -and (Test-Path $defaultPayloadPath)) {
    Write-Host "Payload file not found at: $PayloadFile" -ForegroundColor Yellow
    Write-Host "Using default payload file from script directory: $defaultPayloadPath" -ForegroundColor Yellow
    $PayloadFile = $defaultPayloadPath
}

# Check if payload file exists
if (-not (Test-Path $PayloadFile)) {
    Write-Host "Error: Payload file not found: $PayloadFile" -ForegroundColor Red
    exit 1
}

# Read the payload content
$payloadContent = Get-Content $PayloadFile -Raw
Write-Host "Payload loaded successfully from: $PayloadFile" -ForegroundColor Green

# Parse the JSON to extract webhook URL if not provided
if (-not $WebhookUrl) {
    try {
        $payload = $payloadContent | ConvertFrom-Json

        # Try to get webhook URL from payload
        if ($payload.PSObject.Properties.Name -contains "teamsWebhookUrl") {
            $WebhookUrl = $payload.teamsWebhookUrl
            Write-Host "Using webhook URL from payload file" -ForegroundColor Yellow
        }

        if (-not $WebhookUrl) {
            Write-Host "Error: No webhook URL found in payload and none provided as parameter" -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "Error parsing JSON payload: $_" -ForegroundColor Red
        exit 1
    }
}

# Create a clean payload without the teamsWebhookUrl property for sending
try {
    $payloadObj = $payloadContent | ConvertFrom-Json
    if ($payloadObj.PSObject.Properties.Name -contains "teamsWebhookUrl") {
        $payloadObj.PSObject.Properties.Remove("teamsWebhookUrl")
    }
    $cleanPayloadContent = $payloadObj | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Warning: Could not remove teamsWebhookUrl from payload: $_" -ForegroundColor Yellow
    $cleanPayloadContent = $payloadContent
}

# Display webhook URL (partially masked for security)
$maskedUrl = $WebhookUrl
if ($WebhookUrl.Length -gt 60) {
    $maskedUrl = $WebhookUrl.Substring(0, 30) + "..." + $WebhookUrl.Substring($WebhookUrl.Length - 30)
}
Write-Host "Sending request to webhook: $maskedUrl" -ForegroundColor Yellow

# Send the request
try {
    Write-Host "Sending webhook request..." -ForegroundColor Yellow

    # If simple test is requested or we're using the simple payload file
    if ($SimpleTest -or $PayloadFile -eq $simplePayloadPath) {
        # Create a simple payload with just the text field
        $simplePayload = @{
            text = "Simple test message from PowerShell script"
        } | ConvertTo-Json

        Write-Host "Using simple text payload: $simplePayload" -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $WebhookUrl -Method Post -ContentType "application/json" -Body $simplePayload
        Write-Host "Simple test message sent successfully!" -ForegroundColor Green
    }
    # Otherwise use the full payload from file
    else {
        Write-Host "Using full payload from file (with teamsWebhookUrl removed)" -ForegroundColor Yellow
        Write-Host "Payload: $cleanPayloadContent" -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri $WebhookUrl -Method Post -ContentType "application/json" -Body $cleanPayloadContent
        Write-Host "Full payload sent successfully!" -ForegroundColor Green
    }

    # Display response if any
    if ($response) {
        Write-Host "Response: $response" -ForegroundColor Green
    }
    else {
        Write-Host "Request completed with no response body (this is normal for Teams webhooks)" -ForegroundColor Green
    }
}
catch {
    Write-Host "Error sending webhook request: $_" -ForegroundColor Red

    # Display more detailed error information
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Red

        # Try to get response body for more details
        try {
            $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $streamReader.ReadToEnd()
            $streamReader.Close()

            Write-Host "Error Response Body: $errorBody" -ForegroundColor Red
        }
        catch {
            Write-Host "Could not read error response body" -ForegroundColor Red
        }
    }

    exit 1
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   Test Completed Successfully      " -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
