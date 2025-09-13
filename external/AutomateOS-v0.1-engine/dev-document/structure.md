### \#\# Project Directory Tree

```
automateos/
├── .env                  # Environment variables (DB connection, secrets)
├── .gitignore            # Git ignore file
├── docker-compose.yml    # Orchestrates all services for development
├── Dockerfile            # Dockerfile for the FastAPI application
├── Dockerfile.worker     # Dockerfile for the RQ worker
├── README.md             # Project documentation
├── requirements.txt      # Python dependencies
├── main.py               # Entry point to run the FastAPI app
├── worker.py             # Entry point to run the RQ worker
│
├── app/                  # Main application source code
│   ├── __init__.py
│   │
│   ├── api/              # API endpoints (routers)
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py      # Aggregates all endpoint routers
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth.py
│   │           └── workflows.py
│   │
│   ├── core/             # Core logic: config, security
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── db/               # Database session management
│   │   ├── __init__.py
│   │   └── session.py
│   │
│   ├── engine/           # The workflow execution engine (used by the worker)
│   │   ├── __init__.py
│   │   ├── orchestrator.py
│   │   └── nodes/        # The "Plugin" directory for all nodes
│   │       ├── __init__.py
│   │       ├── base.py
│   │       ├── http_request_node.py
│   │       └── filter_node.py
│   │
│   ├── models/           # SQLModel database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── workflow.py
│   │
│   └── schemas/          # Pydantic schemas for API validation
│       ├── __init__.py
│       ├── user.py
│       └── workflow.py
│
└── tests/                # Application tests
    ├── __init__.py
    └── ...
```

---

### \#\# Key Directory Explanations

-   **`automateos/` (Root):** Contains Docker files, environment configurations, and entry points (`main.py`, `worker.py`). This keeps your runtime configuration separate from your application logic.

-   **`app/`:** The main Python package for your application source code.

-   **`app/api/`:** Holds all your API versions and endpoints. Starting with a `v1/` sub-directory is a best practice that makes future API updates much easier.

-   **`app/core/`:** For application-wide logic like loading configuration from `.env` files (`config.py`) and handling security tasks like password hashing and JWT management (`security.py`).

-   **`app/engine/`:** This is the heart of your automation logic. It's used by `worker.py` but not directly by the API.

    -   `orchestrator.py`: The main file that contains the logic to run a workflow step-by-step.
    -   `nodes/`: Your **plugin directory**. You simply add a new Python file here to create a new node, and the engine will dynamically load it.

-   **`app/models/`:** Contains your SQLModel classes, which define your database table structures.

-   **`app/schemas/`:** Contains your Pydantic classes. These define the shape of data for your API (e.g., what the request body for creating a user should look like). This separation from `models` allows you to expose different data in your API than what you store in your database.
