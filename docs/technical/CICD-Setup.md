
# 0) Repo layout (relevant bits)

```
automateos-v1/
├─ apps/
│  ├─ dev-web/                # Next.js (Creator Studio)
│  └─ app-web/                # Next.js (User Dashboard, later)
├─ services/
│  ├─ api-gateway/            # Fastify/Nest (TS)
│  ├─ orchestrator/           # TS service
│  ├─ webhook/                # TS service
│  └─ worker/                 # TS worker
├─ external/
│  └─ engine/                 # Python engine v0.1 (REST)
├─ infra/
│  ├─ docker-compose.dev.yml
│  ├─ docker-compose.prod.yml        # (used for DO droplet)
│  └─ cloud-run/
│     ├─ envs/                        # .env.production samples (NOT committed)
│     └─ run-order.md                 # notes for deploy order & DB migrate
└─ .github/workflows/
   ├─ build-push.yml
   ├─ deploy-gcp.yml
   └─ deploy-do.yml
```

---

# 1) Dockerfiles

## 1.1 Next.js (apps/dev-web) — multi-stage for Cloud Run

`apps/dev-web/Dockerfile`

```dockerfile
# --- Builder ---
FROM node:20-bullseye AS builder
WORKDIR /app
COPY ../../package.json ../../pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
# copy monorepo files (optimize as needed)
COPY ../../ ./
RUN pnpm install --frozen-lockfile
RUN pnpm -C apps/dev-web build  # Next.js "output: standalone" in next.config.js recommended

# --- Runner ---
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
ENV NODE_ENV=production PORT=8080
# copy only the standalone build
COPY --from=builder /app/apps/dev-web/.next/standalone ./
COPY --from=builder /app/apps/dev-web/.next/static ./apps/dev-web/.next/static
COPY --from=builder /app/apps/dev-web/public ./apps/dev-web/public
EXPOSE 8080
CMD ["apps/dev-web/server.js"]
```

> In `apps/dev-web/next.config.js` set:

```js
module.exports = { output: 'standalone' }
```

## 1.2 Node service (services/api-gateway)

`services/api-gateway/Dockerfile`

```dockerfile
FROM node:20-bullseye AS deps
WORKDIR /app
COPY ../../package.json ../../pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ../../ ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm -C services/api-gateway build   # tsc -> dist

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/services/api-gateway/dist ./dist
COPY --from=deps  /app/services/api-gateway/package.json ./
EXPOSE 8080
CMD ["dist/main.js"]
```

## 1.3 Python engine (external/engine)

`external/engine/Dockerfile`

```dockerfile
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PORT=8080
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["python","-m","engine.main"]
```

---

# 2) GitHub Actions — build & push

We’ll push images to **Artifact Registry (GCP)** *or* **GHCR**. Choose one.
Below shows **GHCR** (simpler cross-cloud). Replace `OWNER`/`REPO`.

> **Secrets needed (GitHub repo → Settings → Secrets and variables → Actions)**

* `GHCR_TOKEN` (classic PAT with `write:packages`) or use built-in GITHUB\_TOKEN (see note in YAML).
* For GCP deploy: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SA_KEY_JSON` (if not using Workload Identity).
* For DO deploy: `DO_SSH_HOST`, `DO_SSH_USER`, `DO_SSH_KEY` (private key), optional `DO_REGISTRY_TOKEN` if using DOCR.

`.github/workflows/build-push.yml`

```yaml
name: Build & Push Containers

on:
  push:
    branches: [ main ]
  workflow_dispatch: {}

jobs:
  build-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write   # required to push to GHCR with GITHUB_TOKEN
    strategy:
      matrix:
        component:
          - apps/dev-web
          - services/api-gateway
          - services/orchestrator
          - services/webhook
          - services/worker
          - external/engine
    steps:
      - uses: actions/checkout@v4

      - name: Set image name
        id: img
        run: |
          echo "name=ghcr.io/${{ github.repository }}/$(echo '${{ matrix.component }}' | tr '/' '-')" >> $GITHUB_OUTPUT

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}   # works if permissions.packages: write

      - name: Build & Push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ${{ matrix.component }}/Dockerfile
          push: true
          tags: |
            ${{ steps.img.outputs.name }}:sha-${{ github.sha }}
            ${{ steps.img.outputs.name }}:latest
          cache-from: type=registry,ref=${{ steps.img.outputs.name }}:buildcache
          cache-to: type=registry,ref=${{ steps.img.outputs.name }}:buildcache,mode=max
```

> You’ll get images like:
> `ghcr.io/OWNER/REPO-apps-dev-web:latest`
> `ghcr.io/OWNER/REPO-services-api-gateway:latest` … etc.

---

# 3) Deploy — **Option A: Google Cloud Run**

## 3.1 Workflow (deploy selected services)

`.github/workflows/deploy-gcp.yml`

```yaml
name: Deploy to Google Cloud Run

on:
  workflow_dispatch:
    inputs:
      ref:
        description: "Git ref/sha/tag to deploy"
        required: true
        default: main

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
      GCP_REGION:     ${{ secrets.GCP_REGION }}
      REPO:           ${{ github.repository }}
      SHA:            ${{ github.sha }}

    steps:
      - uses: actions/checkout@v4
        with: { ref: ${{ inputs.ref }} }

      - name: Setup gcloud
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: ${{ env.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY_JSON }}  # or remove to use Workload Identity
          export_default_credentials: true

      - name: Configure Artifact Registry Docker (if using AR instead of GHCR)
        run: gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev --quiet || true

      - name: Deploy dev-web
        run: |
          gcloud run deploy dev-web \
            --image ghcr.io/${REPO}/apps-dev-web:latest \
            --region ${GCP_REGION} --project ${GCP_PROJECT_ID} \
            --platform managed --allow-unauthenticated \
            --port 8080 \
            --set-env-vars "NODE_ENV=production" \
            --set-secrets "NEXT_PUBLIC_SOME_KEY=projects/../secrets/..:latest"

      - name: Deploy api-gateway
        run: |
          gcloud run deploy api-gateway \
            --image ghcr.io/${REPO}/services-api-gateway:latest \
            --region ${GCP_REGION} --project ${GCP_PROJECT_ID} \
            --platform managed --no-allow-unauthenticated \
            --port 8080 \
            --set-env-vars "NODE_ENV=production,DATABASE_URL=${{ secrets.DATABASE_URL }},REDIS_URL=${{ secrets.REDIS_URL }}" \
            --set-secrets "JWT_SECRET=projects/../secrets/jwt_secret:latest"

      - name: Deploy orchestrator
        run: |
          gcloud run deploy orchestrator \
            --image ghcr.io/${REPO}/services-orchestrator:latest \
            --region ${GCP_REGION} --project ${GCP_PROJECT_ID} \
            --platform managed --no-allow-unauthenticated \
            --port 8080 \
            --set-env-vars "ENGINE_URL=${{ vars.ENGINE_URL }}"

      - name: Deploy webhook
        run: |
          gcloud run deploy webhook \
            --image ghcr.io/${REPO}/services-webhook:latest \
            --region ${GCP_REGION} --project ${GCP_PROJECT_ID} \
            --platform managed --no-allow-unauthenticated \
            --port 8080

      - name: Deploy worker
        run: |
          gcloud run deploy worker \
            --image ghcr.io/${REPO}/services-worker:latest \
            --region ${GCP_REGION} --project ${GCP_PROJECT_ID} \
            --platform managed --no-allow-unauthenticated \
            --port 8080

      - name: Deploy engine
        run: |
          gcloud run deploy engine \
            --image ghcr.io/${REPO}/external-engine:latest \
            --region ${GCP_REGION} --project ${GCP_PROJECT_ID} \
            --platform managed --no-allow-unauthenticated \
            --port 8080
```

### Notes

* **DB/Redis**: use **Cloud SQL (Postgres)** & **Memorystore (Redis)**, connect via private VPC if possible.
* **Secrets**: use **Secret Manager** and `--set-secrets`.
* **Auth**: `dev-web` can be public; other services private (authenticated invoker) and reachable via **Cloud Run VPC connectors** or **authorized service-to-service** calls.
* **Migrations**: add a step that runs Prisma migrate in `api-gateway` (either a one-off **Cloud Run Job** or a step before deploying).

**Migration step example (optional):**

```bash
gcloud run jobs deploy db-migrate \
  --image ghcr.io/${REPO}/services-api-gateway:latest \
  --region ${GCP_REGION} --project ${GCP_PROJECT_ID} \
  --set-env-vars "DATABASE_URL=${{ secrets.DATABASE_URL }}" \
  --execute-now
```

---

# 4) Deploy — **Option B: DigitalOcean Droplet (Docker Compose)**

## 4.1 Production Compose

`infra/docker-compose.prod.yml`

```yaml
version: "3.9"
services:
  dev-web:
    image: ghcr.io/OWNER/REPO-apps-dev-web:latest
    restart: unless-stopped
    env_file: ./envs/dev-web.env
    ports: ["80:8080"]
    depends_on: [api-gateway]

  api-gateway:
    image: ghcr.io/OWNER/REPO-services-api-gateway:latest
    restart: unless-stopped
    env_file: ./envs/api-gateway.env

  orchestrator:
    image: ghcr.io/OWNER/REPO-services-orchestrator:latest
    restart: unless-stopped
    env_file: ./envs/orchestrator.env

  webhook:
    image: ghcr.io/OWNER/REPO-services-webhook:latest
    restart: unless-stopped
    env_file: ./envs/webhook.env

  worker:
    image: ghcr.io/OWNER/REPO-services-worker:latest
    restart: unless-stopped
    env_file: ./envs/worker.env

  engine:
    image: ghcr.io/OWNER/REPO-external-engine:latest
    restart: unless-stopped
    env_file: ./envs/engine.env
```

> Put env files under `infra/envs/*.env` on the droplet (not committed).

## 4.2 GitHub Action (SSH into Droplet, pull & up)

`.github/workflows/deploy-do.yml`

```yaml
name: Deploy to DigitalOcean Droplet

on:
  workflow_dispatch:
    inputs:
      host:
        description: "Droplet host (defaults to secret)"
        required: false
      ref:
        description: "Git ref to deploy"
        required: true
        default: main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Resolve host
        id: host
        run: |
          echo "value=${{ inputs.host || secrets.DO_SSH_HOST }}" >> $GITHUB_OUTPUT

      - name: Checkout (for infra files only)
        uses: actions/checkout@v4
        with: { ref: ${{ inputs.ref }} }

      - name: Copy compose files to droplet
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ steps.host.outputs.value }}
          username: ${{ secrets.DO_SSH_USER }}
          key: ${{ secrets.DO_SSH_KEY }}
          source: "infra/docker-compose.prod.yml"
          target: "~/automateos"

      - name: SSH deploy
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ steps.host.outputs.value }}
          username: ${{ secrets.DO_SSH_USER }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd ~/automateos
            docker login ghcr.io -u $GITHUB_ACTOR -p ${{ secrets.GITHUB_TOKEN }}
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --remove-orphans
            docker image prune -f
```

> You’ll need to set up the droplet with: Docker, Docker Compose, firewall rules (80/443), and reverse proxy/TLS (Caddy/Traefik or Nginx).
> For TLS quickly: **Caddy** auto-TLS via Let’s Encrypt with a simple Caddyfile reverse proxy to `dev-web:8080`.

---

# 5) Env & Secrets (baseline checklist)

**Shared**

* `NODE_ENV=production`
* `LOG_LEVEL=info`

**api-gateway / orchestrator / worker**

* `DATABASE_URL=postgres://...`
* `REDIS_URL=redis://...`
* `JWT_SECRET=...`
* `ENGINE_URL=https://engine.your-domain` (or internal)

**dev-web**

* `NEXT_PUBLIC_API_BASE=https://api.your-domain`

**engine**

* Provider keys only if needed here (or pass through from orchestrator).

> **Never log secrets**. Use Secret Manager (GCP) or DO environment files with strict file perms.

---

# 6) Deployment order & migration

1. Ensure **Postgres** + **Redis** are provisioned and reachable.
2. **Run DB migrations** (Cloud Run Job or on droplet: `docker compose run --rm api-gateway node dist/migrate.js`).
3. Deploy **api-gateway**, **orchestrator**, **worker**, **engine**.
4. Deploy **dev-web** (and later **app-web**).
5. Smoke test: health endpoints, one starter workflow E2E.

---

