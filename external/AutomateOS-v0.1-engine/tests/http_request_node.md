### **Scenario 1: Making a `POST` Request with Data**

This test will confirm that your node can correctly send data in the body of a `POST` request. We'll use the same public test API.

-   **Workflow Name:** `Test POST Request`
-   **Request Body for `POST /api/v1/workflows`:**
    ```json
    {
        "name": "Test POST Request",
        "definition": {
            "steps": [
                {
                    "type": "http_request_node",
                    "config": {
                        "method": "POST",
                        "url": "https://jsonplaceholder.typicode.com/posts",
                        "json_body": {
                            "title": "AutomateOS Test",
                            "body": "This is a test post.",
                            "userId": 1
                        }
                    }
                }
            ]
        }
    }
    ```
-   **What to look for in the database `logs`:** The `status_code` should be `201`, and the `json` in the log should contain the post you sent, along with a new `id` assigned by the server.

---

### **Scenario 2: Sending Custom Headers**

This test will verify that the `headers` configuration is working correctly. We'll use `httpbin.org`, a great tool for inspecting HTTP requests.

-   **Workflow Name:** `Test Custom Headers`
-   **Request Body for `POST /api/v1/workflows`:**
    ```json
    {
        "name": "Test Custom Headers",
        "definition": {
            "steps": [
                {
                    "type": "http_request_node",
                    "config": {
                        "method": "GET",
                        "url": "https://httpbin.org/headers",
                        "headers": {
                            "X-AutomateOS-Test": "It Works!",
                            "User-Agent": "AutomateOS-Engine-v0.1"
                        }
                    }
                }
            ]
        }
    }
    ```
-   **What to look for in the database `logs`:** The `status_code` should be `200`. Inside the `json` of the log, you should see a `"headers"` object that contains the two custom headers you sent: `"X-Automateos-Test": "It Works!"` and `"User-Agent": "AutomateOS-Engine-v0.1"`.

---

### **Scenario 3: Handling a Failed Request (404 Not Found)**

This test will confirm that your error handling is working correctly in both the node and the worker task. We will intentionally call a URL that doesn't exist.

-   **Workflow Name:** `Test 404 Error`
-   **Request Body for `POST /api/v1/workflows`:**
    ```json
    {
        "name": "Test 404 Error",
        "definition": {
            "steps": [
                {
                    "type": "http_request_node",
                    "config": {
                        "method": "GET",
                        "url": "https://jsonplaceholder.typicode.com/posts/this-does-not-exist"
                    }
                }
            ]
        }
    }
    ```
-   **What to look for in the database `logs`:**
    -   The `status` column for this `WorkflowRun` must be **`"Failed"`**.
    -   The `logs` column should contain an `{"error": "..."}` message. The error string should include something like `Client error '404 Not Found'`. This proves that your `try...except` block in `tasks.py` correctly caught the error raised by `response.raise_for_status()` in your node.

Running these three tests will give you great confidence that your first plugin is working correctly under different conditions.
