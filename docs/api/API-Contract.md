# AutomateOS — API Contract v1.0 (Sprint 2 Final)

This document defines the **frozen API endpoints** for AutomateOS v1.0 Sprint 2.  
Scope: workflow execution via `/runs` endpoints (primary), basic workflow CRUD.  
Audience: frontend (`apps/dev-web`), orchestrator service, and external clients.

**Status**: 🔒 **FROZEN** for Sprint 2 delivery — schemas match implementation and tests.

---

## General Guidelines

- **Base URL**: `/api/v1` (dev-web) or `/v1` (api-gateway)
- **Auth**: Not required in Phase 1 (local/dev). OAuth planned Phase 2.
- **Content-Type**: `application/json`
- **Encoding**: UTF-8
- **HTTP Status Codes**:
  - `200` Success with body
  - `202` Accepted (async operations like run start)
  - `400` Bad Request (validation errors)
  - `404` Not Found
  - `500` Internal Server Error
- **Error Format**:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR|NOT_FOUND|INTERNAL_ERROR",
      "message": "Human-readable error description",
      "details": ["Additional context"],
      "requestId": "req_abc123"
    }
  }
  ```
- **IDs**: UUID v4 format for `runId`, `workflowId`
- **Timestamps**: ISO 8601 UTC format (e.g., `2025-09-13T10:30:00.000Z`)
- **Idempotency**: Supported via `Idempotency-Key` header (recommended for POST operations)

---

## Core Endpoints (Sprint 2 Focus)

### 🎯 Runs (Primary Implementation)

#### **POST /v1/runs**

Start workflow execution (either from a stored workflow or inline graph).

**Request Headers**:

```
Content-Type: application/json
Idempotency-Key: uuid (optional, recommended for safe retries)
```

**Request Body**:

```json
{
  "graph": {
    "nodes": [
      {
        "id": "start-1",
        "type": "start",
        "position": { "x": 100, "y": 100 },
        "data": { "config": {} }
      },
      {
        "id": "http-1",
        "type": "http",
        "position": { "x": 300, "y": 100 },
        "data": {
          "config": {
            "method": "POST",
            "url": "https://discord.com/api/webhooks/.../...",
            "headers": { "Content-Type": "application/json" },
            "body": "{\"content\": \"🎉 New Sale! A payment of $10.00 was just successfully processed.\"}"
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "start-1",
        "target": "http-1"
      }
    ]
  },
  "input": { "amount": 10.0, "currency": "USD" }
}
```

**Alternative Request (with stored workflow)**:

```json
{
  "workflowId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "input": { "amount": 10.0, "currency": "USD" }
}
```

**Validation Rules**:

- Either `graph` OR `workflowId` must be provided (not both)
- `graph.nodes` must contain exactly one node with `type: "start"`
- All `edge.source` and `edge.target` must reference existing node IDs
- Node configs validated against type-specific schemas (see `packages/workflow-schema`)

**Response (202 Accepted)**:

```json
{
  "runId": "run_01HXYZ123456789ABCDEF",
  "status": "queued"
}
```

**Error Examples**:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid workflow graph",
    "details": [
      "Node 'http-1' config.url must be a valid URL",
      "Edge references non-existent node 'missing-node'"
    ],
    "requestId": "req_abc123"
  }
}
```

#### **GET /v1/runs/:runId**

Retrieve run status, logs, and step details.

**Response (200 OK)**:

```json
{
  "id": "run_01HXYZ123456789ABCDEF",
  "status": "succeeded",
  "createdAt": "2025-09-13T10:30:00.000Z",
  "finishedAt": "2025-09-13T10:30:05.234Z",
  "logs": [
    {
      "ts": "2025-09-13T10:30:01.000Z",
      "level": "info",
      "msg": "Starting workflow execution",
      "nodeId": "start-1"
    },
    {
      "ts": "2025-09-13T10:30:03.500Z",
      "level": "info",
      "msg": "HTTP POST request completed successfully (200)",
      "nodeId": "http-1"
    }
  ],
  "steps": [
    {
      "id": "step_01",
      "nodeId": "start-1",
      "status": "succeeded",
      "durationMs": 15
    },
    {
      "id": "step_02",
      "nodeId": "http-1",
      "status": "succeeded",
      "durationMs": 1240
    }
  ]
}
```

**Status Values**:

- `queued`: Run accepted, waiting for execution
- `running`: Currently executing workflow steps
- `succeeded`: All steps completed successfully
- `failed`: At least one step failed

**404 Response**:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Run not found",
    "requestId": "req_def456"
  }
}
```

---

## Secondary Endpoints (Basic CRUD)

### Workflows

#### **POST /v1/workflows**

Create and store a workflow definition.

**Request**:

```json
{
  "name": "Discord Notification",
  "description": "Send notifications to Discord channel",
  "graph": {
    "nodes": [...],
    "edges": [...]
  },
  "tags": ["notification", "discord"]
}
```

**Response (201 Created)**:

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Discord Notification",
  "createdAt": "2025-09-13T10:30:00.000Z"
}
```

#### **GET /v1/workflows/:id**

Retrieve workflow definition.

#### **PUT /v1/workflows/:id**

Update workflow (replaces entire definition).

#### **DELETE /v1/workflows/:id**

Remove workflow.

---

## Worked Example: Discord Webhook Workflow

This example demonstrates the complete flow from workflow creation to execution.

### 1. Create Workflow

```bash
curl -X POST http://localhost:3000/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Discord Sale Alert",
    "graph": {
      "nodes": [
        {
          "id": "start-1",
          "type": "start",
          "position": { "x": 100, "y": 100 },
          "data": { "config": {} }
        },
        {
          "id": "http-1",
          "type": "http",
          "position": { "x": 300, "y": 100 },
          "data": {
            "config": {
              "method": "POST",
              "url": "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL",
              "headers": { "Content-Type": "application/json" },
              "body": "{\"content\": \"🎉 New Sale! Payment processed successfully.\"}"
            }
          }
        }
      ],
      "edges": [
        { "id": "edge-1", "source": "start-1", "target": "http-1" }
      ]
    }
  }'
```

### 2. Execute Workflow

```bash
curl -X POST http://localhost:3000/api/v1/runs \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "workflowId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "input": { "amount": 29.99, "product": "Premium Plan" }
  }'
```

### 3. Check Run Status

```bash
curl http://localhost:3000/api/v1/runs/run_01HXYZ123456789ABCDEF
```

### 4. Expected Flow

1. ✅ **POST returns `202`** with `runId`
2. ✅ **Engine executes** HTTP request to Discord
3. ✅ **GET shows `succeeded`** with step details and logs
4. ✅ **Discord channel** receives notification message

---

## Schema Validation

All requests are validated using Zod schemas from `@automateos/workflow-schema`:

- **StartRunRequestSchema**: Validates POST /v1/runs body
- **WorkflowSchema**: Validates graph structure and node configs
- **HttpConfigSchema**: Validates HTTP node configuration
- **StartConfigSchema**: Validates start node (empty object)

**Round-trip guarantee**: Import/export preserves identical workflow JSON.

---

## Rate Limiting & Security

- **Rate Limits**: Not enforced in Sprint 2 (dev/local only)
- **Authentication**: Not required in Sprint 2
- **Secrets**: Never stored in frontend; encrypted in backend
- **CORS**: Enabled for `http://localhost:3000` (dev-web)
- **Logging**: All requests include `requestId`; sensitive headers masked

---

## Testing Contract Compliance

API contract compliance is verified via:

1. **Unit tests**: `apps/dev-web/src/builder/run/api-contract.test.ts`
2. **Integration tests**: `test-api.js`, `dod-verification.js`
3. **E2E tests**: `apps/dev-web/e2e/builder.spec.ts`

All schemas match the implementation in `services/api-gateway` and `apps/dev-web/app/api`.

---

**Last Updated**: September 13, 2025 (Sprint 2 Final)  
**Next Review**: Phase 2 (OAuth, rate limiting, templates)

---

### Templates

- **POST /templates**
  - Publish a workflow as a template

- **GET /templates**
  - List templates

- **GET /templates/:id**
  - Fetch template details

- **POST /templates/:id/install**
  - Copy template into user workflows

---

### Credentials (minimal Phase 1)

- **POST /credentials**
  - Store an API key (encrypted)
  - Body:
    ```json
    { "name": "openai", "value": "sk-..." }
    ```

- **GET /credentials/:name**
  - Fetch credential (decrypted only at runtime)

---

## Notes

- **Round-trip safety**: Import/export must preserve identical workflow JSON.
- **Minimal secrets**: No secrets in frontend. Only stored encrypted in backend.
- **Run logs**: Immutable, append-only.

---
