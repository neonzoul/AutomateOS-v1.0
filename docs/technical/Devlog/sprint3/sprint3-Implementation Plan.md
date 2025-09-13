## 🛠️ Sprint 3 Implementation Plan – Import/Export, Local Persistence & Templates

This plan translates the Sprint 3 requirements into concrete steps for the team to execute. It assumes the current state of AutomateOS v1.0 on the main branch, which already has basic import/export helpers and a canvas toolbar for adding nodes. Each task below references specific files, functions and modules in the repo so that engineers can navigate and implement efficiently.

### 🔑 Summary of Features

1. **Import/Export round‑trip:** Sanitize and validate graphs before serialization, download the JSON, then parse and validate on import, updating the Zustand store. This is the foundation for sharing workflows[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=%2F%2F%20Sanitize%20nodes%2Fedges%3A%20strip%20React,).

2. **localStorage persistence (dev only):** Automatically save the graph to the browser’s localStorage in development and restore it on reload. Controlled by an environment flag.

3. **Seed a Slack Notification starter workflow:** Provide a ready‑to‑use Slack template as a JSON file or embedded object and an easy way to load it in the UI.

4. **Optional enhancements:** run‑log streaming (SSE/WebSocket), Postgres persistence for workflows, undo/redo with multi‑select. These can be scoped as stretch goals.

### 🧱 1\. Extend Import/Export Helpers

**Files:**

- apps/dev-web/src/builder/io/importExport.ts

**Steps:**

1. **Sanitize node/edge data:** Reuse the existing helper functions sanitizeNode and sanitizeEdge to strip React‑Flow view properties (selected, width, height) and keep only id, type, position, data.config etc. This ensures exported JSON matches the shared WorkflowSchema[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=%2F%2F%20Sanitize%20nodes%2Fedges%3A%20strip%20React,).

2. **Validate payload:** After sanitizing, construct a payload: Workflow with nodes, edges and a meta object containing name (fallback to “Untitled”), version: 1, and exportedAt (ISO timestamp)[\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20payload%3A%20Workflow%20%3D%20,typed%20via%20schema%20validation%20below). Use WorkflowSchema.safeParse(payload) to validate before serializing. If validation fails, throw an error (to be surfaced via toast in the UI).

3. **Serialize and download:** Use JSON.stringify(payload, null, 2\) to produce human‑readable JSON and trigger a download via a temporary \<a\> with Blob and URL.createObjectURL (already implemented as saveAs). Name the file using the template ${kebabCase(meta.name)}-v${meta.version}.json.

4. **Import logic:** Read the uploaded file via file.text(), parse with JSON.parse inside a try/catch, validate with WorkflowSchema.safeParse(raw), and if valid, return the workflow data. Set error codes (INVALID_JSON, INVALID_SCHEMA) on thrown errors so the UI can present meaningful messages[\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20parsed%20%3D%20WorkflowSchema,return%20parsed.data).

5. **Return type:** Ensure importWorkflow() returns a Workflow (typed from @automateos/workflow-schema). Export both helper functions from this module.

### 🖱️ 2\. Add Import/Export & Template Buttons

**Files:**

- apps/dev-web/src/builder/canvas/Canvas.tsx (inside ToolbarButtons)

**Steps:**

1. **Import button:** Already present. Ensure the \<input type="file"\> accepts .json and calls onImport. After successful import, call setGraph({ nodes: wf.nodes, edges: wf.edges }), reset the UI state via clearUiState(), and show a toast (“Workflow loaded”)[\[4\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx#:~:text=const%20onImport%3A%20React.ChangeEventHandler,).

2. **Export button:** Already implemented. Ensure it calls exportWorkflow({ nodes, edges, name: 'Workflow' }) and shows a toast on success or error[\[5\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx#:~:text=const%20onExport%20%3D%20async%20,). Optionally prompt the user for a name before export to personalize the file name.

3. **Slack template button:** Add a new button labeled “Load Slack Template” next to Import/Export. When clicked, it should fetch the template JSON (from /examples/slack-notification.json) or import an embedded constant. Use importWorkflow() to validate and load it. After loading, update the graph and show a toast. Include a tooltip or note that users must replace the Slack webhook URL with their own.

4. **Toolbar layout:** Ensure all buttons (Add Start, Add HTTP, Import, Export, Slack Template, Clear) remain accessible and keyboard‑navigable. Use aria-label for accessibility.

### 💾 3\. Implement localStorage Persistence

**Files:**

- apps/dev-web/src/builder/page.tsx or the top‑level component where the canvas is rendered.

- apps/dev-web/src/core/state.ts (Zustand store definitions)

**Steps:**

1. **Feature flag:** Define an environment variable NEXT_PUBLIC_DEV_STORAGE. In the dev environment, set it to true. The code should check this flag before reading or writing to localStorage.

2. **Save logic:** In a useEffect hook inside the page component, subscribe to changes in nodes and edges via useBuilderStore.subscribe((s) \=\> ({ nodes: s.nodes, edges: s.edges })). Whenever the graph changes, sanitize and validate with WorkflowSchema. If valid, call localStorage.setItem('aos.graph', JSON.stringify({ nodes, edges })). Debounce writes to avoid thrashing.

3. **Load logic:** On component mount, check localStorage.getItem('aos.graph'). If present, JSON.parse it and validate with WorkflowSchema. If valid, call setGraph({ nodes, edges }); otherwise, clear localStorage. Only perform this logic when NEXT_PUBLIC_DEV_STORAGE \=== 'true'.

4. **Disable in production:** Because this persistence is for developer convenience, ensure the code branch is conditioned on process.env.NODE_ENV \!== 'production' and the feature flag. In production, localStorage should not persist workflows.

### 📨 4\. Create the Slack Notification Starter

**Files:**

- examples/slack-notification.json (new file)

**Content:**

{  
 "nodes": \[  
 {  
 "id": "start1",  
 "type": "start",  
 "position": { "x": 0, "y": 0 },  
 "data": { "label": "Start", "config": {} }  
 },  
 {  
 "id": "http1",  
 "type": "http",  
 "position": { "x": 200, "y": 0 },  
 "data": {  
 "label": "Slack Notify",  
 "config": {  
 "method": "POST",  
 "url": "https://hooks.slack.com/services/REPLACE/ME",  
 "headers": { "Content-Type": "application/json" },  
 "json_body": {  
 "text": "Hello from AutomateOS\!"  
 }  
 }  
 }  
 }  
 \],  
 "edges": \[  
 {  
 "id": "e1",  
 "source": "start1",  
 "target": "http1",  
 "sourceHandle": null,  
 "targetHandle": null,  
 "data": {}  
 }  
 \],  
 "meta": {  
 "name": "Slack Notification",  
 "version": 1,  
 "exportedAt": "2025-09-13T00:00:00.000Z"  
 }  
}

**Steps:**

1. Save the above JSON under examples/ in the repository. Note: The url includes a placeholder; instruct users via documentation/dev log to replace it with their Slack webhook.

2. Expose this template via the UI (as described in section 2) by reading the file using fetch('/examples/slack-notification.json') in the client or by importing it statically.

3. Validate with WorkflowSchema and load into the store using setGraph() and clearUiState().

### 🔌 5\. Optional Enhancements (Stretch)

These tasks are nice‑to‑have and can be scheduled if capacity allows. They may require coordination across services.

1. **Run‑log streaming (SSE/WebSocket):**

2. Add a GET /v1/runs/:id/stream endpoint on the API‑Gateway that upgrades to SSE or WebSocket and streams run logs as they are appended in the orchestrator.

3. On the frontend, create a log viewer component that subscribes to this stream using EventSource or WebSocket and updates the RunPanel in real‑time.

4. Ensure proper cleanup (closing the connection on unmount) and fallback to polling if the feature flag is off.

5. **Database persistence and simple auth:**

6. Define a workflows table and a workflow_versions table in Postgres, using Prisma or a SQL client.

7. Add POST /v1/workflows to create a new saved workflow and GET /v1/workflows/:id to fetch it. Associate versions with runs.

8. Implement a minimal auth layer (e.g. signed cookies or JWT) to associate workflows with a user. This will prepare the ground for a template gallery.

9. **Undo/Redo & multi‑select:**

10. Extend the Zustand store to maintain a history stack (arrays of past nodes/edges). On each mutating action, push to the stack. Provide undo() and redo() actions to pop/push history.

11. Add UI commands (Ctrl+Z, Ctrl+Y) and toolbar buttons for undo/redo. Use useKeyboardShortcuts() to intercept these keys.

12. Implement multi‑select by allowing selectedNodeId to be an array; update delete and duplicate actions accordingly.

### ✔️ End‑of‑Sprint Checklist

[ ] Export current graph → refresh → import file → graph is identical.

[ ] localStorage save/load works in development when NEXT_PUBLIC_DEV_STORAGE is true.

[ ] Slack template loads and runs (HTTP node returns 200/204 from Slack). Slack message appears in the target channel.

[ ] Clear error handling: invalid JSON or invalid schema shows descriptive toast and does not mutate store.

[ ] Dev log entry summarising the work is added under docs/technical/Devlog/sprint3.

[ ] Optional features: streaming logs, persistence, undo/redo implemented if time permits.

Following this plan will deliver a polished and shareable workflow builder experience while setting up for future enhancements like templates and collaboration.

---

[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=%2F%2F%20Sanitize%20nodes%2Fedges%3A%20strip%20React,) [\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20payload%3A%20Workflow%20%3D%20,typed%20via%20schema%20validation%20below) [\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20parsed%20%3D%20WorkflowSchema,return%20parsed.data) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts)

[\[4\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx#:~:text=const%20onImport%3A%20React.ChangeEventHandler,) [\[5\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx#:~:text=const%20onExport%20%3D%20async%20,) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx)
