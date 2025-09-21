# AutomateOS Templates

This directory contains ready-to-use workflow templates for common automation scenarios.

## Available Templates

### 📢 Slack Notification Template
A workflow for sending notifications to Slack via webhooks.

### 📝 Notion Database Template
A workflow for creating entries in Notion databases with automated data.

---

## 📢 Slack Notification Template

### What it includes

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

### Template Details

- **File**: `examples/slack-notification.json`
- **Nodes**: 2 (Start + HTTP)
- **Edges**: 1 (Start → HTTP)
- **Method**: POST
- **Content-Type**: application/json

---

## 📝 Notion Database Template

### What it includes

- **Start Node**: Initiates the workflow
- **HTTP Node**: Pre-configured to create a new page in a Notion database with structured data
- **Authentication**: Built-in credential management for Notion integration tokens

### How to use

1. Click the "📝 Notion Template" button in the Canvas Toolbar
2. The template will load onto your canvas with pre-configured nodes
3. **Setup Required**: You need to configure your Notion integration and database

### Setting up Notion Integration

#### Step 1: Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "AutomateOS Integration")
4. Select the workspace you want to integrate with
5. Click "Submit"
6. **Copy the Integration Token** (starts with `secret_`) - you'll need this for AutomateOS

#### Step 2: Share Database with Integration

1. Open the Notion database you want to add entries to
2. Click "Share" in the top-right
3. Click "Invite" and search for your integration name
4. Give it "Can edit" permissions
5. **Copy the Database ID** from the URL (32-character string after the last slash)

#### Step 3: Configure AutomateOS Credential

1. In AutomateOS, select the Notion HTTP node (should be pre-selected)
2. In the Inspector panel, find the "Authentication (optional)" section
3. Click "+ Create new credential"
4. Enter credential name: `notion-integration-token` (this matches the template)
5. Enter your Notion integration token (the `secret_...` value from Step 1)
6. The credential will be encrypted and stored securely

#### Step 4: Configure Database ID

1. With the Notion node still selected
2. In the Body field, find the `YOUR_DATABASE_ID_HERE` placeholder
3. Replace it with your actual database ID from Step 2

### Database Structure

The template creates entries with these properties:

```json
{
  "Name": {
    "title": [{"text": {"content": "New Automated Entry"}}]
  },
  "Status": {
    "select": {"name": "In Progress"}
  },
  "Created": {
    "date": {"start": "2025-09-18"}
  }
}
```

**Important**: Your Notion database must have these exact property names and types:
- `Name` - Title field
- `Status` - Select field with "In Progress" as an option
- `Created` - Date field

### Customizing the Entry

You can modify the data being created by editing the Body field:

1. Select the Notion HTTP node
2. Edit the JSON in the Body field
3. Customize properties according to your database schema:

```json
{
  "parent": {
    "database_id": "YOUR_DATABASE_ID_HERE"
  },
  "properties": {
    "Name": {
      "title": [{"text": {"content": "Custom Entry Title"}}]
    },
    "Priority": {
      "select": {"name": "High"}
    },
    "Due Date": {
      "date": {"start": "2025-09-25"}
    },
    "Tags": {
      "multi_select": [
        {"name": "automation"},
        {"name": "workflow"}
      ]
    }
  }
}
```

### Running the Workflow

Once configured:

1. Click the "▶️ Run" button in the Run Panel
2. Check your Notion database for the new entry
3. Monitor the run logs for success/error feedback
4. Look for "HTTP POST api.notion.com responded with 200" in the logs

### Troubleshooting

#### Common Issues

**❌ "Integration not found" Error**
- Ensure you've shared the database with your integration
- Check that the database ID is correct (32-character string)

**❌ "Validation failed" Error**
- Verify your database has the required property names and types
- Check that select field options exist (e.g., "In Progress")

**❌ "Authentication failed" Error**
- Verify your integration token is correct and starts with `secret_`
- Ensure the credential was created successfully in AutomateOS

**❌ "Property not found" Error**
- Database properties are case-sensitive
- Ensure property names match exactly: `Name`, `Status`, `Created`

#### Testing Your Setup

You can test your Notion setup by:

1. Using a simple entry first:
```json
{
  "parent": {"database_id": "YOUR_DATABASE_ID_HERE"},
  "properties": {
    "Name": {"title": [{"text": {"content": "Test Entry"}}]}
  }
}
```

2. Gradually adding more properties as you verify they work

### Template Details

- **File**: `examples/notion-automation.json`
- **Nodes**: 2 (Start + HTTP)
- **Edges**: 1 (Start → Notion)
- **Method**: POST
- **Endpoint**: `https://api.notion.com/v1/pages`
- **Headers**:
  - `Content-Type: application/json`
  - `Notion-Version: 2022-06-28`
- **Authentication**: Integration token via credential system

### Security Features

- **Encrypted Storage**: Your Notion integration token is encrypted using AES-GCM
- **Masked Display**: Token values are masked in the UI (e.g., `secret_***********45`)
- **Export Safety**: Exported workflows contain only credential references, never actual tokens
- **Browser Security**: Tokens never appear in browser localStorage in plaintext

### Advanced Configuration

#### Multiple Databases

To use different databases, create multiple credentials:

1. Create credentials for each integration: `notion-database-1`, `notion-database-2`
2. Duplicate the template and configure each with different database IDs
3. Use meaningful names for your credentials to organize multiple integrations

#### Dynamic Content

You can make entries more dynamic by incorporating:

- Current timestamps: `"start": "2025-09-18"`
- Variable content based on external data
- Different entry types based on workflow triggers

This template provides a solid foundation for Notion database automation that you can extend based on your specific needs.
