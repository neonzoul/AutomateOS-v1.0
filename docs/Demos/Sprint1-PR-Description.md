# Sprint 1 Deliverable — Workflow Builder Scaffold

## Summary

This PR delivers the Sprint 1 scope for AutomateOS: a fully functional workflow builder scaffold with canvas interaction, node registry, persistence, and CI/CD pipeline. Users can create workflows by adding nodes, connecting them, and inspecting their properties—all with automatic localStorage persistence.

## What's in this PR

- [x] **Canvas/UX** - React Flow integration with pan/zoom, drag-drop, node connections
- [x] **Node registry** - Start and HTTP nodes with extensible registry system  
- [x] **Inspector** - Right panel updates based on node selection
- [x] **Run panel** - Bottom panel shell (ready for Sprint 2 engine integration)
- [x] **Keyboard shortcuts** - Delete key for node removal
- [x] **localStorage persistence** - Auto-save/restore workflows on page refresh
- [x] **CI/DevEx** - GitHub Actions pipeline with install, typecheck, build
- [x] **Docs** - Sprint planning, handover notes, demo instructions

### Changes (high level)

- Enhanced Zustand store with React Flow integration and persistence
- Canvas component with toolbar, node registry, and connection handling  
- Inspector panel that dynamically shows node properties
- RunPanel shell ready for backend engine integration
- Comprehensive test suite with Vitest + React Testing Library
- CI/CD pipeline ensuring code quality on every PR
- Docker support for consistent development environment

---

## Demo

- **Loom:** [Record and paste link here]
- **Demo Instructions:** `docs/Demos/Sprint1-Demo-Instructions.md`
- **Handover Notes:** `docs/Demos/Sprint1-Handover-Notes.md`

> **Demo flow**: Open `/builder` → add Start node → add HTTP node → connect them → click nodes to see Inspector update → show localStorage persistence on refresh

---

## How to run locally

```bash
# Install and start
pnpm install
pnpm -C apps/dev-web dev   
# → http://localhost:3000/builder

# Validate build
pnpm -C apps/dev-web typecheck
pnpm -C apps/dev-web build

# Run tests  
pnpm -C apps/dev-web test
```

---

## Tech Debt & Sprint 2 TODOs

**🔄 Ready for Sprint 2:**
- Wire RunPanel to backend execution engine (`/api/v1/runs`)
- Add form validation to Inspector (react-hook-form + Zod)
- Expand node registry (File, Database, Transform nodes)  
- Implement workflow execution with real data flow

**🎯 Sprint 1 Success Criteria Met:**
- ✅ Canvas loads and accepts nodes
- ✅ Nodes can be connected with edges
- ✅ Inspector shows node properties
- ✅ Workflows persist across sessions
- ✅ CI pipeline ensures code quality
- ✅ Comprehensive test coverage

---

## CI/CD Status

This PR must have **all CI checks passing**:
- ✅ `pnpm install` (dependencies)
- ✅ `pnpm -C apps/dev-web typecheck` (TypeScript)  
- ✅ `pnpm -C apps/dev-web build` (Next.js build)

GitHub Actions workflow: `.github/workflows/ci.yml`

---

**Ready to merge into `main` and tag as Sprint 1 deliverable.**
