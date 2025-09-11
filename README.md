# AutomateOS v1.0

🚀 **Visual Workflow Automation Platform** — Build, share, and run workflows without code.

## Quick Start

### Prerequisites

- Node.js 20+
- PNPM (`corepack enable`)
- Docker (optional for local stack)
- Python 3.11+ (for engine development)

### Local Development

```bash
# Install dependencies
pnpm i

# Start development servers
pnpm dev

# Or start specific apps/services
pnpm -C apps/dev-web dev
pnpm -C services/api-gateway dev
```

### Run Stack with Orchestrator + Engine (Sprint 2)

Workflow execution prototype services can be started via Docker (Engine, Orchestrator, API Gateway) while running the builder locally:

```bash
# Terminal 1: start backend stack
docker compose -f infra/docker-compose.dev.yml up --build

# Terminal 2: start builder UI (ensure env)
set NEXT_PUBLIC_API_BASE=http://localhost:8080 # Windows PowerShell use: $env:NEXT_PUBLIC_API_BASE="http://localhost:8080"
pnpm -C apps/dev-web dev
```

Services exposed:

- API Gateway: http://localhost:8080 (/v1/runs)
- Engine (mock v0.1): http://localhost:8081
- Orchestrator (internal): http://localhost:3002

Click the Run button in the builder to post the current graph to the gateway and execute via Engine (Start + HTTP supported).

### With Docker

```bash
cd infra
docker compose -f docker-compose.dev.yml up --build
```

## Project Structure

```
automateos-v1/
├─ apps/                         # Frontend apps (Next.js)
│  ├─ dev-web/                   # AutomateOS.dev — Creator Studio
│  └─ app-web/                   # AutomateOS.app — User Dashboard
│
├─ services/                     # Backend services (Node.js)
│  ├─ api-gateway/               # API Gateway (Auth, RBAC, Templates)
│  ├─ orchestrator/              # Workflow orchestration
│  ├─ webhook/                   # External triggers
│  └─ worker/                    # Workflow execution worker
│
├─ external/                     # External Engine (Python)
│  └─ engine/                    # Workflow execution runtime
│
├─ packages/                     # Shared libraries
│  ├─ ui/                        # UI component library
│  ├─ workflow-schema/           # Workflow schemas
│  ├─ logger/                    # Logging utilities
│  └─ config/                    # Shared configurations
│
├─ infra/                        # Infrastructure & deployment
└─ docs/                         # Documentation
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
