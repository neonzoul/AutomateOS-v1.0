# External Services & Engines

This directory contains external services and execution engines that AutomateOS integrates with.

## Structure

- `AutomateOS-v0.1-engine/` - **Comprehensive FastAPI Engine** — Full-featured workflow execution runtime with authentication, persistence, and plugin architecture

## AutomateOS Engine v0.1

### Overview

Complete FastAPI-based workflow execution engine with:

- 🔐 **Authentication System** - User management and JWT tokens
- 💾 **Database Persistence** - SQLite with proper models
- 🔌 **Plugin Architecture** - Extensible node system
- 🐳 **Docker Support** - Containerized deployment
- 📊 **Comprehensive APIs** - RESTful endpoints for all operations
- 🧪 **Test Coverage** - E2E and integration tests

### Quick Start

```bash
cd AutomateOS-v0.1-engine

# Setup Python environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the engine
python main.py
```

**Engine will start on http://localhost:8000**

### Docker Deployment

```bash
cd AutomateOS-v0.1-engine
docker-compose up -d
```

### Integration Status

✅ **Compatible with Sprint2 Builder**

- Our current Builder → API Gateway → Orchestrator integration works
- Includes test scripts that validate Sprint2 compatibility
- Enhanced HTTP logging and Discord webhook testing confirmed

🔄 **Migration in Progress**

- API endpoints differ from our minimal Sprint2 implementation
- See `docs/technical/Engine-Integration-Guide.md` for detailed migration plan

### Key Features

#### Authentication

```bash
# Login to get JWT token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

#### Workflow Execution

```bash
# Execute workflow
curl -X POST http://localhost:8000/api/v1/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow": {...}}'
```

#### Available Nodes

- **HTTP Request Node** - Make HTTP calls with full configuration
- **Filter Node** - Data transformation and filtering
- **Base Node** - Foundation for custom node development

### Testing

```bash
# Validate Sprint2 compatibility
python sprint2-verification.py

# Test Discord webhook integration
python test-discord-webhook.py

# Run comprehensive E2E tests
python tests/e2e_week5.py
```

### Documentation

- `dev-document/` - Comprehensive development documentation
- `docs/images/` - Screenshots and visual documentation
- `tests/` - Test scripts and examples
- API Documentation available at http://localhost:8000/docs when running

## Integration with Builder

The engine integrates with our Sprint2 Builder implementation:

1. **Builder** (Next.js) → Creates workflow graphs
2. **API Gateway** (Node.js) → Routes requests
3. **Orchestrator** (Node.js) → Compiles and manages execution
4. **Engine** (FastAPI) → Executes workflows with nodes

See `docs/technical/Engine-Integration-Guide.md` for detailed integration instructions.

The engine is designed to:

- Execute workflow steps received from orchestrator
- Handle retries and error handling
- Provide execution logs and metrics
- Run isolated from Node.js services
- Support scaling independently
