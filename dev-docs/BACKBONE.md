# AutomateOS v1 — Monorepo Backbone

Below is a copy‑pasteable scaffold for the repo. It includes the directory tree and **minimal runnable files** for: Next.js app (`dev-web`), Node services (`api-gateway`, `orchestrator`, `webhook`, `worker`), Python engine (`external/engine`), shared packages (UI, schema, logger, config), Dockerfiles, docker‑compose, and GitHub Actions.

---

## 0) 🗂 Directory Tree 

```
automateos-v1/
├─ apps/                         # Frontend apps (Next.js)
│  ├─ dev-web/                   # AutomateOS.dev — Creator Studio (Builder, Profiles, Publishing)
│  └─ app-web/                   # AutomateOS.app — User Dashboard (Gallery, Usage, SaaS)
│
├─ services/                     # Backend Node services (Fastify/Nest)
│  ├─ api-gateway/               # BFF/API (Auth, RBAC, Templates, Workflows, Runs)
│  ├─ orchestrator/              # DAG compiler, dispatches workflows to Engine
│  ├─ webhook/                   # Ingress for external triggers (webhooks, cron)
│  └─ worker/                    # Executes workflow steps, retries, DLQ, logs
│
├─ external/                     # External Engine (Python)
│  └─ engine/                    # v0.1 Engine — execution runtime, separate repo boundary
│
├─ packages/                     # Shared code (TypeScript libraries)
│  ├─ ui/                        # Shared UI kit (Tailwind + shadcn/ui)
│  ├─ workflow-schema/           # Zod schemas for Workflow, Node, Edge, Run, Template
│  ├─ logger/                    # Pino logger + OpenTelemetry integration
│  └─ config/                    # Shared config (tsconfig, eslint, prettier, tailwind presets)
│
├─ infra/                        # Deployment, infra, and local dev setup
│  ├─ docker-compose.dev.yml     # Local dev stack (apps + services + engine)
│  ├─ docker-compose.prod.yml    # Production stack (for DigitalOcean or VM deploy)
│  └─ README.md                  # Infra/deploy notes
│
├─ .github/workflows/            # GitHub Actions CI/CD pipelines
│  ├─ build-push.yml             # Build & push Docker images (to GHCR or Artifact Registry)
│  ├─ deploy-gcp.yml             # Deploy workflow for Google Cloud Run
│  └─ deploy-do.yml              # Deploy workflow for DigitalOcean Droplet
│
├─ docs/                         # Vision → Roadmap → Requirements → ADRs (single source of truth)
│
├─ package.json                  # Root config, scripts, dev dependencies
├─ pnpm-workspace.yaml           # Monorepo workspace definitions
├─ turbo.json                    # Turborepo pipeline (build/dev/lint)
├─ tsconfig.base.json            # Shared TypeScript compiler options
├─ .eslintrc.json                # ESLint base rules
├─ .prettierrc                   # Prettier formatting rules
└─ README.md                     # Repo overview & quickstart
```
---

## 1) Root files

### `package.json`
```json
{
  "name": "automateos-v1",
  "private": true,
  "packageManager": "pnpm@9.7.0",
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "turbo": "^2.0.6",
    "typescript": "^5.5.4"
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
  - "external/*"
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {},
    "typecheck": {}
  }
}
```

### `tsconfig.base.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@automateos/ui": ["packages/ui/src"],
      "@automateos/schema": ["packages/workflow-schema/src"],
      "@automateos/logger": ["packages/logger/src"],
      "@automateos/config": ["packages/config/src"]
    }
  }
}
```

### `.eslintrc.json`
```json
{
  "root": true,
  "env": { "es2022": true, "node": true, "browser": true },
  "extends": ["eslint:recommended"],
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  "rules": {}
}
```

### `.prettierrc`
```json
{ "singleQuote": true, "semi": true }
```

### `README.md`
```md
# AutomateOS v1 — Monorepo

## Quickstart
pnpm i
pnpm dev

## Apps & Services
- apps/dev-web: Creator Studio (Next.js)
- services/*: Node services (Fastify), worker, webhook
- external/engine: Python FastAPI engine v0.1

## Dev stack
Docker (optional), Postgres, Redis
```

---

## 2) Apps — Next.js (Creator Studio)

### `apps/dev-web/package.json`
```json
{
  "name": "dev-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "echo skip"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

### `apps/dev-web/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "jsx": "react-jsx" },
  "include": ["./**/*.ts", "./**/*.tsx"]
}
```

### `apps/dev-web/next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = { output: 'standalone' };
module.exports = nextConfig;
```

### `apps/dev-web/app/layout.tsx`
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
```

### `apps/dev-web/app/page.tsx`
```tsx
export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>AutomateOS.dev — Creator Studio</h1>
      <p>Repo scaffold is running. Build the Workflow Builder here.</p>
    </main>
  );
}
```

### `apps/dev-web/Dockerfile`
```dockerfile
FROM node:20-bullseye AS builder
WORKDIR /app
COPY ../../package.json ../../pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ../../ ./
RUN pnpm install --frozen-lockfile
RUN pnpm -C apps/dev-web build

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=builder /app/apps/dev-web/.next/standalone ./
COPY --from=builder /app/apps/dev-web/.next/static ./apps/dev-web/.next/static
COPY --from=builder /app/apps/dev-web/public ./apps/dev-web/public
EXPOSE 8080
CMD ["apps/dev-web/server.js"]
```

> `apps/app-web/*` mirrors the same structure, kept as placeholder for later.

---

## 3) Services — Node (Fastify)

### `services/api-gateway/package.json`
```json
{
  "name": "api-gateway",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js"
  },
  "dependencies": {
    "fastify": "4.27.2"
  },
  "devDependencies": {
    "tsx": "^4.16.2",
    "typescript": "^5.5.4"
  }
}
```

### `services/api-gateway/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src"]
}
```

### `services/api-gateway/src/routes/health.ts`
```ts
import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true, service: 'api-gateway' }));
}
```

### `services/api-gateway/src/main.ts`
```ts
import Fastify from 'fastify';
import { healthRoutes } from './routes/health';

const app = Fastify({ logger: true });

app.register(healthRoutes, { prefix: '/v1' });

const port = Number(process.env.PORT || 8080);
app
  .listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`api-gateway listening on ${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
```

### `services/api-gateway/Dockerfile`
```dockerfile
FROM node:20-bullseye AS deps
WORKDIR /app
COPY ../../package.json ../../pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ../../ ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm -C services/api-gateway build

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/services/api-gateway/dist ./dist
COPY --from=deps  /app/services/api-gateway/package.json ./
EXPOSE 8080
CMD ["dist/main.js"]
```

### Orchestrator/Webhook/Worker (minimal)

`services/orchestrator/src/main.ts`
```ts
import Fastify from 'fastify';
const app = Fastify({ logger: true });
app.get('/health', async () => ({ ok: true, service: 'orchestrator' }));
app.listen({ port: Number(process.env.PORT || 8080), host: '0.0.0.0' });
```

`services/webhook/src/main.ts`
```ts
import Fastify from 'fastify';
const app = Fastify({ logger: true });
app.post('/ingress', async (req, _res) => ({ received: true }));
app.get('/health', async () => ({ ok: true, service: 'webhook' }));
app.listen({ port: Number(process.env.PORT || 8080), host: '0.0.0.0' });
```

`services/worker/src/main.ts`
```ts
setInterval(() => {
  // simulate background heartbeat
  console.log(`[worker] alive ${new Date().toISOString()}`);
}, 5000);
```

Each of the above has a `package.json`, `tsconfig.json`, and a `Dockerfile` equivalent to api-gateway (adjust name).

---

## 4) External Engine — Python (FastAPI)

### `external/engine/requirements.txt`
```
fastapi==0.111.0
uvicorn==0.30.0
```

### `external/engine/engine/main.py`
```py
from fastapi import FastAPI

app = FastAPI(title="AutomateOS Engine v0.1")

@app.get("/health")
def health():
    return {"ok": True, "service": "engine"}

@app.post("/execute")
def execute(payload: dict):
    # TODO: implement workflow execution bridge
    return {"received": True, "nodes": len(payload.get("nodes", []))}
```

### `external/engine/Dockerfile`
```dockerfile
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PORT=8080
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["uvicorn","engine.main:app","--host","0.0.0.0","--port","8080"]
```

---

## 5) Shared Packages

### `packages/ui/package.json`
```json
{ "name": "@automateos/ui", "version": "0.1.0", "private": true, "main": "src/index.ts" }
```

### `packages/ui/src/index.ts`
```ts
export const Button = (props: { label: string }) => `<button>${props.label}</button>`;
```

### `packages/workflow-schema/package.json`
```json
{ "name": "@automateos/schema", "version": "0.1.0", "private": true, "main": "src/index.ts", "dependencies": { "zod": "^3.23.8" } }
```

### `packages/workflow-schema/src/index.ts`
```ts
import { z } from 'zod';

export const NodeSchema = z.object({ id: z.string(), type: z.string(), config: z.record(z.any()).optional() });
export const EdgeSchema = z.object({ id: z.string(), source: z.string(), target: z.string() });
export const WorkflowSchema = z.object({ id: z.string(), nodes: z.array(NodeSchema), edges: z.array(EdgeSchema) });

export type Workflow = z.infer<typeof WorkflowSchema>;
```

### `packages/logger/package.json`
```json
{ "name": "@automateos/logger", "version": "0.1.0", "private": true, "main": "src/index.ts", "dependencies": { "pino": "^9.3.2" } }
```

### `packages/logger/src/index.ts`
```ts
import pino from 'pino';
export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
```

### `packages/config/package.json`
```json
{ "name": "@automateos/config", "version": "0.1.0", "private": true, "main": "src/index.ts" }
```

### `packages/config/src/index.ts`
```ts
export const cfg = {
  port: Number(process.env.PORT || 8080),
  databaseUrl: process.env.DATABASE_URL || '',
};
```

---

## 6) Infra — Docker Compose & CI/CD stubs

### `infra/docker-compose.dev.yml`
```yaml
version: "3.9"
services:
  dev-web:
    build: { context: .., dockerfile: apps/dev-web/Dockerfile }
    environment:
      - NODE_ENV=development
    ports: ["3000:8080"]
    depends_on: [api-gateway]

  api-gateway:
    build: { context: .., dockerfile: services/api-gateway/Dockerfile }
    environment:
      - NODE_ENV=development
      - PORT=8080
    ports: ["8081:8080"]

  orchestrator:
    build: { context: .., dockerfile: services/orchestrator/Dockerfile }
    environment: ["PORT=8080"]
    ports: ["8082:8080"]

  webhook:
    build: { context: .., dockerfile: services/webhook/Dockerfile }
    environment: ["PORT=8080"]
    ports: ["8083:8080"]

  worker:
    build: { context: .., dockerfile: services/worker/Dockerfile }

  engine:
    build: { context: .., dockerfile: external/engine/Dockerfile }
    environment: ["PORT=8080"]
    ports: ["8084:8080"]
```

### `infra/docker-compose.prod.yml`
```yaml
version: "3.9"
services:
  dev-web:
    image: ghcr.io/OWNER/REPO-apps-dev-web:latest
    restart: unless-stopped
    environment: ["NODE_ENV=production"]
    ports: ["80:8080"]

  api-gateway:
    image: ghcr.io/OWNER/REPO-services-api-gateway:latest
    restart: unless-stopped
    environment: ["NODE_ENV=production", "PORT=8080"]
    ports: ["8081:8080"]

  orchestrator:
    image: ghcr.io/OWNER/REPO-services-orchestrator:latest
    restart: unless-stopped
    environment: ["PORT=8080"]
    ports: ["8082:8080"]

  webhook:
    image: ghcr.io/OWNER/REPO-services-webhook:latest
    restart: unless-stopped
    environment: ["PORT=8080"]
    ports: ["8083:8080"]

  worker:
    image: ghcr.io/OWNER/REPO-services-worker:latest
    restart: unless-stopped

  engine:
    image: ghcr.io/OWNER/REPO-external-engine:latest
    restart: unless-stopped
    environment: ["PORT=8080"]
    ports: ["8084:8080"]
```

### `.github/workflows/build-push.yml`
```yaml
name: Build & Push Containers
on: { push: { branches: [ main ] }, workflow_dispatch: {} }
jobs:
  build-push:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    strategy:
      matrix:
        component: [ "apps/dev-web", "services/api-gateway", "services/orchestrator", "services/webhook", "services/worker", "external/engine" ]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Set image name
        id: img
        run: echo "name=ghcr.io/${{ github.repository }}/$(echo '${{ matrix.component }}' | tr '/' '-')" >> $GITHUB_OUTPUT
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: ${{ matrix.component }}/Dockerfile
          push: true
          tags: |
            ${{ steps.img.outputs.name }}:sha-${{ github.sha }}
            ${{ steps.img.outputs.name }}:latest
```

> `deploy-gcp.yml` / `deploy-do.yml` can be added from the previous message when you’re ready.

---

## 7) Getting Started

```bash
# 1) Install deps
pnpm i

# 2) Dev (local without Docker)
pnpm -C apps/dev-web dev   # open http://localhost:3000
pnpm -C services/api-gateway dev  # http://localhost:8081/v1/health

# 3) Dev with Docker
cd infra
docker compose -f docker-compose.dev.yml up --build

# 4) Build images via CI (push to main)
# GitHub Actions builds and pushes to GHCR
