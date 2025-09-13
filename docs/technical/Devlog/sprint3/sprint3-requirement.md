[GPT5-Agent]

## 🚀 Sprint 3 – Import/Export & Starter Templates (Weeks 5–6)

### 🎯 Goal

Empower creators to **share workflows** for the first time and seed the template ecosystem. Sprint 3 builds on the running builder (Sprints 1–2) by enabling JSON export/import, storing graphs in localStorage for dev convenience, and providing a first starter workflow (Slack notification). Optional enhancements (undo/redo, run‑log streaming, DB persistence) can be scoped as stretch items if time allows. The sprint’s success ensures a visible path from local experimentation to community sharing and seeds the Creator Flywheel【758†The Creator Flywheel Strategy.pdf】.

### 📦 Scope & Constraints

1. **Import/Export:** Users must be able to export their current graph to a JSON file and import it back later, preserving node/edge IDs, positions and configs. The export must include a minimal meta section (name, version, exportedAt) and be validated against the shared WorkflowSchema. Under no circumstances should raw JSON be exposed to users; the UI should provide buttons and clear feedback【763†UxUi Guideline(HIG).md】.

2. **localStorage Persistence (dev only):** In development, automatically save the current graph (nodes/edges) to localStorage when it changes and load it on page reload. This is a developer convenience only; it should be disabled in production and behind a feature flag or environment check.

3. **Starter Workflow:** Provide a ready‑to‑use **Slack Notification** workflow as a JSON file and an import action in the UI. The workflow should include a start node and an http node configured to send a message to a Slack incoming webhook (URL omitted/templated). Validation should ensure the workflow runs end‑to‑end via the engine.

4. **Nice‑to‑Have Stretch Goals:**

5. **Run log streaming:** Implement Server‑Sent Events (SSE) or WebSocket endpoint on the API‑Gateway to stream run logs to the UI in real time. Enhance the RunPanel to display live logs.

6. **Database persistence:** Persist workflows and versions to Postgres via the API‑Gateway; expose POST /workflows and GET /workflows/:id endpoints. This requires basic auth (e.g., email magic link) and multi‑tenant separation, but only if time permits (can be deferred to Sprint 4/5). Use the data model defined in Phase 1 (Workflows, WorkflowVersions)【773†v1-Architecture.md】.

7. **Undo/Redo and multi‑select:** Add history stacks in the Zustand store to support undo/redo and allow multi‑select actions (e.g., delete multiple nodes). Must not compromise run logic.

### 🔄 Functional Requirements

#### _A. Export Workflow_

1. **Helper function exportWorkflow()**

2. Located in apps/dev-web/src/builder/io/importExport.ts (new or extended).

3. Accepts nodes and edges from the Zustand store. Sanitize each node and edge: remove view‑only properties (like selected, width, height, React Flow internals) and keep id, type, position, data.config etc. Include a meta object with a name (default “Untitled”), version (currently 1), and exportedAt timestamp[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=%2F%2F%20Sanitize%20nodes%2Fedges%3A%20strip%20React,).

4. Validate the payload against WorkflowSchema from packages/workflow-schema (defence in depth) before serialization. If validation fails, surface an error toast.

5. Serialize with JSON.stringify(payload, null, 2\) and trigger download using a Blob and a temporary \<a\> element. File name pattern: workflow-v1-{name}.json.

6. **UI integration**

7. Add an **Export** button to the Canvas toolbar. Clicking the button triggers exportWorkflow() with the current nodes/edges. Provide success/fail toast feedback.

8. The export action must never reveal raw JSON to users; it simply downloads a file.

#### _B. Import Workflow_

1. **Helper function importWorkflow(file: File)**

2. Accepts an uploaded JSON file. Read text (FileReader), then parse with JSON.parse. If parsing fails, throw an error and show a toast (“Invalid file: not JSON”).

3. Validate the parsed object against WorkflowSchema. On failure, show an error toast (“Invalid workflow: schema mismatch”). Include validation issues in logs for developers.

4. If valid, extract nodes and edges, set them into the Zustand store via setGraph({ nodes, edges }), and clear selection and run state.

5. For localStorage persistence, after import, save the graph to localStorage (if the feature flag is on).

6. **UI integration**

7. Add an **Import** button to the Canvas toolbar with an associated \<input type="file" accept="application/json"\>. When the user selects a file, call importWorkflow(file).

8. Provide success/fail toast feedback. Reset the file input after each import to allow re‑selecting the same file.

9. If the imported workflow includes a meta.name, use it to set a temporary label in the builder (e.g., top‑bar breadcrumb). This is optional but improves UX.

#### _C. LocalStorage Persistence_

1. **Feature flag**: Use process.env.NEXT_PUBLIC_DEV_STORAGE \=== "true" to toggle localStorage persistence. Do not enable in production or when the environment variable is not set.

2. **Store updates**: When nodes or edges change (e.g., in a Zustand subscribe), serialize the graph and save it to localStorage\["automateos.dev.graph"\]. Use WorkflowSchema to validate before saving.

3. **Restore on load**: On page mount, if the flag is enabled and a serialized graph exists in localStorage, parse and validate it. If valid, load it into the store; otherwise clear the entry. Provide a fallback to a blank canvas.

#### _D. Starter Workflow – Slack Notification_

1. **Definition**: Create a JSON file under examples/ (e.g., slack-notification.json). It should contain two nodes:

2. start node with no config.

3. http node with method: "POST", url: "https://hooks.slack.com/services/…" (placeholder), headers: { "Content-Type": "application/json" }, and json_body: { "text": "Hello from AutomateOS\!" }. Provide comments/instructions in the dev log on how to replace the webhook URL.

4. **Import seed**: Add a “Load Slack Template” option in the toolbar or the Dev Log. Clicking it should fetch examples/slack-notification.json, validate and import it into the canvas. Alternatively, embed the JSON directly in the code.

5. **Run verification**: Running this workflow via the engine should result in a successful HTTP 2xx response. If the Slack URL is invalid, surface error logs via the RunPanel. The starter workflow forms the basis for demonstrating template creation and sharing to the community.

#### _E. Dev Log \#1_

Prepare a Markdown dev log (under docs/technical/Devlog/sprint3) summarizing the import/export implementation. It should include: \- An overview of how workflows are exported and imported, with code snippets. \- Screenshots or Loom videos of exporting, refreshing, and importing the graph. \- The Slack starter workflow demonstration. \- Challenges and solutions (e.g., Zod validation edge cases, file handling). \- Next steps (e.g., credentials, undo/redo planning).

### 🧪 Definition of Done (DoD)

The following criteria must be met to mark Sprint 3 complete:

1. **Round‑trip Import/Export:** A workflow created in the builder can be exported, the page refreshed, and the file re‑imported, producing an identical graph (node/edge IDs and positions preserved). This satisfies the original Sprint 3 deliverable【762†Phase1-sprints.txt】.

2. **LocalStorage Save/Load:** When the dev flag is enabled, the builder automatically saves the current graph to localStorage and restores it on reload. The feature is disabled in production.

3. **Starter Workflow:** The Slack notification workflow can be imported and run end‑to‑end; a short log appears in the RunPanel confirming a successful HTTP call.

4. **Validation & Error Handling:** Invalid JSON files or schema mismatches are handled gracefully with clear error messages (toasts). The store is not mutated on error.

5. **Docs & Dev Log:** A dev log documenting the sprint work is committed in docs/technical/Devlog/sprint3, and code includes inline comments referencing the Sprint 3 requirement and any relevant design decisions.

### 🛡️ Security & UX Considerations

- **No Raw JSON:** The UI never shows raw JSON to users; import/export is handled via buttons with clear feedback【763†UxUi Guideline(HIG).md】.

- **Secrets:** Do not include any API keys or secrets in exported workflows. In the Slack starter, instruct users to replace the webhook URL locally. The .env or inline key approach is still the only credential mechanism until Sprint 4.

- **Accessibility:** Ensure Import/Export buttons have proper aria-labels and keyboard focus states. Use toasts and inline messages for feedback. Match motion design guidelines (smooth transitions, purposeful animations)【763†UxUi Guideline(HIG).md】.

- **Resilience:** Validate all imported content; never trust client input. Use the same WorkflowSchema across client and server to avoid drift. For future DB persistence, follow the data model and security policies (encrypted secrets, append‑only logs)【773†v1-Architecture.md】.

### 📌 Suggested Timeline & Task Breakdown

| Task                               | Owner       | Est.     | Details                                                    |
| :--------------------------------- | :---------- | :------- | :--------------------------------------------------------- |
| Implement exportWorkflow() helper  | FE Engineer | 0.5 day  | Sanitize graph, validate with Zod, download file.          |
| Implement importWorkflow() helper  | FE Engineer | 1 day    | File parsing, validation, store update.                    |
| Add Import/Export UI               | FE Engineer | 0.5 day  | Buttons in toolbar, toasts, file input wiring.             |
| LocalStorage persistence           | FE Engineer | 1 day    | Feature flag, subscribe to store changes, restore on load. |
| Create Slack starter template      | FE/Docs     | 0.5 day  | JSON file, UI action to load.                              |
| Write Dev Log \#1                  | Docs/Lead   | 0.5 day  | Document work with screenshots/video.                      |
| Optional: SSE/WebSocket run logs   | BE/FE       | 2–3 days | SSE endpoint in Gateway, hook into RunPanel.               |
| Optional: Persist workflows to DB  | BE          | 2–3 days | POST /workflows/GET /workflows; auth tokens.               |
| Optional: Undo/Redo & multi‑select | FE          | 1–2 days | Add history stacks to Zustand, multi‑select UI.            |

_Notes:_ Optional tasks can roll into Sprint 4 if time constrained; focus on core import/export and starter workflow first.

---

[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts#:~:text=%2F%2F%20Sanitize%20nodes%2Fedges%3A%20strip%20React,) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/io/importExport.ts)
