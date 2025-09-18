# Sprint 4 — Notion Integration Requirements

## Overview

This document provides detailed requirements for integrating **Notion API** into AutomateOS Sprint 4, replacing the original Google Sheets integration. Notion provides a simpler authentication model using Integration Tokens instead of OAuth, making it more suitable for testing and development.

## Why Notion over Google Sheets?

### Authentication Simplicity
- **Notion:** Uses simple Integration Token (Bearer token)
- **Google Sheets:** Requires OAuth 2.0 flow with service accounts or user consent
- **Testing:** Notion allows immediate testing without complex OAuth setup

### API Accessibility
- **Notion:** RESTful API with clear documentation
- **Popular Usage:** Widely adopted by development teams and productivity enthusiasts
- **Rich Features:** Supports databases, pages, blocks, and properties

## Notion API Integration Details

### Authentication Setup
1. **Create Integration:** Visit https://www.notion.so/my-integrations
2. **Get Token:** Copy the Internal Integration Token (starts with `secret_`)
3. **Share Database:** Share the target database/page with the integration

### API Capabilities
- **Create Pages:** Add new pages to databases
- **Update Properties:** Modify database entries
- **Query Databases:** Filter and sort database content
- **Rich Text Support:** Handle formatted text content

## Template Design: Notion Database Automation

### Workflow Structure
```
[Start Node] → [HTTP Request Node] → [End]
```

### Node Configuration

#### Start Node
- **Type:** `start_node`
- **Purpose:** Initialize workflow with payload data
- **Sample Payload:**
  ```json
  {
    "title": "New Task",
    "status": "To Do",
    "priority": "High",
    "dueDate": "2024-01-15"
  }
  ```

#### HTTP Request Node
- **Type:** `http_request_node`
- **Method:** `POST`
- **URL:** `https://api.notion.com/v1/pages`
- **Headers:**
  - `Authorization: Bearer {{getCredential('notionToken')}}`
  - `Content-Type: application/json`
  - `Notion-Version: 2022-06-28`

#### Request Body Structure
```json
{
  "parent": {
    "database_id": "{{databaseId}}"
  },
  "properties": {
    "Name": {
      "title": [{"text": {"content": "{{payload.title}}"}}]
    },
    "Status": {
      "select": {"name": "{{payload.status}}"}
    },
    "Priority": {
      "select": {"name": "{{payload.priority}}"}
    },
    "Due Date": {
      "date": {"start": "{{payload.dueDate}}"}
    }
  }
}
```

## Template Use Cases

### 1. Task Management
- **Purpose:** Create new tasks in a Notion database
- **Data:** Title, status, priority, due date
- **Benefit:** Automated task creation from forms/webhooks

### 2. Content Management
- **Purpose:** Add new articles/posts to content database
- **Data:** Title, author, status, tags, content
- **Benefit:** Streamlined content workflow

### 3. Lead Tracking
- **Purpose:** Log new leads/contacts
- **Data:** Name, email, company, source, status
- **Benefit:** Automated CRM updates

### 4. Knowledge Base Updates
- **Purpose:** Add documentation entries
- **Data:** Title, category, content, author
- **Benefit:** Automated documentation workflow

## Technical Implementation

### Environment Variables
```env
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Template JSON Structure
```json
{
  "name": "Notion Database Automation",
  "description": "Create a new page in a Notion database",
  "nodes": [
    {
      "id": "start-1",
      "type": "start_node",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Start",
        "config": {}
      }
    },
    {
      "id": "notion-1",
      "type": "http_request_node",
      "position": { "x": 300, "y": 100 },
      "data": {
        "label": "Create Notion Page",
        "config": {
          "method": "POST",
          "url": "https://api.notion.com/v1/pages",
          "headers": {
            "Authorization": "Bearer {{getCredential('notionToken')}}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
          },
          "json_body": {
            "parent": { "database_id": "{{databaseId}}" },
            "properties": {
              "Name": {
                "title": [{"text": {"content": "{{payload.title}}"}}]
              },
              "Status": {
                "select": {"name": "{{payload.status}}"}
              }
            }
          }
        }
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "start-1",
      "target": "notion-1"
    }
  ]
}
```

## Credential Management

### Storage Requirements
- **Security:** AES-GCM encryption in memory
- **Display:** Masked token (`secret_***...xyz`)
- **Injection:** Runtime credential substitution
- **Scope:** Session-only, never persisted

### Setup Instructions for Users
1. **Create Notion Integration:**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Name it "AutomateOS Integration"
   - Copy the Integration Token

2. **Setup Database:**
   - Create or open a Notion database
   - Copy the database ID from URL
   - Share database with the integration

3. **Configure AutomateOS:**
   - Open Credential Manager
   - Add credential named "notionToken"
   - Paste the Integration Token
   - Configure database ID in template

## Testing Scenarios

### Success Cases
- **Valid Token:** Creates page successfully (HTTP 200)
- **Valid Database:** Page appears in correct database
- **Property Mapping:** All properties set correctly

### Error Cases
- **Invalid Token:** HTTP 401 Unauthorized
- **Missing Database:** HTTP 404 Not Found
- **Invalid Properties:** HTTP 400 Bad Request
- **Rate Limiting:** HTTP 429 Too Many Requests

## Documentation Requirements

### User Guide Sections
1. **Notion Setup:** Step-by-step integration creation
2. **Database Configuration:** How to share databases
3. **Template Usage:** Loading and customizing the template
4. **Troubleshooting:** Common errors and solutions

### Developer Notes
- **API Version:** Use `2022-06-28` for consistency
- **Rate Limits:** Notion has rate limits (~3 requests/second)
- **Property Types:** Support title, select, date, number, checkbox
- **Error Handling:** Parse Notion API error responses

## Implementation Files to Update

### Documentation
- `Sprint4-Requirement.md` - Replace Google Sheets sections
- `Sprint4-Implementation Plan.md` - Update template details
- `Sprint4-TechnicalBreakdown.md` - Modify implementation steps

### Code Files (Future Implementation)
- `examples/notion-automation.json` - Template definition
- `CanvasToolbar.tsx` - Add "Notion Template" button
- `.env.example` - Add NOTION_TOKEN variable

This comprehensive Notion integration provides a simpler, more accessible alternative to Google Sheets while maintaining the same core functionality for Sprint 4 testing and validation.