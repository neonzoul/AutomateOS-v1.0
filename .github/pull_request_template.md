# Sprint PR — AutomateOS

## Summary

> 1–2 sentences. What’s the goal of this PR?

- …

## What’s in this PR

- [ ] Canvas/UX
- [ ] Node registry
- [ ] Inspector
- [ ] Run panel
- [ ] Keyboard shortcuts
- [ ] LocalStorage persistence
- [ ] CI/DevEx
- [ ] Docs

### Changes (high level)

- …

---

## Demo

- **Loom:** <paste link>
- **GIF:** `docs/Demos/sprint1-demo.gif` _(attach in PR if convenient)_

> Suggested demo flow: open `/builder` → pan/zoom → +Start → +HTTP → connect → Inspector → show Run (disabled).

---

## How to run locally

```bash
pnpm install
pnpm -C apps/dev-web dev   # http://localhost:3000/builder
```

> If build-only validation needed:

```bash
pnpm -C apps/dev-web typecheck
pnpm -C apps/dev-web build
```

---

## Acceptance (Sprint checklist)

- [ ] `/` hello or link to Builder
- [ ] `/builder` canvas renders (pan/zoom)
- [ ] Add **Start** + **HTTP** nodes
- [ ] Connect **Start → HTTP**
- [ ] Inspector shows selected node details
- [ ] CI green: typecheck + build

---

## CI status

- [ ] `.github/workflows/ci.yml` ran on this PR
- [ ] **Install** passed
- [ ] **Typecheck** passed
- [ ] **Build** passed

---

## Screenshots (optional)

| Area    | Before | After |
| ------- | ------ | ----- |
| Builder |        |       |

---

## Technical notes

- Architecture / decisions:
  - …

- Invariants:
  - Only one `start` node allowed (UI-enforced)
  - No secrets in frontend/localStorage

- Known limitations:
  - …

---

## Tests

- [ ] Unit tests updated/added (e.g., store, canvas, inspector)
- [ ] Integration tests (if any)
- [ ] E2E / smoke (optional)
- Notes:
  - …

---

## Docs

- [ ] `docs/Core Development/API-Contract.md` (touched if endpoints change)
- [ ] `docs/Core Development/Code-Comments-Style.md` (n/a)
- [ ] `docs/Core Development/Sprint Planning.md` (status updated)
- [ ] `docs/Demos/` updated with Loom/GIF

---

## Risk & rollout

- Risk: Low / Medium / High (choose one)
- Rollback plan: revert PR (no data migrations in Phase 1)
- Feature flag: n/a

---

## Breaking changes

- [ ] None
- If any: describe migration path clearly.

---

## Related

- Issues: closes #…, relates to #…
- Design/Docs: …

---

## Next sprint (Tech debt & TODOs)

- Inspector v2: schema-driven forms (`react-hook-form + zodResolver`)
- RunPanel wiring: `POST /v1/runs`, poll `GET /v1/runs/:id`
- Deep-copy on duplicate (`structuredClone`), throttle localStorage
- Import/Export JSON (round-trip safety)
- Node library expansion (Delay, Branch/If, Webhook)
- Replace placeholder inputs with `@automateos/ui`
