[gpt5]

# Sprint 4 — Implementation Plan (Junior-Friendly)

## Goals (what “done” looks like)

- `.env` loaded across UI, gateway, orchestrator, engine; secrets never committed.
- Orchestrator compiles a **real DAG** and the **Engine does real HTTP** (with masked headers).
- UI polls and shows **step list, per-node status, durations, and logs**.
- **Credential store** (AES-GCM, in-memory) + Inspector field; secrets never in export/localStorage/logs.
- **Notion template** available from toolbar.

---

# Day-by-Day Plan (exact edits + suggested commits)

## 1 — .env plumbing everywhere [x]

**Edits**

- `services/api-gateway/src/index.ts`: `import 'dotenv/config'` at top; read `process.env.ORCHESTRATOR_BASE`.
- `services/orchestrator/src/index.ts`: `import 'dotenv/config'`; ensure Engine base via `process.env.ENGINE_BASE`.
- `external/engine/server.js`: `import 'dotenv/config'`; use `process.env.PORT ?? 8082`.
- Root: add `.env.example`:
  ```
  NEXT_PUBLIC_API_BASE=http://localhost:8080
  ORCHESTRATOR_BASE=http://localhost:3002
  ENGINE_BASE=http://localhost:8082
  SLACK_WEBHOOK=
  NOTION_TOKEN=
  NEXT_PUBLIC_DEV_STORAGE=true

  ```
- `.gitignore`: ensure `.env` ignored.

**Commit**

```
chore(env): load .env in ui/gateway/orchestrator/engine + add .env.example

```

(Refs: env setup & docs expectations. )

---

## 2 — Orchestrator uses real DAG compiler [x]

**Edits**

- `services/orchestrator/src/index.ts`: replace `convertToEngineDag` with:
  ```tsx
  import { compileDag } from '@automateos/workflow-schema';
  // ...
  const dag = compileDag(body.graph);
  ```
- Remove/deprecate old converter; ensure each node has `deps` and mapped engine step types.

**Commit**

```
feat(orchestrator): compileDag() replaces convertToEngineDag for proper deps

```

(Refs: compile full DAG in orchestrator. )

---

## 3 — Engine: real HTTP (mask sensitive headers) [x]

**Edits**

- `external/engine/package.json`: add `"node-fetch": "^3.3.2"`.
- `external/engine/server.js`:
  ```jsx
  import fetch from 'node-fetch';
  // ...
  case 'http_request_node': {
    const { method='GET', url, headers={}, json_body } = node.config || {};
    const safeHeaders = {...headers}; // before logging
    const res = await fetch(url, {
      method, headers, body: json_body ? JSON.stringify(json_body) : undefined,
    });
    run.logs.push(logLine('info', `HTTP ${res.status} ${method} ${url}`));
    break;
  }

  ```
- Implement `maskValue`/header masking before any log line (mask `authorization`, `x-api-key`, etc).

**Commit**

```
feat(engine): real HTTP execution via node-fetch + sensitive header masking

```

(Refs: real HTTP + mask logs. )

---

## 4 — Run polling: steps, durations, logs [x]

**Edits**

- `apps/dev-web/src/builder/run/runActions.ts`:
  - Ensure `startRun()` sends full graph + **Idempotency-Key** header.
  - `pollRun()` parses `run.steps`/`run.logs`, updates `nodeRunStatuses[nodeId]`, stores `stepDurations[nodeId]=durationMs`, appends logs (with timestamp + severity), stop on terminal states.
- `apps/dev-web/src/builder/run/RunPanel.tsx`:
  - Add **Steps** section: list node label → status pill → duration (ms/s).
  - Keep existing status pill & logs; add a **Cancel** button stub to stop polling.

**Commit**

```
feat(run): normalize statuses, durations; show step list + logs; idempotent start

```

(Refs: status mapping + UI run panel. )

---

## 5 — Credential store (AES-GCM) + Inspector field [x]

**Edits**

- **New** `apps/dev-web/src/core/credentials.ts`:
  - Zustand store: `setCredential`, `getCredential`, `listCredentials` using `window.crypto.subtle` AES-GCM; store only cipher+iv+masked preview **in memory**.
- `apps/dev-web/src/builder/inspector/Inspector.tsx`:
  - Extend `HttpConfigSchema` to include optional `auth: { credentialName: string }`.
  - Add input for credential name; **do not** store secrets—only the name.
- **Run substitution (v1 option)**: in `startRun()` (client-side) look up secret with `getCredential(name)` and inject into outgoing request headers (e.g., `Authorization: Bearer ...`); do **not** log.

**Commit**

```
feat(credentials): AES-GCM in-memory store + Inspector credentialName field + run-time substitution

```

(Refs: Credential mgmt & injection. )

---

## 6 — Notion starter template + toolbar [x]

**Edits**

- **New** `examples/notion-automation.json` (POST create page in database; placeholders for DatabaseID, credential name).
- `apps/dev-web/src/builder/canvas/CanvasToolbar.tsx`: add **"Notion Template"** button → fetch file → validate with `WorkflowSchema` → `setGraph` + `clearUiState()`; toast helper text about Integration Token.

**Commit**

```
feat(examples): Notion template + toolbar loader

```

(Refs: second starter template. )

---

## 7 — Tests (unit)

**Edits**

- **Credentials**: vitest encrypt/decrypt round-trip; masked preview; ensure secret not in store JSON.
- **Engine HTTP**: mock `node-fetch`; assert method/url/headers/body; assert logs are masked.
- **Run pipeline**: mock gateway/orchestrator responses for `queued→running→succeeded/failed`; verify status map & durations.

**Commit**

```
test: credentials crypto; engine http; run status mapping + durations

```

(Refs: testing focus. )

---

## 8 — Component tests (UI)

**Edits**

- **RunPanel**: feed fake store with steps+durations; expect list + colors + logs.
- **Inspector (HTTP+auth)**: enter credential name → store updated; no secret visible.

**Commit**

```
test(ui): RunPanel steps/durations/logs; Inspector credentialName flow

```

---

## 9 — E2E smoke (Slack + Notion)

**Playwright**

- Load Slack template, set credential, **Run** → expect **200 POST** log line.
- Load Notion template, set Notion credential, **Run** → expect **200** log line.
- Ensure **no secrets** appear in exported JSON or localStorage.

**Commit**

```
test(e2e): Slack & Notion runs succeed; secrets never leak

```

---

## 10 — Docs + PR

**Docs**

- `docs/.env.md`: variable meanings & setup.
- Update `API-Contract.md` for `/v1/runs` (idempotency, statuses), log masking note.
- `docs/Demos/sprint4-demo.gif` (run flow with badges + logs).

**Commit**

```
docs: sprint4 env guide, run contract notes, demo gif

```

---

## PR Checklist (acceptance)

- [ ] `.env` loaded in all services; `.env.example` present; secrets ignored.
- [ ] Orchestrator uses `compileDag()`; Engine performs real HTTP; sensitive headers masked.
- [ ] UI: step list, statuses (queued/running/succeeded/failed), durations, logs, cancel stub.
- [ ] Credential store AES-GCM (in-memory); Inspector references credential by name; no secrets in export/localStorage/logs.
- [ ] Notion template loads from toolbar and runs.
- [ ] Unit + component + (optional) E2E tests green; CI passes.

---

## Risk & Guardrails

- **Do not** persist credentials to localStorage or exports; only encrypted in-memory during session.
- Log lines must **mask** secrets in headers/bodies at gateway/orchestrator/engine.
- Keep **backward compatibility** with existing Slack template & Import/Export JSON.

---
