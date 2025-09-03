[GPT5]

# 📝 AutomateOS v1.0 — Core Requirements

## 1. 🔑 Architectural Requirements

* **Monorepo structure (Turborepo + PNPM)**

  * `apps/dev-web` (Creator Studio)
  * `apps/app-web` (User Dashboard)
  * `services` (api-gateway, orchestrator, webhook, worker)
  * `external/engine` (kept separate; REST now, gRPC later)
  * `packages` (ui, sdk, sdk-engine, workflow-schema, types, logger, config)
* **Separation of Concerns**

  * Builder/Orchestrator logic separate from Engine execution.
  * Shared schema & types via `packages/workflow-schema`.
* **Multi-phase readiness**

  * Must support Phase 1 (Creator-first), Phase 2 (User SaaS), Phase 3 (AI/Samantha) without re-architecture.

---

## 2. 🏗 System Design Requirements

* **Core Data Models**

  * Orgs, Users, Memberships → multi-tenancy.
  * Templates, TemplateVersions, Installations → creator ecosystem.
  * Workflows, WorkflowVersions, Nodes, Edges → builder graphs.
  * Runs, RunSteps, RunLogs → execution traces.
  * Secrets (inline/env only, AES-GCM).
  * AuditLogs (compliance, trust).
* **Workflow Execution**

  * DAG compiler in Orchestrator.
  * Idempotency keys for runs/webhooks.
  * Retry & DLQ surfaced in UI.
* **Import/Export**

  * JSON one-click, roundtrip safe.
* **Security**

  * Minimal secret handling (inline/env) in Phase 1.
  * Encrypted at rest; never logged in plaintext.
* **Resilience**

  * Append-only run logs (immutable).
  * Idempotent webhooks/runs.

---

## 3. 🖌 UX/UI Requirements

* **Creator-first (AutomateOS.dev)**

  * Drag-drop workflow builder (GarageBand-like).
  * Side panel form config, no raw JSON exposed.
  * Creator Profile (simple showcase of templates).
  * Template Gallery (browse + install in 1 click).
  * Import/Export workflows with visual confirmation.
  * Starter templates (Slack, Sheets, OpenAI).
* **User-focused (AutomateOS.app)**

  * Dashboard (list workflows, run logs, usage stats).
  * Transparent usage & cost display (Pay-as-you-go).
  * Calm, translucent, “just works” visual language.
* **UI Identity**

  * Brand colors: Coral Red #E84B4B primary, Cream + Burgundy accents.
  * Logo = flowing infinity wave, animatable (breathing motion).
  * Micro-interactions: snapping lines, pulsing glow, hover expansion.

---

## 4. 🧩 Structural Requirements

* **Services**

  * `api-gateway` → Auth, RBAC, templates, workflows, runs.
  * `orchestrator` → DAG compiler, dispatch, retries, traceability.
  * `worker` → executes steps, retries, DLQ.
  * `webhook` → ingress, dedupe, enqueue.
* **Apps**

  * `dev-web` → workflow builder, profiles, publishing.
  * `app-web` → dashboard, usage, template install (later in Phase 1).
* **External Engine**

  * Stays independent; AutomateOS communicates via SDK client.

---

## 5. ⚙️ Technology / Techstack Requirements

* **Frontend**

  * Next.js (App Router) + TypeScript
  * TailwindCSS + shadcn/ui
  * React Flow (canvas)
  * Framer Motion (micro-interactions)

* **Backend / Services**

  * Node.js + TypeScript (Fastify/Nest/Fastify preferred for gateway)
  * Orchestrator/Worker: TS services with Redis queue
  * Engine: Python (v0.1), REST → gRPC upgrade path

* **Database**

  * Postgres (Prisma ORM or Drizzle if lighter needed)
  * Redis (queues + cache)

* **Infra & Deployment**

  * **Docker-first** for all apps + services (Docker Compose for local dev).
  * **CI/CD:** GitHub Actions pipelines → build & push Docker images → deploy to cloud.
  * **Cloud Options:**

    * **Google Cloud Run (preferred)** → runs Docker images serverlessly, auto-scaling.
    * **Google Cloud SQL (Postgres) + Memorystore (Redis)**.
    * Alternative: **DigitalOcean Droplets** (manual VM style) with Docker Compose or DO App Platform for managed deploys.
  * **Secret Management:**

    * GitHub Actions Secrets for CI/CD.
    * Cloud Secret Manager (GCP) or DO secrets for runtime.

* **Security**

  * AES-GCM for secrets.
  * JWT/OAuth (minimal in Phase 1, full in Phase 2).

* **Observability**

  * Pino logger + OpenTelemetry traces.
  * Metrics exported to Grafana/Prometheus (or GCP Monitoring).

---

## 6. 🎯 v1.0 Success Criteria

* **Workflow Builder v1** (polished UX/UI, Apple-level).
* **Template Gallery + Creator Profiles** live.
* **Community ecosystem** → ≥100 true creators engaged.
* **User Dashboard (beta SaaS)** → usage, run logs, minimal hosting.
* **Security baseline** → secrets encrypted, no plaintext logs.
* **Prototype billing** → Pay-as-you-go tested.
* **Ecosystem alive** → ≥20–30 templates in real use.

---

👉 This requirement doc = **North Star for developers**:

* **What must exist** (features, infra, UX, security).
* **How it should be built** (tech choices, structure).
* **Why it matters** (alignment with vision).

---
