# Services

Backend Node.js services built with Fastify/Nest.js.

## Structure

- `api-gateway/` - BFF/API Gateway (Auth, RBAC, Templates, Workflows, Runs)
- `orchestrator/` - DAG compiler, dispatches workflows to Engine
- `webhook/` - Ingress for external triggers (webhooks, cron)
- `worker/` - Executes workflow steps, retries, DLQ, logs

## Development

```bash
# Start all services
pnpm dev

# Start specific service
pnpm -C services/api-gateway dev
pnpm -C services/orchestrator dev
```

Each service includes:
- Health endpoint (`GET /health`)
- Structured logging with `@automateos/logger`
- TypeScript with strict mode
- Zod validation at boundaries
- Docker configuration
