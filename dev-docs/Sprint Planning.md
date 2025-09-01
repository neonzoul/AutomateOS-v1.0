[GPT5]

# 🚀 Sprint Planning — Objective 1 (Q4/2025)

**Duration:** Sep → Dec 2025 (≈ 12 weeks → 6 sprints of 2 weeks each)

**Goal:** Deliver visible Workflow Builder v0.1 + import/export + minimal credentials + starter workflows + public sharing.

---

## 🟢 Sprint 1 (Weeks 1–2) — Repo & Builder Scaffold

**Focus:** Monorepo ready, UI skeleton running.

- Scaffold `dev-web` app (Next.js + Tailwind + shadcn/ui).
- Create shared packages: `ui`, `workflow-schema`, `logger`.
- Add drag/drop canvas (React Flow or similar).
- Add 2 basic nodes: Start + HTTP (mock only).
- CI/CD pipeline with lint, typecheck, build.
    
    **Deliverable:** A blank workflow canvas where nodes can be placed & connected.
    

---

## 🟢 Sprint 2 (Weeks 3–4) — Node Config & Engine Integration

**Focus:** Make workflows actually executable.

- Side-panel config editor for nodes (form inputs instead of JSON).
- Wire orchestrator → external Engine v0.1 (via REST).
- Run workflow from UI (button) → engine executes.
- Show success/fail in builder (status indicator).
    
    **Deliverable:** A workflow created in the builder can run end-to-end via engine.
    

---

## 🟢 Sprint 3 (Weeks 5–6) — Import/Export + Templates

**Focus:** Let creators share workflows.

- JSON export (download button).
- JSON import (upload → render on canvas).
- Seed 1 starter workflow (e.g., Slack notification).
- Dev log #1 (show workflow export/import).
    
    **Deliverable:** Workflows can be exported/imported in 1 click.
    

---

## 🟢 Sprint 4 (Weeks 7–8) — Minimal Credentials

**Focus:** Allow API keys safely.

- Add `.env` support for developers.
- Add inline API key config to node inspector.
- Secure key storage in memory (AES-GCM).
- Add `getCredential("name")` abstraction.
- Seed 2nd starter workflow (Google Sheets automation).
    
    **Deliverable:** Creators can run real integrations with their own API keys.
    

---

## 🟢 Sprint 5 (Weeks 9–10) — Starter Workflows + UX Polish

**Focus:** Make it delightful, not just functional.

- Seed 3rd starter workflow (OpenAI API completion).
- Add snapping lines, hover highlights (Apple-level micro interactions).
- Add progress ticks on nodes when workflow runs.
- Dev log #2 & #3 (show OpenAI + polished builder).
    
    **Deliverable:** 3 working starter workflows + UI feels “fun to use.”
    

---

## 🟢 Sprint 6 (Weeks 11–12) — Demo Readiness & Community

**Focus:** Package for first creators.

- Add sample workflows to repo (`/examples`).
- Write quickstart docs (how to build, import, run).
- Post weekly logs (reach ≥50 followers, ≥10 Discord members).
- Dry-run demo: show building & running workflow in <5 minutes.
    
    **Deliverable:** A visible Workflow Builder v0.1 with starter workflows, import/export, credentials → ready to demo publicly.
    

---

# ✅ End of Q4/2025 = Success Criteria

- Builder v0.1 working (drag/drop + run).
- Import/export JSON works.
- Minimal credential handling in place.
- 3 starter workflows live (Slack, Sheets, OpenAI).
- Community seeded (≥50 followers, ≥10 Discord members).

---