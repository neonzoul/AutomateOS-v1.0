# AutomateOS v1.0 — AI Coding Instructions

## Project Overview

AutomateOS is a **visual workflow automation platform** (monorepo) with Next.js frontends, Node.js services, and a Python execution engine.
Goal: a no-code builder where **creators** design, share, and run workflows — growing into a template ecosystem.

---

## Architecture & Key Components

### Monorepo (Turborepo + PNPM)

- **`apps/dev-web`** → Creator Studio (Next.js + React Flow) ✅ _Phase 1 priority_
- **`apps/app-web`** → User Dashboard (planned Q2/2026; **out of Phase 1**)
- **`services/`** → `api-gateway`, `orchestrator`, `webhook`, `worker`
- **`external/engine`** → Python runtime
- **`packages/`** → `ui`, `workflow-schema`, `logger`, `config`

### Core Tech

- **Frontend:** Next.js 15, @xyflow/react (React Flow), Zustand, react-hook-form, Zod, Framer Motion
- **Backend:** Node.js (Fastify/Nest planned)
- **Engine:** Python (FastAPI)
- **Data:** Postgres + Redis
- **Deploy:** Docker/Compose (later: CI/CD to GCP/DO)

---

## Phase Context

**Phase 1 (Sep 2025–Dec 2026): engine → product → ecosystem**

- **Q4/2025:** Workflow Builder v0.1 (import/export, minimal credentials)
- **Q1/2026:** Creator Experience (Profiles, Gallery, 10 templates)
- **Q2/2026:** User Dashboard beta
- **Q3/2026:** Ecosystem growth (submissions, analytics)
- **Q4/2026:** Builder v1.0 launch + partner readiness

**North Star:** Ship visible product and attract the first **100 true creators**.

---

## Development Workflow

### Essential Commands

```bash
pnpm dev                    # Start all dev servers
pnpm build                  # Build all workspaces
pnpm -C apps/dev-web dev    # Start only dev-web
pnpm -C apps/dev-web add .. # Add deps to dev-web (workspace-aware)
```

> Always use `-C <workspace>` when working in apps/services.

### Key Files

- `docs/Core Development/BACKBONE.md` — repo + infra blueprint
- `docs/dev-web (Creator Studio)/Architecture.md` — frontend guide
- `docs/Mermaid Chart/*.mmd` — architecture/system/data diagrams
- `apps/dev-web/app/(builder)/builder/page.tsx` — Builder entry point

---

## Project Patterns

### State Management (Zustand)

- Global store in `apps/dev-web/src/core/state.ts`
- Holds: `nodes`, `edges`, `selectedNode`, `runStatus`
- Example: `const sel = useBuilderStore((s) => s.selectedNode);`

### Schema-Driven Development

- All validation via `@automateos/workflow-schema` (Zod)
- Forms use `react-hook-form + zodResolver`
- Node configs **auto-generate** from registry Zod schemas

### React Flow Integration

- Custom nodes: `Start`, `Http` (expand later)
- **Registry pattern**:

  ```ts
  type NodeSpec = {
    type: string;
    configSchema: ZodType;
    component: React.FC;
    runtime: { adapter: string }; // used by orchestrator
  };
  ```

- Canvas state ←→ Zustand store

### Component Layout

```
BuilderPage (2-column)
├─ Canvas (React Flow)
└─ Right Panel
   ├─ Inspector (schema → form)
   └─ RunPanel (run controls + status/logs)
```

### Import/Export

- Workflows as JSON validated by `WorkflowSchema`
- **Round-trip safe** (export → import identical)
- Validate at boundaries (never trust raw input)

---

## UX Guardrails

- Never expose raw JSON to end-users
- Smart defaults everywhere
- Motion with purpose (snapping, pulsing, smooth panels)
- Templates are **digital products** (clear preview/share)
- Aim for **alive, human, delightful** (GarageBand-like)

---

## Current Phase: Sprint 1 (Q4 2025)

**Focus:** Repo scaffold + basic builder
**Status:** ✅ monorepo, ✅ deps, 🚧 canvas integration

**Priorities**

1. Zustand store (nodes, edges, selection)
2. Node Registry (Start/Http schemas + components)
3. Inspector (schema → form)
4. Canvas polish (drag/connect/select)

---

## Known Technical Debt

- Remove legacy `reactflow` (use `@xyflow/react` only)
- Canvas not fully wired to Zustand
- Node registry & inspector pending
- CI covers `dev-web` only (services later)

---

## Integration Points

### Frontend → Backend

1. Builder creates graph (Zustand)
2. Export validates with `WorkflowSchema`
3. **Run** → `POST /v1/runs` → orchestrator → engine
4. Poll `GET /v1/runs/:id` → update badges + logs

### Secrets & Security

- ❌ Never store secrets in frontend/localStorage
- ✅ Backend handles encryption (AES-GCM) and runtime decryption
- ✅ Engine only sees decrypted values at execution time

---

## Development Guidelines

### File Organization

- `src/builder/*` — builder feature modules
- `src/components/*` — shared dev-web components
- `src/core/*` — state, http, config, utils

### Naming

- Packages: `@automateos/<name>`
- Components: `PascalCase`
- Hooks/Stores: `useCamelCase`, files snake to feature (`state.ts`, `registry.ts`)

### Code Quality

- Strict TypeScript
- Zod at every boundary
- Memoized selectors for perf
- Prefer composition over inheritance

---

## AI Assistant Rules

- Put new code under **correct folder** (`src/builder/*`) unless cross-cutting
- Never add secrets to frontend
- Prefer importing from `@automateos/*` packages
- If schema doesn’t exist → **create Zod schema first**
- If unsure, check `/docs/dev-web/Architecture.md` or `/docs/Core Development/Sprint Planning.md`
- Explain changes **clearly and precisely** in PR descriptions

---

## Testing Strategy & Layout

### Where tests live

- **Unit (colocated):** `apps/dev-web/src/**/something.test.ts(x)` ✅ (`src/core/state.test.ts` is correct)
- **Integration:** `apps/dev-web/test/**` (API mocks, jsdom/node)
- **E2E:** separate workspace/folder (e.g., `apps/e2e/` with Playwright)

### Vitest (dev-web) quick config

```ts
// apps/dev-web/vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom', // 'node' fine for store-only
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.ts?(x)', 'test/**/*.test.ts'],
    coverage: { reporter: ['text', 'lcov'], lines: 85, branches: 80 },
  },
  resolve: { alias: { '@': '/apps/dev-web/src' } },
});
```

**Tips**

- Add a test-only reset helper:

  ```ts
  export const resetBuilderStore = () =>
    useBuilderStore.setState(
      { nodes: [], edges: [], selectedNodeId: null },
      true
    );
  ```

- Use `afterEach(resetBuilderStore)` to isolate tests.

---

# Appendix A — API Contract v0.1 (CRUD names)

**Base URL**

- Local: `http://localhost:8081/v1`
- Prod: `https://api.automateos.dev/v1`

**Conventions**

- JSON, UTF-8; paths **kebab-case**, fields **camelCase**
- Pagination: `?page=&limit=` (default 20, max 100)
- Idempotency (where supported): `Idempotency-Key: <uuid>`
- Timestamps: ISO 8601 (UTC)
- Errors:

  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "...",
      "details": [],
      "requestId": "req_..."
    }
  }
  ```

## Templates

- **POST** `/templates` → create draft
  Body: `{ name, tags?, graph, description? }` → `201 { templateId, versionId }`
- **GET** `/templates?tag=&page=&limit=` → list
- **GET** `/templates/:templateId` → fetch with latest version
- **POST** `/templates/:templateId/publish` → publish new version
  Body: `{ graph }` → `201 { versionId }`

## Installations

- **POST** `/installations` → install template version
  Body: `{ templateId, templateVersionId }` → `201 { installationId }`
- **GET** `/installations` → list

## Workflows (optional if separate from templates)

- **POST** `/workflows/validate` → validate graph only
  Body: `{ graph }` → `200 { valid: true }` | `400 { error }`

## Runs

- **POST** `/runs` → start a run
  Headers: `Idempotency-Key` (recommended)
  Body: `{ workflowVersionId | graph, inputs? }` → `202 { runId }`
- **GET** `/runs/:runId`

  ```json
  {
    "id": "run_abc",
    "status": "queued|running|succeeded|failed",
    "startedAt": "...",
    "finishedAt": null,
    "steps": [
      { "id": "s1", "nodeId": "start", "status": "succeeded", "durationMs": 3 }
    ],
    "logs": [{ "ts": "...", "level": "info", "msg": "HTTP 200" }]
  }
  ```

## Webhooks

- **POST** `/webhooks/:key` → enqueue external trigger
  Body: freeform; `202 { accepted: true, ref: "evt_123" }`

**Rate limits (stub)**: `60 req/min` with `X-RateLimit-*` headers.

---

# Appendix B — Commenting & Docs Style

**Rule:** _Comments explain “why”; code shows “what”._

## TSDoc for exports

```ts
/**
 * Compile a workflow graph into an executable DAG.
 * @param graph - Validated workflow (WorkflowSchema)
 * @returns Ordered steps with dependencies
 * @throws {CompileError} when graph has cycles or missing nodes
 * @example const dag = compile(graph)
 */
export function compile(graph: Workflow): Dag { ... }
```

## React components (3-line synopsis)

```tsx
/**
 * Inspector: renders a form from the selected node's Zod schema.
 * Reads from Zustand selection; writes via updateNodeConfig(nodeId, values).
 * No secrets in client; only public config fields appear.
 */
export function Inspector() { ... }
```

## Zustand modules — invariants up top

```ts
// Invariants:
// - Only one 'start' node allowed
// - Edges connect existing node ids
// - updateNodeConfig merges keys (does not replace entire config)
```

## TODO / FIXME / NOTE

```ts
// TODO(mos): support PATCH of config keys
// FIXME(mos): edge creation can race under fast drags
// NOTE: this runs on every nodesChange; keep allocations low
```

## File headers (for complex modules)

```ts
/**
 * Module: builder/run/polling.ts
 * Purpose: Poll /v1/runs/:id and merge into UI state
 * Key deps: api.get, useBuilderStore
 */
```

---

# Appendix C — Example Route & Client

**Fastify route (gateway)**

```ts
// services/api-gateway/src/routes/runs.ts
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const StartRunSchema = z.object({
  workflowVersionId: z.string().uuid().optional(),
  inputs: z.record(z.any()).default({}),
});

export async function runsRoutes(app: FastifyInstance) {
  app.post('/v1/runs', async (req, reply) => {
    const body = StartRunSchema.parse(req.body);
    const runId = await app.services.orchestrator.enqueueRun(
      body,
      req.headers['idempotency-key'] as string | undefined
    );
    return reply.code(202).send({ runId });
  });

  app.get('/v1/runs/:id', async (req, reply) => {
    const id = z.string().parse((req.params as any).id);
    const run = await app.services.runs.getRun(id);
    return reply.send(run);
  });
}
```

**Client (dev-web)**

```ts
// apps/dev-web/src/builder/run/runClient.ts
export async function startRun(payload: unknown) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Run start failed: ${res.status}`);
  return res.json() as Promise<{ runId: string }>;
}
```

---

# Appendix D — PR Template (Checklist)

- [ ] Types strict; Zod validation at all boundaries
- [ ] No secrets/PII in client or logs
- [ ] Logs include `requestId` / `runId` where relevant
- [ ] Unit tests (and one failure path) added/updated
- [ ] Docs: TSDoc on exports; README/MD updated if needed
- [ ] UI: keyboard/focus states; aria roles/labels present
- [ ] Performance: selectors/memo prevent extra renders
- [ ] DX: meaningful names; short functions; no commented-out code

---

## Final notes

- Your current `src/core/state.test.ts` placement is **correct** for the colocated unit-test approach.
- Move demo/usage files to `examples/` or delete after reading.
- If you want, I can also generate a **standalone `API-Contract.md`** and **`Code-Comments-Style.md`** from these appendices to drop into `docs/Core Development/`.
