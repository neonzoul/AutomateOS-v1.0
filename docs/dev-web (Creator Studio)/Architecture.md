Yes—this is the perfect moment to nail the **dev-web (Creator Studio) architecture** so the builder scales cleanly. Here’s a focused plan with a concrete folder structure, key modules, data flows, and a ready-to-use task checklist.

# 🧱 dev-web Architecture (Next.js + React Flow)

## 1) Folder Structure (feature-first + builder core)

```
apps/dev-web/
├─ app/
│  ├─ (builder)/                        # Builder route group
│  │  └─ builder/
│  │     ├─ page.tsx                    # /builder (canvas + inspector + run panel)
│  │     └─ layout.tsx
│  ├─ api/                              # (optional) Next server actions/proxies later
│  └─ layout.tsx
├─ src/
│  ├─ core/                             # cross-cutting FE core
│  │  ├─ config.ts                      # env, constants
│  │  ├─ http.ts                        # API client (fetch wrapper)
│  │  ├─ state.ts                       # global store (Zustand) + selectors
│  │  └─ types.ts                       # FE-only types (import shared from @automateos/schema)
│  ├─ builder/                          # builder feature domain
│  │  ├─ canvas/                        # React Flow integration
│  │  │  ├─ Canvas.tsx
│  │  │  ├─ nodes/                      # node UIs
│  │  │  │  ├─ StartNode.tsx
│  │  │  │  └─ HttpNode.tsx
│  │  │  └─ edges/
│  │  ├─ inspector/                     # right-side config panel
│  │  │  ├─ Inspector.tsx
│  │  │  └─ fields/                     # form field components
│  │  ├─ registry/                      # node registry (display + runtime keys)
│  │  │  ├─ registry.ts
│  │  │  └─ nodeSpecs.ts                # Zod schemas, defaults, icons
│  │  ├─ io/                            # import/export + validation
│  │  │  ├─ importWorkflow.ts
│  │  │  ├─ exportWorkflow.ts
│  │  │  └─ validate.ts
│  │  ├─ run/                           # run controller + status polling
│  │  │  ├─ RunPanel.tsx
│  │  │  ├─ runClient.ts                # calls api-gateway /runs
│  │  │  └─ polling.ts
│  │  ├─ ux/                            # microinteractions & helpers
│  │  │  ├─ motion.ts                   # Framer Motion helpers
│  │  │  └─ gestures.ts                 # keyboard, snapping utils
│  │  └─ utils/                         # feature utils (graph transforms, idempotency keys)
│  ├─ components/                       # shared UI for dev-web (wrappers over @ui)
│  │  ├─ AppShell.tsx
│  │  ├─ Sidebar.tsx
│  │  └─ Toolbar.tsx
│  ├─ styles/
│  │  └─ globals.css
│  └─ lib/
│     └─ zod.ts                         # zodResolver, helpers
├─ public/
│  └─ icons/
├─ next.config.js
├─ package.json
└─ tsconfig.json
```

## 2) Core design choices

* **State**: lightweight global store with **Zustand** (canvas graph, selection, run status). Avoid Redux boilerplate.
* **Schemas**: all graph validation via `@automateos/schema` (Zod). Forms use `react-hook-form + zodResolver`.
* **Canvas**: **React Flow** with custom nodes (Start, HTTP first), snapping & smart edges; use memoized selectors to keep 60fps.
* **Node Registry**: a single source that maps node type →

  * UI component
  * Zod schema (config)
  * runtime “adapter key” (so orchestrator knows what to execute)
* **Run Path**: UI → `api-gateway /runs` → orchestrator → engine. dev-web only polls statuses and renders logs; **no secrets in client**.
* **Delight**: Framer Motion micro-interactions, hover glow, pulsing active nodes—centralized in `builder/ux`.

## 3) Data flow (happy path)

1. User adds nodes/edges → graph in Zustand store.
2. Inspector reads selected node → renders form from that node’s Zod schema; updates store on change.
3. Export/Import uses `@automateos/schema.WorkflowSchema` to validate & transform.
4. Run: POST `/runs` with `workflowVersionId` or raw graph (v0.1), receive `runId`, start polling `GET /runs/:id`.
5. UI updates node badges (running/succeeded/failed) and streams logs into `RunPanel`.

---

# 🧩 Key modules (what to implement)

## A) Node Registry (single source of truth)

```ts
// src/builder/registry/nodeSpecs.ts
import { z } from 'zod';
import { NodeSchema } from '@automateos/schema';

export const StartConfig = z.object({}); // no config
export const HttpConfig = z.object({
  method: z.enum(['GET','POST']).default('GET'),
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
});

export type NodeSpec = {
  type: string;
  label: string;
  icon?: React.ComponentType<any>;
  configSchema: z.ZodTypeAny;
  runtime: { adapter: 'start' | 'http' }; // orchestrator uses this
  defaults?: Record<string, any>;
};

export const NODE_SPECS: Record<string, NodeSpec> = {
  start: { type: 'start', label: 'Start', configSchema: StartConfig, runtime: { adapter: 'start' } },
  http:  { type: 'http',  label: 'HTTP',  configSchema: HttpConfig,  runtime: { adapter: 'http'  } },
};
```

## B) Canvas + Nodes

```tsx
// src/builder/canvas/Canvas.tsx
'use client';
import ReactFlow, { Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useBuilderStore } from '@/src/core/state';
import { StartNode } from './nodes/StartNode';
import { HttpNode } from './nodes/HttpNode';

const nodeTypes = { start: StartNode, http: HttpNode };

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useBuilderStore((s) => s.flowApi);
  return (
    <div className="h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
```

## C) Inspector (form from schema)

```tsx
// src/builder/inspector/Inspector.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NODE_SPECS } from '../registry/nodeSpecs';
import { useBuilderStore } from '@/src/core/state';

export function Inspector() {
  const sel = useBuilderStore((s) => s.selectedNode);
  if (!sel) return <div className="p-4 text-sm opacity-70">Select a node to edit</div>;
  const spec = NODE_SPECS[sel.type];
  const form = useForm({ resolver: zodResolver(spec.configSchema), defaultValues: sel.data?.config ?? {} });

  const onSubmit = form.handleSubmit((values) =>
    useBuilderStore.getState().updateNodeConfig(sel.id, values)
  );

  return (
    <form onSubmit={onSubmit} className="p-3 space-y-3">
      {/* Render generic fields — can expand to per-type components later */}
      {/* Example: url */}
      {'url' in form.getValues() && (
        <div>
          <label className="block text-xs mb-1">URL</label>
          <input className="w-full border p-2 rounded" {...form.register('url')} />
        </div>
      )}
      <button className="w-full border rounded py-2">Save</button>
    </form>
  );
}
```

## D) Run Controller (API client + polling)

```ts
// src/builder/run/runClient.ts
import { api } from '@/src/core/http';
export async function startRun(payload: any) {
  const res = await api.post('/v1/runs', payload);
  return res.json() as Promise<{ runId: string }>;
}
export async function getRun(id: string) {
  const res = await api.get(`/v1/runs/${id}`);
  return res.json();
}
```

---

# 🎨 Page Composition (builder)

```tsx
// app/(builder)/builder/page.tsx
import { Canvas } from '@/src/builder/canvas/Canvas';
import { Inspector } from '@/src/builder/inspector/Inspector';
import { RunPanel } from '@/src/builder/run/RunPanel';

export default function BuilderPage() {
  return (
    <main className="grid grid-cols-[1fr_360px] h-[calc(100vh-64px)]">
      <Canvas />
      <section className="border-l flex flex-col">
        <Inspector />
        <div className="border-t">
          <RunPanel />
        </div>
      </section>
    </main>
  );
}
```

---

# ✅ Notion-ready task checklist

## Sprint A — Scaffold & Canvas

* Install **Zustand**, **React Flow**, **react-hook-form**, **zod** (w/ resolver), **Framer Motion**.
* Create folder structure above; wire **page.tsx** with `Canvas + Inspector + RunPanel`.
* Implement **Zustand store** with `nodes/edges + selection` and handlers.
* Implement **StartNode** and **HttpNode** components.
* Implement **Node Registry** with `NODE_SPECS`.

## Sprint B — Inspector & Validation

* Generic **Inspector** that renders form from node’s **Zod schema**.
* `updateNodeConfig(nodeId, values)` mutates store and revalidates.
* Toasts / inline errors on invalid configs.

## Sprint C — Import/Export & Persistence

* `exportWorkflow()` → validated JSON (round-trip safe).
* `importWorkflow(file)` → validate → render.
* Save/Load to localStorage (optional dev convenience).

## Sprint D — Run Controller

* `startRun()` posts to `/v1/runs` (mock first).
* Poll `GET /v1/runs/:id` → update node badges.
* **RunPanel** shows step list + logs.

## Sprint E — UX Polish & Accessibility

* Snap lines, hover glow, pulsing active nodes.
* Keyboard: delete, duplicate, align, zoom.
* Focus styles, roles, aria-labels for controls.

## Sprint F — Hardening

* Error boundaries around Canvas/Inspector/RunPanel.
* Telemetry hooks (track node add/delete, run start/finish).
* E2E: import → run → status OK (Playwright).

---

# 🧪 Testing strategy

* **Unit**: registry specs (schemas & defaults), utils (graph transforms).
* **Component**: inspector renders fields from schema; nodes render stable with memo.
* **Integration**: run controller mocks `/runs` & `/runs/:id` responses.
* **E2E**: build a simple workflow (Start→HTTP) → run → see success tick.

---

If you want, I can drop a **starter React Flow canvas + Zustand store** directly into your repo backbone (the canvas can render Start/HTTP nodes with selection + basic inspector), so you can run `/builder` immediately.
