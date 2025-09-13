# Sprint 1 — Task 7: Inspector shell

## Overview

Built a minimal Inspector that reads the selected node from the Zustand store and shows:

- Node type and ID
- Basic placeholder form
  - HTTP node: Method select + URL input (no validation yet)
  - Start node: "No configurable fields" message

Canvas already wires selection (click node → select, click pane → clear), so the Inspector updates live.

## Files changed/added

- apps/dev-web/src/builder/inspector/Inspector.tsx
  - Reads selection via `useSelectedNode()`
  - Persists HTTP config via `updateNodeConfig(nodeId, { method, url })`
  - Label input now persists via `updateNodeConfig(nodeId, { label })`
  - Uses `HttpConfig` type from registry for safer access (no `any`)
  - TODO: "Replace with schema-driven form using `NODE_SPECS[type].configSchema` + `zodResolver`"

- apps/dev-web/app/(builder)/builder/page.tsx
  - Renders `<Inspector />` in the right panel (Canvas wrapped in `<ReactFlowProvider>`)

- apps/dev-web/src/builder/inspector/Inspector.test.tsx
  - Shows placeholder when no selection
  - Shows HTTP form when HTTP node selected
  - Shows Start-node message when Start selected
  - Updates store when typing URL (asserts merged into `data.config`)

## Behavior

- Selecting a node shows details in Inspector
- HTTP form changes are merged into node config via store
- Clicking empty canvas clears selection and shows placeholder

## Acceptance (met)

- Selecting a node shows its details in the inspector panel ✅

## Notes & Next

- Keep Inspector minimal for Sprint 1
- Sprint 2: Move to schema-driven forms using Zod schemas and `react-hook-form + zodResolver`
- UI polish later: swap to shared UI components and align with HIG (spacing, focus states)
