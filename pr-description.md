# Sprint 1 Deliverable — Workflow Builder Scaffold

## Summary

Sprint 1 deliverable: Complete workflow builder foundation with canvas, nodes, inspector, and run panel shells. Establishes core architecture for AutomateOS with working canvas where users can place Start and HTTP nodes, connect them, and see basic UI framework.

## What's in this PR

- [x] Canvas/UX
- [x] Node registry
- [x] Inspector
- [x] Run panel
- [x] Keyboard shortcuts
- [x] LocalStorage persistence
- [x] CI/DevEx
- [x] Docs

### Changes (high level)

- **Monorepo Foundation**: Complete Turborepo + PNPM workspace setup with `apps/dev-web`
- **Core State Management**: Zustand store with nodes/edges, selection, and localStorage persistence
- **React Flow Canvas**: Working canvas with pan/zoom, node placement, and connection capabilities
- **Node Registry System**: Extensible pattern for Start and HTTP nodes with proper TypeScript types
- **UI Shells**: Inspector and RunPanel components ready for Sprint 2 integration
- **Developer Experience**: CI pipeline, unit tests, keyboard shortcuts, and development workflow
- **Windows Compatibility**: Fixed Next.js standalone output issues for cross-platform development

---

## Demo

- **Loom:** https://www.loom.com/share/2ea6974b7a9f43598875b50fbd1d9276?sid=ee367d3f-f8e5-442c-ad37-b8711b9640a8

**Sprint 1 Demo:**

![Sprint 1 Handover Demo](docs/Demos/Sprint1%20Handover%20-%205%20September%202025.gif)

> Demo flow: open `/builder` → pan/zoom → +Start → +HTTP → connect → Inspector → show Run (ready for Sprint 2).

---

## How to run locally

```bash
pnpm install
pnpm -C apps/dev-web dev   # http://localhost:3000/builder
```

> Build validation:

```bash
pnpm -C apps/dev-web typecheck
pnpm -C apps/dev-web build
```

---

## Acceptance (Sprint 1 checklist)

- [x] `/` hello page with link to Builder
- [x] `/builder` canvas renders with pan/zoom
- [x] Add **Start** + **HTTP** nodes via toolbar
- [x] Connect **Start → HTTP** with React Flow edges
- [x] Inspector shows selected node details (shell ready)
- [x] RunPanel component (shell ready for Sprint 2)
- [x] CI green: typecheck + build passing

---

## CI status

- [x] `.github/workflows/ci.yml` configured for PR validation
- [x] **Install** passes (`pnpm install --frozen-lockfile`)
- [x] **Typecheck** passes (`pnpm -C apps/dev-web typecheck`)
- [x] **Build** passes (`pnpm -C apps/dev-web build`)

---

## Screenshots (optional)

| Area    | Before          | After                                     |
| ------- | --------------- | ----------------------------------------- |
| Builder | Empty workspace | Working canvas with nodes and connections |

---

## Technical notes

**Architecture / decisions:**

- Zustand for state management (lightweight, TypeScript-first)
- React Flow for canvas (mature, extensible, good performance)
- Node registry pattern for extensibility
- Monorepo structure for future scaling (services, packages)
- localStorage persistence for development convenience

**Invariants:**

- Only one `start` node allowed (UI-enforced via registry)
- No secrets in frontend/localStorage (ready for Sprint 4)
- All state mutations through Zustand actions
- TypeScript strict mode throughout

**Known limitations:**

- Inspector forms are placeholder (Sprint 2: schema-driven forms)
- RunPanel not wired to engine (Sprint 2: `/v1/runs` integration)
- Node styling is basic (Sprint 5: UX polish)
- Windows: standalone output disabled due to symlink permissions

---

## Tests

- [x] Unit tests for core store functionality (`state.test.ts`)
- [x] Canvas component tests (`Canvas.test.tsx`)
- [x] Inspector and RunPanel component tests
- [x] Node registry validation tests
- [x] All tests passing in CI environment

**Test coverage:**

- Zustand store: add/delete nodes, selection, persistence
- Canvas: keyboard shortcuts, node interactions
- Node registry: type safety, validation

---

## Docs

- [x] `docs/_strategy/Sprint-Planning.md` - Sprint 1 marked complete
- [x] `docs/Demos/` updated with handover GIF and Loom
- [x] Repository structure documented
- [x] CI/CD pipeline documented

---

## Risk & rollout

**Risk:** Low

- Foundation code with comprehensive tests
- No breaking changes (new codebase)
- CI validation ensures build stability

**Rollback plan:** Revert PR (no data migrations in Phase 1)

**Feature flag:** n/a (foundation Sprint)

---

## Breaking changes

- [x] None (initial implementation)

---

## Related

**Issues:**

- Closes Sprint 1 milestone
- Relates to AutomateOS Phase 1 objectives

**Design/Docs:**

- Follows `docs/_business/UxUi-Guideline-HIG.md`
- Aligns with `docs/architecture/Architecture-Overview.md`

---

## Next sprint (Tech debt & TODOs)

**Sprint 2 priorities:**

- Inspector v2: schema-driven forms (`react-hook-form + zodResolver`)
- RunPanel wiring: `POST /v1/runs`, poll `GET /v1/runs/:id`
- Engine integration for actual workflow execution

**Technical improvements:**

- Deep-copy on duplicate (`structuredClone`)
- Throttle localStorage writes for performance
- Import/Export JSON (round-trip safety)
- Replace placeholder inputs with `@automateos/ui`

**Node library expansion:**

- Delay, Branch/If, Webhook nodes
- Form validation per node type
- Better node styling and UX

**DevEx improvements:**

- Re-enable standalone output with proper Windows handling
- E2E tests with Playwright
- Performance monitoring setup
