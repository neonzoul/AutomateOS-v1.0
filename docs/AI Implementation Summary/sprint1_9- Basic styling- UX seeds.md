# Sprint 1.9 — Basic styling & UX seeds

Date: 2025-09-04

## Summary

Seeded a global CSS foundation, converted the Builder page to a two‑column grid (canvas + 360px panel), and added a subtle hover affordance for nodes. This gives the app a cohesive shell and improves immediate usability without heavy UI work.

## Files changed

- `apps/dev-web/app/(builder)/builder/page.tsx` — layout updated to CSS grid with fixed 360px right rail; preserved panel dividers and stacking.
- `apps/dev-web/app/globals.css` — Tailwind v4 import, app baseline (html/body), React Flow base CSS, and node hover styles.
- Verified `apps/dev-web/app/layout.tsx` imports `./globals.css`.

## What changed

- Global styles:
  - Switched to Tailwind v4 import: `@import 'tailwindcss';` (replaces deprecated `@tailwind base/components/utilities`).
  - Imported React Flow base CSS: `@import '@xyflow/react/dist/style.css';`.
  - App baseline: 100% height, zero margins, system font stack, gray-50 background.
- Builder layout:
  - Container uses CSS grid with `gridTemplateColumns: '1fr 360px'` for a stable right panel.
  - Left column: canvas (`<Canvas />`) under `ReactFlowProvider`.
  - Right column: white background, left border; Inspector stacked above Run with a divider.
- Node UX:
  - `.react-flow__node` now has pointer cursor and transition.
  - On hover: slight shadow and blue border-color highlight (subtle, non-distracting).

## Rationale & notes

- Grid guarantees a fixed right rail without flex shrink/overflow quirks; the canvas column can grow/shrink naturally.
- Tailwind v4 requires `@import 'tailwindcss'`; removed legacy at-rules to avoid build warnings.
- React Flow CSS is imported globally to ensure nodes/edges render correctly.

## Verification

- Unit tests: PASS (34/34) via `pnpm -C apps/dev-web test:run`.
- Build smoke: No errors in modified files; layout and CSS compile as expected locally.

Quality gates

- Build: PASS (smoke)
- Lint/Typecheck: PASS (no TS changes in this diff)
- Unit tests: PASS
- Smoke UI: `/builder` renders with grid and hover effects

## Acceptance criteria

- [x] `globals.css` included and loaded by `layout.tsx`
- [x] Panel layout via grid `1fr / 360px`
- [x] Dividers between canvas/panel and inspector/run
- [x] Node hover style (shadow + blue border)

## Screens/UX expectations

- `/builder` presents a stable two-column app shell.
- Right panel stays 360px; content scrolls within as needed.
- Nodes feel interactive on hover without heavy visuals.

## Follow-ups (optional)

- Introduce a small CSS variable theme (spacing, radius, duration) for consistent micro-interactions.
- Add focus states to nodes for keyboard navigation parity.
- Persist panel scroll position between Inspector/Run switches (if we add tabs later).
