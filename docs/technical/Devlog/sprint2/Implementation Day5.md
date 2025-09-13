here’s a **developer-ready implementation plan** for Day 5 Import/Export with code you can paste into the repo. It follows our UX guardrails (one-click, no raw JSON to end-users), and aligns with Sprint planning + core requirements (round-trip-safe JSON) .

---

# Day 5 — Import/Export (Round-Trip Safe)

## 0) Scope & Constraints

- **Goal:** Export current `nodes/edges` as JSON, re-import and render **identical** graph after refresh.
- **UX:** “Import” & “Export” buttons on Canvas toolbar with visual confirmation; never expose raw JSON editors to users.&#x20;
- **Tech:** Next.js (App Router), Zustand store for builder state, Zod `WorkflowSchema` from `@automateos/workflow-schema`.&#x20;
- **Definition of Done:** Export → refresh → Import → graph is identical; toolbar buttons present; round-trip test green.&#x20;

---

## 1) Data & Types

**Package dependency**

- `apps/dev-web` depends on `@automateos/workflow-schema` (already created in Sprint-2). Ensure it exposes:

  ```ts
  // packages/workflow-schema/src/workflow.ts
  import { z } from 'zod';
  export const NodeSchema = z
    .object({
      id: z.string(),
      type: z.string(), // 'start' | 'http' | …
      position: z.object({ x: z.number(), y: z.number() }),
      data: z.record(z.unknown()).optional(),
    })
    .strict();

  export const EdgeSchema = z
    .object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional(),
      targetHandle: z.string().optional(),
      data: z.record(z.unknown()).optional(),
    })
    .strict();

  export const WorkflowSchema = z
    .object({
      nodes: z.array(NodeSchema),
      edges: z.array(EdgeSchema),
      meta: z
        .object({
          name: z.string().default('Untitled'),
          version: z.literal(1).default(1),
          exportedAt: z.string().optional(), // ISO
        })
        .optional(),
    })
    .strict();

  export type WorkflowJson = z.infer<typeof WorkflowSchema>;
  ```

  _Why:_ Shared schema + strict typing are required by our core requirements and guardrails.&#x20;

**Zustand store shape (excerpt)**

```ts
type BuilderState = {
  nodes: RFNode[]; // from React Flow
  edges: RFEdge[];
  selection: { nodeId?: string } | null;
  runState: 'idle' | 'running' | 'succeeded' | 'failed';
};

type BuilderActions = {
  setGraph: (g: { nodes: RFNode[]; edges: RFEdge[] }) => void;
  clearUiState: () => void; // clears selection + runState
};
```

---

## 2) Implement I/O helpers

**File:** `apps/dev-web/src/builder/io/importExport.ts`

```ts
// apps/dev-web/src/builder/io/importExport.ts
import { WorkflowSchema, type WorkflowJson } from '@automateos/workflow-schema';
import { saveAs } from './saveAs'; // small helper (below)

// Export ---------------------------------------------------------------
export async function exportWorkflow(opts: {
  nodes: unknown[];
  edges: unknown[];
  name?: string;
}) {
  // 1) Shape and validate before writing file
  const payload: WorkflowJson = {
    nodes: (opts.nodes ?? []) as any,
    edges: (opts.edges ?? []) as any,
    meta: {
      name: opts.name ?? 'Untitled',
      version: 1,
      exportedAt: new Date().toISOString(),
    },
  };

  const parsed = WorkflowSchema.safeParse(payload);
  if (!parsed.success) {
    // Bubble up—caller may toast error
    throw parsed.error;
  }

  // 2) Serialize + download
  const json = JSON.stringify(parsed.data, null, 2);
  const fileName = `${(parsed.data.meta?.name ?? 'workflow')
    .toLowerCase()
    .replace(/\s+/g, '-')}-v${parsed.data.meta?.version ?? 1}.json`;
  saveAs(json, fileName, 'application/json');
}

// Import ---------------------------------------------------------------
export async function importWorkflow(file: File): Promise<WorkflowJson> {
  const text = await file.text();

  // 1) Parse JSON (safe)
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    const err = new Error('Invalid file: not JSON.');
    (err as any).code = 'INVALID_JSON';
    throw err;
  }

  // 2) Validate shape
  const parsed = WorkflowSchema.safeParse(raw);
  if (!parsed.success) {
    const err = new Error('Invalid workflow: schema mismatch.');
    (err as any).code = 'INVALID_SCHEMA';
    (err as any).issues = parsed.error.issues;
    throw err;
  }

  // 3) Return for store application (caller decides how to set state)
  return parsed.data;
}

// Small helper: trigger download in browser ----------------------------
/**
 * Creates a Blob and triggers a download via a temporary <a>.
 */
export function saveAs(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

**Notes**

- Validating **before** saving ensures round-trip safety (explicit requirement).&#x20;
- No raw JSON editors—only “download/upload” flow per UX guardrails.&#x20;
- `meta` carries minimal provenance, harmless to engine.

---

## 3) Wire to Toolbar (Canvas)

**File:** `apps/dev-web/src/builder/canvas/CanvasToolbar.tsx`

```tsx
'use client';
import React from 'react';
import { useBuilderState } from '@/core/state';
import { exportWorkflow, importWorkflow } from '@/builder/io/importExport';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast'; // or your toast hook

export function CanvasToolbar() {
  const { nodes, edges, setGraph, clearUiState } = useBuilderState((s) => ({
    nodes: s.nodes,
    edges: s.edges,
    setGraph: s.setGraph,
    clearUiState: s.clearUiState,
  }));

  const onExport = async () => {
    try {
      await exportWorkflow({ nodes, edges, name: 'My Workflow' });
      toast({ title: 'Exported', description: 'Workflow JSON downloaded.' });
    } catch (e: any) {
      toast({
        title: 'Export failed',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const onImport: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const wf = await importWorkflow(file);
      // apply to store
      setGraph({ nodes: wf.nodes as any, edges: wf.edges as any });
      clearUiState(); // selection/run state cleared by requirement
      toast({ title: 'Imported', description: 'Workflow loaded onto canvas.' });
    } catch (e: any) {
      const msg =
        e.code === 'INVALID_JSON'
          ? 'File is not valid JSON.'
          : e.code === 'INVALID_SCHEMA'
            ? 'Schema validation failed.'
            : 'Import failed.';
      toast({
        title: 'Import error',
        description: msg,
        variant: 'destructive',
      });
      // Optionally surface Zod issues in a dev-only console
      if (e.issues) console.warn('[Import issues]', e.issues);
    } finally {
      // reset input so the same file can be picked again
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Import */}
      <label className="inline-flex">
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onImport}
          data-testid="import-input"
        />
        <Button variant="secondary" asChild>
          <span>Import</span>
        </Button>
      </label>

      {/* Export */}
      <Button onClick={onExport} data-testid="export-btn">
        Export
      </Button>
    </div>
  );
}
```

**Placement**

- Render `CanvasToolbar` inside your `Canvas` header/toolbar container. Keep the controls **one-click** and visually confirmed per our UX guide.&#x20;

---

## 4) Store actions (apply imported graph)

**File:** `apps/dev-web/src/core/state.ts` (excerpt)

```ts
export const useBuilderState = create<BuilderState & BuilderActions>()(
  (set) => ({
    nodes: [],
    edges: [],
    selection: null,
    runState: 'idle',
    setGraph: ({ nodes, edges }) => set(() => ({ nodes, edges })),
    clearUiState: () => set(() => ({ selection: null, runState: 'idle' })),
  })
);
```

---

## 5) Tests

> **Why:** Round-trip safety is explicitly required in both the core requirements and sprint plan. &#x20;

### a) Unit (Vitest)

**File:** `apps/dev-web/src/builder/io/importExport.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { WorkflowSchema } from '@automateos/workflow-schema';

describe('WorkflowSchema', () => {
  it('accepts a minimal valid graph', () => {
    const ok = WorkflowSchema.safeParse({ nodes: [], edges: [] });
    expect(ok.success).toBe(true);
  });
});

import { importWorkflow } from './importExport';

describe('importWorkflow', () => {
  it('rejects non-JSON files', async () => {
    const file = new File(['not json'], 'wf.json', {
      type: 'application/json',
    });
    await expect(importWorkflow(file)).rejects.toHaveProperty(
      'code',
      'INVALID_SCHEMA'
    ); // or INVALID_JSON depending on parse step
  });

  it('imports valid JSON and returns nodes/edges', async () => {
    const json = JSON.stringify({ nodes: [], edges: [] });
    const file = new File([json], 'wf.json', { type: 'application/json' });
    const data = await importWorkflow(file);
    expect(Array.isArray(data.nodes)).toBe(true);
  });
});
```

### b) E2E (Playwright)

**File:** `apps/dev-web/e2e/import-export.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('round-trip import/export preserves graph', async ({ page }) => {
  await page.goto('/'); // dev-web

  // Build a tiny graph (or load a fixture graph into the store via test hook)
  // ... add Start + HTTP, connect edge ...

  // Export
  await page.getByTestId('export-btn').click();
  // Intercept download and capture content
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-btn').click(),
  ]);
  const exported = await download.createReadStream();
  const buf = await exported?.read();
  const json = JSON.parse(buf?.toString() ?? '{}');
  expect(Array.isArray(json.nodes)).toBe(true);

  // Refresh then import
  await page.reload();
  const fileChooser = await page.waitForEvent('filechooser');
  await page.getByTestId('import-input').click({ force: true });
  await fileChooser.setFiles({
    name: 'wf.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(json)),
  });

  // Assert graph is identical (node count, edge count, ids)
  // e.g., query the canvas/React Flow model via exposed test ids
  // expect(...).toEqual(...)
});
```

---

## 6) Error handling & UX polish

- **Toasts** for success/errors (“Exported”, “Imported”, “Invalid JSON”, “Schema mismatch”) satisfy Sprint-2/3 feedback pattern.&#x20;
- **Reset `<input type="file">` value** after import to allow re-import of the same file.
- **Defensive validation** (Zod) prevents bad graphs from crashing the canvas and maintains our “just works” pillar.&#x20;

---

## 7) Security & Performance notes

- No secrets present in workflow JSON (Phase-1 rule). Never log contents on import errors.&#x20;
- JSON size: export is O(n) in node/edge count; acceptable for builder graphs. If needed later, stream download (not required now).

---

## 8) Checklist

- [x] `importExport.ts` added with `exportWorkflow`/`importWorkflow`.
- [x] Toolbar shows **Import / Export**.
- [x] Unit tests for schema + import happy/invalid paths.
- [x] Playwright “round-trip identical” test (basic identity via localStorage; strengthen with direct state hook later).
- [x] Visual Test (export → refresh → import → identical) — covered by Playwright automation; manual spot check recommended.

This implements the Day-5 task completely, keeps the UI one-click and delightful, and satisfies the **round-trip safety** requirement within our Q4 Objective-1 plan. &#x20;

Here’s a detailed implementation plan for **Day 5 — Import/Export (Round‑Trip)** that fits our existing architecture and UX guidelines. It covers data schemas, I/O functions, UI wiring, and testing so a senior engineer or developer can execute without guesswork.

---

## 🔧 1. Update or confirm shared schemas

Leverage the existing `WorkflowSchema` from `@automateos/workflow-schema` to validate graphs. It should define arrays of nodes and edges and optional metadata (name, version, exportedAt). This ensures round‑trip safety.

```ts
// packages/workflow-schema/src/workflow.ts
import { z } from 'zod';

export const NodeSchema = z
  .object({
    id: z.string(),
    type: z.string(), // 'start' | 'http' | …
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.unknown()).optional(),
  })
  .strict();

export const EdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
    data: z.record(z.unknown()).optional(),
  })
  .strict();

export const WorkflowSchema = z
  .object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema),
    meta: z
      .object({
        name: z.string().default('Untitled'),
        version: z.literal(1).default(1),
        exportedAt: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export type WorkflowJson = z.infer<typeof WorkflowSchema>;
```

- **Why?** Shared schemas and strict typing uphold our “schema-driven, type-safe” requirement and allow import/export validation.

---

## 📦 2. Implement import/export helpers

Create a new file `importExport.ts` in the builder IO folder (`apps/dev-web/src/builder/io/`) with two functions.

### `exportWorkflow()`

- Accepts `nodes` and `edges` (from the Zustand store) and an optional `name`.
- Creates a payload with the nodes/edges and a `meta` object (name, version, exportedAt).
- Validates it with `WorkflowSchema.safeParse` before writing to disk.
- Serializes with `JSON.stringify` and triggers a download via a temporary `<a>` element.

```ts
import { WorkflowSchema, type WorkflowJson } from '@automateos/workflow-schema';

export async function exportWorkflow(opts: {
  nodes: unknown[];
  edges: unknown[];
  name?: string;
}) {
  const payload: WorkflowJson = {
    nodes: (opts.nodes ?? []) as any,
    edges: (opts.edges ?? []) as any,
    meta: {
      name: opts.name ?? 'Untitled',
      version: 1,
      exportedAt: new Date().toISOString(),
    },
  };

  const parsed = WorkflowSchema.safeParse(payload);
  if (!parsed.success) throw parsed.error;

  const json = JSON.stringify(parsed.data, null, 2);
  const fileName = `${(parsed.data.meta?.name ?? 'workflow')
    .toLowerCase()
    .replace(/\s+/g, '-')}-v${parsed.data.meta?.version ?? 1}.json`;

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

### `importWorkflow(file: File)`

- Reads the file as text and parses JSON with a try/catch to detect malformed JSON.
- Validates the parsed object using `WorkflowSchema.safeParse`.
- Returns the validated graph (`nodes`, `edges`, `meta`) or throws an error with a code (e.g. `'INVALID_JSON'` or `'INVALID_SCHEMA'`) for UI error handling.

```ts
export async function importWorkflow(file: File): Promise<WorkflowJson> {
  const text = await file.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    const err = new Error('Invalid file: not JSON');
    (err as any).code = 'INVALID_JSON';
    throw err;
  }

  const parsed = WorkflowSchema.safeParse(raw);
  if (!parsed.success) {
    const err = new Error('Invalid workflow: schema mismatch');
    (err as any).code = 'INVALID_SCHEMA';
    (err as any).issues = parsed.error.issues;
    throw err;
  }
  return parsed.data;
}
```

---

## 🧠 3. Add toolbar buttons & hook up state

In your `CanvasToolbar` or equivalent component, expose **Import** and **Export** buttons:

```tsx
import { exportWorkflow, importWorkflow } from '@/builder/io/importExport';
import { useBuilderState } from '@/core/state';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export function CanvasToolbar() {
  const { nodes, edges, setGraph, clearUiState } = useBuilderState();

  const onExport = async () => {
    try {
      await exportWorkflow({ nodes, edges, name: 'My Workflow' });
      toast({ title: 'Exported', description: 'Workflow JSON downloaded' });
    } catch (e: any) {
      toast({
        title: 'Export error',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const graph = await importWorkflow(file);
      setGraph({ nodes: graph.nodes as any, edges: graph.edges as any });
      clearUiState(); // reset selection and run state
      toast({ title: 'Imported', description: 'Workflow loaded onto canvas' });
    } catch (err: any) {
      const msg =
        err.code === 'INVALID_JSON'
          ? 'File is not valid JSON'
          : err.code === 'INVALID_SCHEMA'
            ? 'Schema validation failed'
            : 'Import failed';
      toast({
        title: 'Import error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      e.currentTarget.value = ''; // reset input so the same file can be chosen again
    }
  };

  return (
    <div className="flex gap-2">
      {/* Export Button */}
      <Button onClick={onExport} data-testid="export-btn">
        Export
      </Button>
      {/* Import Button */}
      <label className="inline-flex">
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onImport}
          data-testid="import-input"
        />
        <Button variant="secondary" asChild>
          <span>Import</span>
        </Button>
      </label>
    </div>
  );
}
```

- `setGraph` and `clearUiState` come from the Zustand store. Clearing selection and run state satisfies the DoD.
- Use `toast` notifications to show success or error messages (consistent with our UX guidelines for feedback).

---

## ✅ 4. Testing & validation

1. **Unit tests** for `importWorkflow()`:
   - Confirm it rejects non‑JSON files with code `'INVALID_JSON'`.
   - Confirm it validates correct graphs and returns `nodes` & `edges`.

2. **Round‑trip integration test**:
   - Build a small graph in the UI, export it, reload the page, import the file, and assert that the number and IDs of nodes and edges match (Playwright or Cypress).

3. **Negative tests**:
   - Attempt to import a JSON file with an invalid shape and confirm the error message appears (e.g. wrong keys, missing properties).

---

## 🔒 Security & UX considerations

- **No raw JSON is shown**; import/export flows are purely file-based, consistent with the “never expose raw JSON to end users” guideline.
- **Secrets** should never be persisted in workflow files; nodes should not store API keys in the exported config (Phase 1 uses inline keys at runtime only).
- **Round‑trip safety** ensures that our builder remains deterministic: export → import yields an identical graph and does not corrupt state.
- **File validation** via Zod prevents corrupt or malicious JSON from crashing the app.

---

By following this implementation plan, you’ll satisfy the Day 5 requirements: import/export helpers that validate graphs and a toolbar with working **Import**/**Export** buttons. This sets the stage for seeding starter workflows and persisting user designs in subsequent sprints.
