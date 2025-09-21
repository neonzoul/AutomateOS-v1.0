[GPT5 AGENT ]

# Sprint 4 – Technical Breakdown (Junior‑Friendly)

This document expands the Sprint 4 requirements into detailed, step‑by‑step tasks. Each section specifies what file to open, what functions to add or modify, and how to test your work. Follow these instructions in order; they build on top of the existing code from Sprints 2–3.

---

## 1\. Environment Setup & .env Support

### 1.1 Install dependencies

- **Install dotenv:** In every package.json under services/api-gateway, services/orchestrator and external/engine, add "dotenv": "^16.0.3" to dependencies. Run pnpm i in the root of the repo to install it.

- **Create .env files:**

- At the repository root, create a .env.example with keys you need in dev (use this as a template for your real .env). Example:

- NEXT_PUBLIC_API_BASE=http://localhost:8080  
  ORCHESTRATOR_BASE=http://localhost:3002  
  ENGINE_BASE=http://localhost:8082  
  SLACK_WEBHOOK=  
  NOTION_TOKEN=  
  NEXT_PUBLIC_DEV_STORAGE=true

- Developers can copy this file to .env and fill in real keys. Make sure .env is listed in .gitignore so secrets never go to Git.

### 1.2 Load .env variables in services

- **API Gateway:** Open services/api-gateway/src/index.ts and add the following at the top:

- import dotenv from 'dotenv';  
  dotenv.config();

- Then use process.env.ORCHESTRATOR_BASE and other vars instead of hard‑coded values. This file already reads ORCHESTRATOR_BASE but will benefit from .env loading.

- **Orchestrator:** In services/orchestrator/src/index.ts, import and call dotenv.config() at the top. Also update your EngineClient initialization in runService.ts to read process.env.ENGINE_BASE (it already does, but .env ensures it’s loaded).

- **Engine:** In external/engine/server.js, import dotenv and call dotenv.config() at the very top. This will allow us to read any Engine‑specific configs later (e.g., API timeouts).

### 1.3 Document the variables

- Update the project README or create docs/.env.md explaining each environment variable and how to set it (e.g., Slack webhook URL, Notion Integration Token). Stress that developers should never commit real API keys to the repo.

---

## 2\. Run Pipeline Enhancements

### 2.1 Compile complete DAG in the orchestrator

The current orchestrator uses convertToEngineDag() (simplistic) instead of the compileDag() function in packages/workflow-schema.

Tasks:

1. Open services/orchestrator/src/index.ts and replace the call in /internal/runs from convertToEngineDag(body.graph) to compileDag(body.graph).

2. Ensure you import compileDag:

- import { compileDag } from '@automateos/workflow-schema';

3. Delete or deprecate the old convertToEngineDag() function if it’s no longer used.

4. Confirm that compileDag attaches a deps array to each node (dependency ordering) and maps UI node types to engine step types.

### 2.2 Real HTTP execution in the Engine

The engine currently mocks HTTP requests. To call real APIs:

1. Install a fetch library in the engine directory. In external/engine/package.json, add "node-fetch": "^3.3.2" to dependencies. Run pnpm install in that folder.

2. At the top of external/engine/server.js, import fetch:

- import fetch from 'node-fetch';

3. Modify the executeNode function to handle http_request_node:

- case 'http_request_node': {  
   const { method, url, headers \= {}, json_body } \= node.config || {};  
   // Perform the real network call  
   const response \= await fetch(url, {  
   method: method || 'GET',  
   headers,  
   body: json_body ? JSON.stringify(json_body) : undefined,  
   });  
   const status \= response.status;  
   run.logs.push(logLine('info', \`HTTP ${status} ${method} ${url}\`));  
   break;  
  }

4. Make sure sensitive headers (e.g. Authorization, X-API-Key) are masked in logs. Use the same maskValue logic from the API gateway (copy that helper into the engine or import a shared util).

5. Update the engine’s port to match .env (it currently uses 8082; keep as default). Add code to respect process.env.PORT if set:

- const port \= process.env.PORT || 8082;  
  app.listen({ port, host: '0.0.0.0' });

### 2.3 Improve run polling and status mapping

1. In apps/dev-web/src/builder/run/runActions.ts, verify that startRun() sends the entire graph (nodes, edges, config). For each run, generate an idempotency key and pass it as Idempotency-Key header (already implemented[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts#:~:text=%2F%2F%20Generate%20idempotency%20key%20for,Math.random%28%29.toString%2836%29.substr%282%2C%209)).

2. In the same file, extend pollRun() to parse run.steps and run.logs from the API response[\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts#:~:text=setRunStatus%28run). For each step, update the node’s status (queued → running → succeeded/failed) in the store via updateNodeRunStatus(). Convert log objects to a readable string with timestamp and severity.

3. Add human‑readable durations: when updating node statuses, read durationMs from the step; convert it to seconds or milliseconds as appropriate and display it in the run panel.

4. Cap the maximum number of polling attempts (already using maxPolls), and handle timeouts by marking the run as failed.

---

## 3\. Credential Management & Encryption

### 3.1 Implement a credential store (UI)

Create a new file apps/dev-web/src/core/credentials.ts and implement a Zustand store:

import create from 'zustand';

interface CredentialEntry {  
 name: string;  
 cipher: ArrayBuffer;  
 iv: Uint8Array;  
 masked: string; // e.g. first 3 & last 2 chars  
}

interface CredentialState {  
 credentials: Record\<string, CredentialEntry\>;  
 setCredential: (name: string, value: string) \=\> Promise\<void\>;  
 getCredential: (name: string) \=\> Promise\<string | undefined\>;  
 listCredentials: () \=\> { name: string; masked: string }\[\];  
}

export const useCredentialStore \= create\<CredentialState\>((set, get) \=\> ({  
 credentials: {},  
 async setCredential(name, value) {  
 const iv \= crypto.getRandomValues(new Uint8Array(12));  
 const keyMaterial \= await getKeyMaterial(); // see helper below  
 const key \= await window.crypto.subtle.importKey(  
 'raw', keyMaterial, { name: 'AES-GCM' }, false, \['encrypt'\]  
 );  
 const cipher \= await window.crypto.subtle.encrypt(  
 { name: 'AES-GCM', iv }, newKey, new TextEncoder().encode(value)  
 );  
 const masked \= mask(value);  
 set((state) \=\> ({  
 credentials: {  
 ...state.credentials,  
 \[name\]: { name, cipher, iv, masked },  
 },  
 }));  
 },  
 async getCredential(name) {  
 const entry \= get().credentials\[name\];  
 if (\!entry) return undefined;  
 const keyMaterial \= await getKeyMaterial();  
 const key \= await window.crypto.subtle.importKey(  
 'raw', keyMaterial, { name: 'AES-GCM' }, false, \['decrypt'\]  
 );  
 const decrypted \= await window.crypto.subtle.decrypt(  
 { name: 'AES-GCM', iv: entry.iv },  
 key,  
 entry.cipher  
 );  
 return new TextDecoder().decode(decrypted);  
 },  
 listCredentials() {  
 return Object.values(get().credentials).map(({ name, masked }) \=\> ({ name, masked }));  
 },  
}));

// Helper to derive a key from a session-based master password or fallback  
async function getKeyMaterial() {  
 // For simplicity, derive from a constant; advanced: prompt user for a passphrase  
 const raw \= await crypto.subtle.digest('SHA-256', new TextEncoder().encode('automateos-session'));  
 return raw;  
}

function mask(value: string) {  
 if (\!value || value.length \<= 4\) return '\*'.repeat(value.length);  
 return value.slice(0, 3\) \+ '\*\*\*' \+ value.slice(-2);  
}

Notes: \- This uses Web Crypto (window.crypto.subtle) so it works only in the browser. In Node contexts (or orchestrator), use the built‑in crypto module. \- If you have time, prompt the user once per session for a master passphrase and store its hash to derive the key.

### 3.2 Add credential fields in the inspector

1. Open apps/dev-web/src/builder/inspector/Inspector.tsx.

2. For HTTP nodes, extend the HttpConfigSchema to include an optional auth section with credentialName:

- export const HttpAuthSchema \= z.object({  
   credentialName: z.string().nonempty('Credential name is required'),  
  });  
  export const HttpConfigSchema \= z.object({  
   method: z.enum(\['GET','POST','PUT','PATCH','DELETE'\]),  
   url: z.string().url(),  
   headers: z.record(z.string()).optional(),  
   body: z.string().optional(),  
   auth: HttpAuthSchema.optional(),  
  }).strict();

3. Update the form in Inspector.tsx to render an additional input when auth is present. Use register('auth.credentialName'). Add helper text instructing the user to define the credential via the Credential Manager.

4. When saving the config (updateNodeConfig), do **not** insert the secret directly; only store the credential name. The actual secret will be injected during DAG compilation.

### 3.3 Inject credentials when compiling

In services/orchestrator/src/runService.ts, modify the DAG compilation step:

1. After compiling the DAG, iterate over each step. If a node’s config contains auth: { credentialName }, perform a lookup:

2. On the server side, credentials might reside in a secure store (e.g., environment variables or Postgres). For this sprint, we can pass them from the UI by sending a separate credentials map in the POST /v1/runs body. The gateway should validate and forward this map to the orchestrator.

3. Replace the placeholder auth.credentialName with the actual secret in the config (e.g. set headers.Authorization \= 'Bearer ' \+ secret). Ensure you never log the secret.

Alternatively, if you want to keep secrets entirely client‑side for Phase 1, do the lookup in startRun() before sending to the gateway:

const { getCredential } \= useCredentialStore.getState();  
if (workflowJson.nodes) {  
 for (const n of workflowJson.nodes) {  
 if (n.config?.auth?.credentialName) {  
 const secret \= await getCredential(n.config.auth.credentialName);  
 if (secret) {  
 n.config.headers \= { ...(n.config.headers || {}), Authorization: \`Bearer ${secret}\` };  
 delete n.config.auth;  
 }  
 }  
 }  
}

This allows secrets to stay in memory on the client until the HTTP request is made by the engine.

### 3.4 Mask secrets in logs

The API gateway already masks sensitive headers[\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts#:~:text=import%20Fastify%20from%20%27fastify%27%3B%20import,from%20%27zod). Extend the orchestrator and engine logging so any header keys matching authorization or api-key are masked before logging. Reuse the maskValue helper.

---

## 4\. UI Enhancements

### 4.1 Step list and durations in RunPanel

1. Open apps/dev-web/src/builder/run/RunPanel.tsx. Currently it only displays a status pill and logs[\[4\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/RunPanel.tsx#:~:text=%2F%2F%20Status%20display%20helpers%20const,50%27%3B%20%7D).

2. Add a new section below the status pill:

- {nodeRunStatuses && (  
   \<div className="space-y-2"\>  
   \<h4 className="text-sm font-medium text-gray-700"\>Steps\</h4\>  
   \<ul className="text-xs space-y-1"\>  
   {Object.entries(nodeRunStatuses).map((\[nodeId, status\]) \=\> {  
   const label \= nodes.find(n \=\> n.id \=== nodeId)?.data?.label || nodeId;  
   const duration \= stepDurations\[nodeId\]; // you need to compute this when polling  
   return (  
   \<li key={nodeId} className="flex justify-between"\>  
   \<span\>{label}\</span\>  
   \<span className={\`font-mono ${getColor(status)}\`}\>{status}\</span\>  
   {duration && \<span className="text-gray-500 ml-2"\>{duration}ms\</span\>}  
   \</li\>  
   );  
   })}  
   \</ul\>  
   \</div\>  
  )}

3. Compute stepDurations in the run store: when updating step statuses from polling, read durationMs and store it in stepDurations\[nodeId\].

4. Style statuses with colors similar to the status pill (e.g., green for success, red for fail).

### 4.2 Load Notion template

1. Add the JSON file examples/notion-automation.json (as described in the requirements) to the repo.

2. In apps/dev-web/src/builder/canvas/CanvasToolbar.tsx, add another button labeled "Notion Template". Copy the Slack template loader logic: fetch the JSON, validate with WorkflowSchema, load into the graph, clear selection and run state, and show a toast.

3. Add a small icon (optional) or note that Integration Token must be configured via credentials.

### 4.3 Credential manager UI (optional but recommended)

Consider adding a simple modal or drawer where users can create and manage credentials. Provide a button in the toolbar (“Manage Credentials”). Inside the modal:

- List existing credentials with their masked values from useCredentialStore.listCredentials().

- Provide a form to add a new credential (name \+ secret). Use setCredential() to store it.

- Provide a delete button (requires confirming deletion).

This can be implemented later if time allows.

---

## 5\. Testing & Quality

### 5.1 Unit tests (Vitest)

1. **Credential store:** Write tests for setCredential() and getCredential(). Ensure that the encrypted value is not equal to the original and that getCredential() returns the original string.

2. **Engine HTTP:** Mock node-fetch in engine tests and verify that requests are sent with the correct method, URL, headers and body. Ensure logs mask sensitive headers.

3. **Run pipeline:** Test orchestrator’s startRun() and pollOnce() functions. Mock the Engine client to simulate various statuses (queued, running, succeeded, failed) and verify that run records are updated correctly.

### 5.2 Component tests (React Testing Library)

1. **RunPanel:** Mount the RunPanel with a fake store containing step statuses and durations. Verify that statuses and durations render correctly.

2. **Inspector credential field:** Render an HTTP node inspector. Fill in a credential name. Verify that it updates node config and does not display the secret.

3. **Credential manager UI (if implemented):** Add tests for adding and deleting credentials.

### 5.3 End‑to‑End tests (Playwright)

1. **Slack template run:** Import Slack template. Configure a credential (set a fake Slack webhook URL). Run the workflow. Ensure that the run status progresses to success and logs show HTTP 200 POST.

2. **Notion template:** Import Notion template. Configure Notion Integration Token. Run the workflow. Ensure that the run status progresses to success and logs show a 200 status.

3. **Credential persistence:** Ensure that credentials do not persist across page reloads unless you implement a master password. Verify that export JSON does not contain secrets.

---

## 6\. Stretch Goals (if time permits)

### 6.1 Undo/Redo & Multi‑select

- Add history stacks to core/state.ts: past: GraphState\[\], present: GraphState, future: GraphState\[\]. On every graph modification (add/move/delete nodes or edges), push the old state into past and clear future. Implement undo() and redo() actions: pop from past to present and push previous present into future, and vice versa.

- Bind Ctrl+Z and Ctrl+Y keys in the builder page. Add Undo/Redo buttons in the toolbar.

- Multi‑select: store an array selectedNodeIds in the state. When shift‑clicking nodes or dragging a selection box, add or remove node IDs. When pressing Delete, remove all selected nodes. When dragging, move all selected nodes together.

### 6.2 DB persistence & Simple Auth

- Create a new table workflows in Postgres with columns: id (uuid), owner_id, name, json, created_at, updated_at, version.

- Add services/api-gateway/src/routes/workflows.ts with endpoints: POST /v1/workflows (create), GET /v1/workflows/:id (read), PUT /v1/workflows/:id (update), DELETE /v1/workflows/:id. Protect with a simple bearer token: require Authorization: Bearer \<token\> and check it against process.env.API_TOKEN.

- Add useWorkflows hook in the UI to fetch and list workflows. Provide a dropdown to load a saved workflow.

### 6.3 Run Log Streaming (SSE or WebSocket)

- In the API gateway, implement GET /v1/runs/:id/stream that keeps the HTTP connection open and streams log entries as they arrive (Server‑Sent Events). Alternatively use WebSockets.

- In the UI, replace polling in pollRun() with an EventSource (SSE) that listens for incoming log messages and run status updates. Fall back to polling if SSE fails.

---

## 7\. Wrap‑Up Checklist

- \[ \] .env files loaded and documented; secrets not in source control.

- \[ \] Orchestrator uses compileDag() and forwards DAG to engine.

- \[ \] Engine performs real HTTP requests and masks sensitive headers in logs.

- \[ \] Run panel shows step list, statuses, durations and logs.

- \[ \] Credential store implemented with AES‑GCM encryption; inspector updated to reference credential names.

- \[ \] Notion starter template available via toolbar.

- \[ \] Tests written and CI pipeline updated.

- \[ \] Optional: history/undo/redo, DB persistence, SSE streaming.

By following these tasks, even a junior developer should be able to navigate the codebase, modify the necessary files, and deliver the Sprint 4 objectives with confidence.

---

[\[1\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts#:~:text=%2F%2F%20Generate%20idempotency%20key%20for,Math.random%28%29.toString%2836%29.substr%282%2C%209) [\[2\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts#:~:text=setRunStatus%28run) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/runActions.ts)

[\[3\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts#:~:text=import%20Fastify%20from%20%27fastify%27%3B%20import,from%20%27zod) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/services/api-gateway/src/index.ts)

[\[4\]](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/RunPanel.tsx#:~:text=%2F%2F%20Status%20display%20helpers%20const,50%27%3B%20%7D) raw.githubusercontent.com

[https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/RunPanel.tsx](https://raw.githubusercontent.com/neonzoul/AutomateOS-v1.0/main/apps/dev-web/src/builder/run/RunPanel.tsx)
