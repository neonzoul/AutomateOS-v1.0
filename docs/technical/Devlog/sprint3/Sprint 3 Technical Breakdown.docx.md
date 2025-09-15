## 🎓 Sprint 3 Technical Breakdown 

## This document breaks down the Sprint 3 tasks into small, digestible steps so that a junior or new developer can follow along. It assumes familiarity with TypeScript, React (Next.js), and Zustand but explains where to find files and how to wire things up. Use this alongside the main implementation plan for guidance.

### 📁 Project Overview

The AutomateOS builder lives under apps/dev-web. Workflows are represented as arrays of **nodes** and **edges** and stored in a Zustand store. The shared Zod schemas live in packages/workflow-schema. A helper module (io/importExport.ts) handles JSON serialization and validation. The UI uses React Flow for the canvas and a top toolbar for actions like Add Node, Import, Export and Clear.

### 🧠 Task 1 – Export the Current Workflow

**Goal:** Let users click a button to download their workflow as a JSON file.

1. Open the file apps/dev-web/src/builder/io/importExport.ts. You’ll see helper functions and some TODO comments.

2. **Sanitize nodes/edges:** In the exportWorkflow function, write two helper functions called sanitizeNode and sanitizeEdge. They should take a node/edge and return only the fields that belong to the schema:

// Remove view-only props (selected, width, height, etc.)  
const sanitizeNode \= (n: any) \=\> ({  
  id: n.id,  
  type: n.type,  
  position: n.position,  
  data: n.data,  
});  
const sanitizeEdge \= (e: any) \=\> ({  
  id: e.id,  
  source: e.source,  
  target: e.target,  
  sourceHandle: e.sourceHandle,  
  targetHandle: e.targetHandle,  
  type: e.type,  
  data: e.data,  
});

1. **Build payload:** Create a payload object containing sanitized nodes, edges and a meta object with name, version, and exportedAt. The name can default to “Untitled” or use the optional opts.name provided by the caller. Generate the timestamp with new Date().toISOString()[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20payload%3A%20Workflow%20%3D%20,typed%20via%20schema%20validation%20below).

2. **Validate:** Import WorkflowSchema from @automateos/workflow-schema and call WorkflowSchema.safeParse(payload). If validation fails (success is false), throw the error so the UI can catch it and show a message[\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20parsed%20%3D%20WorkflowSchema,return%20parsed.data).

3. **Download:** Convert the valid payload to a pretty‑printed JSON string and use the existing saveAs helper to trigger a download. Use the meta name to create a filename like workflow-v1.json. You’re done with export\!

### 📦 Task 2 – Import a Workflow from JSON

**Goal:** Parse a user‑selected JSON file, validate it and load it into the canvas.

1. In the same importExport.ts file, implement importWorkflow(file). Use await file.text() to read the contents. Wrap JSON.parse in a try/catch so you can set the error code to INVALID\_JSON if parsing fails[\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20parsed%20%3D%20WorkflowSchema,return%20parsed.data).

2. After parsing, validate the object with WorkflowSchema.safeParse. If invalid, throw an error with the code INVALID\_SCHEMA. Include parsed.error.issues in the error for debugging. If valid, return the parsed.data.

3. **Return typed data:** The function should return a Workflow (inferred from the schema) so that the caller knows it’s safe to use.

### 🖥️ Task 3 – Wire Buttons into the Canvas Toolbar

**Goal:** Expose “Import”, “Export” and “Load Slack Template” buttons in the UI.

1. Open apps/dev-web/src/builder/canvas/Canvas.tsx and locate the ToolbarButtons component. You’ll see code for adding nodes, clearing the workflow and calling import/export helpers[\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx#:~:text=const%20onExport%20%3D%20async%20,).

2. **Ensure import is wired:** The \<input type="file"\> inside the Import label calls onImport when the user selects a file. Make sure that function uses your importWorkflow helper and, on success, calls setGraph({ nodes, edges }) and clearUiState().

3. **Ensure export is wired:** The Export button should call exportWorkflow({ nodes, edges, name: 'Workflow' }). Wrap it in a try/catch so you can show success or error messages via the notify function (a placeholder for toasts)[\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx#:~:text=const%20onExport%20%3D%20async%20,).

4. **Add Slack template button:** Add a new button element next to Import/Export. When clicked, fetch /examples/slack-notification.json (you’ll add this file in Task 5) using fetch(). Then call importWorkflow() on the fetched content and load it into the graph. Display a toast to confirm the template loaded.

5. Test the UI: Create a small graph, export it, refresh the page, import it and verify it matches exactly (node positions and IDs preserved). Ensure the Slack template loads with Start and HTTP nodes.

### 💾 Task 4 – localStorage Persistence (Dev Only)

**Goal:** Save the workflow automatically in the browser so you don’t lose your work on reload (only in development).

1. In apps/dev-web/src/builder/page.tsx (or the root page that renders the Canvas), import the useBuilderStore from core/state.ts.

2. **Feature flag:** Read process.env.NEXT\_PUBLIC\_DEV\_STORAGE. Only run the persistence logic if this is "true" and process.env.NODE\_ENV \!== "production".

3. **Subscribe to the graph:** Use useEffect with an inner subscription such as:

useEffect(() \=\> {  
  if (\!process.env.NEXT\_PUBLIC\_DEV\_STORAGE) return;  
  const unsub \= useBuilderStore.subscribe(  
    (state) \=\> ({ nodes: state.nodes, edges: state.edges }),  
    (graph) \=\> {  
      // sanitize and validate here before saving  
      localStorage.setItem('aos.graph', JSON.stringify(graph));  
    }  
  );  
  return () \=\> unsub();  
}, \[\]);

Debounce or throttle writes if performance becomes a concern. 4\. **Restore on load:** On component mount, check localStorage.getItem('aos.graph'). If present, parse it and validate with WorkflowSchema. If valid, call setGraph({ nodes, edges }). Otherwise, clear the storage to avoid future errors.

### 🔔 Task 5 – Add a Slack Notification Starter Template

**Goal:** Seed the first template so users have a working example to import.

1. Create a directory examples/ at the root of the repo if it doesn’t exist. Inside it, add a file slack-notification.json containing the two‑node workflow shown in the implementation plan. The only field that needs to change when a user runs it is the url (replace the placeholder with their Slack webhook).

2. Commit this file and instruct users (in the README or dev log) to replace the url value with their own Slack webhook. The template demonstrates how to make an HTTP call using the builder.

3. In the toolbar button from Task 3, fetch this file via fetch('/examples/slack-notification.json') and then call importWorkflow() on the parsed JSON. Validate and load it into the graph.

### ✅ Task 6 – Testing and Verification

Perform these tests to ensure your implementation works:

1. **Round‑trip test:** Build a small graph (Start → HTTP), export it, refresh the page, import it and verify that the node positions and IDs are identical. Use console logs or the run panel to confirm.

2. **Local storage test:** Enable NEXT\_PUBLIC\_DEV\_STORAGE=true in your .env.local. Build a graph, reload the page and check that it’s restored. Disable the flag and verify persistence is off.

3. **Slack template test:** Click “Load Slack Template”, replace the URL with a valid Slack webhook and run it. Confirm a message appears in your Slack channel.

4. **Error handling:** Try importing an invalid JSON file or a file with missing fields. Ensure the app shows a toast error (“Invalid file” or “Schema validation failed”) and does not change the graph.

### 🚀 Stretch Goals (Optional)

If you finish early, explore these enhancements:

1. **Streaming logs:** Research how to implement Server‑Sent Events or WebSockets in Fastify. Expose a GET /v1/runs/:id/stream endpoint and use EventSource on the frontend to display real‑time run logs.

2. **Database persistence and auth:** Add Prisma models for workflows and versions, implement CRUD API routes (/v1/workflows), and create a simple authentication layer (JWT or session cookies) so workflows are user‑specific.

3. **Undo/Redo & multi‑select:** Extend the Zustand store with a history stack and actions for undo/redo. Add keyboard shortcuts (Ctrl+Z, Ctrl+Y) and update selection logic to allow multiple nodes. Provide buttons in the toolbar for these actions.

### 🏁 Conclusion

By following these tasks step by step, a junior developer can confidently implement Sprint 3 features. Remember to commit often, write unit tests for your helpers, and document your work in docs/technical/Devlog/sprint3 so the team can follow your progress.

---

[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20payload%3A%20Workflow%20%3D%20,typed%20via%20schema%20validation%20below) [\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=const%20parsed%20%3D%20WorkflowSchema,return%20parsed.data) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts)

[\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx#:~:text=const%20onExport%20%3D%20async%20,) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/canvas/Canvas.tsx)