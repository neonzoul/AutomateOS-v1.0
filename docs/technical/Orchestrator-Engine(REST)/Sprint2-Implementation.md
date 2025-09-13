[GPT-5 Agent]

engineering-ready plan to **wire the Orchestrator → external Engine v0.1 (REST)** so a workflow like your “Stripe → Discord Bridge” runs end-to-end from the Builder UI.

aligning every decision with our v1 Core Requirements (separation of concerns, schema at boundaries), the Sprint-2 goal (“Workflows actually run”), and the Phase-1 roadmap/work-breakdown (REST now, gRPC later; Run API, run status, logs).  
Also respecting the UX guardrails (creator-first, never expose raw JSON to end-users; use toasts/inline errors).&#x20;

---

# Sprint-2 Implementation Plan — Orchestrator → Engine (REST)

## 0) Outcome (what “done” looks like)

- In **dev-web**, user clicks **Run** on the canvas; UI shows per-node status (running/success/fail) and minimal logs.
- **Orchestrator** compiles the canvas graph (nodes/edges) into an Engine-ready spec, posts it to Engine v0.1, and tracks status.
- **Engine** executes steps (e.g., HTTP POST) and returns step/run progress.
- **Gateway** exposes `POST /runs` & `GET /runs/:id` used by the UI.
- Round-trip E2E: **import → run → see status** passes. (Matches Objective-1 “builder runs via engine”).&#x20;

---

## 1) Contracts (MVP)

### 1.1 API-Gateway (BFF) — public to UI

```
POST /v1/runs
Body: {
  "graph": { "nodes": [...], "edges": [...] },   // validated WorkflowSchema
  "inputs": { ... },                              // optional user inputs
  "idempotencyKey": "uuid"                        // optional
}
→ 201 { "runId": "run_abc" }

GET /v1/runs/:id
→ 200 {
  "id": "run_abc",
  "status": "queued|running|succeeded|failed",
  "steps": [
    { "id":"s1","nodeId":"start","status":"succeeded","durationMs":3 },
    { "id":"s2","nodeId":"http_1","status":"running" }
  ],
  "logs": [{ "ts":"...","level":"info","msg":"..." }]
}
```

(These mirror the baseline contracts we defined earlier and keep the UI simple.)&#x20;

### 1.2 Orchestrator → Engine v0.1 (REST)

```
POST  ENGINE_BASE/v1/execute
Body: {
  "runId": "run_abc",
  "dag": {
    "nodes": [
      { "id":"s1", "type":"start", "config":{} },
      { "id":"s2", "type":"http_request_node",
        "config": { "method":"POST","url":"...","headers":{...},"json_body":{...} },
        "deps": ["s1"]
      }
    ]
  },
  "env": { } // minimal in Phase 1
}
→ 202 { "engineRunId":"eng_123" }

GET   ENGINE_BASE/v1/runs/eng_123
→ 200 {
  "id":"eng_123",
  "status":"running|succeeded|failed",
  "steps":[
    {"id":"s1","status":"succeeded","durationMs":2},
    {"id":"s2","status":"running"}
  ],
  "logs":[{"ts":"...","level":"info","msg":"HTTP 200"}]
}
```

_Rationale:_ Engine remains independent, REST now; later we can swap to gRPC without changing the UI contract. &#x20;

---

## 2) Data flow (sequence)

1. **UI (dev-web)** → `POST /v1/runs` with the builder graph.
2. **Gateway** validates with `WorkflowSchema`, creates `run` row (`status=queued`), forwards to **Orchestrator**.
3. **Orchestrator** compiles graph → DAG (topo-order; attach deps), posts to **Engine /v1/execute**, stores `engineRunId`, sets `status=running`.
4. **UI** polls `GET /v1/runs/:id` every 1–2s. **Orchestrator** polls Engine `/runs/:engId` and updates our DB (`steps`, `logs`, `status`).
5. On completion, **UI** shows success/fail badges on nodes; RunPanel displays short logs.

(Responsibilities split per our structural requirements.) &#x20;

---

## 3) Orchestrator: tasks & code scaffolding

### 3.1 DAG compiler (TS)

- Input: validated `WorkflowSchema` JSON from gateway.
- Output: Engine DAG: array of steps with `id`, `type`, `config`, `deps`.
- Rules:
  - **Topological sort** edges; Start has no deps.
  - Map node types:
    - `start` → `{type:"start"}`
    - `http` (UI) → `http_request_node` (engine) with `{method,url,headers,json_body}`.

  - Validate each node config again with node-level Zod (defense in depth).

- File: `services/orchestrator/src/compile/compileDag.ts`

```ts
export function compileDag(graph: WorkflowJson): EngineDag {
  // 1) validate workflow shape (already done at gateway, but re-check)
  // 2) index nodes, build adjacency, topo-sort
  // 3) map each to engine step type/config
}
```

### 3.2 Engine REST client (TS)

- File: `packages/sdk-engine/src/client.ts`

```ts
export class EngineClient {
  constructor(private baseURL: string, private fetchImpl = fetch) {}
  async execute(req: ExecuteRequest): Promise<{engineRunId:string}> { ... }
  async getRun(engineRunId: string): Promise<EngineRunStatus> { ... }
}
```

- Use **timeouts**, **retry with backoff** for `getRun`.
- Add `x-idempotency-key` header (if provided) to `POST /v1/execute`.
  (REST client in a shared package keeps orchestrator slim and swappable.)&#x20;

### 3.3 Orchestrator run loop

- File: `services/orchestrator/src/runs/runService.ts`

```ts
export async function startRun(runId: string, graph: WorkflowJson) {
  const dag = compileDag(graph);
  const { engineRunId } = await engineClient.execute({ runId, dag, env: {} });
  await runsRepo.markRunning(runId, engineRunId);
  queue.enqueue({ kind: 'poll', runId, engineRunId }); // Redis delayed job
}
export async function pollRun(engineRunId: string, runId: string) {
  const s = await engineClient.getRun(engineRunId);
  await runsRepo.upsertSteps(runId, s.steps);
  await runsRepo.appendLogs(runId, s.logs);
  if (s.status === 'running')
    return queue.enqueue(
      { kind: 'poll', runId, engineRunId },
      { delayMs: 1000 }
    );
  await runsRepo.setStatus(runId, s.status);
}
```

- Use Redis for the simple polling queue (Phase-1). DLQ not required yet but easy to add later.&#x20;

---

## 4) API-Gateway: endpoints

- File: `services/api-gateway/src/routes/runs.ts`

```ts
app.post('/v1/runs', zValidator(WorkflowSchema), async (req, rep) => {
  const { graph, inputs, idempotencyKey } = req.body;
  const runId = await runsRepo.create({
    status: 'queued',
    graph,
    inputs,
    idem: idempotencyKey,
  });
  await orchestrator.startRun(runId, graph);
  return rep.code(201).send({ runId });
});

app.get('/v1/runs/:id', async (req, rep) => {
  const run = await runsRepo.get(req.params.id);
  return run; // includes steps + logs
});
```

- **Zod at boundaries**, **no plaintext secrets in logs**, **idempotency** supported—matches our security & quality guardrails. &#x20;

---

## 5) Engine v0.1 (Python, REST) — minimal spec

- Endpoint `POST /v1/execute` accepts DAG; returns `engineRunId`.
- It executes steps sequentially by deps (MVP), supporting:
  - `start`
  - `http_request_node` → executes `requests.request(method, url, headers, json=body)`

- Persists an in-memory status table keyed by `engineRunId`.
- Endpoint `GET /v1/runs/:id` returns status, step statuses, and most recent logs.

(Engine stays independent; Dockerized and composed locally.)&#x20;

---

## 6) UI (dev-web) changes

- **Run** button → `POST /v1/runs` with current graph from store (we already export/import; reuse the same graph shape).
- Poll `GET /v1/runs/:id` every 1–2s; set node **badges** (running/success/fail) and show RunPanel with step list + short logs.
- **Toasts** for run start/failure; keep **inline** errors if schema invalid (use what we added for Day-4 forms).
  (UX: “just works”, one-click, no raw JSON surfaced.) &#x20;

---

## 7) Docker compose (local dev)

Add **engine**, **orchestrator**, **gateway**, **redis**, **postgres** in `docker-compose.dev.yml`. Engine exposes `8081`, gateway `8080`.

```yaml
services:
  engine:
    build: ./external/engine
    ports: ['8081:8081']
  orchestrator:
    build: ./services/orchestrator
    environment:
      ENGINE_BASE: http://engine:8081
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgres://...
    depends_on: [engine, redis, db]
  gateway:
    build: ./services/api-gateway
    ports: ['8080:8080']
    depends_on: [orchestrator, db]
  redis:
    image: redis:7
  db:
    image: postgres:15
```

---

## 8) Security & logging (Phase-1)

- **Secrets:** inline/env only; never log request bodies that may contain secrets (HTTP node headers/body). Mask sensitive header keys (`authorization`, `x-api-key`).&#x20;
- **Logs:** include `request_id` & `run_id` in gateway/orchestrator; append-only run logs.&#x20;
- **Idempotency:** accept `idempotencyKey` on `/v1/runs` and pass to Engine; de-dupe if we see the same key within N minutes.&#x20;

---

## 9) Tests (add now)

**Unit**

- DAG compiler: maps `http` → `http_request_node`; topological order; dep wiring.
- Engine client: happy path + timeouts + retries.
- Gateway `/v1/runs`: rejects invalid graphs via `WorkflowSchema`.

**Integration**

- Orchestrator posts Engine, stores `engineRunId`, polls until terminal state, persists step statuses & logs.

**E2E (Playwright)**

- Import small graph (Start → HTTP).
- Click **Run** → node badges update → final status `succeeded`.
- Assert logs contain HTTP 200.
  (“import → run → status OK” is explicitly called out for Objective-1.)&#x20;

---

## 10) Your example: “Stripe → Discord Bridge”

Given your JSON:

```json
{
  "name": "Stripe to Discord Bridge",
  "definition": {
    "steps": [
      {
        "type": "http_request_node",
        "config": {
          "method": "POST",
          "url": "https://discord.com/api/webhooks/xxx/yyy",
          "headers": { "Content-Type": "application/json" },
          "json_body": {
            "content": "🎉 New Sale! A payment of $10.00 was just successfully processed."
          }
        }
      }
    ]
  }
}
```

- In **Builder**, this is simply a **Start → HTTP** graph (the compiler will translate the `http` node to `http_request_node` for Engine).
- **Engine** executes one step: HTTP POST to the Discord webhook.
- **UI** shows node success; a short log like `HTTP 204` from Discord (webhook accepts without content).
  This fits our MVP run-path exactly and demonstrates the “notify in Discord” starter workflow we planned.&#x20;

---

## 11) Task breakdown (assignable)

1. **Orchestrator**
   - `compileDag.ts` (topo sort + mapping) – 1–2d
   - `sdk-engine` client (execute/getRun + retries) – 0.5d
   - run service + polling queue (Redis) – 1–2d

2. **Gateway**
   - `/v1/runs` (validate, create run, delegate) & `/v1/runs/:id` – 0.5–1d

3. **Engine v0.1**
   - REST skeleton + in-memory run table; implement `http_request_node` – 1–2d

4. **UI (dev-web)**
   - Run button + polling + node badges + toasts – 1–1.5d

5. **E2E & Docs**
   - Playwright flow import→run→status, Quickstart doc – 0.5–1d

---

### Why this plan matches our pillars

- **Separation of concerns** (UI/Gateway/Orchestrator/Engine) & **shared schema at boundaries**.&#x20;
- **REST Engine now, gRPC later** with a clean client abstraction.&#x20;
- **Run Controller & status feedback** visible in UI (creator-first, “just works”). &#x20;
- **E2E import→run** as Objective-1 DoD.&#x20;

---

Below is a comprehensive, step‑by‑step implementation plan to **wire the orchestrator to the external Engine v0.1 (REST)** and enable end‑to‑end workflow execution—so your “Stripe → Discord Bridge” example will run directly from the builder.

## 🛠️ High‑Level Overview

1. **Define API contracts.** Add Gateway endpoints for creating and polling runs. Define how the orchestrator calls the engine.
2. **Implement the orchestrator’s DAG compiler and engine client.** Turn the builder’s node/edge graph into a step DAG, then call the engine via REST.
3. **Create Engine v0.1.** A minimal Python/Node service that executes HTTP‑request steps and tracks run status/logs.
4. **Wire up the UI.** Add a **Run** button, poll run status and show node badges/logs.
5. **Add tests and security/UX polish.** Ensure round‑trip import→run works and follow our no‑plaintext‑secrets, no raw JSON guidelines.

This plan aligns with the Phase‑1 technical roadmap: a REST‑based engine integration with schema validation, run status polling and one‑click execution. It also respects the UX guardrails (creator‑first, no raw JSON, clear feedback) and security themes (retries, idempotency, secret masking).

---

## 1. API Contracts

### 1.1 Public Gateway → UI

Expose these endpoints from `services/api-gateway`:

| Method | Path           | Body/Params                                                      | Result                       |
| ------ | -------------- | ---------------------------------------------------------------- | ---------------------------- |
| POST   | `/v1/runs`     | `{"graph":{nodes,edges}, "inputs":{}, "idempotencyKey": "uuid"}` | `201 {"runId":"run_abc"}`    |
| GET    | `/v1/runs/:id` | N/A                                                              | `200 {id,status,steps,logs}` |

- The gateway validates `graph` using `WorkflowSchema` to avoid invalid payloads.
- The `idempotencyKey` prevents duplicate runs if the user double‑clicks.
- The run record tracks status (`queued`, `running`, `succeeded`, `failed`), per‑step status, and logs.

### 1.2 Orchestrator → Engine

Define a stable contract for v0.1:

```
POST /v1/execute
Body: {
  "runId": "run_abc",
  "dag": {
    "nodes": [
      { "id":"s1", "type":"start", "config":{} },
      { "id":"s2", "type":"http_request_node",
        "config": { "method":"POST", "url":"...", "headers":{...}, "json_body":{...} },
        "deps": ["s1"]
      }
    ]
  },
  "env": {}
}
→ 202 {"engineRunId":"eng_xyz"}

GET /v1/runs/:engineRunId
→ {"id":"eng_xyz","status":"running","steps":[...],"logs":[...]}
```

Later versions can switch to gRPC without changing the builder, because we centralize all calls in an EngineClient.

---

## 2. Orchestrator Implementation

### 2.1 DAG compiler (`compileDag.ts`)

Convert the builder graph into an Engine DAG:

- **Topological sort** edges and map node types (`http` → `http_request_node`).
- Extract only relevant fields (`id`, `type`, `config`)—similar to the sanitization logic used in export.
- Validate each node’s config using Zod (defence in depth).
- Output: `{ nodes: [{id,type,config,deps: [...]}, …] }`.

### 2.2 Engine client

Create a small client in `packages/sdk-engine/src/client.ts`:

```ts
export class EngineClient {
  constructor(private baseURL: string) {}
  async execute(req: ExecuteRequest): Promise<{engineRunId:string}> { ... }
  async getRun(engineRunId: string): Promise<EngineRunStatus> { ... }
}
```

- Use `fetch` with timeouts and exponential backoff on retries.
- Attach optional `x-idempotency-key` header.

### 2.3 Orchestrator run service

Implement `startRun(runId, graph)`:

1. Call `compileDag(graph)`.
2. `await engineClient.execute({ runId, dag, env:{} })`.
3. Persist `engineRunId`, set run status to `running`.
4. Enqueue a polling job (e.g. with Redis or setTimeout) to `pollRun(engineRunId, runId)`.

`pollRun` should fetch engine status, update run’s steps/logs and status, and re‑queue itself until the run completes.

- Keep `clearUiState` behaviour for UI resets when appropriate.
- Handle retries and idempotency; never log secrets (mask headers like `Authorization`).

---

## 3. Engine v0.1

### 3.1 Execution service

A minimal Python or Node service under `external/engine`:

- Accepts DAG via `POST /v1/execute`.
- Stores runs in memory (`runId`, `status`, steps, logs).
- Sequentially executes steps (MVP) obeying dependencies:
  - `start` = no‑op.
  - `http_request_node` = use `requests`/`fetch` to call the specified URL, passing headers and JSON body; capture HTTP status/logs.

- Exposes `GET /v1/runs/:id` to return status and logs.

### 3.2 Considerations

- Keep secrets out of logs (mask headers or body fields).
- Later phases can add concurrency, retries, and DLQ.

---

## 4. UI (dev‑web)

### 4.1 Run button and status polling

- Add a **Run** button on the canvas header. On click:
  1. Serialize current graph (just like export).
  2. `POST /v1/runs` with the graph.
  3. Store returned `runId` and start polling `GET /v1/runs/:id`.

- Every second, update node badges:
  - Idle → Running → Success/Fail.
  - Display logs in a RunPanel.

- Use toasts for run started / succeeded / failed.

### 4.2 UX details

- Disable Run button if schema invalid (existing inline errors).
- Show a spinner or status indicator on run button while running.
- Keep “Import/Export” separate and still one‑click.
- Use the builder’s test helpers (window.\_\_getBuilderSnapshot) for Playwright E2E.

---

## 5. Example: Stripe → Discord Bridge

When you import a graph with a single HTTP node (like your JSON):

```json
{
  "nodes":[ { "id":"n1", "type":"start", "position":{…} },
            { "id":"n2", "type":"http",  "position":{…},
              "data":{ "config":{
                "method":"POST",
                "url":"https://discord.com/api/webhooks/xxx/yyy",
                "headers":{"Content-Type":"application/json"},
                "json_body":{"content":"🎉 New Sale! A payment of $10.00 was just successfully processed."}
              }}}
          ],
  "edges":[ { "id":"e1","source":"n1","target":"n2" } ]
}
```

The compiler will map it to two engine steps (`start`, `http_request_node`) with a dependency. Posting to `/v1/runs` runs the step; the Engine does the HTTP POST; the UI marks the node green on success, and you see a short log (“HTTP 204”).

---

## 6. Tests & Done Criteria

- **Unit tests:** DAG compiler mappings, engine client error handling.
- **Integration tests:** Orchestrator starts a run → engine receives → run status updated.
- **E2E tests:** Import a graph → click **Run** → see nodes turn green and logs appear.

Meeting these ensures your Sprint‑2 deliverable (“Workflows actually run”) is satisfied and paves the way for Phase‑1 Objective‑1.
