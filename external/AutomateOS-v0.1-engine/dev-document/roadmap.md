The "Plugin Architecture" will use to build all nodes, starting in Week 4.

Here is the complete 6-week roadmap rewritten in English for your project documentation.

---

### **Roadmap: `AutomateOS` MVP (Core Engine) - 6-Week Sprint**

**Primary Goal:** At the end of these 6 weeks, you will have a fully functional backend API, ready to be connected to a front-end interface.

---

### **Week 1: Foundations & Project Setup (Aug 2 - Aug 8)**

**Goal:** A running project structure with initial data models defined.

-   **Initialize Project:**
    -   Use `git init` and create a remote repository on GitHub.
    -   Create a `.gitignore` file for Python.
-   **Setup Environment:**
    -   Create a Python virtual environment.
    -   Install initial dependencies: `fastapi`, `uvicorn`, `sqlmodel`, `psycopg2-binary`.
    -   Create a `requirements.txt` file.
-   **Project Structure:**
    -   Establish the base folder structure (e.g., `app/`, `app/api/`, `app/core/`, `app/models/`).
-   **Database Models (SQLModel):**
    -   Create the most critical data models first: `User`, `Workflow`, `WorkflowRun`.
-   **"Hello World" API:**
    -   Create a root (`/`) API endpoint to confirm the server is running correctly.

---

### **Week 2: Authentication & Workflow CRUD (Aug 9 - Aug 15)**

**Goal:** A secure API where a user can manage their own workflows.

-   **Implement JWT Authentication:**
    -   Create endpoints for `/register` and `/login`.
    -   A successful login must return a JWT access token.
-   **Create Protected Endpoints:**
    -   Create a FastAPI dependency to verify the JWT and restrict access to authenticated users.
-   **Workflow CRUD API:**
    -   Build API endpoints for **C**reate, **R**ead, **U**pdate, and **D**elete `Workflow` definitions.

---

### **Week 3: Execution Engine Pt. 1 - Trigger & Queuing (Aug 16 - Aug 22)**

**Goal:** Prove that the core event-driven, asynchronous architecture is working.

-   **Setup Redis & RQ (Redis Queue):**
    -   Install `redis` and `rq`.
    -   Configure the FastAPI app to connect to Redis.
-   **Webhook Trigger Endpoint:**
    -   Create a unique, dynamic endpoint for each workflow (e.g., `/webhooks/{workflow_id}`).
-   **Queue a Job:**
    -   When the webhook is called, the API must only add a job to the Redis queue and return immediately. It **must not** run the workflow itself.
-   **Create the Worker:**
    -   Set up an RQ worker process to consume jobs from the queue.
    -   **Initial Test:** The worker successfully pulls a job and logs a message like "Workflow [ID] triggered!".

---

### **Week 4: Execution Engine Pt. 2 - The First Action (HTTP Node) (Aug 23 - Aug 29)**

**Goal:** Enable the worker to perform its first useful task using a scalable plugin architecture.

-   **Implement Plugin Architecture:**
    -   Design and build the dynamic loading system (e.g., using `importlib`) that will discover and load all available node types.
-   **Implement HTTP Request Node:**
    -   Build the `HTTP Request Node` as the **first plugin** for your new system.
-   **Execution History:**
    -   The worker must read the workflow steps from the DB, execute the node, and then record the result (success/failure) in the `WorkflowRun` table.

---

### **Week 5: Execution Engine Pt. 3 - Intelligence & Polish (Aug 30 - Sep 5)**

**Goal:** Add conditional logic to workflows and allow users to view their execution history.

-   **Implement Filter Node:**
    -   Build the `Filter Node` as a **second plugin**, proving the extensibility of the architecture. It should evaluate a simple condition to determine if the workflow continues.
-   **Multi-step Execution:**
    -   Test that a workflow with multiple steps (e.g., Webhook -> Filter -> HTTP Request) executes in the correct order.
-   **History API:**
    -   Create an API endpoint for users to retrieve their `WorkflowRun` history.

---

### **Week 6: Deployment Prep & Documentation (Sep 6 - Sep 12)**

**Goal:** A well-documented project that is easy for anyone (including your future self) to run and deploy.

-   **Containerize with Docker:**
    -   Create a `Dockerfile` for the FastAPI app and another for the RQ worker.
    -   Create a `docker-compose.yml` file to orchestrate all services (App, Worker, Redis, Postgres) with a single `docker-compose up` command.
-   **API Documentation:**
    -   Review and add clear descriptions to the auto-generated API docs from FastAPI (Swagger UI).
-   **Write a Good README.md:**
    -   Explain what the project is, its features, and how to set it up and run it locally using Docker Compose.
