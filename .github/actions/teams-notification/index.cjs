const https = require('https');
const url = require('url');

try {
  // 1. Parse Inputs
  const webhookUrl = process.env.INPUT_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('Input required and not supplied: webhook_url');
  }

  const message = process.env.INPUT_MESSAGE || '';
  const title = process.env.INPUT_TITLE || 'Deployment Notification';
  const status = process.env.INPUT_STATUS || 'info'; // success, failure, info
  const environment = process.env.INPUT_ENVIRONMENT || 'Production';
  const deploymentUrl = process.env.INPUT_DEPLOYMENT_URL;
  const runId = process.env.INPUT_RUN_ID;
  const repo = process.env.GITHUB_REPOSITORY;
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';

  // Metadata inputs
  const version = process.env.INPUT_VERSION || 'N/A';
  const author = process.env.INPUT_AUTHOR || 'N/A';
  const branch = process.env.INPUT_BRANCH || 'N/A';

  // Determine Color and Status Text
  let themeColor = '0076D7'; // Default Blue
  let statusEmoji = 'ℹ️';

  if (status.toLowerCase() === 'success') {
    themeColor = '00A300'; // Green
    statusEmoji = '✅';
  } else if (status.toLowerCase() === 'failure') {
    themeColor = 'C50F1F'; // Red
    statusEmoji = '❌';
  }

  // 2. Construct Adaptive Card Payload
  const card = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              text: `${statusEmoji} ${title}`,
              weight: 'Bolder',
              size: 'Large',
              color: status.toLowerCase() === 'failure' ? 'Attention' : 'Default'
            },
            {
              type: 'TextBlock',
              text: message,
              wrap: true,
              spacing: 'Medium'
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Environment', value: environment },
                { title: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1) },
                { title: 'Version', value: version },
                { title: 'Branch', value: branch },
                { title: 'Author', value: author }
              ],
              spacing: 'Medium'
            }
          ],
          actions: []
        }
      }
    ]
  };

  // Add Actions (Buttons)
  if (deploymentUrl) {
    card.attachments[0].content.actions.push({
      type: 'Action.OpenUrl',
      title: 'View Deployment',
      url: deploymentUrl
    });
  }

  if (runId && repo) {
    const runUrl = `${serverUrl}/${repo}/actions/runs/${runId}`;
    card.attachments[0].content.actions.push({
      type: 'Action.OpenUrl',
      title: 'View Workflow Log',
      url: runUrl
    });
  }

  // 3. Send Request to Teams Webhook
  const requestOptions = url.parse(webhookUrl);
  requestOptions.method = 'POST';
  requestOptions.headers = {
    'Content-Type': 'application/json'
  };

  const req = https.request(requestOptions, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 202) { // 200 OK or 202 Accepted
        console.log('✅ Notification sent successfully to Teams.');
      } else {
        console.error(`❌ Failed to send notification. Status: ${res.statusCode}`);
        console.error('Response:', responseData);
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
    process.exit(1);
  });

  req.write(JSON.stringify(card));
  req.end();

} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
