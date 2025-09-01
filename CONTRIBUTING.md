# Contributing to AutomateOS v1

Welcome to AutomateOS! This guide will help you get started with contributing to the project.

## 🚀 Local Setup

### Prerequisites
- **Node.js 20+** (`node --version`)
- **PNPM** (`corepack enable`)
- **Docker** (optional for compose)
- **Python 3.11+** (for engine development)

### Installation
```bash
pnpm i
pnpm dev   # or: pnpm -C apps/dev-web dev, pnpm -C services/api-gateway dev
```

### With Docker
```bash
cd infra
docker compose -f docker-compose.dev.yml up --build
```

## 🌿 Branching & PRs

- **Default branch:** `main`
- **Feature branches:** `feat/<area>-<short-desc>` (e.g., `feat/builder-node-inspector`)
- **Fix branches:** `fix/<area>-<short-desc>`

### PR Template
- What/Why (problem → solution)
- Screenshots/GIF for UI changes
- Tests added/updated
- Check the PR checklist below

## 📝 Commit Convention (Conventional Commits)

- `feat: add node inspector form`
- `fix: prevent secrets from logging`
- `chore: bump deps`
- `docs: add API contract for runs`

## 🎨 Code Style & Linting

- **TypeScript strict** everywhere (no `any` unless justified)
- **Zod** for runtime validation at boundaries
- **ESLint + Prettier**: run `pnpm lint` before pushing
- **Logs:** use `@automateos/logger`; include `request_id`, `run_id` when possible

## 🔧 Project Structure

### Adding a New Service (Node.js)
1. Create `services/<name>/` with `src/main.ts`, `package.json`, `tsconfig.json`, `Dockerfile`
2. Register dev script in root `package.json` 
3. Add health endpoint (`GET /health`)
4. Add to `infra/docker-compose.dev.yml`
5. CI builds automatically via matrix

### Adding a New App (Next.js)
1. Create `apps/<name>/` (copy `apps/dev-web` scaffold)
2. Keep `next.config.js` with `output: 'standalone'`
3. Add route in compose if needed

### Adding a New Package (shared lib)
1. Create `packages/<name>/` with `src/index.ts`, `package.json`, `tsconfig.json`
2. Add path alias in `tsconfig.base.json`
3. Import via `@automateos/<name>`

## 📊 Database & Migrations

- **ORM:** Prisma (recommended)
- Put migrations in the service that owns the DB connection
- **Local:** `pnpm -C services/api-gateway prisma migrate dev`
- **Production:** run migration job or script

## 🔐 Secrets & Environment

- **Never commit** `.env*` files
- **Local:** `.env.local` files per app/service
- **CI/CD:** GitHub Actions Secrets
- **Runtime:** GCP Secret Manager or secure env files
- Use `getCredential(name)` abstraction; **never log secrets**

## 🧪 Testing Strategy

- **Unit:** business logic, schema validation
- **Integration:** HTTP routes, service communication
- **E2E:** workflow import → run → view logs
- **Merge requirement:** tests must pass in CI

## 📊 Observability

- Use `@automateos/logger` for structured logs
- Add trace IDs at service boundaries
- Emit timing metrics for runs/steps

## ✅ PR Checklist

- [ ] Types + Zod validation at boundaries
- [ ] Unit/Integration tests updated
- [ ] No secrets or PII in logs
- [ ] Documentation updated (`docs/` or local README)
- [ ] Screenshots/GIF for UI changes
- [ ] ESLint + Prettier passing
- [ ] TypeScript strict compliance

## 🏷️ Releases & Tags

- Tag `v0.Y.Z` per milestone
- **v1.0.0** at launch
- Changelogs grouped by: Apps / Services / Engine / Packages / Infra

## 🔒 Security

- Input validation on every external boundary
- CSRF/CORS/Headers for web services
- RBAC (creator/user) where applicable
- Regular dependency updates
- Scan container images
- Minimize base images

---

## Quick Reference

**New contributor setup:**
1. `pnpm i` → `pnpm dev`
2. Build in the folder you own (app/service/package)
3. Validate with Zod, log with `@automateos/logger`, write tests
4. Open PR with screenshots and checklist

**Need help?** Check the `docs/` folder or open an issue!
