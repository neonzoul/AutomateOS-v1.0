[GPT-5 Agent]

the simple truth:

- **You do not call the Engine from the UI.**
- The **UI talks to the API-Gateway**, the **Gateway asks the Orchestrator** to compile and start a run, and the **Orchestrator calls the external Engine v0.1 (REST)**. That split is intentional and part of v1’s core architecture.

Below is a crisp, follow-along flow with exact steps, commands, env vars, and what “connected” looks like on your laptop. I’ll also show where the Engine (from GitHub) fits in, and how v1 finds it.

---

# What you actually run (and how they connect)

```
[apps/dev-web]  --(POST /v1/runs)-->  [services/api-gateway]
                                          |
                                          v
                                  [services/orchestrator]
                                          |
                           (REST)         v
                              --->   [external/engine v0.1]
```

- This separation is a v1 requirement: **Engine stays independent** (REST now, gRPC later) and we share schemas via `packages/workflow-schema`.
- Sprint 2’s goal is exactly this: “Workflows actually run” via **orchestrator → engine** with status shown on nodes.
- We’re “Docker-first,” so you can spin the whole thing locally with compose.

---

# Option A (recommended): Run everything locally with Docker

> Perfect when the Engine is “just in GitHub” and not deployed anywhere yet.

### 0) Prereqs

- Docker Desktop (or Docker Engine)
- Node 18+ / PNPM for the UI (though you can containerize that too)

### 1) Clone the main monorepo and install deps

```bash
git clone https://github.com/<you>/AutomateOS-v1.0.git
cd AutomateOS-v1.0
pnpm i
```

### 2) Pull in / prepare the Engine v0.1

If your engine lives in a second repo, add it as `external/engine` (or keep as a submodule). The v1 **expects** an external engine service reachable over HTTP (REST).

Example layout (monorepo requirement):

```
apps/
services/
packages/
external/
  engine/      # the v0.1 REST engine lives here (Dockerized)
```

This mirrors our **Core Requirements** monorepo structure.

### 3) Compose it up

Create or edit `docker-compose.dev.yml` like this (minimal sketch):

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
      ORCHESTRATOR_URL: http://orchestrator:3000 # if orchestrator is a service
    depends_on: [orchestrator]
```

- **ENGINE_BASE** tells the Orchestrator where the Engine lives.
- This Docker-first local setup is part of the v1 infra requirements and Sprint breakdown.

Run it:

```bash
docker compose -f docker-compose.dev.yml up --build
```

### 4) Start the Builder UI

```bash
pnpm --filter apps/dev-web dev
# open http://localhost:3000
```

### 5) Confirm the pipeline is “wired”

- In the UI, build a tiny graph: **Start → HTTP**.
- Click **Run**. The UI sends **POST /v1/runs** to the Gateway (not to the Engine).
- Orchestrator compiles your graph to an Engine DAG and calls **ENGINE_BASE/v1/execute**.
- UI polls **GET /v1/runs/\:runId** for status/logs and shows node badges (running/success/fail)—this is Sprint-2 DoD.

> UX guardrails to remember while testing: **never expose raw JSON**, use toasts/inline errors and keep it “one-click” delightful.

---

# Option B: Deploy Engine somewhere, point v1 to it

If you don’t want to run the Engine locally:

1. Build & push the Engine’s Docker image; deploy it (e.g., Cloud Run / any VM).
2. Get its base URL, e.g. `https://engine-dev.yourdomain.com`.
3. Set `ENGINE_BASE=https://engine-dev.yourdomain.com` in the Orchestrator’s environment (or your compose/helm/terraform).
4. Run Gateway + Orchestrator + UI locally; they’ll talk to the remote Engine.

This fits the **External Engine** requirement (kept separate; AutomateOS talks via an SDK/REST client).

---

# “Do I have to download the engine and run with Docker?”

- **Yes, if you’re working locally and the Engine isn’t hosted yet.**
- Our **Phase-1 Tech Roadmap** explicitly calls out Engine as a separate, Dockerized service contacted via REST.
- Sprint planning codifies **“Run from UI → Engine executes”** and **orchestrator → engine (REST)** as Sprint-2 tasks.
- The Work Breakdown also places Engine under `external/engine` with a minimal REST contract and local compose for dev.

So the simplest flow is:

1. Clone monorepo.
2. Put/clone engine code into `external/engine`.
3. `docker compose up`.
4. Start UI.
5. Click **Run** in the UI; watch status propagate.

---

# How v1 “connects” to the Engine, concretely

- **UI** only knows `POST /v1/runs` and `GET /v1/runs/:id` on the **Gateway** (BFF).
- **Gateway** validates the graph (Zod `WorkflowSchema`) and asks the **Orchestrator** to start a run (a Sprint-2 deliverable).
- **Orchestrator** compiles the graph to a DAG and calls **`POST ENGINE_BASE/v1/execute`** on the **Engine**; then it polls **`GET ENGINE_BASE/v1/runs/:engineRunId`** and updates our **Runs** record.
- **UI** polls the Gateway for run status and shows per-node results.
- This is **the** architecture for v1.0 and sets us up for credentials, retries/DLQ, and a “SaaS beta” later.

---

# Example you can run today (Stripe → Discord Bridge)

1. In the Builder, add **Start** and an **HTTP** node.
2. Configure HTTP:
   - **Method:** POST
   - **URL:** your Discord Webhook URL
   - **Headers:** `Content-Type: application/json`
   - **Body/JSON:**

     ```json
     {
       "content": "🎉 New Sale! A payment of $10.00 was just successfully processed."
     }
     ```

3. Click **Run** → Engine does the POST → UI shows the HTTP node turn green on 2xx.
4. This matches the Objective-1 “starter workflows” path (Slack/Sheets/OpenAI/Discord style) we planned for Q4/2025.

> Security note (Phase-1): keep credentials inline/env, **never** log secrets; mask headers like `authorization` in logs.

---

## Quick Troubleshooting

- **UI says run failed immediately:**
  Check Gateway and Orchestrator logs. Often `ENGINE_BASE` is unset/wrong.
- **Engine returns 4xx/5xx:**
  The webhook URL or request body might be invalid; look at Engine logs (but **do not** print secrets).
- **Nodes don’t update status:**
  Ensure Orchestrator’s poll loop is running and Gateway’s `/v1/runs/:id` merges step statuses/logs correctly.
- **Import/Export works, but Run doesn’t:**
  Import/Export is purely client-side; Run requires Gateway/Orchestrator/Engine to be up (Sprint-2 vs Sprint-3 scopes are separate items).

---

## Why we do it this way (so it scales later)

- **Creator-first UX**: one-click run, never raw JSON, delightful feedback.
- **Core architecture**: monorepo, shared schemas, Engine externalized—REST now, ready for gRPC later.
- **Roadmap fit**: this unlocks Sprint-4/5/6 (credentials, polish, E2E demo) and the Q4/2025 “Builder v0.1 runs workflows via engine” milestone.

---

Here’s a clear explanation of what to do when the Engine lives in its own repo and how everything connects in v1:

1. **Architecture first – no direct UI → Engine calls.**
   - The **builder (dev‑web)** never hits the Engine directly. When a user clicks **Run**, the UI sends the current graph to the **API‑gateway** (`POST /v1/runs`).
   - The **gateway** validates the workflow using the shared `WorkflowSchema` and forwards it to the **orchestrator**.
   - The **orchestrator** compiles the graph into a DAG and makes a REST call to the external Engine. This separation of concerns is part of the core requirements: the monorepo includes an `external/engine` folder that is **kept separate** and accessed through an SDK client. The builder/orchestrator logic is deliberately separated from engine execution.

2. **Sprint‑2 tasks define the Engine wire‑up.**
   - The sprint plan calls out that, once node configuration and validation are in place, you need to **wire the orchestrator to an external Engine v0.1 over REST**. The same tasks state that clicking **Run** should cause the engine to execute the workflow and the UI should show run status per node (success/fail).

3. **Engine repo and local setup.**
   - In our monorepo structure, the Engine code sits in `external/engine` (or a separate GitHub repo if you pulled it out). The Technical Work Breakdown notes that you must **dockerize Engine v0.1 for local compose** and **define a REST contract for `POST /execute`**. This means the Engine exposes endpoints like `POST /v1/execute` (to accept a DAG) and `GET /v1/runs/:id` (to return status).
   - Because the engine is independent, you either:
     1. Clone the Engine repository (or ensure `external/engine` exists in the monorepo),
     2. Build its Docker image, and
     3. Run it alongside the orchestrator and gateway.

   - The local infrastructure uses **Docker Compose**. In the `docker‑compose.dev.yml` file, you’ll find services for Postgres, Redis, the engine, the orchestrator and the API‑gateway. Running `docker compose up --build` spins up the Engine at a known host/port (e.g. `http://engine:8081`).

4. **Connecting v1 to the Engine.**
   - At runtime, the orchestrator reads an environment variable (often named `ENGINE_BASE`) that points to the Engine’s URL (e.g. `http://engine:8081`). When `POST /v1/runs` arrives, the orchestrator compiles the workflow into a DAG, attaches a `run_id` and optional `idempotency_key`, and then calls `ENGINE_BASE/v1/execute`.
   - The Engine executes each step (start, HTTP request, etc.), stores run state, and provides updates via `GET ENGINE_BASE/v1/runs/:engineRunId`. The orchestrator polls this endpoint and merges the status back into the AutomateOS run record so the UI can display node success/failure.

5. **Building and running locally.**
   - After cloning both `AutomateOS‑v1.0` and the `AutomateOS‑v0.1‑engine` (or ensuring `external/engine` is present), install JS dependencies with `pnpm i`.
   - Run `docker compose -f docker-compose.dev.yml up --build` from the repository root. This builds and launches Postgres, Redis, the Engine, the Orchestrator and the Gateway.
   - In another terminal, start the builder with `pnpm --filter apps/dev-web dev` and open `http://localhost:3000`. Now you can create a Start→HTTP workflow, click **Run**, and watch the Engine execute it; run status (running/succeeded/failed) will appear as badges on each node, fulfilling the Sprint‑2 deliverable.

**In summary:** the Engine stays in its own repository/folder and is run as a separate service. You don’t “build v1 to connect to it”; instead, you run the Engine (via Docker) and point your orchestrator to it. The UI remains decoupled—it talks only to the gateway, which in turn dispatches runs to the Engine.
