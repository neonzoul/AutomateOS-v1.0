### **`AutomateOS` MVP: Architecture Blueprint**

This blueprint describes the high-level structure and interaction flow of the core components. The design prioritizes scalability, reliability, and extensibility through an **asynchronous, event-driven model**.

---

### ## 1. Component Overview

1.  **API Server (FastAPI): The Front Door** 🚪

    -   **Responsibility:** Handles all incoming HTTP requests. It manages user authentication (login/register), workflow definitions (CRUD), and most importantly, receives incoming data from webhooks. Its primary design goal is to be extremely fast and responsive.

2.  **Database (PostgreSQL / SQLModel): The Brain** 🧠

    -   **Responsibility:** Acts as the single source of truth for all persistent data.
        -   `Users`: Stores user information.
        -   `Workflows`: Stores the "blueprints" of the automation flows.
        -   `WorkflowRuns`: Stores the execution history and logs for every run.

3.  **Job Queue (Redis): The Dispatcher** 📬

    -   **Responsibility:** A high-speed, in-memory message broker that decouples the API Server from the background Workers. The API places "work orders" (jobs) here, and the workers pick them up.

4.  **Worker (RQ): The Workshop** 🛠️

    -   **Responsibility:** One or more background processes that are completely separate from the API Server. Their only job is to constantly watch the Job Queue for new tasks. This is where the **Engine** lives and executes the actual workflow logic.

5.  **Node Plugins (`/nodes` directory): The Toolbox** 🧰
    -   **Responsibility:** A collection of individual Python files, where each file represents a specific action (e.g., `http_request.py`, `filter.py`). The Worker's Engine uses dynamic loading (`importlib`) to discover and use these "tools" as needed.

---

### ## 2. Key Interaction Flows

#### **Flow A: Managing a Workflow (Synchronous CRUD)**

This flow is for creating or editing a workflow definition.

1.  A user sends an API request (e.g., `POST /workflows`) with their JWT to the **API Server**.
2.  The **API Server** authenticates the user and validates the data.
3.  The **API Server** writes the workflow definition directly to the **Database**.
4.  The **API Server** sends a confirmation response back to the user.

#### **Flow B: Executing a Workflow (The Core Asynchronous Flow)**

This is the main event-driven flow.

1.  An external service sends a request to a workflow's unique webhook URL.
2.  The **API Server** receives the request.
3.  The **API Server** instantly creates a job payload (containing the workflow ID and incoming data) and places it on the **Job Queue (Redis)**.
4.  The **API Server** immediately sends a `202 Accepted` response. **It does not wait for the workflow to finish.**
5.  A **Worker** process, listening to the queue, picks up the new job.
6.  The **Worker's Engine** reads the workflow definition from the **Database**.
7.  The **Engine** begins executing the workflow's nodes sequentially, using the dynamically loaded **Node Plugins**.
8.  As it runs, the **Engine** updates the execution history in the **Database**.

This architecture ensures your system is fast and scalable from day one.
