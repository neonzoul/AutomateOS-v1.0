# Notion Template Debug Guide

Based on your error logs, I can see the issue: your Notion workflow is sending a GET request instead of POST to the Notion API.

## The Problem

Your logs show:
```
[INFO] http GET 400 https://api.notion.com/v1/pages 831ms
```

But it should show:
```
[INFO] http POST 200 https://api.notion.com/v1/pages
```

## Root Cause Analysis

The engine defaults to GET method when no method is specified:
```javascript
const { method = 'GET', url, headers = {}, json_body } = node.config || {};
```

This means your HTTP node's config is missing the `method: 'POST'` field.

## Quick Fix Steps

### Step 1: Check Current Node Configuration

1. In AutomateOS builder, select the "Create Notion Page" HTTP node
2. In the Inspector panel, check that Method shows "POST" not "GET"
3. If it shows "GET", change it to "POST"

### Step 2: Verify the Complete Configuration

Your HTTP node should have these exact settings:

**Method:** POST
**URL:** https://api.notion.com/v1/pages
**Headers:** (should show Content-Type and Notion-Version)
**Body:** (should contain your JSON with database_id)
**Authentication:** notion-integration-token (masked)

### Step 3: Re-test

1. Save the configuration
2. Run the workflow again
3. Check logs show `HTTP POST` not `HTTP GET`

## Manual Verification

If you're still having issues, try this test:

### Option A: Create Fresh HTTP Node

1. Delete the current HTTP node
2. Add a new HTTP node manually
3. Configure it with:
   - Method: POST
   - URL: https://api.notion.com/v1/pages
   - Headers: Content-Type: application/json, Notion-Version: 2022-06-28
   - Body: Your JSON payload
   - Auth: Your credential

### Option B: Export and Check JSON

1. Export your workflow (Export button)
2. Open the JSON file
3. Look for the HTTP node config:

```json
{
  "id": "notion-1",
  "type": "http",
  "data": {
    "config": {
      "method": "POST",  // ← This should be "POST" not missing
      "url": "https://api.notion.com/v1/pages",
      "headers": {
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      // ... rest of config
    }
  }
}
```

## Database ID Format Check

Your database ID `2720613ba14080f093c7fa528ef392c6` looks correct (32 characters), but make sure:

1. **No Hyphens**: Notion database IDs don't have hyphens in the API
2. **From Database URL**: Get it from the database page URL, not the view URL
3. **Replace Placeholder**: Make sure you replaced `YOUR_DATABASE_ID_HERE` in the Body

Example Body should look like:
```json
{
  "parent": {
    "database_id": "2720613ba14080f093c7fa528ef392c6"
  },
  "properties": {
    "Name": {"title": [{"text": {"content": "New Automated Entry"}}]},
    "Status": {"select": {"name": "In Progress"}},
    "Created": {"date": {"start": "2025-09-18"}}
  }
}
```

## Expected Success Logs

When working correctly, you should see:
```
[INFO] Starting run (attempt 1/5)
[INFO] step start-1 start start
[INFO] step start-1 done
[INFO] step notion-1 start http
[INFO] HTTP POST https://api.notion.com/v1/pages (headers: {...})
[INFO] http request body sent: json keys=['parent', 'properties']
[INFO] HTTP 201 POST https://api.notion.com/v1/pages 500ms
[INFO] Response: 201 Created
[INFO] step notion-1 done
```

The key differences:
- `HTTP POST` not `HTTP GET`
- `201 Created` not `400 Bad Request`
- No error response in logs

## Next Steps

1. **Fix the method**: Make sure HTTP node method is set to POST
2. **Re-run**: Test the workflow again
3. **Check Notion**: Verify the entry appears in your database
4. **Report back**: Let me know if you still get GET in the logs

The credential injection is working fine (I can see your token in the logs), so once we fix the HTTP method, it should work perfectly!