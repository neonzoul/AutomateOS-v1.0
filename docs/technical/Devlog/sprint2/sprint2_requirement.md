[GPT5 Agent Mode]

# Sprint 2 – Node Config & Engine Integration (Weeks 3–4)

## Overview

**Objective:** Enable creators to configure workflow nodes and execute workflows end‑to‑end from the builder. Sprint 1 delivered the monorepo scaffold, canvas, node registry and basic UI; this sprint focuses on making those nodes functional. The builder must render configuration forms based on each node’s Zod schema, validate input, update the underlying state, and dispatch compiled workflows to the external Engine (v0.1) via REST. When a run completes, the UI should display per‑node status (success/fail) and surface validation feedback to the user.

**Strategic focus:**

Node configuration and Engine integration — bridging the front‑end builder to the back‑end execution engine while adhering to the project pillars of separation of concerns and multi‑phase readiness.

The Engine remains an independent service; the orchestrator compiles workflows and sends them over a defined REST contract.

## Scope & Deliverables

- Provide a **generic Inspector panel** that dynamically renders form fields from a node’s Zod schema. The Inspector should use `react-hook-form` with a Zod resolver for type‑safe validation and display contextual help. No raw JSON should be shown to end‑users.
- Implement `updateNodeConfig(nodeId, values)` in the Zustand store. This function mutates the node’s configuration, revalidates against the schema and triggers re‑render. Updates must preserve immutability patterns and maintain compatibility with Phase 2/3 features (e.g. credential selection). Shared types must come from `packages/workflow-schema`.
- **Validation feedback** must surface through unobtrusive toasts and inline error messages. Use micro‑interactions consistent with the UX guidelines — e.g. subtle highlight or pulsing icons instead of modal pop‑upsnewtab.
- **Orchestrator → Engine wiring:** Extend the orchestrator service to compile the client‑side workflow into a DAG and dispatch it to the Python engine (v0.1) via `POST /execute`. Include idempotency keys and run metadata per the baseline data model. Ensure that secrets remain inline/in‑memory and are not logged in plaintext.
- **Run workflow from UI:** Add a “Run” button to the builder UI that invokes `api-gateway/runs`, which in turn instructs the orchestrator to call the Engine. The UI should optimistically indicate a run has started and then update node badges to idle/running/success/fail based on `GET /runs/:id` status. Render a run panel listing steps and logs when a node is selected.
- **Run status on nodes:** Once the engine returns execution results, the builder must decorate each node with success/fail badges and update the run panel accordingly. Use pulsing glow for active nodes and green/red ticks for success/failure, as described in the UX guideline.
- ✅ **Deliverable:** A workflow built in the UI executes through the orchestrator and engine end‑to‑end. Creators can configure nodes via forms, run workflows and observe per‑node outcomes with appropriate validation feedback.

## Functional Requirements

1. **Inspector Rendering**
   - Read the Zod schema for each node type from `packages/workflow-schema` and generate a corresponding React form. Support primitive types (string, number, boolean) and nested objects.
   - Use sensible defaults and display descriptive labels and helper text. The form must update the Zustand store via `updateNodeConfig` on blur/change.
   - Follow contextual simplicity — keep forms concise and grouped logicallynewtab.
2. **State Management & Validation**
   - Implement `updateNodeConfig(nodeId, values)` that performs:
     - Deep merge of new values into the node config.
     - Validation with Zod; return error messages per field.
     - Trigger toast or inline error display without blocking editing.
   - Persist the updated graph in localStorage for dev convenience, but design the API so that persistence can later switch to remote storage (Phase 2).
3. **Orchestrator & Engine Contract**
   - Define a typed request (`ExecuteRequest`) containing `workflow_id`, `run_id`, `dag_nodes`, `dag_edges`, and per‑node config. Include `idempotency_key` to allow safe retries.
   - Implement a REST client in the orchestrator (`/services/orchestrator/src/engineClient.ts`) that calls the engine’s `POST /execute` endpoint. Handle timeouts, retries and error propagation.
   - When the engine returns a result, update the run record and notify subscribed clients via a WebSocket or polling (simplify with polling in v0.1).
4. **UI Run Flow**
   - Add a Run button in the builder toolbar. On click, call `startRun(workflow)` via the API gateway. Disable the button if validation fails.
   - Poll `GET /runs/:id` until completion. Use exponential back‑off; show spinner on the overall run and pulses on individual nodes.
   - Update node badges: grey → running → green for success, red for failure. Provide a tooltip on hover with error message or output.
5. **Error Handling & Observability**
   - Surface engine errors to the UI without exposing stack traces. Display human‑friendly messages and log detailed errors via `@automateos/logger` with `request_id` and `run_id`.
   - Ensure no secrets or PII appear in logs or error messages.
   - Instrument orchestrator and engine calls with OpenTelemetry traces; metrics should include run latency, success rate and retry counts for later dashboards.

## Non‑Functional Requirements

- **Separation of concerns:** Keep builder/orchestrator logic separate from engine execution. The front‑end must not call the engine directly; all communication goes through the orchestrator and API gateway.
- **Multi‑phase readiness:** Design interfaces and state structures so they can evolve for the User Dashboard and Samantha layers without major rewrites. For example, do not bake in assumptions about credential storage.
- **Security:** Use inline or environment API keys only (Phase 1) and encrypt them with AES‑GCM if persisted. Never log secrets. Respect RBAC boundaries in the API gateway (public endpoints only require minimal auth in Phase 1).
- **Resilience:** Implement retries and idempotency keys for orchestrator → engine calls. Append run logs immutably for audit.
- **UX guardrails:** Never expose raw JSON to end‑users; rely on forms and smart defaults. Incorporate delight — snapping lines, pulsing nodes, gentle toasts — to make configuration pleasantnewtab.

## Acceptance Criteria

1. A creator can select a node in the builder and see a dynamically generated form reflecting the node’s schema. Editing values updates the graph state and revalidates without page refresh.
2. Invalid input triggers inline error messages and a toast explaining what needs to be fixed. The Run button remains disabled until the graph is valid.
3. Clicking **Run** sends the compiled workflow to the engine via the orchestrator. The API gateway returns a `run_id` which the UI uses to poll status.
4. As the run progresses, nodes visually indicate running state; upon completion they display success or failure badges with hoverable details.
5. Successful runs produce run logs accessible in the Run panel. Errors do not leak secrets or stack traces.
6. The Senior Engineer has broken down these requirements into developer tasks (UI, orchestrator, engine client) and documented them in the sprint planning board.

## Additional Notes

- **Design alignment:** Use the brand colors (Coral Red #E84B4B, Cream, Burgundy) and motion system described in the UX guidenewtab. Forms should be consistent with the overall UI kit. [Follow .\docs\_business\UxUi-Guideline-HIG.md]
- **Testing:** Unit tests must cover schema validation, state updates and orchestrator request formation. Integration tests should simulate running a sample workflow end‑to‑end.
- **Documentation:** Update `docs/` with API contracts, state diagrams and how to add new nodes. Provide a short “Run your first workflow” guide.

# For Implementation.

## 📋 Acceptance Criteria

- Run button works (stub or live): workflow triggers, status updates in RunPanel.
- Inspector validates inputs using Zod, shows inline errors.
- Export/Import round-trips identical workflow JSON.
- API Gateway responds correctly to `/runs` endpoints (even stubbed).
- All CI checks (lint, typecheck, build, test) pass on PR.

---

**Theme:** Run controller + schema-driven inspector + import/export (mock backend OK).

## Definition of Done (Sprint 2)

- ✅ Run button triggers mocked run; statuses/logs update.
- ✅ Inspector uses zod+rhf on HTTP config with inline errors.
- ✅ Import/Export round-trips the graph with validation.
- ✅ Unit & component tests cover run/import/inspector paths.
- ✅ CI is green on PR; demo Loom/GIF attached.

---

---

### Tiny code hints (you’ll likely paste these)

**Trigger download (export)**

```tsx
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Polling pattern**

```tsx
export async function poll<T>(
  fn: () => Promise<T>,
  stop: (res: T) => boolean,
  ms = 1500
) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fn();
    if (stop(res)) return res;
    await new Promise((r) => setTimeout(r, ms));
  }
}
```
