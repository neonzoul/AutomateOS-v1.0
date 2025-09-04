# Sprint 1 — Task 8: RunPanel shell

## Overview

Added a minimal RunPanel on the right sidebar below the Inspector. It’s a presentational shell only for Sprint 1 with:

- A disabled “Run” button (no behavior yet)
- A stub status area showing “No runs yet”
- A11y/testing attributes (`aria-label`, `aria-disabled`, `data-testid`)

This sets the stage for Sprint 2 to wire up the orchestrator/engine run flow.

## Files changed/added

- apps/dev-web/src/builder/run/RunPanel.tsx
  - New component rendered as an `<aside>`
  - Disabled button labeled “Run” and titled “Run (disabled in Sprint 1)”
  - Stub status text: “No runs yet”

- apps/dev-web/app/(builder)/builder/page.tsx
  - Import and render `<RunPanel />`
  - Replaces the prior placeholder “Run Controls” block

- apps/dev-web/src/builder/run/RunPanel.test.tsx
  - Verifies presence of the panel via `aria-label`
  - Asserts the Run button exists and is disabled
  - Asserts the status text matches “No runs yet”

## Behavior

- Right panel shows a “Run” header with a disabled button
- Status area displays the stub message
- No side effects, no network calls

## Acceptance (met)

- Disabled Run button visible ✅
- Status area reads “No runs yet” ✅
- Integrated into Builder page layout (below Inspector) ✅
- Unit test covers core shell behaviors ✅

## Notes & Next (Sprint 2)

- Implement `startRun(payload)` client to call `/v1/runs`
- Show current run status: `queued | running | succeeded | failed`
- Poll `/v1/runs/:id` and stream logs into the panel
- Add tests for status transitions and button enable/disable logic
