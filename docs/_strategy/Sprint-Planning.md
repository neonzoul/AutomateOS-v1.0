[GPT5]

# 🚀 Sprint Planning — Objective 1 (Q4/2025)

**Duration:** Sep → Dec 2025 (≈ 12 weeks → 6 sprints of 2 weeks each)

**Goal:** Deliver visible Workflow Builder v0.1 + import/export + minimal credentials + starter workflows + public sharing.

---

## 🟢 Sprint 1 — Scaffold & Canvas (Weeks 1–2)

**Goal:** Developer foundation, first visible canvas.

**Strategic focus:** Repo & Builder Scaffold

✅ **Deliverable:** Blank workflow canvas, nodes can be placed & connected.

**Status: ✅ COMPLETED (September 5, 2025)**

**Completed Tasks:**

- ✅ Monorepo scaffold with Turborepo + PNPM
- ✅ Core dependencies installed (Zustand, React Flow, zod, etc.)
- ✅ Zustand store with nodes/edges + selection + localStorage persistence
- ✅ Canvas shell with React Flow integration
- ✅ StartNode + HttpNode components via registry pattern
- ✅ Inspector + RunPanel shells
- ✅ Keyboard shortcuts (Delete, Escape)
- ✅ CI/CD pipeline with typecheck + build
- ✅ Unit tests for core functionality

**Demo:** [Sprint 1 Handover - 5 September 2025.gif](../Demos/Sprint1%20Handover%20-%205%20September%202025.gif)
**Loom:** https://www.loom.com/share/2ea6974b7a9f43598875b50fbd1d9276?sid=ee367d3f-f8e5-442c-ad37-b8711b9640a8

**Technical tasks (Sprint A)**

- Install core deps: Zustand, React Flow, react-hook-form, zod (resolver), Framer Motion.
- Scaffold monorepo: `dev-web`, shared `ui`, `workflow-schema`, `logger`.
- Implement Zustand store (`nodes/edges + selection`).
- Add Canvas + Inspector + RunPanel shells.
- Implement StartNode + HttpNode components.
- Node Registry (`NODE_SPECS`).
- CI/CD pipeline basic checks.

---

## 🟢 Sprint 2 — Inspector & Engine Integration (Weeks 3–4)

**Goal:** Workflows actually run.

**Strategic focus:** Node Config + Engine integration

**Technical tasks (Sprint B)**

- Generic Inspector rendering forms from node’s Zod schema.
- `updateNodeConfig(nodeId, values)` mutates store + revalidates.
- Validation: toasts / inline errors.
- Wire orchestrator → external Engine v0.1 (REST).
- Run workflow from UI → engine executes.
- Show run status on nodes (success/fail).
  ✅ **Deliverable:** Workflow built in UI executes end-to-end.

---

## 🟢 Sprint 3 — Import/Export & Persistence (Weeks 5–6)

**Goal:** Share workflows.

**Strategic focus:** Share workflows (JSON)

**Technical tasks (Sprint C)**

- `exportWorkflow()` → validated JSON (round-trip safe). (download)
- `importWorkflow(file)` → validate & render on canvas. (upload → render)
- Extend Zustand store to handle imported state.
- Save/load via localStorage (dev convenience).
- Seed 1 starter workflow (Slack notification).
- Post Dev Log #1 (public).
  ✅ **Deliverable:** Workflows export/import in 1 click.

---

## 🟢 Sprint 4 — Run Controller & Credentials (Weeks 7–8)

**Goal:** Run real integrations safely.

**Strategic focus:** Credentials + run feedback

**Technical tasks (Sprint D)**

- Run Controller: `startRun()` → POST `/v1/runs` (mock → real).
- Poll run status → update node badges.
- RunPanel: step list + logs.
- Add `.env` support for devs.
- Inline API key config in inspector.
- Secure key storage in memory (AES-GCM).
- Abstraction: `getCredential("name")`.
- Seed 2nd starter workflow (Google Sheets automation).
  ✅ **Deliverable:** Workflows with real credentials + live run feedback.

---

## 🟢 Sprint 5 — UX Polish & Starter Workflows (Weeks 9–10)

**Goal:** Make it fun, not just functional.

**Strategic focus:** Delight + OpenAI demo

**Technical tasks (Sprint E)**

- Micro-interactions: UX polish: snap lines, hover glow, pulsing active nodes.
- Keyboard shortcuts: delete, duplicate, align, zoom.
- Node run progress (ticks, pulsing glow).
- Focus styles, roles, aria-labels for accessibility.
  - Motion system: smooth panel transitions.
- Seed 3rd starter workflow (OpenAI completion).
- Dev Logs #2 & #3 (showcase OpenAI + polish).
  ✅ **Deliverable:** 3 working starter workflows + polished builder feel. (working starter workflows + GarageBand-like builder UX.)

---

## 🟢 Sprint 6 — Hardening & Community Demo (Weeks 11–12)

**Goal:** Ship to first creators.

**Strategic focus:** Demo readiness + community seeding

**Technical tasks (Sprint F)**

- Error boundaries around Canvas/Inspector/RunPanel.
- Telemetry hooks (track node add/delete, run start/finish).
- E2E test: import → run → status OK (Playwright).
- Add sample workflows to repo (`/examples`).
- Write Quickstart docs. (build, import, run).
- Weekly logs, reach ≥50 followers + ≥10 Discord members.
- Dry-run demo: build & run workflow in <5 mins.
  ✅ **Deliverable:** Workflow Builder v0.1 demo-ready + seeded community (with templates + minimal credentials.).

---

# ✅ End-of-Quarter Success

- Workflow Builder v0.1 runs workflows via engine (drag/drop + run).
- Import/export JSON. (1-click).
- **Minimal credentials** (.env + inline).
- 3 starter workflows live (Slack, Sheets, OpenAI).
- Early community seeded (≥50 followers, ≥10 Discord).

---
