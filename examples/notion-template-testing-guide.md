# Manual Testing Guide: Notion Template

This guide walks you through manually testing the Notion Database Template to verify it works end-to-end with real Notion API integration.

## Quick Setup Checklist

### ✅ Prerequisites
- [ ] Active Notion account with a workspace
- [ ] AutomateOS running locally (`pnpm dev`)
- [ ] Access to create Notion integrations

### ✅ Notion Setup (5 minutes)
- [ ] Create Notion integration at https://www.notion.so/my-integrations
- [ ] Copy integration token (starts with `secret_`)
- [ ] Create or choose a database to test with
- [ ] Share database with your integration
- [ ] Copy database ID from URL

### ✅ AutomateOS Setup (2 minutes)
- [ ] Load Notion template in builder
- [ ] Create credential with your integration token
- [ ] Update database ID in HTTP node body
- [ ] Run workflow and verify success

---

## Step-by-Step Testing Instructions

### Step 1: Prepare Notion Database

1. **Create a test database** (or use existing):
   - Go to any Notion page
   - Type `/database` and select "Table - Full page"
   - Name it "AutomateOS Test Database"

2. **Configure required properties**:
   ```
   Name (Title) - already exists
   Status (Select) - add this property, create "In Progress" option
   Created (Date) - add this property
   ```

3. **Get the database ID**:
   - Open your database as a full page
   - Copy the 32-character ID from URL: `notion.so/your-workspace/DATABASE_ID?v=...`
   - Example: `12345678-1234-1234-1234-123456789012`

### Step 2: Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Configuration:
   ```
   Name: AutomateOS Test Integration
   Logo: (optional)
   Associated workspace: (select your workspace)
   ```
4. Click "Submit"
5. **COPY THE SECRET TOKEN** - looks like: `secret_123abc...xyz789`

### Step 3: Share Database with Integration

1. Open your test database
2. Click "Share" (top-right)
3. Click "Invite"
4. Search for "AutomateOS Test Integration"
5. Set permissions to "Can edit"
6. Click "Invite"

### Step 4: Test in AutomateOS

1. **Load the template**:
   ```
   1. Open AutomateOS at http://localhost:3000/builder
   2. Click "📝 Notion Template" button in toolbar
   3. Verify 2 nodes load: Start → Create Notion Page
   ```

2. **Create credential**:
   ```
   1. Select the "Create Notion Page" HTTP node
   2. In Inspector, find "Authentication (optional)"
   3. Click "+ Create new credential"
   4. Enter name: notion-integration-token
   5. Enter value: secret_123abc...xyz789 (your token)
   6. Verify it shows as masked: secret_***********789
   ```

3. **Configure database ID**:
   ```
   1. With HTTP node selected, find the Body field
   2. Replace "YOUR_DATABASE_ID_HERE" with your actual database ID
   3. Example result:
      "parent": {
        "database_id": "12345678-1234-1234-1234-123456789012"
      }
   ```

### Step 5: Run the Workflow

1. **Execute**:
   ```
   1. Click "▶️ Run" button in Run Panel
   2. Watch status change: Ready → Running → Succeeded
   3. Monitor logs for "HTTP POST api.notion.com responded with 200"
   ```

2. **Verify in Notion**:
   ```
   1. Go back to your Notion database
   2. Look for new entry: "New Automated Entry"
   3. Check properties:
      - Status: "In Progress"
      - Created: "2025-09-18"
   ```

---

## Expected Test Results

### ✅ Success Indicators

**In AutomateOS:**
- Run status shows "Succeeded (run-id)"
- Logs contain: `HTTP POST api.notion.com responded with 200`
- No error messages in logs

**In Notion:**
- New row appears in your database
- Entry has title "New Automated Entry"
- Status is set to "In Progress"
- Created date is "2025-09-18"

### ❌ Common Issues and Solutions

**"Authentication failed" Error:**
```
Issue: Integration token incorrect or expired
Solution: Double-check token starts with 'secret_' and copy/paste carefully
```

**"Integration not found" Error:**
```
Issue: Database not shared with integration
Solution: Re-share database and ensure integration has "Can edit" permissions
```

**"Validation failed for property Status" Error:**
```
Issue: Select property doesn't have "In Progress" option
Solution: Add "In Progress" as an option in your Status select property
```

**"Object not found" Error:**
```
Issue: Database ID incorrect
Solution: Verify database ID is 32 characters with hyphens in right positions
```

---

## Testing Variations

### Test 1: Modify Entry Content
1. Change the Body JSON:
   ```json
   {
     "parent": {"database_id": "YOUR_DATABASE_ID_HERE"},
     "properties": {
       "Name": {"title": [{"text": {"content": "Custom Test Entry"}}]},
       "Status": {"select": {"name": "In Progress"}},
       "Created": {"date": {"start": "2025-12-25"}}
     }
   }
   ```
2. Run workflow
3. Verify custom content appears in Notion

### Test 2: Test Error Handling
1. Change database ID to invalid value: `invalid-database-id`
2. Run workflow
3. Verify it shows "Failed" status with error logs

### Test 3: Test Credential Security
1. Export the workflow (Export button)
2. Open exported JSON
3. Verify token value doesn't appear - only `"credentialName": "notion-integration-token"`

---

## Validation Checklist

After testing, verify these security and functionality aspects:

### 🔒 Security Validation
- [ ] Credential token is masked in UI (secret_***********789)
- [ ] Export JSON contains only credentialName reference
- [ ] Browser localStorage doesn't contain plaintext token
- [ ] Re-importing workflow preserves credential reference

### ⚡ Functionality Validation
- [ ] Template loads correctly with 2 nodes
- [ ] Credential creation works through UI
- [ ] HTTP POST to api.notion.com succeeds (200 response)
- [ ] Database entry appears with correct data
- [ ] Run logs show step-by-step execution
- [ ] Error scenarios handled gracefully

### 🎯 Integration Validation
- [ ] Real Notion API integration works
- [ ] Database permissions work correctly
- [ ] Entry structure matches Notion requirements
- [ ] Workflow can be run multiple times successfully

---

## Advanced Testing

### Test Multiple Databases
1. Create second database with different schema
2. Create second credential: `notion-database-2`
3. Duplicate template and configure for second database
4. Run both workflows and verify they work independently

### Test Complex Properties
Update the Body to test more Notion property types:

```json
{
  "parent": {"database_id": "YOUR_DATABASE_ID_HERE"},
  "properties": {
    "Name": {"title": [{"text": {"content": "Advanced Test Entry"}}]},
    "Priority": {"select": {"name": "High"}},
    "Tags": {"multi_select": [{"name": "testing"}, {"name": "automation"}]},
    "Progress": {"number": 75},
    "Notes": {"rich_text": [{"text": {"content": "Created via AutomateOS workflow"}}]},
    "Due Date": {"date": {"start": "2025-09-25"}},
    "Completed": {"checkbox": false}
  }
}
```

This comprehensive testing ensures the Notion template works reliably for real-world automation scenarios.

---

## Troubleshooting Quick Reference

| Error Message | Likely Cause | Solution |
|---|---|---|
| "Authentication failed" | Wrong token | Re-copy integration token |
| "Integration not found" | Database not shared | Share database with integration |
| "Object not found" | Wrong database ID | Verify 32-character database ID |
| "Property not found" | Missing properties | Add required properties to database |
| "Validation failed" | Wrong property type | Check property types match JSON |
| "Network error" | Connection issues | Check internet and API status |

Need help? The full documentation with examples is in the main README.md file.