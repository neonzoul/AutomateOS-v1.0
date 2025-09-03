# External Engine

Python-based workflow execution runtime.

## Structure

- `engine/` - v0.1 Engine — execution runtime, separate repo boundary

## Development

```bash
# Setup Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run engine
python main.py
```

The engine is designed to:
- Execute workflow steps received from orchestrator
- Handle retries and error handling
- Provide execution logs and metrics
- Run isolated from Node.js services
- Support scaling independently
