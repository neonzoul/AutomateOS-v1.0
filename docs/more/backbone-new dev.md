# AutomateOS v1 — Monorepo Backbone (with Descriptions)

This is the scaffold with **short descriptions per directory** to help quickly understand roles & follow the architecture vision【148†v1-Architecture.md】.

---

## 🗂 Directory Tree (with roles)

```
automateos-v1/
├─ apps/                         # Frontend apps (Next.js)
│  ├─ dev-web/                   # AutomateOS.dev — Creator Studio (Builder, Profiles, Publishing)
│  └─ app-web/                   # AutomateOS.app — User Dashboard (Gallery, Usage, SaaS)
│
├─ services/                     # Backend Node services (Fastify/Nest)
│  ├─ api-gateway/               # BFF/API (Auth, RBAC, Templates, Workflows, Runs)
│  ├─ orchestrator/              # DAG compiler, dispatches workflows to Engine
│  ├─ webhook/                   # Ingress for external triggers (webhooks, cron)
│  └─ worker/                    # Executes workflow steps, retries, DLQ, logs
│
├─ external/                     # External Engine (Python)
│  └─ engine/                    # v0.1 Engine — execution runtime, separate repo boundary
│
├─ packages/                     # Shared code (TypeScript libraries)
│  ├─ ui/                        # Shared UI kit (Tailwind + shadcn/ui)
│  ├─ workflow-schema/           # Zod schemas for Workflow, Node, Edge, Run, Template
│  ├─ logger/                    # Pino logger + OpenTelemetry integration
│  └─ config/                    # Shared config (tsconfig, eslint, prettier, tailwind presets)
│
├─ infra/                        # Deployment, infra, and local dev setup
│  ├─ docker-compose.dev.yml     # Local dev stack (apps + services + engine)
│  ├─ docker-compose.prod.yml    # Production stack (for DigitalOcean or VM deploy)
│  └─ README.md                  # Infra/deploy notes
│
├─ .github/workflows/            # GitHub Actions CI/CD pipelines
│  ├─ build-push.yml             # Build & push Docker images (to GHCR or Artifact Registry)
│  ├─ deploy-gcp.yml             # Deploy workflow for Google Cloud Run
│  └─ deploy-do.yml              # Deploy workflow for DigitalOcean Droplet
│
├─ docs/                         # Vision → Roadmap → Requirements → ADRs (single source of truth)
│
├─ package.json                  # Root config, scripts, dev dependencies
├─ pnpm-workspace.yaml           # Monorepo workspace definitions
├─ turbo.json                    # Turborepo pipeline (build/dev/lint)
├─ tsconfig.base.json            # Shared TypeScript compiler options
├─ .eslintrc.json                # ESLint base rules
├─ .prettierrc                   # Prettier formatting rules
└─ README.md                     # Repo overview & quickstart
```

---

👉 Each folder maps directly to the **Phase 1 → 2 → 3 roadmap**【144†Phase1-AutomateOS-v1(objectives).md】. 
- `apps/dev-web` = **Q4/2025 priority** (Workflow Builder v0.1). 
- `services/*` = orchestration + API backbone for workflows. 
- `external/engine` = isolated runtime (can evolve separately). 
- `packages/*` = enforce **type safety & consistency** across apps/services. 
- `infra/*` + `.github/workflows/` = CI/CD and deploy pipelines. 
- `docs/` = living space for PRDs, API contracts, and ADRs.

---

This annotated backbone should make it easy for any dev to onboard quickly and see **where to work** depending on whether they’re on frontend, backend, infra, or schema side.


---

## 🤝 CONTRIBUTING.md (Quick Guide for New Devs)

### 1) Local Setup
- **Prereqs:** Node 20, PNPM (`corepack enable`), Docker (optional for compose), Python 3.11 (for engine devs).
- **Install:**
  ```bash
  pnpm i
  pnpm dev   # or: pnpm -C apps/dev-web dev, pnpm -C services/api-gateway dev
  ```
- **With Docker:**
  ```bash
  cd infra
  docker compose -f docker-compose.dev.yml up --build
  ```

### 2) Branching & PRs
- **Default branch:** `main`
- **Feature branches:** `feat/<area>-<short-desc>` (e.g., `feat/builder-node-inspector`).
- **Fix branches:** `fix/<area>-<short-desc>`.
- **PR template:**
  - What/Why (problem → solution)
  - Screens/GIF for UI
  - Tests added/updated
  - Checklist (below)

### 3) Commit Convention (Conventional Commits)
- `feat: add node inspector form`
- `fix: prevent secrets from logging`
- `chore: bump deps`
- `docs: add API contract for runs`

### 4) Code Style & Linting
- **TypeScript strict** everywhere (no `any` unless justified).
- **Zod** for runtime validation at boundaries.
- **ESLint + Prettier**: run `pnpm lint` before pushing.
- **Logs:** use `@automateos/logger`; include `request_id`, `run_id` when possible.

### 5) Adding a New **Service** (Node)
1. Create `services/<name>/` with `src/main.ts`, `package.json`, `tsconfig.json`, `Dockerfile` (mirror `api-gateway`).
2. Register dev script in `package.json` and ensure `turbo.json` picks it up.
3. Add health endpoint (`GET /health`).
4. Add to `infra/docker-compose.dev.yml` for local testing.
5. Add **CI build**: it’s auto-included via matrix as long as the folder has a `Dockerfile`.

### 6) Adding a New **App** (Next.js)
1. Create `apps/<name>/` (copy `apps/dev-web` scaffold).
2. Keep `next.config.js` with `output: 'standalone'` for container builds.
3. Add route in compose if needed for local.

### 7) Adding a New **Package** (shared lib)
1. Create `packages/<name>/` with `src/index.ts`, `package.json`, `tsconfig.json`.
2. Add path alias in `tsconfig.base.json`.
3. Import via `@automateos/<name>`.

### 8) Schemas & Versioning (`@automateos/schema`)
- All workflow graphs must pass `WorkflowSchema`.
- **Breaking changes** to schemas require:
  - Migration or compatibility shim.
  - Version bump (semver) and CHANGELOG note.

### 9) Database & Migrations
- ORM: **Prisma** (recommended) or Drizzle (TBD per service). 
- Put migrations in the service that owns the DB connection (`services/api-gateway` to start).
- **Migrate locally:** `pnpm -C services/api-gateway prisma migrate dev`.
- **Migrate in prod:** run a one-off job (Cloud Run Job) or `docker compose run --rm api-gateway node dist/migrate.js`.

### 10) Secrets & Env
- Never commit `.env*` files.
- Local: `.env.local` files per app/service.
- CI/CD: GitHub Actions Secrets; runtime: GCP Secret Manager or DO env files with strict perms.
- Use `getCredential(name)` abstraction; **never log secrets**.

### 11) Testing Strategy
- **Unit:** business logic, schema guards (`pnpm vitest` if added).
- **Integration:** HTTP routes, orchestrator→engine bridge.
- **E2E:** Import → Run → View logs (Playwright for UI).
- Merge only if tests pass in CI.

### 12) Observability
- Use `@automateos/logger` for structured logs.
- Add trace IDs at service boundaries; emit timing metrics for runs/steps.

### 13) PR Checklist
- [ ] Types + Zod validation at boundaries
- [ ] Unit/Integration tests updated
- [ ] No secrets or PII in logs
- [ ] Docs updated (`docs/` or README in folder)
- [ ] Screens/GIF for UI changes

### 14) Releases & Tags
- Tag `v0.Y.Z` per milestone; **v1.0.0** at launch.
- Changelogs grouped by: Apps / Services / Engine / Packages / Infra.

### 15) Security
- Input validation on every external boundary.
- CSRF/CORS/Headers for web services.
- RBAC (creator/user) where applicable.
- Regular dep updates; scan images; minimize base images.

---

**TL;DR for new contributors:**
1) `pnpm i` → `pnpm dev`  
2) Build in the folder you own (app/service/package).  
3) Validate with Zod, log with `@automateos/logger`, write tests.  
4) Open a PR with screenshots and tick the checklist.  
