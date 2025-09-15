# Slack Notification Template

This template provides a ready-to-use workflow for sending notifications to Slack.

## What it includes

- **Start Node**: Initiates the workflow
- **HTTP Node**: Configured to send a POST request to a Slack webhook with a JSON message

## How to use

1. Click the "📢 Slack Template" button in the Canvas Toolbar
2. The template will load onto your canvas
3. **Important**: You must replace the placeholder webhook URL with your own Slack webhook URL

## Setting up a Slack Webhook

1. Go to your Slack workspace settings
2. Navigate to Apps & Integrations > Build > Incoming Webhooks
3. Create a new webhook for your desired channel
4. Copy the webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`)
5. In the AutomateOS builder, select the HTTP node and replace the URL in the configuration

## Message Configuration

The template comes with a JSON-formatted message in the Body field:

```json
{
  "text": "Hello from AutomateOS! 🤖\nThis message was sent via the Slack notification template."
}
```

You can customize this by:

1. Selecting the HTTP node
2. Editing the Body field in the Inspector
3. Modifying the JSON to include additional Slack formatting:
   ```json
   {
     "text": "Your custom message here",
     "channel": "#general",
     "username": "AutomateOS Bot",
     "icon_emoji": ":robot_face:"
   }
   ```

**Important**: Keep the Body field as valid JSON format for Slack webhook compatibility.

## Running the Workflow

Once you've configured your webhook URL:

1. Click the "▶️ Run" button in the Run Panel
2. Check your Slack channel for the notification
3. Monitor the run logs for success/error feedback

## Template Details

- **File**: `examples/slack-notification.json`
- **Nodes**: 2 (Start + HTTP)
- **Edges**: 1 (Start → HTTP)
- **Method**: POST
- **Content-Type**: application/json
