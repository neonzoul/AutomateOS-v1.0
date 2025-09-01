[GPT5]
---

# 🔧 Phase 1 Technical Work Breakdown (2025–2026)

## Q4/2025 — Objective 1: Workflow Builder Foundation

### 1) Frontend — `apps/dev-web` (Creator Studio)

* **Monorepo bootstrap**

  * Init Turborepo + PNPM workspaces; set up `apps/dev-web`, `packages/ui`, `packages/workflow-schema`, `packages/logger`, `packages/config`.
  * CI jobs: `lint`, `typecheck`, `build` (GitHub Actions).
* **UI kit & theming**

  * Tailwind + shadcn/ui; global theme tokens (typography, spacing, colors), dark mode.
  * Motion primitives (Framer Motion) + micro-interaction utilities.
* **Canvas (React Flow)**

  * Node system v0.1: `Start`, `HTTP`.
  * Edge routing + snapping; selection, drag, zoom, pan.
  * Context menu (add node, duplicate, delete), keyboard shortcuts.
* **Inspector / Config panel**

  * Form-driven config (Zod schema from `packages/workflow-schema`).
  * Live validation (zodResolver); inline help; sensible defaults.
* **Run from UI**

  * “Run” button → POST `api-gateway/runs`.
  * Node status indicators: idle/running/success/fail; step logs panel.
* **Import/Export**

  * Export JSON (download blob).
  * Import JSON (drag-drop file → validate → render to canvas).
* **Starter workflows**

  * Slack notification, Google Sheets append, OpenAI completion (mock first, then live).
* **Delight polish**

  * Hover glow, pulsing active nodes, smooth transitions.

### 2) Services / Backend

* **`services/api-gateway` (BFF)**

  * REST scaffolding (Fastify/Express/Nest — your pick; I’ll default to Fastify + Zod).
  * Endpoints (v0.1, no auth yet):

    * `POST /runs` – enqueue workflow run.
    * `GET /runs/:id` – run status + steps + logs.
    * `POST /workflows/validate` – schema validation for import.
* **`services/orchestrator`**

  * Compile workflow JSON → DAG.
  * Add `idempotency_key`, `run_id`, enqueue to Engine (REST).
* **`services/webhook`**

  * Ingress stub (reserve route; no external triggers yet).
* **`external/engine`**

  * Dockerize engine v0.1 for local compose.
  * Define REST contract for `POST /execute` (receive DAG).

### 3) Data / Security / Infra

* **Data model (Phase 1 baseline)**

  * `workflows`, `workflow_versions`, `runs`, `run_steps`, `run_logs`.
  * Migrations + Prisma/Drizzle (choose one; I’ll default Prisma).
* **Secrets (minimal)**

  * Inline API keys in node config (masked in UI).
  * AES-GCM utility (`packages/crypto`) for in-memory encryption if persisted to disk is needed later (v0.1 can keep in memory).
* **Local infra**

  * `docker-compose.dev.yml`: Postgres, Redis/Queue, Engine.
  * Seed script for demo data.

### 4) DX / Quality

* Type safety wall: `strict` TS everywhere; Zod schemas in `packages/workflow-schema`.
* Logging: `packages/logger` (Pino) with request IDs, run IDs.
* Unit tests: schema, DAG compiler, orchestrator enqueue.
* E2E happy path: import → run → see status in UI (Playwright).
* **Done Criteria (Q4/2025)**

  * Drag-drop builder runs a simple workflow end-to-end via Engine.
  * Import/Export works on at least 3 example workflows.
  * API keys can be provided inline and are not logged in plaintext.

---

## Q1/2026 — Objective 2: Creator Experience

### 1) Frontend — `apps/dev-web`

* **Creator Profile (MVP)**

  * Public page with avatar, bio, template cards.
  * “Publish Template” flow (name, cover, tags, JSON payload).
* **Template Gallery (MVP)**

  * Browse, search, filter by tags.
  * Template detail page → preview graph → “Install” (export or copy to user space).
* **Install flow**

  * “Add to My Workspace” → creates `installation` record (local for now).
* **Guided onboarding**

  * Empty state with starter templates; inline hints; “Try run.”

### 2) Services / Backend

* **`api-gateway`**

  * Templates CRUD: `POST/GET /templates`, `GET /templates/:id`, `POST /templates/:id/publish`.
  * Installations: `POST /installations`, `GET /installations`.
* **Auth (MVP)**

  * Email magic link or GitHub OAuth (one is fine).
  * Roles: `creator`, `user` (simple RBAC middleware).
* **`orchestrator`**

  * Version pinning: resolve `workflow_version` at run time.
* **Rate limiting**

  * Basic per-IP/per-user throttles on run endpoints.

### 3) Data / Security / Infra

* **Schema add-ons**

  * `templates`, `template_versions`, `installations`, `profiles`.
  * `audit_logs` (publish, install, run).
* **Secrets**

  * Persist minimal API keys in DB (encrypted column).
  * Secret access API: `getCredential(name)` returns decrypted in memory only.
* **CD (preview env)**

  * PR previews for `dev-web` via Vercel/Netlify; services on Fly.io/Render (cost-aware).

### 4) DX / Quality

* Integration tests: publish → gallery → install → run.
* Load test: small RPS on `/runs` with retries enabled (k6).
* **Done Criteria (Q1/2026)**

  * Creators can publish templates and show them on a profile.
  * Users can install a template in one click and run it.
  * Minimal auth in place; secrets stored encrypted at rest.

---

## Q2/2026 — Objective 3: User Dashboard & SaaS Beta

### 1) Frontend — `apps/app-web` (User)

* **Dashboard MVP**

  * “My Workflows”, Run history (status, duration, errors), Usage tally.
  * Install from Gallery (cross-app deep link).
* **Logs & Trace UI**

  * Run tree view; step logs with timestamps; retry badge.

### 2) Services / Backend

* **Auth & Multi-tenancy**

  * Orgs/Users/Memberships; org switcher in UI.
* **Usage accounting**

  * `usage_events` append on run/step; daily aggregation job.
* **Managed Hosting (beta)**

  * Deploy “app” stack (+DB, Redis, Engine). Feature flags for beta users.
* **Credential service (minimal)**

  * Centralized store with per-org scoped secrets; rotation endpoint.

### 3) Data / Security / Infra

* **Schema add-ons**

  * `orgs`, `memberships`, `usage_events`, aggregates.
* **Sec hardening**

  * JWT/Session rotation; CSRF; CORS; HTTPS everywhere; secure headers.
  * PII mapping; secrets egress policy (never in logs).
* **Observability**

  * OpenTelemetry traces across gateway → orchestrator → engine.
  * Metrics: run latency, success rate, retry counts; dashboards (Grafana).

### 4) DX / Quality

* Synthetics: hourly smoke run of a known workflow.
* Disaster drill: kill worker → verify DLQ → replay UI.
* **Done Criteria (Q2/2026)**

  * Hosted beta with real users running workflows.
  * Users can view usage & run history.
  * Org-scoped secrets and minimal multi-tenancy live.

---

## Q3/2026 — Objective 4: Ecosystem Growth

### 1) Frontend

* **External submission**

  * “Submit Template” (external creators); moderation queue UI.
* **Community hooks**

  * Share to Discord/Twitter buttons; canonical template URLs.

### 2) Services / Backend

* **Submissions workflow**

  * Moderation endpoints; status transitions (draft → pending → approved → published).
* **Creator analytics (basic)**

  * Downloads/Installs counters; referral source tracking.
* **Webhooks (ingress)**

  * Enable `webhook` service for external triggers; validate/dedupe; enqueue.

### 3) Data / Security / Infra

* **Schema add-ons**

  * `submissions`, `moderation_events`, `referrals`.
* **Abuse/rate limit**

  * WAF rules; per-template download throttles.
* **Backups/SLA**

  * Nightly DB backups; restore drill; documented RTO/RPO.

### 4) DX / Quality

* Funnel tests: discover → view → install → run → share.
* **Done Criteria (Q3/2026)**

  * Templates accepted from external creators.
  * Public sharing flows.
  * Basic creator analytics visible.

---

## Q4/2026 — Objective 5: v1 Launch

### 1) Frontend polish

* Builder v1: refined node library (Webhook, OpenAI, Google Sheets, Slack), better empty states, zero-conf defaults, keyboard-first ops.
* App v1: calm visuals, translucent surfaces, “just works” feel; usage/costs clarity.

### 2) Services / Backend

* **Billing prototype**

  * Usage-based: per run/step & AI token pass-through; Stripe metered usage.
* **Stability**

  * Retry/backoff policies per node; circuit breakers; DLQ surfacing in UI.
* **Hardening**

  * Pen test fixes; audit logs surfaced in admin.

### 3) Data / Security / Infra

* **Data retention policy**

  * Run logs TTL with export option.
* **SLOs**

  * P0 incident runbook; pager policy; error budget tracking.

### 4) DX / Quality

* Launch-grade E2E suite; chaos tests (kill Redis/Worker); performance baseline (p50/p95 run latency).
* **Done Criteria (Q4/2026)**

  * Polished Builder & App.
  * Prototype billing working in sandbox mode.
  * Ecosystem at 20–30 active templates and stable ops.

---

## 🧱 API Contracts (MVP samples)

```http
POST /runs
Body: {
  "workflowVersionId": "wv_123",
  "inputs": { "message": "Hello" },
  "idempotencyKey": "uuid"
}
Response: { "runId": "run_abc" }
```

```http
GET /runs/:id
Response: {
  "id": "run_abc",
  "status": "running|succeeded|failed",
  "startedAt": "...",
  "finishedAt": null,
  "steps": [
    {"id":"s1","nodeId":"start","status":"succeeded","durationMs":3},
    {"id":"s2","nodeId":"http","status":"running"}
  ],
  "logs": [{ "ts":"...", "level":"info", "msg":"..." }]
}
```

```http
POST /templates
Body: { "name": "Slack Ping", "tags": ["slack"], "graph": { ... } }
Response: { "templateId": "tpl_123" }
```

```http
POST /installations
Body: { "templateId": "tpl_123" }
Response: { "installationId": "ins_456" }
```

---

## 🗃 Minimal DB Schema (Prisma-ish)

```sql
orgs(id, name, created_at)
users(id, email, name, created_at)
memberships(id, org_id, user_id, role)

profiles(id, user_id, display_name, bio)
templates(id, creator_user_id, name, tags[], created_at, published_at)
template_versions(id, template_id, version, graph_json, created_at)

installations(id, org_id, template_id, template_version_id, created_at)

workflows(id, org_id, name)                 -- optional if separate from templates
workflow_versions(id, workflow_id, version, graph_json)

runs(id, org_id, workflow_version_id, status, started_at, finished_at)
run_steps(id, run_id, node_id, status, started_at, finished_at)
run_logs(id, run_id, ts, level, message, step_id?)

secrets(id, org_id, name, enc_value, created_at)
usage_events(id, org_id, run_id, kind, amount, ts)

submissions(id, submitter_user_id, template_id?, status, created_at)
moderation_events(id, submission_id, actor_user_id, action, ts)

audit_logs(id, org_id, actor_user_id, action, resource_type, resource_id, ts, meta_json)
```

---

## 🔐 Security Controls (Phase 1)

* **Secrets:** AES-GCM encrypted at rest; never log; UI masked; copy-once pattern if possible.
* **Auth:** OAuth/Magic link; short-lived tokens; org-scoped RBAC.
* **Web:** CSRF, CORS, HTTPS, secure headers, input validation via Zod.
* **Data:** Principle of least privilege; per-table RLS optional (Postgres).
* **Ops:** API rate limits, WAF, IP throttle for burst endpoints.

---

## 📈 Performance Targets (initial)

* Run enqueue p95 < 200 ms.
* Orchestrator compile p95 < 50 ms for small graphs.
* Dashboard list runs p95 < 300 ms for last 50.
* Cold start (UI) TTFB < 200 ms on Vercel; LCP < 2.5 s.

---

## ✅ Definition of Done (per ticket)

* Type-safe inputs/outputs; Zod validation.
* Unit tests for business logic; integration tests for I/O.
* Logs contain `request_id` & `run_id`, no secrets.
* Docs: README snippet or MDX page per feature.
* Screens recorded (Loom/GIF) for UI features.

---
