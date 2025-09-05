# AutomateOS — API Contract (Phase 1 Baseline)

This document defines the **core API endpoints** for AutomateOS v1 (Phase 1).  
Scope: workflows, runs, templates, credentials.  
Audience: frontend (`apps/dev-web`) and external clients.

---

## General Guidelines

- **Base URL**: `/api/v1`
- **Auth**: Not required in Phase 1 (local/dev). OAuth planned Phase 2.
- **Content-Type**: `application/json`
- **Errors**: Always `{ "error": { "code": string, "message": string } }`
- **IDs**: `uuid` or `snowflake` format

---

## Endpoints

### Workflows

- **POST /workflows**
  - Create a workflow
  - Body:
    ```json
    {
      "name": "My Workflow",
      "nodes": [ ... ],
      "edges": [ ... ]
    }
    ```
  - Returns: `{ "id": "uuid", "name": "My Workflow" }`

- **GET /workflows/:id**
  - Fetch a workflow by ID

- **PUT /workflows/:id**
  - Update workflow (nodes/edges)

- **DELETE /workflows/:id**
  - Remove workflow

---

### Runs

- **POST /runs**
  - Trigger execution of a workflow
  - Body:
    ```json
    {
      "workflowId": "uuid",
      "input": { "foo": "bar" }
    }
    ```
  - Returns: `{ "runId": "uuid", "status": "queued" }`

- **GET /runs/:id**
  - Get run status
  - Returns:
    ```json
    {
      "id": "uuid",
      "status": "running",
      "logs": ["step1 ok", "step2 failed"]
    }
    ```

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
