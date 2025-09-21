[GPT5 AGENT]

# Sprint 4 — Run Controller & Credentials

## Overview

**Goal:** Enable AutomateOS to run real integrations safely by introducing a Run Controller with live status feedback and secure credential handling. This sprint builds upon the foundations from Sprints 1–3 (schema‑driven inspector, import/export, localStorage persistence, basic run pipeline) to make workflows execute against real external APIs while protecting sensitive data and improving run UX.

**Strategic focus:** Credentials \+ run feedback \+ extensibility for future integrations. The system must handle API keys/tokens securely, provide clear run status and logs, and ship with an additional starter template. Optional stretch items include undo/redo & multi‑select actions, DB persistence with simple auth, and streaming run logs.

## Context & Motivation

The current state (merged Sprints 2–3) includes:

- A canvas with node registry, dynamic inspector forms and import/export features.

- A localStorage persistence mechanism for the graph (dev‑only)[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/core/state.ts#:~:text=%2F%2F%20%3D%3D%3D%20LocalStorage%20Persistence%20%3D%3D%3D,graph).

- A starter Slack Notification template demonstrating import/export[\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/examples/slack-notification.json#:~:text=,14T00%3A00%3A00.000Z%22).

- A run pipeline that posts a compiled graph to the API gateway (POST /v1/runs), which forwards to the orchestrator and minimal Engine v0.1; the UI polls /v1/runs/:id and updates badges and logs[\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts#:~:text=workflowJson%3A%20unknown%20%29%3A%20Promise,%3D%20useBuilderStore.getState).

- The engine currently uses deterministic mocks for HTTP requests (no real outbound calls)[\[4\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/external/engine/server.js#:~:text=switch%20%28node.type%29%20,node.config%3F.url%7D%60%20%29).

To deliver real value, we need to support **real HTTP integrations** (e.g., Slack and Notion APIs), handle **credentials** securely (never store secrets in exported JSON or localStorage), and improve **run feedback** (steps, logs, status). This sprint addresses those gaps.

## Scope & Constraints

- **No raw JSON exposed to users:** All configuration remains form‑driven as in prior sprints. Credentials should be entered via dedicated UI fields and masked when displayed.

- **Backward compatibility:** Existing import/export JSON and Slack template must continue working. The new features should not break current users.

- **Security by design:** Secrets must never leak in logs, exports, or localStorage. Use AES‑GCM encryption for in‑memory storage and mask headers in logs[\[5\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts#:~:text=import%20Fastify%20from%20%27fastify%27%3B%20import,from%20%27zod). Credentials should only live in memory or secure .env files on the server.

- **Developer convenience:** .env files should be loaded automatically for all services (UI, gateway, orchestrator, engine) in dev. The builder should still run against mocks when no engine/gateway is available.

- **Time‑boxed:** Focus on core run & credential features. Stretch items can be pulled if capacity permits.

## Functional Requirements

### 1 Run Controller & API Integration

1. **Compile and POST runs** – Update startRun() in apps/dev-web/src/builder/run/runActions.ts to send the fully compiled workflow graph (nodes, edges, configs) to the API gateway. Ensure each run includes a unique idempotency key and request ID[\[6\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts#:~:text=%2F%2F%20Generate%20idempotency%20key%20for,Math.random%28%29.toString%2836%29.substr%282%2C%209).

2. **Orchestrator enhancements** – In services/orchestrator:

3. Use compileDag(graph) from packages/workflow-schema to generate a proper Engine DAG, including deps array for each node.

4. Store run metadata (status, steps, logs, createdAt, updatedAt, idempotencyKey) in an in‑memory store; optionally persist to Postgres if time permits.

5. On run start, call engine.execute(runId, dag, env) via the Engine client; handle idempotency & retries.

6. Schedule polling using engine.getRun(engineRunId) until the run reaches succeeded or failed, updating per‑step status and logs[\[7\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/orchestrator/src/runService.ts#:~:text=async%20function%20pollOnce,runId%2C%20engineRunId).

7. **Engine upgrades** – Modify the minimal engine in external/engine so it can perform **real HTTP requests** when node type is http_request_node. Use node-fetch or axios inside engine. Respect the method, url, headers, and json_body fields in the config. Mask sensitive headers (Authorization, X-API-Key) in logs[\[4\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/external/engine/server.js#:~:text=switch%20%28node.type%29%20,node.config%3F.url%7D%60%20%29). Maintain backward compatibility with the Slack template.

8. **Polling & Run Status** – Enhance polling in runActions.ts to update nodeRunStatuses and append new logs to the store. Support exponential backoff with a maximum poll count【88516629508859†L166-L297】. Show human‑readable durations for each completed step.

9. **RunPanel UI** – Expand the run panel in RunPanel.tsx:

10. Display a list of steps with step IDs, friendly node names, statuses (queued, running, succeeded, failed) and durations.

11. Stream logs below the steps; each log entry should include a timestamp and severity (INFO/WARN/ERROR).

12. Provide a “Cancel” button stub that, for now, simply marks the run as cancelled and stops polling.

### 2 Credential Management

1. **Inline API key fields** – Extend the HTTP node inspector to allow users to specify API keys or tokens. For example, add a field Headers › Authorization with a masked input. Use Zod to validate key formats (non‑empty string). Display a masked preview (e.g., “sk_live…123”) and allow re‑entry.

2. **Credential store in UI** – Implement a useCredentialStore (Zustand) that stores credentials in memory (not localStorage). Provide methods:

3. setCredential(name: string, value: string, masterPassword?: string) – encrypts value using AES‑GCM; returns an ID.

4. getCredential(name: string): string | undefined – decrypts and returns the secret for runtime use.

5. listCredentials(): {name: string, maskedValue: string}\[\] – returns metadata for display (no secrets).  
   Use window.crypto.subtle for encryption. Ask the user for a master password once per session (optional advanced feature).

6. **Credential retrieval on run** – When compiling DAG, if a node references a credential (e.g., auth: { credential: 'slackWebhook' }), look up the value via getCredential and insert the secret into the engine config. Do this server‑side in the orchestrator if possible; otherwise securely embed on the client just before sending.

7. **Environment variables (.env)** – Use dotenv to load .env files for API Gateway, Orchestrator and Engine services. Document environment variables:

8. NEXT_PUBLIC_API_BASE for dev‑web to find the gateway.

9. ORCHESTRATOR_BASE for the gateway to find orchestrator.

10. ENGINE_BASE for orchestrator to find engine.

11. SLACK_WEBHOOK, NOTION_TOKEN for seeds (these should be optional; guide developers to set them for the starter workflows).

### 3 Seed Starter Workflow: Notion Database Automation

1. **Add a new file** in examples/notion-automation.json that defines a simple workflow: Start node → HTTP Request node calling Notion API to create a new page in a database. Use placeholders for Integration Token and Database ID. Example config:

- {
   "name": "Notion Database Automation",
   "definition": {
   "steps": \[
   {
   "type": "http_request_node",
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
       "title": \[{"text": {"content": "{{payload.title}}"}}\]
     },
     "Status": {
       "select": {"name": "{{payload.status}}"}
     }
   }
   }
   }
   }
   \]
   }
  }

2. **Load template** – Add a button in CanvasToolbar.tsx labelled "Notion Template". When clicked, fetch the JSON file, validate with WorkflowSchema and load nodes/edges into the graph. Display a toast confirming the load.

### 4 Developer Ergonomics & .env Support

1. **Load .env files** – Add dotenv imports at the top of services/api-gateway/index.ts, services/orchestrator/index.ts and external/engine/server.js so environment variables are loaded automatically. Use NEXT_PUBLIC_DEV_STORAGE flag to toggle localStorage persistence (already implemented)[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/core/state.ts#:~:text=%2F%2F%20%3D%3D%3D%20LocalStorage%20Persistence%20%3D%3D%3D,graph).

2. **Improve error messages** – Provide clear error messages when runs fail due to missing credentials, invalid API endpoints, or network errors. Surface these errors in the UI logs.

3. **CI pipeline updates** – Add tests for credential encryption/decryption and ensure no secrets are logged. Update Playwright tests to include the Notion starter workflow.

### 5 Stretch Goals (optional)

1. **Undo/Redo & Multi‑select** – Implement history stacks in core/state.ts capturing graph changes (add, move, delete nodes/edges). Provide undo() and redo() actions. Add keyboard shortcuts (Ctrl+Z / Ctrl+Y) and toolbar buttons. Multi‑select can be implemented by storing an array of selected node IDs and supporting group moves/deletes.

2. **DB Persistence & Simple Auth** – Add a /v1/workflows CRUD API in API‑Gateway (and a corresponding repository in Orchestrator) that stores named workflows in Postgres. Implement simple bearer‑token auth (hard‑coded token in .env for now). UI can save and load workflows by name.

3. **Run Log Streaming (SSE/WebSocket)** – Expose GET /v1/runs/:id/stream in API‑Gateway to stream run logs via Server‑Sent Events or WebSockets. Update runActions.ts to use an EventSource instead of polling. This will reduce latency and network overhead for long‑running workflows.

## Definition of Done

- **Run Pipeline:** Clicking **Run** posts a workflow to /v1/runs, which triggers orchestrator → engine → external API. Runs return real HTTP responses (e.g., Slack message posted, Notion page created). Node badges update from queued → running → success/fail. Logs show step details.

- **Secure Credential Handling:** Developers can input API keys in the inspector; these are stored encrypted in memory and not persisted to localStorage or exports. Node configs can reference credentials via {{getCredential('name')}}. Sensitive headers are masked in logs[\[5\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts#:~:text=import%20Fastify%20from%20%27fastify%27%3B%20import,from%20%27zod).

- **.env Support:** All services load environment variables from .env files automatically; devs can set NEXT_PUBLIC_API_BASE, SLACK_WEBHOOK, NOTION_TOKEN, etc., without changing code.

- **Notion Template:** A second starter workflow is available via toolbar; import/export round‑trip works; Slack template still works.

- **RunPanel Enhancements:** The run panel lists steps with statuses and durations, streams logs, and indicates when a run completes or fails. Cancel button stub exists.

- **Tests Updated:** Unit tests cover encryption/decryption, run controller behaviour with missing credentials, and orchestrator’s status mapping. Playwright E2E tests include the new template and confirm end‑to‑end execution.

- **Optional:** If implemented, history (undo/redo), DB persistence and SSE streaming are documented and tested.

## Suggested Timeline & Task Breakdown

| Task                              | Description                                                                                                    | Owner          | Est. Effort |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------- | :------------- | :---------- |
| Run controller enhancements       | Finalize compile graph → DAG; update run actions to call API gateway; update run panel with step list and logs | Senior dev     | 2d          |
| Engine HTTP integration           | Replace mock HTTP in engine with real network requests; handle headers/body; mask sensitive logs               | Backend dev    | 1d          |
| Credential store & encryption     | Implement credential store with AES‑GCM; add UI fields; integrate getCredential substitution                   | Full‑stack dev | 2d          |
| .env support                      | Add dotenv to all services; document variables; update docs                                                    | DevOps         | 0.5d        |
| Notion template                   | Create JSON file; add toolbar button; test loading                                                             | Frontend dev   | 0.5d        |
| Tests & CI                        | Add unit and E2E tests; update pipeline                                                                        | QA             | 1d          |
| Stretch: Undo/Redo & multi‑select | History stacks, keyboard shortcuts, UI updates                                                                 | Extra          | 2–3d        |
| Stretch: DB persistence & auth    | CRUD API, simple bearer auth, UI integration                                                                   | Extra          | 3–4d        |
| Stretch: Run log streaming        | SSE endpoint; EventSource in UI                                                                                | Extra          | 2d          |

This plan ensures Sprint 4 delivers real workflow execution with secure credentials and improved feedback, while leaving room for optional enhancements if time permits.

---

[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/core/state.ts#:~:text=%2F%2F%20%3D%3D%3D%20LocalStorage%20Persistence%20%3D%3D%3D,graph) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/core/state.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/core/state.ts)

[\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/examples/slack-notification.json#:~:text=,14T00%3A00%3A00.000Z%22) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/examples/slack-notification.json](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/examples/slack-notification.json)

[\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts#:~:text=workflowJson%3A%20unknown%20%29%3A%20Promise,%3D%20useBuilderStore.getState) [\[6\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts#:~:text=%2F%2F%20Generate%20idempotency%20key%20for,Math.random%28%29.toString%2836%29.substr%282%2C%209) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts)

[\[4\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/external/engine/server.js#:~:text=switch%20%28node.type%29%20,node.config%3F.url%7D%60%20%29) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/external/engine/server.js](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/external/engine/server.js)

[\[5\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts#:~:text=import%20Fastify%20from%20%27fastify%27%3B%20import,from%20%27zod) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts)

[\[7\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/orchestrator/src/runService.ts#:~:text=async%20function%20pollOnce,runId%2C%20engineRunId) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/orchestrator/src/runService.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/orchestrator/src/runService.ts)
