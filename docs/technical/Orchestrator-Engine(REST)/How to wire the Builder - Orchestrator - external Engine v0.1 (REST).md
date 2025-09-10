[GPT-5 Agent]

this so clear that a new dev can land on the repo and wire the Builder → Orchestrator → external **Engine v0.1 (REST)** in a single sitting.

Below you’ll find:

1. system flow (what talks to what),
2. API contracts,
3. where files live (exact paths),
4. code skeletons (copy-pasteable stubs),
5. runbook (how to run locally),
6. tests you must add, and
7. security/UX guardrails.

This is aligned with our v1 core requirements (separation of concerns, schema at boundaries, Docker-first), sprint plan (Sprint-2 “Workflows actually run”), and the Phase-1 technical roadmap (REST engine now, gRPC later).  
Also strict about “creator-first, never show raw JSON to end-users; one-click actions with clear feedback.”&#x20;

---

# 0) What “integrated” means (Definition of Done)

- From the **Builder (dev-web)**, user clicks **Run** → UI posts the current graph to the **API-Gateway** → **Orchestrator** compiles to an Engine-ready DAG and **POSTs** it to the **Engine v0.1 (REST)** → Engine executes steps and exposes status → UI polls run status & shows per-node badges/logs.
- Round-trip E2E: **import → run → see green** on the canvas. (Matches Sprint-2 DoD.)&#x20;

---

# 1) System Flow (read this first)

**Text diagram**

```
[dev-web (Builder)]
   |  POST /v1/runs { graph }                    (Gateway, Zod-validated)
   v
[services/api-gateway] ---calls---> [services/orchestrator]
                                         | compile graph → DAG
                                         | POST ENGINE_BASE/v1/execute {runId, dag}
                                         v
                                   [external/engine v0.1]
                                         | executes steps (start, http_request_node)
                                         | tracks run + step status + logs
                                         |
[dev-web] <--- GET /v1/runs/:id --- [api-gateway] <--- poll --- [orchestrator] <--- GET engine/runs/:engId
   (poll 1–2s)     returns merged run status (overall + per-step + logs)
```

- **Why this split:** clear separation of concerns (Builder/Orchestrator vs Engine), shared workflow schema at boundaries, replaceable engine (REST now, gRPC later) without touching the UI. &#x20;

---

# 2) API Contracts (copy these)

## 2.1 Public (Gateway ↔ UI)

- **POST** `/v1/runs`
  Body:

  ```json
  {
    "graph": { "nodes": [], "edges": [] },
    "inputs": {},
    "idempotencyKey": "uuid"
  }
  ```

  Response: `201 { "runId": "run_abc" }`

- **GET** `/v1/runs/:id`
  Response:

  ```json
  {
    "id": "run_abc",
    "status": "queued|running|succeeded|failed",
    "steps": [
      { "id": "s1", "nodeId": "start", "status": "succeeded", "durationMs": 3 },
      { "id": "s2", "nodeId": "http", "status": "running" }
    ],
    "logs": [{ "ts": "...", "level": "info", "msg": "..." }]
  }
  ```

  (Contracts mirror our MVP samples & sprint plan.)&#x20;

## 2.2 Orchestrator ↔ Engine v0.1 (REST)

- **POST** `ENGINE_BASE/v1/execute`
  Body:

  ```json
  {
    "runId": "run_abc",
    "dag": {
      "nodes": [
        { "id": "s1", "type": "start", "config": {} },
        {
          "id": "s2",
          "type": "http_request_node",
          "config": {
            "method": "POST",
            "url": "https://discord.com/api/webhooks/xxx/yyy",
            "headers": { "Content-Type": "application/json" },
            "json_body": { "content": "🎉 New Sale! ..." }
          },
          "deps": ["s1"]
        }
      ]
    },
    "env": {}
  }
  ```

  Response: `202 { "engineRunId":"eng_123" }`

- **GET** `ENGINE_BASE/v1/runs/:engineRunId`
  Response:

  ```json
  {
    "id": "eng_123",
    "status": "running|succeeded|failed",
    "steps": [
      { "id": "s1", "status": "succeeded" },
      { "id": "s2", "status": "running" }
    ],
    "logs": [{ "ts": "...", "level": "info", "msg": "HTTP 204" }]
  }
  ```

---

# 3) Where code goes (repo map)

Monorepo (Turborepo + PNPM) with clear areas: `apps/`, `services/`, `packages/`, `external/engine`.&#x20;

```
apps/
  dev-web/                  # Builder UI
services/
  api-gateway/              # BFF (Fastify/Nest)
  orchestrator/             # Compile DAG + talk to Engine
packages/
  workflow-schema/          # Shared zod schemas (WorkflowSchema, Node/Edge schemas)
  sdk-engine/               # Engine REST client (execute/getRun)
external/
  engine/                   # Engine v0.1 (Python/Node), REST
```

---

# 4) Code skeletons (paste & fill)

> All TypeScript snippets assume ES modules and strict TS. All HTTP handlers must validate inputs with Zod (schema at boundaries).&#x20;

## 4.1 `packages/workflow-schema` (already exists)

Ensure it exports:

```ts
// packages/workflow-schema/src/workflow.ts
import { z } from 'zod';

export const NodeSchema = z
  .object({
    id: z.string(),
    type: z.string(), // 'start' | 'http'
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.unknown()).optional(),
  })
  .strict();

export const EdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
    data: z.record(z.unknown()).optional(),
  })
  .strict();

export const WorkflowSchema = z
  .object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema),
    meta: z
      .object({
        name: z.string().default('Untitled'),
        version: z.literal(1).default(1),
        exportedAt: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export type WorkflowJson = z.infer<typeof WorkflowSchema>;
```

> We already use this in import/export; re-use for run creation (no raw JSON for end-users). &#x20;

## 4.2 Engine client (shared)

```ts
// packages/sdk-engine/src/client.ts
export type ExecuteRequest = {
  runId: string;
  dag: { nodes: any[] };
  env?: Record<string, unknown>;
};
export type EngineRunStatus = {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  steps: { id: string; status: string; durationMs?: number }[];
  logs: { ts: string; level: string; msg: string }[];
};

export class EngineClient {
  constructor(
    private baseURL: string,
    private fetchImpl = fetch
  ) {}

  async execute(
    req: ExecuteRequest,
    opts?: { idempotencyKey?: string }
  ): Promise<{ engineRunId: string }> {
    const res = await this.fetchImpl(`${this.baseURL}/v1/execute`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(opts?.idempotencyKey
          ? { 'x-idempotency-key': opts.idempotencyKey }
          : {}),
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`engine.execute failed: ${res.status}`);
    return res.json();
  }

  async getRun(engineRunId: string): Promise<EngineRunStatus> {
    const res = await this.fetchImpl(`${this.baseURL}/v1/runs/${engineRunId}`);
    if (!res.ok) throw new Error(`engine.getRun failed: ${res.status}`);
    return res.json();
  }
}
```

## 4.3 DAG compiler (orchestrator)

```ts
// services/orchestrator/src/compile/compileDag.ts
import { WorkflowJson } from '@automateos/workflow-schema';

type EngineStep = {
  id: string;
  type: string;
  config: Record<string, unknown>;
  deps?: string[];
};
export type EngineDag = { nodes: EngineStep[] };

export function compileDag(graph: WorkflowJson): EngineDag {
  // Index nodes & build adjacency from edges
  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
  const deps = new Map<string, Set<string>>();
  graph.nodes.forEach((n) => deps.set(n.id, new Set()));
  graph.edges.forEach((e) => deps.get(e.target)?.add(e.source));

  // Topo-sort (Kahn)
  const incoming = new Map([...deps].map(([k, v]) => [k, v.size]));
  const queue = [...incoming].filter(([_, c]) => c === 0).map(([k]) => k);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    graph.edges
      .filter((e) => e.source === id)
      .forEach((e) => {
        const c = incoming.get(e.target)! - 1;
        incoming.set(e.target, c);
        if (c === 0) queue.push(e.target);
      });
  }
  if (order.length !== graph.nodes.length) throw new Error('Graph has cycles');

  // Map each node to engine step
  const steps: EngineStep[] = order.map((id) => {
    const n = nodesById.get(id)!;
    const d = [...(deps.get(id) ?? [])];
    switch (n.type) {
      case 'start':
        return { id, type: 'start', config: {}, deps: d };
      case 'http':
        // UI stores config in node.data?.config
        const cfg = (n.data as any)?.config ?? {};
        // rename body->json_body if using that key
        const { body, ...rest } = cfg;
        const httpCfg = { ...rest, ...(body ? { json_body: body } : {}) };
        return { id, type: 'http_request_node', config: httpCfg, deps: d };
      default:
        throw new Error(`Unsupported node type: ${n.type}`);
    }
  });

  return { nodes: steps };
}
```

> The mapping (`http` → `http_request_node`) is the key to run your “Stripe → Discord Bridge”. The Engine executes the resulting HTTP POST step. This implements the “DAG compiler in Orchestrator” requirement.&#x20;

## 4.4 Orchestrator run service

```ts
// services/orchestrator/src/runs/runService.ts
import { compileDag } from '../compile/compileDag';
import { EngineClient } from '@automateos/sdk-engine';
import { WorkflowJson } from '@automateos/workflow-schema';
import { runsRepo } from '../repo/runsRepo'; // simple DB repo

const engine = new EngineClient(process.env.ENGINE_BASE!);

export async function startRun(
  runId: string,
  graph: WorkflowJson,
  idem?: string
) {
  const dag = compileDag(graph);
  const { engineRunId } = await engine.execute(
    { runId, dag, env: {} },
    { idempotencyKey: idem }
  );
  await runsRepo.markRunning(runId, engineRunId);
  schedulePoll(runId, engineRunId);
}

function schedulePoll(runId: string, engineRunId: string) {
  setTimeout(() => pollOnce(runId, engineRunId), 1000);
}

async function pollOnce(runId: string, engineRunId: string) {
  const s = await engine.getRun(engineRunId);
  await runsRepo.upsertSteps(runId, s.steps);
  await runsRepo.appendLogs(runId, s.logs);
  if (s.status === 'running') return schedulePoll(runId, engineRunId);
  await runsRepo.setStatus(runId, s.status);
}
```

## 4.5 API-Gateway routes

```ts
// services/api-gateway/src/routes/runs.ts
import { WorkflowSchema } from '@automateos/workflow-schema';
import { z } from 'zod';
import { startRun } from '@automateos/orchestrator'; // via pkg alias or HTTP call

const CreateRun = z.object({
  graph: WorkflowSchema,
  inputs: z.record(z.unknown()).optional(),
  idempotencyKey: z.string().uuid().optional(),
});

app.post('/v1/runs', async (req, rep) => {
  const { graph, inputs, idempotencyKey } = CreateRun.parse(req.body);
  const runId = await runsRepo.create({
    status: 'queued',
    graph,
    inputs,
    idem: idempotencyKey,
  });
  await startRun(runId, graph, idempotencyKey);
  return rep.code(201).send({ runId });
});

app.get('/v1/runs/:id', async (req, rep) => {
  const run = await runsRepo.get(req.params.id);
  return run; // includes steps + logs
});
```

> Zod at boundaries, no plaintext secrets in logs — both are core requirements.&#x20;

## 4.6 Engine v0.1 (minimal REST service)

Pick Python FastAPI or Node Fastify — here’s Python-ish pseudo:

```py
# external/engine/main.py
from fastapi import FastAPI
import requests, time, uuid

app = FastAPI()
runs = {}  # in-memory: { engId: {status, steps[], logs[]} }

@app.post("/v1/execute")
def execute(req: dict):
    engId = "eng_" + str(uuid.uuid4())
    runs[engId] = { "status":"queued", "steps": [], "logs":[] }
    # Fire-and-forget: start a thread to execute DAG
    start_exec_thread(engId, req["dag"])
    return { "engineRunId": engId }

@app.get("/v1/runs/{engId}")
def get_run(engId: str):
    return { "id": engId, **runs.get(engId, {}) }

def start_exec_thread(engId, dag):
    def run():
        runs[engId]["status"] = "running"
        # naive sequential respecting deps
        steps = topo(dag["nodes"])
        for step in steps:
            if step["type"] == "start":
                mark(engId, step["id"], "succeeded")
            elif step["type"] == "http_request_node":
                try:
                    r = requests.request(
                        step["config"].get("method","GET"),
                        step["config"]["url"],
                        headers=step["config"].get("headers", {}),
                        json=step["config"].get("json_body", None),
                        timeout=10,
                    )
                    log(engId, f"HTTP {r.status_code}")
                    mark(engId, step["id"], "succeeded")
                except Exception as e:
                    log(engId, f"http error: {e}")
                    mark(engId, step["id"], "failed")
                    runs[engId]["status"] = "failed"; return
        runs[engId]["status"] = "succeeded"
    # start thread...
```

- This is intentionally minimal for Phase-1; we’ll harden later (retries, DLQ, persistence). Matches the roadmap.&#x20;

---

# 5) UI wiring (dev-web)

- Add a **Run** button near Import/Export. On click:
  1. read graph from store (same shape used by export),
  2. `POST /v1/runs`,
  3. poll `GET /v1/runs/:id` every 1–2s,
  4. color nodes: running (pulse), success (green tick), fail (red x),
  5. RunPanel shows step list + short logs.

- Use toasts for start/fail/success and keep to the “one-click, never raw JSON” UX rule.&#x20;

---

# 6) Local runbook (Docker-first)

`docker-compose.dev.yml` (add services):

```yaml
services:
  engine:
    build: ./external/engine
    ports: ['8081:8081']
  orchestrator:
    build: ./services/orchestrator
    environment:
      ENGINE_BASE: http://engine:8081
    depends_on: [engine]
  api-gateway:
    build: ./services/api-gateway
    ports: ['8080:8080']
    environment:
      ORCHESTRATOR_URL: http://orchestrator:3000 # if HTTP; or monorepo import
    depends_on: [orchestrator]
```

- Start stack: `pnpm i && docker compose -f docker-compose.dev.yml up --build`
- Run builder: `pnpm --filter dev-web dev` (point it to `http://localhost:8080`).

Infrastructure and Docker-first development are part of our core v1 requirements.&#x20;

---

# 7) Tests you must add (green = ship)

**Unit (orchestrator)**

- `compileDag` maps `http` → `http_request_node`, produces correct deps (topo) and rejects cycles.
- Engine client handles non-2xx and timeouts (retry/backoff optional for v0.1).

**Integration**

- `startRun` → persists `engineRunId`, polling updates steps/logs and terminal status.

**E2E (Playwright)**

- Import a Start→HTTP graph (Discord webhook).
- Click **Run**, poll until success; verify node badges and log contains `HTTP 2xx`.
- This corresponds to Sprint-2 and Sprint-6 E2E items. &#x20;

---

# 8) Security + UX guardrails (Phase-1)

- **No secrets in plaintext logs**, mask headers like `authorization`/`x-api-key`.
- **Idempotency keys** accepted end-to-end to prevent duplicate runs.
- **Never show raw JSON** to end-users; the UI stays form-driven with toasts and inline errors. &#x20;

---

# 9) Your example: “Stripe → Discord Bridge”

The builder graph (Start → HTTP with your POST config) compiles to a two-step DAG. The Engine executes the HTTP POST to your Discord webhook and returns `succeeded` with a short log (“HTTP 204/200”). That proves “v1 can already do what the engine does.” This flow is explicitly targeted in Objective-1 and the roadmap. &#x20;

---

## TL;DR for a new dev

1. **Implement** `EngineClient`, `compileDag`, `runService` in orchestrator.
2. **Expose** `/v1/runs` + `/v1/runs/:id` in gateway with Zod validation.
3. **Stand up** `external/engine` with `/v1/execute` + `/v1/runs/:id`.
4. **Wire UI** Run button + polling + node badges/logs.
5. **Prove E2E** with the Discord webhook example.

---

Here’s a **step‑by‑step integration guide** to wire the Builder, Orchestrator and Engine v0.1 so thoroughly that even a fresh developer can follow it without prior context.
I’ve included an end‑to‑end system flow, API definitions, file locations, code skeletons and a local runbook.

---

## 🗺️ System Flow (big picture)

1. **Builder UI (dev‑web)**: User clicks **Run**. UI validates the graph and calls the API Gateway’s `/v1/runs`.
2. **API Gateway**: Validates the graph with `WorkflowSchema` and creates a run record (`runId`). It forwards the request to the Orchestrator.
3. **Orchestrator**: Compiles the UI graph into an Engine DAG (`compileDag`), calls the external **Engine v0.1** via `POST /v1/execute`, persists `engineRunId` and triggers polling.
4. **Engine v0.1**: Executes the steps (e.g., HTTP requests), tracks per‑step status and logs, and exposes its status via `GET /v1/runs/:engineRunId`.
5. **Orchestrator Poller**: Periodically calls the Engine’s status endpoint, updates the run record with step status/logs, and finishes the run when done.
6. **UI Polling**: Frontend polls `/v1/runs/:runId` every 1–2 seconds to update the node badges (running/success/fail) and display logs.

This flow maintains separation of concerns (UI vs Gateway vs Orchestrator vs Engine), uses shared schemas for validation, and keeps the engine replaceable (REST now, gRPC later).

---

## 🧩 API Contracts

### Gateway ↔ UI

- **POST /v1/runs**: body `{ graph, inputs?, idempotencyKey? }` → returns `{ runId }` on 201.
- **GET /v1/runs/\:id**: returns `{ id, status, steps, logs }` where `status` is `queued|running|succeeded|failed`.

### Orchestrator ↔ Engine v0.1 (REST)

- **POST ENGINE_BASE/v1/execute**: body `{ runId, dag, env? }` → returns `{ engineRunId }`.
- **GET ENGINE_BASE/v1/runs/\:engineRunId**: returns engine status `{ id, status, steps, logs }`.

---

## 🗂️ File Locations & What They Do

- **`packages/workflow-schema`**: houses Zod schemas (`WorkflowSchema`, `NodeSchema`, etc.) used across UI, Gateway and Orchestrator for validation.
- **`packages/sdk-engine`**: contains `EngineClient` with `execute()` and `getRun()` to talk to the Engine REST API.
- **`services/api-gateway`**: REST endpoints (`/v1/runs`). It calls the Orchestrator and returns run status to the UI.
- **`services/orchestrator`**: logic to compile graphs (`compileDag.ts`), start runs, poll engine status, and persist run logs/steps.
- **`external/engine`**: the Engine v0.1 service (Python or Node) that executes DAG steps and exposes run status.
- **`apps/dev-web`**: the Builder UI; add Run button, import/export, and per‑node run status polling.

---

## 🔨 Code Skeletons (copy, paste, customize)

### 1. Engine Client

```ts
// packages/sdk-engine/src/client.ts
export class EngineClient {
  constructor(
    private baseURL: string,
    private fetchImpl = fetch
  ) {}
  async execute(req: ExecuteRequest, opts?: { idempotencyKey?: string }) {
    const res = await this.fetchImpl(`${this.baseURL}/v1/execute`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(opts?.idempotencyKey
          ? { 'x-idempotency-key': opts.idempotencyKey }
          : {}),
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`engine.execute failed: ${res.status}`);
    return res.json();
  }
  async getRun(engineRunId: string) {
    const res = await this.fetchImpl(`${this.baseURL}/v1/runs/${engineRunId}`);
    if (!res.ok) throw new Error(`engine.getRun failed: ${res.status}`);
    return res.json();
  }
}
```

### 2. Compile DAG

```ts
// services/orchestrator/src/compile/compileDag.ts
import { WorkflowJson } from '@automateos/workflow-schema';

export function compileDag(graph: WorkflowJson) {
  // Build adjacency lists and perform Kahn topological sort on edges
  // Map each node type:
  //   'start' → {type:'start', config:{}}
  //   'http' → {type:'http_request_node', config:{method,url,headers,json_body}}
  // The deps array lists the IDs of predecessor steps.
  // Throw if the graph has cycles or unsupported node types.
  // Return { nodes: EngineStep[] }.
}
```

### 3. Orchestrator Run Service

```ts
// services/orchestrator/src/runs/runService.ts
import { compileDag } from '../compile/compileDag';
import { EngineClient } from '@automateos/sdk-engine';
const engine = new EngineClient(process.env.ENGINE_BASE!);

export async function startRun(
  runId: string,
  graph: WorkflowJson,
  idem?: string
) {
  const dag = compileDag(graph);
  const { engineRunId } = await engine.execute(
    { runId, dag, env: {} },
    { idempotencyKey: idem }
  );
  await runsRepo.markRunning(runId, engineRunId);
  poll(runId, engineRunId);
}

async function poll(runId: string, engineRunId: string) {
  const status = await engine.getRun(engineRunId);
  await runsRepo.upsertSteps(runId, status.steps);
  await runsRepo.appendLogs(runId, status.logs);
  if (status.status === 'running')
    setTimeout(() => poll(runId, engineRunId), 1000);
  else await runsRepo.setStatus(runId, status.status);
}
```

### 4. Gateway Routes

```ts
// services/api-gateway/src/routes/runs.ts
import { WorkflowSchema } from '@automateos/workflow-schema';
import { startRun } from '@automateos/orchestrator';

app.post('/v1/runs', async (req, rep) => {
  const { graph, inputs, idempotencyKey } = z
    .object({
      graph: WorkflowSchema,
      inputs: z.record(z.unknown()).optional(),
      idempotencyKey: z.string().uuid().optional(),
    })
    .parse(req.body);
  const runId = await runsRepo.create({
    status: 'queued',
    graph,
    inputs,
    idem: idempotencyKey,
  });
  await startRun(runId, graph, idempotencyKey);
  return rep.code(201).send({ runId });
});
app.get('/v1/runs/:id', async (req, rep) => {
  const run = await runsRepo.get(req.params.id);
  return run; // includes steps + logs
});
```

### 5. Engine v0.1 (Python pseudo)

```py
# external/engine/main.py
from fastapi import FastAPI
import requests, uuid, threading

app = FastAPI()
runs = {}

@app.post("/v1/execute")
async def execute(req: dict):
    engId = "eng_" + str(uuid.uuid4())
    runs[engId] = {"status":"queued","steps":[],"logs":[]}
    threading.Thread(target=_run, args=(engId, req["dag"])).start()
    return {"engineRunId": engId}

@app.get("/v1/runs/{engId}")
async def get_run(engId: str):
    return {"id": engId, **runs.get(engId, {})}

def _run(engId, dag):
    runs[engId]["status"]="running"
    for step in topo_sort(dag["nodes"]):
        if step["type"] == "start":
            runs[engId]["steps"].append({"id": step["id"], "status": "succeeded"})
        elif step["type"] == "http_request_node":
            cfg = step["config"]
            try:
                r = requests.request(cfg["method"], cfg["url"], headers=cfg.get("headers"), json=cfg.get("json_body"), timeout=10)
                runs[engId]["logs"].append({"ts":"...", "level":"info", "msg":f"HTTP {r.status_code}"})
                runs[engId]["steps"].append({"id": step["id"], "status":"succeeded"})
            except Exception as e:
                runs[engId]["logs"].append({"ts":"...", "level":"error", "msg":str(e)})
                runs[engId]["steps"].append({"id": step["id"], "status":"failed"})
                runs[engId]["status"] = "failed"; return
    runs[engId]["status"] = "succeeded"
```

---

## 🧪 Tests to Add

- **Unit (orchestrator)**: Check that `compileDag` correctly maps node types and detects cycles.
- **Integration**: Start a run, verify it posts to engine and receives an `engineRunId`. Poll until completion, ensuring step statuses propagate.
- **E2E (Playwright)**: Import a Start→HTTP workflow, click **Run**, wait for success, and assert node badges show green and logs contain an HTTP status.

---

## 🛠️ How to run locally

1. Install dependencies: `pnpm install`.
2. Launch the stack: `docker compose -f docker-compose.dev.yml up --build`. This starts Postgres, Redis (for queueing), Engine, Orchestrator and Gateway.
3. Start the builder: `pnpm --filter apps/dev-web dev` and navigate to `http://localhost:3000`. The Gateway will be at `http://localhost:8080`.
4. In the builder, create a simple graph (Start + HTTP) and click **Run**. Watch the node badges update and logs appear.

---

## 🔒 Security and UX Reminders

- Do not store or log secrets in plaintext; mask sensitive headers (`Authorization`, `X-API-Key`).
- Validate all incoming graphs using `WorkflowSchema` (shared across services).
- Never expose raw JSON to users; keep the builder form‑driven and use toasts/inline errors for feedback.
- Implement idempotency keys to handle duplicate run requests gracefully.

---

## ✅ Practical Example: Stripe → Discord

Your provided workflow:

```json
{
  "nodes": [
    { "id": "start1", "type": "start", "position": { "x": 0, "y": 0 } },
    {
      "id": "http1",
      "type": "http",
      "position": { "x": 200, "y": 0 },
      "data": {
        "config": {
          "method": "POST",
          "url": "https://discord.com/api/webhooks/xxx/yyy",
          "headers": { "Content-Type": "application/json" },
          "json_body": {
            "content": "🎉 New Sale! A payment of $10.00 was just successfully processed."
          }
        }
      }
    }
  ],
  "edges": [{ "id": "e1", "source": "start1", "target": "http1" }]
}
```

- The DAG compiler maps `http` → `http_request_node` with the same configuration.
- The orchestrator posts this DAG to the Engine; Engine performs the HTTP POST and returns `succeeded`.
- The UI shows the first node (Start) as green instantly and the HTTP node as green when the webhook call succeeds.
- Logs show `HTTP 204` or `HTTP 200`, confirming the Discord webhook call ran.

---

With these detailed steps, file paths, and code snippets, a developer unfamiliar with the engine can clone the repo, stand up the services, and wire everything together with confidence.
