# Engine Integration Guide

## Overview

This guide covers the integration of the comprehensive FastAPI engine (v0.1) into AutomateOS v1.0, replacing our minimal Sprint2 implementation.

## What Changed

### From Sprint2 Minimal Engine → Full FastAPI Engine

**Sprint2 (What we built):**

- Simple HTTP execution server on port 8090
- Basic DAG compilation and execution
- Enhanced HTTP logging
- Direct Discord webhook testing

**Full Engine (What we now have):**

- Complete FastAPI application with authentication
- Database persistence (SQLite)
- Advanced workflow management
- Node-based architecture with plugins
- Comprehensive API endpoints
- Worker processes for background execution
- Docker containerization

## Integration Status

### ✅ Already Working

- Sprint2 Builder → API Gateway → Orchestrator integration
- Discord webhook testing and validation
- Basic HTTP node execution
- Enhanced logging and monitoring

### 🔄 Migration Path

#### 1. Current Docker Setup

The full engine includes its own `docker-compose.yml`. You can:

**Option A: Use Full Engine Docker**

```bash
cd external/AutomateOS-v0.1-engine
docker-compose up -d
```

**Option B: Integrate with Main Compose** (Recommended)
Update `infra/docker-compose.dev.yml` to use the full engine.

#### 2. API Compatibility

The full engine has different API endpoints than our Sprint2 implementation:

**Sprint2 Endpoint:**

```
POST http://localhost:8090/execute
```

**Full Engine Endpoints:**

```
POST /api/v1/workflows/execute
GET /api/v1/workflows/{workflow_id}/status
POST /api/v1/auth/login
```

#### 3. Database Integration

The full engine uses SQLite with proper models:

- `app/models/workflow.py` - Workflow persistence
- `app/models/user.py` - User management
- `database.db` - SQLite database file

## Quick Start with Full Engine

### 1. Run the Full Engine

```bash
cd external/AutomateOS-v0.1-engine
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py
```

### 2. Test Compatibility

The engine includes test scripts that work with our Builder:

- `sprint2-verification.py` - Tests Sprint2 integration
- `test-discord-webhook.py` - Discord webhook validation

### 3. Update Orchestrator

Our orchestrator (`services/orchestrator`) will need updates to use the full engine API:

```typescript
// services/orchestrator/src/engine/client.ts
const ENGINE_BASE_URL = 'http://localhost:8000/api/v1';

async executeWorkflow(dag: WorkflowDag) {
  const response = await fetch(`${ENGINE_BASE_URL}/workflows/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow: dag })
  });
  return response.json();
}
```

## Advanced Features Available

### 1. Authentication System

```python
# Login endpoint
POST /api/v1/auth/login
{
  "username": "user",
  "password": "password"
}
```

### 2. Workflow Persistence

```python
# Save workflow
POST /api/v1/workflows/
{
  "name": "My Workflow",
  "graph": { ... },
  "description": "Workflow description"
}
```

### 3. Node Plugin Architecture

The engine supports custom nodes via the plugin system:

- `app/engine/nodes/base.py` - Base node interface
- `app/engine/nodes/http_request_node.py` - HTTP node implementation
- `app/engine/nodes/filter_node.py` - Data filtering node

## Migration Timeline

### Phase 1: Parallel Running (Current)

- Keep Sprint2 minimal engine for current Builder
- Test full engine independently
- Validate API compatibility

### Phase 2: API Alignment (Next Sprint)

- Update Orchestrator to use full engine APIs
- Migrate Docker configuration
- Update environment variables

### Phase 3: Advanced Features (Future)

- Implement authentication in Builder
- Add workflow persistence
- Integrate advanced node types

## Testing Strategy

### Current Tests Still Work

All our Sprint2 tests continue to work:

```bash
python test-direct-engine.py  # Direct engine testing
python test-discord-direct.py  # Full pipeline testing
```

### New Engine Tests

```bash
cd external/AutomateOS-v0.1-engine
python sprint2-verification.py  # Validates Sprint2 compatibility
python tests/e2e_week5.py       # Comprehensive E2E tests
```

## Configuration Changes

### Environment Variables

The full engine uses different environment variables:

```env
# Full Engine Configuration
DATABASE_URL=sqlite:///./database.db
SECRET_KEY=your-secret-key-here
API_V1_STR=/api/v1
PROJECT_NAME=AutomateOS Engine
```

### Port Configuration

- **Full Engine**: Port 8000 (FastAPI standard)
- **Sprint2 Engine**: Port 8090 (our custom port)
- **Builder**: Port 3000 (unchanged)
- **API Gateway**: Port 8080 (unchanged)

## Recommendations

### ✅ Immediate Actions

1. ✅ **Commit the engine** (Done!)
2. Test full engine independently
3. Validate Sprint2 compatibility
4. Update documentation

### 🔄 Next Sprint Planning

1. Update orchestrator API calls
2. Migrate Docker configuration
3. Implement authentication flow
4. Add workflow persistence to Builder

### 🚀 Future Enhancements

1. Custom node development
2. Advanced workflow features
3. User management integration
4. Performance optimization

## Summary

The full engine provides a solid foundation for scaling AutomateOS beyond Sprint2. While it requires some integration work, it offers:

- **Professional Architecture**: Well-structured FastAPI application
- **Scalability**: Database persistence and worker processes
- **Extensibility**: Plugin-based node architecture
- **Documentation**: Comprehensive docs and blueprints
- **Testing**: Existing test coverage

The Sprint2 Builder integration continues to work, giving us time to properly migrate to the full engine capabilities.
