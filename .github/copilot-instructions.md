# AutomateOS v1.0 — AI Coding Instructions

## Project Overview

AutomateOS is a **visual workflow automation platform** built as a monorepo with Next.js frontends, Node.js services, and a Python execution engine.
The goal: a no-code builder where **creators** design, share, and run workflows — and eventually, an ecosystem around templates.

---

## Architecture & Key Components

### **Monorepo Structure (Turborepo + PNPM)**

- **`apps/dev-web`** → Creator Studio (Next.js + React Flow builder) ✅ _Phase 1 priority_
- **`apps/app-web`** → User Dashboard (planned for Q2/2026, **not in Phase 1 scope**)
- **`services/`** → Backend microservices (api-gateway, orchestrator, webhook, worker)
- **`external/engine`** → Python workflow execution runtime
- **`packages/`** → Shared libraries (`ui`, `workflow-schema`, `logger`, `config`)

### **Core Tech Stack**

- **Frontend**: Next.js 15, React Flow (@xyflow/react), Zustand, react-hook-form, Zod, Framer Motion
- **Backend**: Node.js (Fastify/NestJS planned)
- **Engine**: Python (FastAPI runtime)
- **Data**: Postgres + Redis
- **Deployment**: Docker + Docker Compose (later GCP or DigitalOcean CI/CD)

---

## Phase Context

**Phase 1 (Sep 2025 – Dec 2026) = from engine → product → ecosystem**

- **Q4/2025** → Workflow Builder Foundation (v0.1)
- **Q1/2026** → Creator Experience (Profiles, Gallery, 10 templates)
- **Q2/2026** → User Dashboard (AutomateOS.app beta)
- **Q3/2026** → Ecosystem Growth (submissions, analytics)
- **Q4/2026** → Polished Builder v1.0 launch + partner readiness

🎯 **North Star Goal**: Deliver a visible product, attract the first **100 true creators**, and prove the vision.

---

## Development Workflows

### **Essential Commands**

```bash
pnpm dev                    # Start all dev servers
pnpm build                  # Build all packages
pnpm -C apps/dev-web dev    # Start only dev-web
pnpm -C apps/dev-web add    # Add deps to dev-web (workspace aware)
```

> Always use `-C <workspace>` flag when working in apps/services.

### **Key Files**

- **`docs/Core Development/BACKBONE.md`** → repo + infra blueprint
- **`docs/dev-web (Creator Studio)/Architecture.md`** → frontend guide
- **`docs/Mermaid Chart/*.mmd`** → diagrams (arch, system design, data model)
- **`apps/dev-web/app/(builder)/builder/page.tsx`** → Builder entry point

---

## Project-Specific Patterns

### **State Management (Zustand)**

- Global store in `src/core/state.ts`
- Holds: `nodes`, `edges`, `selection`, `run status`
- Example:

  ```ts
  const selected = useBuilderStore((s) => s.selectedNode);
  ```

### **Schema-Driven Development**

- All validation via `@automateos/workflow-schema` (Zod schemas)
- Forms → `react-hook-form + zodResolver`
- Node config forms **auto-generate** from registry schemas

### **React Flow Integration**

- Custom nodes (Start, Http, later more)
- Node registry pattern:

  ```ts
  type NodeSpec = {
    type: string;
    configSchema: ZodType;
    component: React.FC;
    runtime: { adapter: string };
  };
  ```

- Canvas state synced with Zustand store

### **Component Layout**

```
BuilderPage (3-column grid)
├── Canvas (React Flow, nodes/edges)
├── Inspector (form from Zod schema of selected node)
└── RunPanel (run button + status/logs)
```

### **Import/Export**

- Workflows = JSON validated against `WorkflowSchema`
- Must be **round-trip safe** (export → import identical)
- Validation always at schema boundary

---

## UX Guardrails

- Never expose raw JSON to end-users
- Smart defaults everywhere
- Motion with purpose (snapping, pulsing, breathing transitions)
- Templates = digital products (preview + share)
- UI should feel **alive, human, delightful** (GarageBand for workflows)

---

## Current Phase: Sprint 1 (Q4 2025)

**Focus:** Repo scaffold + basic workflow builder
**Status:** ✅ Monorepo, ✅ deps installed, 🚧 canvas integration

### **Sprint 1 Priorities**

1. Zustand store (nodes, edges, selection)
2. Node Registry (StartNode + HttpNode schemas + components)
3. Inspector Panel (schema → form)
4. Canvas Polish (drag, connect, select UX)

---

## Known Technical Debt

- Legacy `reactflow` package → remove (use `@xyflow/react` only)
- Canvas renders but not wired to Zustand
- Node registry & inspector missing
- CI/CD covers only `dev-web`, not services

---

## Integration Points

### **Frontend → Backend**

1. Builder creates graph (Zustand store)
2. Export validates with `WorkflowSchema`
3. Run → POST `/runs` → orchestrator → Python engine
4. Poll `/runs/:id` → update node badges, stream logs

### **Secrets & Security**

- ❌ No secrets in frontend/localStorage
- ✅ Backend encrypts (AES-GCM) + handles at runtime
- ✅ Engine receives decrypted only at execution

---

## Development Guidelines

### **File Organization**

- `src/builder/*` → feature-first builder modules
- `src/components/*` → shared dev-web UI
- `src/core/*` → cross-cutting state, utils, http

### **Naming Conventions**

- Packages: `@automateos/<name>`
- Components: PascalCase exports
- Stores: camelCase with typed selectors

### **Code Quality**

- Strict TypeScript
- Zod schemas for all validation
- Memoized selectors for performance
- Composition > inheritance

---

## AI Assistant Rules

- Always create new code under correct folder (`src/builder/*`) unless cross-cutting.
- Never put secrets or API keys in frontend code.
- Prefer `@automateos/schema` imports over redefining.
- If schema doesn’t exist → **generate one** with Zod.
- Before guessing, check `/docs/dev-web/Architecture.md` or `/docs/Core Development/Sprint Planning.md`.
- When explaining somthing, try to explain with easy to understand, clear, precise.

---

## Testing Strategy

- **Unit:** schema validation, graph utils
- **Component:** Inspector forms, node rendering
- **Integration:** run controller mocks (`/runs`, `/runs/:id`)
- **E2E:** import workflow → run → see success/fail ticks

---

_This repo is in **active Phase 1 development**. End of Q4/2025 success = Builder v0.1 running (drag/drop + run), Import/Export, minimal credentials, 3 starter workflows, community seed (≥50 followers, ≥10 Discord)._

---
