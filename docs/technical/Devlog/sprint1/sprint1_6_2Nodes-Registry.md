# Sprint 1 — Task 6: Node Registry + Two Nodes (Start, HTTP)

## Overview

Implemented a Zod-backed Node Registry and two React Flow node components (Start, HTTP), wired into the Canvas with a small toolbar to insert nodes at the cursor position. The graph integrates with the Zustand store for drag/connect updates.

## Artifacts & Key Changes

- apps/dev-web/src/builder/registry/nodeSpecs.ts
  - Zod schemas: `StartConfigSchema` (empty), `HttpConfigSchema` (method, url, headers?, body?).
  - `NODE_SPECS` with typed defaults for `start` and `http`.
  - Optional `runtime.adapter` keys (`start`, `http`) for future orchestrator/engine bridge.
  - Notes: client-only validation; no secrets in client configs.

- apps/dev-web/src/builder/canvas/nodes/StartNode.tsx
  - Simple Tailwind box, label, right-side source handle only.

- apps/dev-web/src/builder/canvas/nodes/HttpNode.tsx
  - Tailwind box; left target + right source handles.
  - Displays method badge and truncated URL from `data.config`.

- apps/dev-web/src/builder/canvas/Canvas.tsx
  - `nodeTypes = { start: StartNode, http: HttpNode }`.
  - Toolbar (Panel top-left) inserts nodes at click position using `useReactFlow().screenToFlowPosition({ x, y })`.
  - Uses `NODE_SPECS` defaults when creating nodes.
  - Selection, connect, and change handlers hooked to Zustand store.

- apps/dev-web/app/(builder)/builder/page.tsx (pre-existing)
  - Canvas is wrapped with `<ReactFlowProvider>` ensuring hooks like `screenToFlowPosition` work.

## Acceptance Criteria — Verification

- Add via toolbar:
  - Clicking Start/HTTP spawns the node where you click.
- Drag & connect:
  - Nodes are draggable; connecting Start → HTTP shows an edge with no console errors.
- Store updates:
  - `useBuilderStore.getState().nodes.length` increments on insert.
  - `edges.length` increments on connect; removing a node removes its edges.
- Types:
  - `NODE_SPECS` and `nodeTypes` are typed; no TypeScript errors in changed files.

## Tests & DX

- Unit tests added:
  - apps/dev-web/src/builder/registry/nodeSpecs.test.ts — registry presence + defaults.
  - apps/dev-web/src/core/state.insert-node.test.ts — addNode increments node count.
- Vitest config:
  - apps/dev-web/vitest.config.ts excludes `e2e/**` so Playwright tests don’t run under Vitest.
- Result: All unit tests pass locally.

## Notes & Next Steps (Optional)

- One-Start rule: use `addStartNode()` guard to prevent multiple start nodes.
- Inspector: add a schema-driven Inspector (react-hook-form + zodResolver) for HTTP config (method, url, headers, body).
- Runtime bridge: `runtime.adapter` keys ready for orchestrator/engine lookup.

## Security & UX

- No secrets/PII are stored in the client; schemas validate non-secret config only.
- Simple, readable Tailwind styles on nodes; concise labels and handles positioning.
