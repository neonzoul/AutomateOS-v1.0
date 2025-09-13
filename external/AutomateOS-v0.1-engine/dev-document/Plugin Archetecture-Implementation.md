The core concepts for Week 4. This week is all about building the "brains" of the operation—the engine that actually _does_ the work. You've correctly identified that the **Plugin Architecture** is the most important concept to understand.

### The Core Problem: How Do You Add New Features?

Imagine your engine's logic is written in one big function. To run a workflow, it might look like this:

```python
# The "bad" way - hard-coded logic
def run_workflow(steps):
    for step in steps:
        if step.type == "http_request":
            # ... logic to make an http request ...
        elif step.type == "send_email":
            # ... logic to send an email ...
        elif step.type == "filter_data":
            # ... logic to filter data ...
```

This works, but it has a huge problem. Every time you want to add a new node type (e.g., "save_to_notion"), you have to come back and modify this central `if/elif` block. This is slow, error-prone, and violates our "Separation of Concerns" principle.

### The Solution: The Plugin Architecture

The Plugin Architecture solves this by completely inverting the logic. Instead of the engine knowing about every node, the engine's only job is to be a **"Loader"** or **"Orchestrator"**. It knows how to find and run "plugins" (our nodes), but it doesn't know what any of them do specifically.

This is exactly what our project documents require: "The engine **must not** contain `if/elif` logic for specific node types" and "**must** use dynamic loading... to discover and load available nodes automatically".

Here's how the three parts you mentioned work together to achieve this:

#### 1\. The "Node" Contract (`app/engine/nodes/base.py`)

This is the most important piece. We create a "contract" that every single plugin must follow. In Python, this is best done with a base class. Every node _must_ inherit from this base class and _must_ have an `execute()` method.

-   **Analogy:** This is like saying every power tool must have the same standard plug to fit into the wall socket. We don't care if it's a drill or a saw, but it must have the right plug.
-   **Code Concept:**

    ```python
    # app/engine/nodes/base.py
    class BaseNode:
        def __init__(self, config: dict):
            self.config = config

        def execute(self, input_data: dict) -> dict:
            # This method must be implemented by every node.
            raise NotImplementedError
    ```

#### 2\. The Behavior-Focused Nodes (e.g., `app/engine/nodes/http_request_node.py`)

These are the individual "tools" or "plugins." Each one is a separate file that knows how to do one specific job. It follows the "Node Contract" by inheriting from `BaseNode` and implementing the `execute()` method.

-   **Analogy:** This is the drill. It has the standard plug, and its specific job is to drill holes.
-   **Code Concept:**

    ```python
    # app/engine/nodes/http_request_node.py
    from .base import BaseNode
    import httpx # A good library for making HTTP requests

    class HttpRequestNode(BaseNode):
        def execute(self, input_data: dict) -> dict:
            url = self.config.get("url")
            print(f"Making HTTP request to: {url}")
            # ... logic to use httpx to make the request ...
            return {"status_code": 200, "data": "response_from_url"}
    ```

#### 3\. The Engine as a "Loader" (`app/engine/orchestrator.py`)

This is the "Orchestrator". Its job is to read the workflow definition from the database, and for each step, dynamically find and load the correct node plugin. It uses Python's `importlib` library to do this.

-   **Analogy:** This is the person using the power tools. They read a blueprint (the workflow), see that the next step requires a "drill," go to the toolbox (`nodes/` directory), grab the drill, plug it in, and use it.
-   **Code Concept:**

    ```python
    # app/engine/orchestrator.py
    import importlib

    def run_workflow(workflow_definition):
        current_data = {}
        for step in workflow_definition['steps']:
            node_type = step['type'] # e.g., "http_request_node"

            # Dynamically import the correct node module
            node_module = importlib.import_module(f".nodes.{node_type}", package="app.engine")

            # Find the class inside the module (e.g., HttpRequestNode)
            NodeClass = getattr(node_module, "HttpRequestNode") # This needs to be smarter

            # Create an instance and execute it
            node_instance = NodeClass(config=step['config'])
            current_data = node_instance.execute(current_data)
    ```

By building the system this way, adding a new "save_to_notion" node in the future is incredibly simple: you just create a new `save_to_notion_node.py` file in the `nodes` directory. You never have to touch the orchestrator's code again. This makes the system extensible and maintainable, fulfilling a key requirement of our project.
